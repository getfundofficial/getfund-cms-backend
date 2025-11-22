import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Allowed origins for CORS
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:5176',
  // Production domains
  'https://getfund.gov.gh',
  'https://www.getfund.gov.gh',
];

function isOriginAllowed(origin?: string | null): boolean {
  if (!origin) return false;

  // Allow all Vercel preview/production deployments
  if (origin.includes('.vercel.app')) return true;

  return ALLOWED_ORIGINS.includes(origin);
}

export function middleware(request: NextRequest) {
  const origin = request.headers.get('origin');

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    const allowedOrigin = isOriginAllowed(origin) ? origin : ALLOWED_ORIGINS[0];

    return new NextResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': allowedOrigin || '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Cache-Control, Pragma, Expires',
        'Access-Control-Max-Age': '86400',
        'Access-Control-Allow-Credentials': 'true',
      },
    });
  }

  // Handle actual requests
  const response = NextResponse.next();
  const allowedOrigin = isOriginAllowed(origin) ? origin : ALLOWED_ORIGINS[0];

  response.headers.set('Access-Control-Allow-Origin', allowedOrigin || '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Cache-Control, Pragma, Expires');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');

  return response;
}

// Apply middleware to API routes only
export const config = {
  matcher: '/api/:path*',
};
