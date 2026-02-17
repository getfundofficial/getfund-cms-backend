import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth-middleware';
import { getCorsHeaders } from '@/lib/cors';
import { PasswordResetRequestModel } from '@/models/PasswordResetRequest';

export const maxDuration = 180;

// GET /api/password-reset-requests - Get all pending requests (admin only)
export async function GET(request: NextRequest) {
  try {
    const { user } = await verifyAuth(request);

    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403, headers: getCorsHeaders(request.headers.get('origin')) }
      );
    }

    const requests = await PasswordResetRequestModel.getAllPending();

    return NextResponse.json(
      { requests },
      { headers: getCorsHeaders(request.headers.get('origin')) }
    );
  } catch (error: any) {
    console.error('Error fetching password reset requests:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
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
