// lib/cors.ts
import { NextResponse } from 'next/server';

// Allowed origins for CORS
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:5176',
  // Add your production frontend URLs here after deployment
  process.env.ADMIN_DASHBOARD_URL,
  process.env.PUBLIC_WEBSITE_URL,
].filter(Boolean); // Remove undefined values

function isOriginAllowed(origin: string): boolean {
  // Check exact match first
  if (allowedOrigins.includes(origin)) {
    return true;
  }

  // Allow any vercel.app subdomain in production
  if (process.env.NODE_ENV === 'production' && origin.endsWith('.vercel.app')) {
    return true;
  }

  return false;
}

export function getCorsHeaders(origin?: string | null) {
  // Check if the origin is allowed
  const isAllowed = origin && isOriginAllowed(origin);

  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : allowedOrigins[0],
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400', // 24 hours
  };
}

export function corsResponse(response: NextResponse, origin?: string | null) {
  const headers = getCorsHeaders(origin);
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

export function corsOptionsResponse(origin?: string | null) {
  return new NextResponse(null, {
    status: 200,
    headers: getCorsHeaders(origin),
  });
}
