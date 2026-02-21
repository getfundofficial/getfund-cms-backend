export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth-middleware';
import { getCorsHeaders } from '@/lib/cors';
import { PasswordResetRequestModel } from '@/models/PasswordResetRequest';

export const maxDuration = 180;

// GET /api/notifications/count - Get notification counts (admin only)
export async function GET(request: NextRequest) {
  try {
    const { user } = await verifyAuth(request);

    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403, headers: getCorsHeaders(request.headers.get('origin')) }
      );
    }

    const passwordResetRequests = await PasswordResetRequestModel.countPending();

    return NextResponse.json(
      { counts: { passwordResetRequests } },
      { headers: getCorsHeaders(request.headers.get('origin')) }
    );
  } catch (error: any) {
    console.error('Error fetching notification counts:', error);
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
