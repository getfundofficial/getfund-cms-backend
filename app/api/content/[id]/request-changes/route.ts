import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { corsResponse, corsOptionsResponse } from '@/lib/cors';
import { verifyAuth } from '@/lib/auth-middleware';

// Handle CORS preflight
export async function OPTIONS(request: NextRequest) {
  return corsOptionsResponse(request.headers.get('origin'));
}

// POST /api/content/:id/request-changes - Request changes to content
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

    // Check if user has review/approval permissions
    const hasPermission =
      authResult.user.role === 'admin' ||
      authResult.user.role === 'approver' ||
      authResult.user.role === 'reviewer';

    if (!hasPermission) {
      const errorResponse = NextResponse.json(
        { error: 'You do not have permission to request changes' },
        { status: 403 }
      );
      corsResponse(errorResponse, request.headers.get('origin'));
      return errorResponse;
    }

    const body = await request.json();
    const { notes } = body;

    // Update content status to changes_requested
    // Store notes in meta_data field
    const result = await query(
      `UPDATE content
       SET status = $1,
           meta_data = jsonb_set(
             COALESCE(meta_data, '{}'::jsonb),
             '{review_notes}',
             $2::jsonb
           ),
           updated_at = NOW()
       WHERE id = $3 AND deleted_at IS NULL
       RETURNING *`,
      ['changes_requested', JSON.stringify(notes || ''), params.id]
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
    console.error('Error requesting changes:', error);
    const errorResponse = NextResponse.json(
      { error: 'Failed to request changes' },
      { status: 500 }
    );
    corsResponse(errorResponse, request.headers.get('origin'));
    return errorResponse;
  }
}
