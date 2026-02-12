import { NextRequest, NextResponse } from 'next/server';
import { corsOptionsResponse, corsResponse } from '@/lib/cors';
import { verifyAuth } from '@/lib/auth-middleware';
import { AuditLogModel } from '@/models/AuditLog';

// Handle CORS preflight
export async function OPTIONS(request: NextRequest) {
  return corsOptionsResponse(request.headers.get('origin'));
}

export async function POST(request: NextRequest) {
  // Try to verify user for audit logging, but don't fail logout if token is invalid
  try {
    const { user } = await verifyAuth(request);

    if (user) {
      // Log logout in audit trail
      const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
      const userAgent = request.headers.get('user-agent') || '';

      await AuditLogModel.create({
        user_id: user.id,
        action: 'logout',
        entity_type: 'user',
        entity_id: user.id,
        ip_address: ipAddress,
        user_agent: userAgent
      });
    }
  } catch (error) {
    // If token verification fails, still proceed with logout
    console.log('Could not verify user for logout audit log');
  }

  const response = NextResponse.json({ message: 'Logged out successfully' });

  // Clear the refresh token cookie
  response.cookies.delete('refreshToken');

  // Apply CORS headers
  corsResponse(response, request.headers.get('origin'));

  return response;
}
