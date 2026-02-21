export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/services/authService';
import { corsOptionsResponse, corsResponse } from '@/lib/cors';

// Handle CORS preflight
export async function OPTIONS(request: NextRequest) {
  return corsOptionsResponse(request.headers.get('origin'));
}

export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get('refreshToken')?.value;
    const origin = request.headers.get('origin');

    if (!refreshToken) {
      const errorResponse = NextResponse.json(
        { error: 'No refresh token provided' },
        { status: 401 }
      );
      corsResponse(errorResponse, origin);
      return errorResponse;
    }

    const result = await AuthService.refreshToken(refreshToken);
    const response = NextResponse.json(result);
    corsResponse(response, origin);

    return response;
  } catch (error: any) {
    const response = NextResponse.json(
      { error: error.message || 'Token refresh failed' },
      { status: 401 }
    );
    
    // Clear the invalid refresh token
    response.cookies.delete('refreshToken');
    corsResponse(response, request.headers.get('origin'));
    
    return response;
  }
}
