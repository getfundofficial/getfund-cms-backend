export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/services/authService';
import { jwtConfig } from '@/lib/jwt';
import { corsOptionsResponse, corsResponse } from '@/lib/cors';

// Configure route to allow longer execution time for database wake-up
export const maxDuration = 180; // 180 seconds (3 minutes)

// Handle CORS preflight
export async function OPTIONS(request: NextRequest) {
  return corsOptionsResponse(request.headers.get('origin'));
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || '';
    const origin = request.headers.get('origin');

    const result = await AuthService.login(email, password, ipAddress, userAgent);

    const response = NextResponse.json({
      user: result.user,
      accessToken: result.accessToken,
    });

    // Apply CORS headers
    corsResponse(response, origin);

    // Set refresh token in HTTP-only cookie
    response.cookies.set({
      name: 'refreshToken',
      value: result.refreshToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      maxAge: jwtConfig.refreshExpiresIn,
      path: '/'
    }as any);

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    const errorResponse = NextResponse.json(
      { error: error.message || 'Authentication failed' },
      { status: error.status || 401 }
    );
    
    // Apply CORS headers to error response
    corsResponse(errorResponse, request.headers.get('origin'));
    return errorResponse;
  }
}
