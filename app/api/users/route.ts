import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, isAdminRole } from '@/lib/auth-middleware';
import { query } from '@/lib/db';
import { getCorsHeaders } from '@/lib/cors';
import bcrypt from 'bcrypt';
import { DEFAULT_PERMISSIONS, UserPermissions } from '@/models/User';
import { AuditLogModel } from '@/models/AuditLog';
import { DEFAULT_USER_PASSWORD } from '@/lib/constants';

// Configure route to allow longer execution time for database wake-up
export const maxDuration = 180; // 180 seconds (3 minutes)

// GET /api/users - Get all users (full admin only)
export async function GET(request: NextRequest) {
  try {
    const { user } = await verifyAuth(request);

    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - Full admin access required' },
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
        must_change_password,
        permissions,
        created_at,
        updated_at
      FROM users
      ORDER BY created_at DESC
    `);

    return NextResponse.json(
      { users: result.rows },
      { headers: getCorsHeaders(request.headers.get('origin')) }
    );
  } catch (error: any) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: getCorsHeaders(request.headers.get('origin')) }
    );
  }
}

// POST /api/users - Create new user (full admin only)
export async function POST(request: NextRequest) {
  try {
    const { user } = await verifyAuth(request);

    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - Full admin access required' },
        { status: 403, headers: getCorsHeaders(request.headers.get('origin')) }
      );
    }

    const body = await request.json();
    const { email, full_name, role, permissions } = body;

    // Validate required fields
    if (!email || !full_name || !role) {
      return NextResponse.json(
        { error: 'Missing required fields: email, full_name, role' },
        { status: 400, headers: getCorsHeaders(request.headers.get('origin')) }
      );
    }

    // Validate role
    const validRoles = ['admin', 'restricted_admin', 'creator', 'reviewer', 'approver'];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: `Invalid role. Must be one of: ${validRoles.join(', ')}` },
        { status: 400, headers: getCorsHeaders(request.headers.get('origin')) }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400, headers: getCorsHeaders(request.headers.get('origin')) }
      );
    }

    // Check if email already exists
    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400, headers: getCorsHeaders(request.headers.get('origin')) }
      );
    }

    // Hash the default password
    const passwordHash = await bcrypt.hash(DEFAULT_USER_PASSWORD, 10);

    // Use provided permissions or default based on role
    const userPermissions: UserPermissions = permissions || DEFAULT_PERMISSIONS[role] || DEFAULT_PERMISSIONS.creator;

    // Create user with must_change_password flag
    const result = await query(`
      INSERT INTO users (
        email,
        password_hash,
        full_name,
        role,
        permissions,
        is_active,
        must_change_password
      ) VALUES ($1, $2, $3, $4, $5, true, true)
      RETURNING id, email, full_name, role, permissions, is_active, must_change_password, created_at
    `, [email, passwordHash, full_name, role, JSON.stringify(userPermissions)]);

    const newUser = result.rows[0];

    // Log user creation in audit trail
    try {
      const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
      const userAgent = request.headers.get('user-agent') || '';

      await AuditLogModel.create({
        user_id: user.id,
        action: 'create',
        entity_type: 'user',
        entity_id: newUser.id,
        changes: {
          email: newUser.email,
          full_name: newUser.full_name,
          role: newUser.role,
          permissions: newUser.permissions
        },
        ip_address: ipAddress,
        user_agent: userAgent
      });
    } catch (auditError) {
      // Log audit error but don't fail user creation
      console.error('Failed to create audit log for user creation:', auditError);
    }

    return NextResponse.json(
      {
        message: 'User created successfully',
        user: newUser
      },
      {
        status: 201,
        headers: getCorsHeaders(request.headers.get('origin'))
      }
    );
  } catch (error: any) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500, headers: getCorsHeaders(request.headers.get('origin')) }
    );
  }
}

// OPTIONS /api/users
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: getCorsHeaders(request.headers.get('origin')),
  });
}

