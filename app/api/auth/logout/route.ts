import { NextRequest, NextResponse } from 'next/server';
import { corsOptionsResponse, corsResponse } from '@/lib/cors';

// Handle CORS preflight
export async function OPTIONS(request: NextRequest) {
  return corsOptionsResponse(request.headers.get('origin'));
}

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ message: 'Logged out successfully' });
  
  // Clear the refresh token cookie
  response.cookies.delete('refreshToken');
  
  // Apply CORS headers
  corsResponse(response, request.headers.get('origin'));
  
  return response;
}
