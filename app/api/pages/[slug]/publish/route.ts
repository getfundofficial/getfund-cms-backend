export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { corsResponse, corsOptionsResponse } from '@/lib/cors';
import { verifyAuth, isAdminRole } from '@/lib/auth-middleware';
import { AuditLogModel } from '@/models/AuditLog';

/*
 * The pages table serves more than one site (migration 053), and both GETFund
 * and EFPI have an `about`, an `impact` and a `contact` — so a lookup by slug
 * alone matches two rows. Defaults to getfund, so callers that send no site
 * behave exactly as they did before EFPI existed.
 */
const SITES = new Set(['getfund', 'efpi']);
const siteOf = (request: NextRequest) => {
  const value = request.nextUrl.searchParams.get('site');
  return value && SITES.has(value) ? value : 'getfund';
};


// Handle CORS preflight
export async function OPTIONS(request: NextRequest) {
  return corsOptionsResponse(request.headers.get('origin'));
}

// POST /api/pages/:slug/publish - Publish page (approver+ only)
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
    const { slug } = params;

    // Check if page exists
    const pageResult = await query(
      'SELECT id, is_active FROM pages WHERE slug = $1 AND site = $2',
      [slug, siteOf(request)]
    );

    if (pageResult.rows.length === 0) {
      const errorResponse = NextResponse.json(
        { error: 'Page not found' },
        { status: 404 }
      );
      corsResponse(errorResponse, request.headers.get('origin'));
      return errorResponse;
    }

    const page = pageResult.rows[0];
    const pageId = page.id;

    // Check permissions (admin, approver, or has publish permission)
    if (!isAdminRole(user.role) && user.role !== 'approver') {
      const permissionResult = await query(`
        SELECT id FROM page_permissions
        WHERE page_id = $1
          AND permission_type = 'publish'
          AND (user_id = $2 OR role = $3)
        LIMIT 1
      `, [pageId, user.id, user.role]);

      if (permissionResult.rows.length === 0) {
        const errorResponse = NextResponse.json(
          { error: 'Forbidden - Approver access or publish permission required' },
          { status: 403 }
        );
        corsResponse(errorResponse, request.headers.get('origin'));
        return errorResponse;
      }
    }

    // Publish page
    const result = await query(`
      UPDATE pages
      SET
        is_active = true,
        updated_by = $1,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `, [user.id, pageId]);

    const publishedPage = result.rows[0];

    // Log page publish in audit trail
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || '';

    await AuditLogModel.create({
      user_id: user.id,
      action: 'publish',
      entity_type: 'page',
      entity_id: pageId,
      changes: {
        slug: slug,
        is_active: { from: page.is_active, to: true }
      },
      ip_address: ipAddress,
      user_agent: userAgent
    });

    const response = NextResponse.json({
      message: 'Page published successfully',
      page: publishedPage,
    });
    corsResponse(response, request.headers.get('origin'));
    return response;
  } catch (error: any) {
    console.error('Error publishing page:', error);
    const errorResponse = NextResponse.json(
      { error: 'Failed to publish page' },
      { status: 500 }
    );
    corsResponse(errorResponse, request.headers.get('origin'));
    return errorResponse;
  }
}
