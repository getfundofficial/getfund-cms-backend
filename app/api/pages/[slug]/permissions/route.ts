export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { corsResponse, corsOptionsResponse } from '@/lib/cors';
import { verifyAuth, isAdminRole } from '@/lib/auth-middleware';

// Handle CORS preflight
export async function OPTIONS(request: NextRequest) {
  return corsOptionsResponse(request.headers.get('origin'));
}

// GET /api/pages/:slug/permissions - Get page permissions
export async function GET(
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

    // Only admins can view permissions
    if (!isAdminRole(user.role)) {
      const errorResponse = NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
      corsResponse(errorResponse, request.headers.get('origin'));
      return errorResponse;
    }

    const { slug } = params;

    // Get page ID
    const pageResult = await query(
      'SELECT id FROM pages WHERE slug = $1',
      [slug]
    );

    if (pageResult.rows.length === 0) {
      const errorResponse = NextResponse.json(
        { error: 'Page not found' },
        { status: 404 }
      );
      corsResponse(errorResponse, request.headers.get('origin'));
      return errorResponse;
    }

    const pageId = pageResult.rows[0].id;

    // Get all permissions for the page (page-level and section-level)
    const result = await query(`
      SELECT
        pp.*,
        u.full_name as user_name,
        u.email as user_email,
        ps.section_key,
        ps.title as section_title
      FROM page_permissions pp
      LEFT JOIN users u ON pp.user_id = u.id
      LEFT JOIN page_sections ps ON pp.section_id = ps.id
      WHERE pp.page_id = $1 OR ps.page_id = $1
      ORDER BY pp.created_at DESC
    `, [pageId]);

    const response = NextResponse.json({ permissions: result.rows });
    corsResponse(response, request.headers.get('origin'));
    return response;
  } catch (error: any) {
    console.error('Error fetching permissions:', error);
    const errorResponse = NextResponse.json(
      { error: 'Failed to fetch permissions' },
      { status: 500 }
    );
    corsResponse(errorResponse, request.headers.get('origin'));
    return errorResponse;
  }
}

// POST /api/pages/:slug/permissions - Grant permission (admin only)
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

    // Only admins can grant permissions
    if (!isAdminRole(user.role)) {
      const errorResponse = NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
      corsResponse(errorResponse, request.headers.get('origin'));
      return errorResponse;
    }

    const { slug } = params;

    // Get page ID
    const pageResult = await query(
      'SELECT id FROM pages WHERE slug = $1',
      [slug]
    );

    if (pageResult.rows.length === 0) {
      const errorResponse = NextResponse.json(
        { error: 'Page not found' },
        { status: 404 }
      );
      corsResponse(errorResponse, request.headers.get('origin'));
      return errorResponse;
    }

    const pageId = pageResult.rows[0].id;

    const body = await request.json();
    const {
      section_key,
      user_id,
      role,
      permission_type,
    } = body;

    // Validate required fields
    if (!permission_type) {
      const errorResponse = NextResponse.json(
        { error: 'Missing required field: permission_type' },
        { status: 400 }
      );
      corsResponse(errorResponse, request.headers.get('origin'));
      return errorResponse;
    }

    // Validate permission_type
    if (!['view', 'edit', 'publish'].includes(permission_type)) {
      const errorResponse = NextResponse.json(
        { error: 'Invalid permission_type. Must be: view, edit, or publish' },
        { status: 400 }
      );
      corsResponse(errorResponse, request.headers.get('origin'));
      return errorResponse;
    }

    // Validate that either user_id or role is provided (but not both)
    if ((user_id && role) || (!user_id && !role)) {
      const errorResponse = NextResponse.json(
        { error: 'Must provide either user_id or role (not both)' },
        { status: 400 }
      );
      corsResponse(errorResponse, request.headers.get('origin'));
      return errorResponse;
    }

    // Get section ID if section_key provided
    let sectionId = null;
    if (section_key) {
      const sectionResult = await query(
        'SELECT id FROM page_sections WHERE page_id = $1 AND section_key = $2',
        [pageId, section_key]
      );

      if (sectionResult.rows.length === 0) {
        const errorResponse = NextResponse.json(
          { error: 'Section not found' },
          { status: 404 }
        );
        corsResponse(errorResponse, request.headers.get('origin'));
        return errorResponse;
      }

      sectionId = sectionResult.rows[0].id;
    }

    // Create permission
    const result = await query(`
      INSERT INTO page_permissions (
        page_id,
        section_id,
        user_id,
        role,
        permission_type
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [
      pageId,
      sectionId,
      user_id || null,
      role || null,
      permission_type,
    ]);

    const response = NextResponse.json(
      {
        message: 'Permission granted successfully',
        permission: result.rows[0],
      },
      { status: 201 }
    );
    corsResponse(response, request.headers.get('origin'));
    return response;
  } catch (error: any) {
    console.error('Error granting permission:', error);

    // Check for unique constraint violation
    if (error.code === '23505') {
      const errorResponse = NextResponse.json(
        { error: 'This permission already exists' },
        { status: 400 }
      );
      corsResponse(errorResponse, request.headers.get('origin'));
      return errorResponse;
    }

    const errorResponse = NextResponse.json(
      { error: 'Failed to grant permission' },
      { status: 500 }
    );
    corsResponse(errorResponse, request.headers.get('origin'));
    return errorResponse;
  }
}
