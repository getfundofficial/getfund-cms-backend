import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, isAdminRole } from '@/lib/auth-middleware';
import { query } from '@/lib/db';
import { getCorsHeaders } from '@/lib/cors';
import bcrypt from 'bcrypt';
import { AuditLogModel } from '@/models/AuditLog';

// GET /api/users/:id - Get single user (admin only)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user } = await verifyAuth(request);

    if (!user || !isAdminRole(user.role)) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403, headers: getCorsHeaders(request.headers.get('origin')) }
      );
    }

    const result = await query(`
      SELECT
        id,
        email,
        full_name,
        role,
        is_active,
        permissions,
        created_at,
        updated_at
      FROM users
      WHERE id = $1
    `, [params.id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404, headers: getCorsHeaders(request.headers.get('origin')) }
      );
    }

    return NextResponse.json(
      { user: result.rows[0] },
      { headers: getCorsHeaders(request.headers.get('origin')) }
    );
  } catch (error: any) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: getCorsHeaders(request.headers.get('origin')) }
    );
  }
}

// PUT /api/users/:id - Update user (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user } = await verifyAuth(request);

    if (!user || !isAdminRole(user.role)) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403, headers: getCorsHeaders(request.headers.get('origin')) }
      );
    }

    // Prevent restricted_admin from editing their own permissions
    if (user.role === 'restricted_admin' && user.id === params.id) {
      return NextResponse.json(
        { error: 'Restricted admins cannot modify their own account' },
        { status: 403, headers: getCorsHeaders(request.headers.get('origin')) }
      );
    }

    const body = await request.json();
    const { full_name, role, is_active, password, permissions } = body;

    // Validate role if provided
    if (role) {
      const validRoles = ['admin', 'restricted_admin', 'creator', 'reviewer', 'approver'];
      if (!validRoles.includes(role)) {
        return NextResponse.json(
          { error: `Invalid role. Must be one of: ${validRoles.join(', ')}` },
          { status: 400, headers: getCorsHeaders(request.headers.get('origin')) }
        );
      }
    }

    // Prevent restricted_admin from promoting users to full admin
    if (user.role === 'restricted_admin' && role === 'admin') {
      return NextResponse.json(
        { error: 'Restricted admins cannot promote users to full admin' },
        { status: 403, headers: getCorsHeaders(request.headers.get('origin')) }
      );
    }

    // Prevent admin from deactivating themselves
    if (is_active === false && user.id === params.id) {
      return NextResponse.json(
        { error: 'Cannot deactivate your own account' },
        { status: 400, headers: getCorsHeaders(request.headers.get('origin')) }
      );
    }

    // Fetch current user data for audit trail
    const oldUserResult = await query(`
      SELECT id, email, full_name, role, is_active, permissions
      FROM users
      WHERE id = $1
    `, [params.id]);

    if (oldUserResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404, headers: getCorsHeaders(request.headers.get('origin')) }
      );
    }

    const oldUser = oldUserResult.rows[0];

    // Build update query dynamically
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (full_name !== undefined) {
      updates.push(`full_name = $${paramIndex}`);
      values.push(full_name);
      paramIndex++;
    }

    if (role !== undefined) {
      updates.push(`role = $${paramIndex}`);
      values.push(role);
      paramIndex++;
    }

    if (is_active !== undefined) {
      updates.push(`is_active = $${paramIndex}`);
      values.push(is_active);
      paramIndex++;
    }

    if (password) {
      const passwordHash = await bcrypt.hash(password, 10);
      updates.push(`password_hash = $${paramIndex}`);
      values.push(passwordHash);
      paramIndex++;
    }

    if (permissions !== undefined) {
      updates.push(`permissions = $${paramIndex}`);
      values.push(JSON.stringify(permissions));
      paramIndex++;
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400, headers: getCorsHeaders(request.headers.get('origin')) }
      );
    }

    updates.push(`updated_at = NOW()`);
    values.push(params.id);

    const result = await query(`
      UPDATE users
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, email, full_name, role, is_active, permissions, created_at, updated_at
    `, values);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404, headers: getCorsHeaders(request.headers.get('origin')) }
      );
    }

    const updatedUser = result.rows[0];

    // Log changes in audit trail
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || '';

    // Track specific change types for detailed audit logs
    const changes: any = {};

    if (role !== undefined && role !== oldUser.role) {
      // Log role change as a specific action
      await AuditLogModel.create({
        user_id: user.id,
        action: 'role_change',
        entity_type: 'user',
        entity_id: params.id,
        changes: {
          old_role: oldUser.role,
          new_role: role
        },
        ip_address: ipAddress,
        user_agent: userAgent
      });
      changes.role = { from: oldUser.role, to: role };
    }

    if (permissions !== undefined && JSON.stringify(permissions) !== JSON.stringify(oldUser.permissions)) {
      // Log permission change as a specific action
      await AuditLogModel.create({
        user_id: user.id,
        action: 'permission_change',
        entity_type: 'user',
        entity_id: params.id,
        changes: {
          old_permissions: oldUser.permissions,
          new_permissions: permissions
        },
        ip_address: ipAddress,
        user_agent: userAgent
      });
      changes.permissions = { from: oldUser.permissions, to: permissions };
    }

    if (password) {
      // Log password change (without storing the actual password)
      await AuditLogModel.create({
        user_id: user.id,
        action: 'password_change',
        entity_type: 'user',
        entity_id: params.id,
        changes: {
          changed_by: user.id === params.id ? 'self' : 'admin'
        },
        ip_address: ipAddress,
        user_agent: userAgent
      });
      changes.password = 'changed';
    }

    if (full_name !== undefined && full_name !== oldUser.full_name) {
      changes.full_name = { from: oldUser.full_name, to: full_name };
    }

    if (is_active !== undefined && is_active !== oldUser.is_active) {
      changes.is_active = { from: oldUser.is_active, to: is_active };
    }

    // Log general update action with all changes
    await AuditLogModel.create({
      user_id: user.id,
      action: 'update',
      entity_type: 'user',
      entity_id: params.id,
      changes: changes,
      ip_address: ipAddress,
      user_agent: userAgent
    });

    return NextResponse.json(
      {
        message: 'User updated successfully',
        user: updatedUser
      },
      { headers: getCorsHeaders(request.headers.get('origin')) }
    );
  } catch (error: any) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500, headers: getCorsHeaders(request.headers.get('origin')) }
    );
  }
}

