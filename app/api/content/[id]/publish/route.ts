import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { corsResponse, corsOptionsResponse } from '@/lib/cors';
import { verifyAuth } from '@/lib/auth-middleware';

// Handle CORS preflight
export async function OPTIONS(request: NextRequest) {
  return corsOptionsResponse(request.headers.get('origin'));
}

// POST /api/content/:id/publish - Publish content
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.authenticated) {
      const errorResponse = NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
      corsResponse(errorResponse, request.headers.get('origin'));
      return errorResponse;
    }

    // Check if user has permission to publish (approver or admin)
    if (authResult.user.role !== 'approver' && authResult.user.role !== 'admin') {
      const errorResponse = NextResponse.json(
        { error: 'You do not have permission to publish content' },
        { status: 403 }
      );
      corsResponse(errorResponse, request.headers.get('origin'));
      return errorResponse;
    }

    const result = await query(
      `UPDATE content
       SET status = 'published',
           published_by = $1,
           published_at = NOW(),
           updated_at = NOW()
       WHERE id = $2 AND deleted_at IS NULL
       RETURNING *`,
      [authResult.user.id, params.id]
    );

    if (result.rows.length === 0) {
      const errorResponse = NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      );
      corsResponse(errorResponse, request.headers.get('origin'));
      return errorResponse;
    }

    const response = NextResponse.json(result.rows[0]);
    corsResponse(response, request.headers.get('origin'));
    return response;
  } catch (error: any) {
    console.error('Error publishing content:', error);
    const errorResponse = NextResponse.json(
      { error: 'Failed to publish content' },
      { status: 500 }
    );
    corsResponse(errorResponse, request.headers.get('origin'));
    return errorResponse;
  }
}
