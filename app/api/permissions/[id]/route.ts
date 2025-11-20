import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { corsResponse, corsOptionsResponse } from '@/lib/cors';
import { verifyAuth } from '@/lib/auth-middleware';

// Handle CORS preflight
export async function OPTIONS(request: NextRequest) {
  return corsOptionsResponse(request.headers.get('origin'));
}

// DELETE /api/permissions/:id - Revoke permission (admin only)
export async function DELETE(
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

    const user = authResult.user!;

    // Only admins can revoke permissions
    if (user.role !== 'admin') {
      const errorResponse = NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
      corsResponse(errorResponse, request.headers.get('origin'));
      return errorResponse;
    }

    const { id } = params;

    // Revoke permission
    const result = await query(
      'DELETE FROM page_permissions WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      const errorResponse = NextResponse.json(
        { error: 'Permission not found' },
        { status: 404 }
      );
      corsResponse(errorResponse, request.headers.get('origin'));
      return errorResponse;
    }

    const response = NextResponse.json({
      message: 'Permission revoked successfully',
    });
    corsResponse(response, request.headers.get('origin'));
    return response;
  } catch (error: any) {
    console.error('Error revoking permission:', error);
    const errorResponse = NextResponse.json(
      { error: 'Failed to revoke permission' },
      { status: 500 }
    );
    corsResponse(errorResponse, request.headers.get('origin'));
    return errorResponse;
  }
}
