import { NextRequest, NextResponse } from 'next/server';

// GET /api/health - Health check endpoint
export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'ok',
    message: 'GETFund CMS API is running',
    timestamp: new Date().toISOString(),
  });
}
