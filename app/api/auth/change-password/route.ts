import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth-middleware';
import { getCorsHeaders } from '@/lib/cors';
import bcrypt from 'bcrypt';
import { UserModel } from '@/models/User';
import { AuditLogModel } from '@/models/AuditLog';
import { DEFAULT_USER_PASSWORD } from '@/lib/constants';

export const maxDuration = 180;

// POST /api/auth/change-password - User changes their own password
export async function POST(request: NextRequest) {
  try {
    const { user } = await verifyAuth(request);

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: getCorsHeaders(request.headers.get('origin')) }
      );
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Current password and new password are required' },
        { status: 400, headers: getCorsHeaders(request.headers.get('origin')) }
      );
    }

    // Validate new password is not the default
    if (newPassword === DEFAULT_USER_PASSWORD) {
      return NextResponse.json(
        { error: 'New password cannot be the default password' },
        { status: 400, headers: getCorsHeaders(request.headers.get('origin')) }
      );
    }

    // Validate password complexity (8+ chars, upper, lower, number, special)
    const hasUpper = /[A-Z]/.test(newPassword);
    const hasLower = /[a-z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword);

    if (newPassword.length < 8 || !hasUpper || !hasLower || !hasNumber || !hasSpecial) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character' },
        { status: 400, headers: getCorsHeaders(request.headers.get('origin')) }
      );
    }

    // Get full user with password hash
    const fullUser = await UserModel.findByIdWithHash(user.id);
    if (!fullUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404, headers: getCorsHeaders(request.headers.get('origin')) }
      );
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, fullUser.password_hash || '');
    if (!isValid) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 400, headers: getCorsHeaders(request.headers.get('origin')) }
      );
    }

    // Hash and update password (also clears must_change_password)
    const newHash = await bcrypt.hash(newPassword, 10);
    await UserModel.updatePassword(user.id, newHash);

    // Audit log
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || '';

    await AuditLogModel.create({
      user_id: user.id,
      action: 'password_change',
      entity_type: 'user',
      entity_id: user.id,
      changes: { changed_by: 'self' },
      ip_address: ipAddress,
      user_agent: userAgent
    });

    return NextResponse.json(
      { message: 'Password changed successfully' },
      { headers: getCorsHeaders(request.headers.get('origin')) }
    );
  } catch (error: any) {
    console.error('Error changing password:', error);
    return NextResponse.json(
      { error: 'Failed to change password' },
      { status: 500, headers: getCorsHeaders(request.headers.get('origin')) }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: getCorsHeaders(request.headers.get('origin')),
  });
}
