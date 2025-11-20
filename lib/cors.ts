// lib/cors.ts
import { NextResponse } from 'next/server';

export function getCorsHeaders(origin?: string | null) {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Cache-Control, Pragma, Expires',
    'Access-Control-Expose-Headers': 'Cache-Control, Pragma, Expires',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400', // 24 hours
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
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
