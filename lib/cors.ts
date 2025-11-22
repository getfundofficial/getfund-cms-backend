// lib/cors.ts
import { NextResponse } from 'next/server';

// Allowed origins for CORS
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:5176',
  // Add your production domains here
  'https://getfund.gov.gh',
  'https://www.getfund.gov.gh',
  // Add your Vercel preview/production URLs when you know them
];

function isOriginAllowed(origin?: string | null): boolean {
  if (!origin) return false;

  // Allow Vercel preview deployments
  if (origin.includes('.vercel.app')) return true;

  return ALLOWED_ORIGINS.includes(origin);
}

export function getCorsHeaders(origin?: string | null) {
  const allowedOrigin = isOriginAllowed(origin) ? origin : ALLOWED_ORIGINS[0];

  return {
    'Access-Control-Allow-Origin': allowedOrigin || '*',
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