// DELETE /api/users/:id - Deactivate or permanently delete user (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user } = await verifyAuth(request);

    if (!user || !isAdminRole(user.role)) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403, headers: getCorsHeaders(request.headers.get('origin')) }
      );
    }

    // Prevent admin from deleting themselves
    if (user.id === params.id) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400, headers: getCorsHeaders(request.headers.get('origin')) }
      );
    }

    const { searchParams } = new URL(request.url);
    const permanent = searchParams.get('permanent') === 'true';

    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || '';

    // Fetch user info for audit log before deletion
    const userInfo = await query(`
      SELECT id, email, full_name, role, is_active FROM users WHERE id = $1
    `, [params.id]);

    if (userInfo.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404, headers: getCorsHeaders(request.headers.get('origin')) }
      );
    }

    const targetUser = userInfo.rows[0];

    if (permanent) {
      // Clear foreign key references that would block deletion
      await query(`UPDATE content SET created_by = NULL WHERE created_by = $1`, [params.id]);
      await query(`UPDATE content SET reviewed_by = NULL WHERE reviewed_by = $1`, [params.id]);
      await query(`UPDATE content SET approved_by = NULL WHERE approved_by = $1`, [params.id]);
      await query(`UPDATE content SET published_by = NULL WHERE published_by = $1`, [params.id]);
      await query(`UPDATE content_revisions SET created_by = NULL WHERE created_by = $1`, [params.id]);
      await query(`UPDATE audit_logs SET user_id = NULL WHERE user_id = $1`, [params.id]);
      await query(`UPDATE media SET uploaded_by = NULL WHERE uploaded_by = $1`, [params.id]);
      await query(`UPDATE content_locks SET locked_by = NULL WHERE locked_by = $1`, [params.id]);
      await query(`UPDATE team_members SET created_by = NULL WHERE created_by = $1`, [params.id]);

      // Permanently delete the user from the database
      await query(`DELETE FROM users WHERE id = $1`, [params.id]);

      await AuditLogModel.create({
        user_id: user.id,
        action: 'delete',
        entity_type: 'user',
        entity_id: params.id,
        changes: {
          permanent: true,
          deleted_email: targetUser.email,
          deleted_name: targetUser.full_name,
          deleted_role: targetUser.role,
          deleted_by: user.id
        },
        ip_address: ipAddress,
        user_agent: userAgent
      });

      return NextResponse.json(
        { message: 'User permanently deleted' },
        { headers: getCorsHeaders(request.headers.get('origin')) }
      );
    } else {
      // Soft delete - deactivate
      await query(`
        UPDATE users SET is_active = false, updated_at = NOW() WHERE id = $1
      `, [params.id]);

      await AuditLogModel.create({
        user_id: user.id,
        action: 'delete',
        entity_type: 'user',
        entity_id: params.id,
        changes: {
          is_active: { from: true, to: false },
          deactivated_by: user.id
        },
        ip_address: ipAddress,
        user_agent: userAgent
      });

      return NextResponse.json(
        { message: 'User deactivated successfully' },
        { headers: getCorsHeaders(request.headers.get('origin')) }
      );
    }
  } catch (error: any) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500, headers: getCorsHeaders(request.headers.get('origin')) }
    );
  }
}

// OPTIONS /api/users/:id
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: getCorsHeaders(request.headers.get('origin')),
  });
}
