export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth-middleware';
import { getCorsHeaders } from '@/lib/cors';
import bcrypt from 'bcrypt';
import { UserModel } from '@/models/User';
import { PasswordResetRequestModel } from '@/models/PasswordResetRequest';
import { AuditLogModel } from '@/models/AuditLog';
import { DEFAULT_USER_PASSWORD } from '@/lib/constants';

export const maxDuration = 180;

// POST /api/password-reset-requests/:id/approve - Admin approves reset
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user } = await verifyAuth(request);

    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403, headers: getCorsHeaders(request.headers.get('origin')) }
      );
    }

    // Find the reset request
    const resetRequest = await PasswordResetRequestModel.findById(params.id);
    if (!resetRequest) {
      return NextResponse.json(
        { error: 'Reset request not found' },
        { status: 404, headers: getCorsHeaders(request.headers.get('origin')) }
      );
    }

    if (resetRequest.status !== 'pending') {
      return NextResponse.json(
        { error: 'Request has already been processed' },
        { status: 400, headers: getCorsHeaders(request.headers.get('origin')) }
      );
    }

    // Reset user password to default and set must_change_password
    const passwordHash = await bcrypt.hash(DEFAULT_USER_PASSWORD, 10);
    await UserModel.resetPasswordToDefault(resetRequest.user_id, passwordHash);

    // Mark request as approved
    await PasswordResetRequestModel.approve(params.id, user.id);

    // Audit log
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || '';

    await AuditLogModel.create({
      user_id: user.id,
      action: 'password_reset',
      entity_type: 'user',
      entity_id: resetRequest.user_id,
      changes: {
        reset_request_id: params.id,
        reset_by: user.id,
        user_email: resetRequest.user_email
      },
      ip_address: ipAddress,
      user_agent: userAgent
    });

    return NextResponse.json(
      { message: 'Password has been reset to default. User will be required to change it on next login.' },
      { headers: getCorsHeaders(request.headers.get('origin')) }
    );
  } catch (error: any) {
    console.error('Error approving password reset:', error);
    return NextResponse.json(
      { error: 'Failed to approve reset request' },
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
