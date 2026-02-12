import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { corsResponse, corsOptionsResponse } from '@/lib/cors';
import { verifyAuth } from '@/lib/auth-middleware';
import { AuditLogModel } from '@/models/AuditLog';

// Handle CORS preflight
export async function OPTIONS(request: NextRequest) {
  return corsOptionsResponse(request.headers.get('origin'));
}

// POST /api/pages/:slug/unpublish - Unpublish page (admin only)
export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
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

    // Only admins can unpublish pages
    if (user.role !== 'admin') {
      const errorResponse = NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
      corsResponse(errorResponse, request.headers.get('origin'));
      return errorResponse;
    }

    const { slug } = params;

    // Unpublish page
    const result = await query(`
      UPDATE pages
      SET
        is_active = false,
        updated_by = $1,
        updated_at = CURRENT_TIMESTAMP
      WHERE slug = $2
      RETURNING *
    `, [user.id, slug]);

    if (result.rows.length === 0) {
      const errorResponse = NextResponse.json(
        { error: 'Page not found' },
        { status: 404 }
      );
      corsResponse(errorResponse, request.headers.get('origin'));
      return errorResponse;
    }

    const unpublishedPage = result.rows[0];

    // Log page unpublish in audit trail
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || '';

    await AuditLogModel.create({
      user_id: user.id,
      action: 'unpublish',
      entity_type: 'page',
      entity_id: unpublishedPage.id,
      changes: {
        slug: slug,
        is_active: { from: true, to: false }
      },
      ip_address: ipAddress,
      user_agent: userAgent
    });

    const response = NextResponse.json({
      message: 'Page unpublished successfully',
      page: unpublishedPage,
    });
    corsResponse(response, request.headers.get('origin'));
    return response;
  } catch (error: any) {
    console.error('Error unpublishing page:', error);
    const errorResponse = NextResponse.json(
      { error: 'Failed to unpublish page' },
      { status: 500 }
    );
    corsResponse(errorResponse, request.headers.get('origin'));
    return errorResponse;
  }
}
