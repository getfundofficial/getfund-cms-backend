import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/services/authService';
import { verifyAuth } from '@/lib/auth-middleware';
import { corsOptionsResponse, corsResponse } from '@/lib/cors';

// Handle CORS preflight
export async function OPTIONS(request: NextRequest) {
  return corsOptionsResponse(request.headers.get('origin'));
}

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    const origin = request.headers.get('origin');
    
    if (!auth.authenticated || !auth.user) {
      const errorResponse = NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
      corsResponse(errorResponse, origin);
      return errorResponse;
    }

    const user = await AuthService.getCurrentUser(auth.user.id);
    const response = NextResponse.json(user);
    corsResponse(response, origin);
    return response;
  } catch (error: any) {
    console.error('Get current user error:', error);
    const errorResponse = NextResponse.json(
      { error: error.message || 'Failed to get user' },
      { status: error.status || 500 }
    );
    corsResponse(errorResponse, request.headers.get('origin'));
    return errorResponse;
  }
}
