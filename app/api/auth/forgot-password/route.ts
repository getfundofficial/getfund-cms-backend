import { NextRequest, NextResponse } from 'next/server';
import { getCorsHeaders } from '@/lib/cors';
import { UserModel } from '@/models/User';
import { PasswordResetRequestModel } from '@/models/PasswordResetRequest';
import { AuditLogModel } from '@/models/AuditLog';

export const maxDuration = 180;

// POST /api/auth/forgot-password - Public endpoint to request password reset
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400, headers: getCorsHeaders(request.headers.get('origin')) }
      );
    }

    // Look up user (but always return same message to prevent enumeration)
    const user = await UserModel.findByEmail(email);

    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || '';

    if (user && user.is_active) {
      // Check if there's already a pending request
      const existing = await PasswordResetRequestModel.findPendingByUserId(user.id);
      if (!existing) {
        await PasswordResetRequestModel.create(user.id);

        // Audit trail: log the reset request creation
        await AuditLogModel.create({
          user_id: user.id,
          action: 'password_reset_request',
          entity_type: 'user',
          entity_id: user.id,
          changes: { requested_via: 'forgot_password_form' },
          ip_address: ipAddress,
          user_agent: userAgent,
        });
      }
    }

    // Always return success to prevent email enumeration
    return NextResponse.json(
      { message: 'If an account with that email exists, a password reset request has been sent to the administrator.' },
      { headers: getCorsHeaders(request.headers.get('origin')) }
    );
  } catch (error: any) {
    console.error('Error processing forgot password:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
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
