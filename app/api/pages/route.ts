import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { corsResponse, corsOptionsResponse } from '@/lib/cors';
import { verifyAuth, isAdminRole } from '@/lib/auth-middleware';
import { AuditLogModel } from '@/models/AuditLog';

// Configure route to allow longer execution time for database wake-up
export const maxDuration = 180; // 180 seconds (3 minutes)

// Handle CORS preflight
export async function OPTIONS(request: NextRequest) {
  return corsOptionsResponse(request.headers.get('origin'));
}

// Helper function to check if a table exists
async function tableExists(tableName: string): Promise<boolean> {
  try {
    const result = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = $1
      )
    `, [tableName]);
    return result.rows[0]?.exists === true;
  } catch {
    return false;
  }
}

// GET /api/pages - Get all pages (with permission filtering)
export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request);

    // Check if page_layouts table exists
    const hasPageLayouts = await tableExists('page_layouts');
    console.log('[Pages API] page_layouts table exists:', hasPageLayouts);

    // For authenticated users, return all pages they have permission to see
    if (authResult.authenticated) {
      const userId = authResult.user!.id;
      const userRole = authResult.user!.role;

      // Admins see all pages
      if (isAdminRole(userRole)) {
        let result;

        if (hasPageLayouts) {
          result = await query(`
            SELECT
              p.*,
              creator.full_name as creator_name,
              updater.full_name as updater_name,
              pl.name as layout_name,
              pl.display_name as layout_display_name,
              (
                SELECT COUNT(*)::int
                FROM page_sections ps
                WHERE ps.page_id = p.id AND ps.is_active = true
              ) as section_count
            FROM pages p
            LEFT JOIN users creator ON p.created_by = creator.id
            LEFT JOIN users updater ON p.updated_by = updater.id
            LEFT JOIN page_layouts pl ON p.layout_id = pl.id
            ORDER BY p.updated_at DESC
          `);
        } else {
          // Fallback query without page_layouts join
          result = await query(`
            SELECT
              p.*,
              creator.full_name as creator_name,
              updater.full_name as updater_name,
              NULL as layout_name,
              NULL as layout_display_name,
              (
                SELECT COUNT(*)::int
                FROM page_sections ps
                WHERE ps.page_id = p.id AND ps.is_active = true
              ) as section_count
            FROM pages p
            LEFT JOIN users creator ON p.created_by = creator.id
            LEFT JOIN users updater ON p.updated_by = updater.id
            ORDER BY p.updated_at DESC
          `);
        }

        const response = NextResponse.json({ pages: result.rows });
        corsResponse(response, request.headers.get('origin'));
        return response;
      }

      // Non-admins see pages they have permissions for
      let result;

      if (hasPageLayouts) {
        result = await query(`
          SELECT DISTINCT
            p.*,
            creator.full_name as creator_name,
            updater.full_name as updater_name,
            pl.name as layout_name,
            pl.display_name as layout_display_name,
            (
              SELECT COUNT(*)::int
              FROM page_sections ps
              WHERE ps.page_id = p.id AND ps.is_active = true
            ) as section_count
          FROM pages p
          LEFT JOIN users creator ON p.created_by = creator.id
          LEFT JOIN users updater ON p.updated_by = updater.id
          LEFT JOIN page_layouts pl ON p.layout_id = pl.id
          LEFT JOIN page_permissions pp ON pp.page_id = p.id
          WHERE
            pp.user_id = $1 OR pp.role = $2
          ORDER BY p.updated_at DESC
        `, [userId, userRole]);
      } else {
        // Fallback query without page_layouts join
        result = await query(`
          SELECT DISTINCT
            p.*,
            creator.full_name as creator_name,
            updater.full_name as updater_name,
            NULL as layout_name,
            NULL as layout_display_name,
            (
              SELECT COUNT(*)::int
              FROM page_sections ps
              WHERE ps.page_id = p.id AND ps.is_active = true
            ) as section_count
          FROM pages p
          LEFT JOIN users creator ON p.created_by = creator.id
          LEFT JOIN users updater ON p.updated_by = updater.id
          LEFT JOIN page_permissions pp ON pp.page_id = p.id
          WHERE
            pp.user_id = $1 OR pp.role = $2
          ORDER BY p.updated_at DESC
        `, [userId, userRole]);
      }

      const response = NextResponse.json({ pages: result.rows });
      corsResponse(response, request.headers.get('origin'));
      return response;
    }

    // For unauthenticated requests, return only active pages (public API)
    const result = await query(`
      SELECT
        id,
        slug,
        title,
        meta_title,
        meta_description,
        layout_template,
        updated_at
      FROM pages
      WHERE is_active = true
      ORDER BY title ASC
    `);

    const response = NextResponse.json({ pages: result.rows });
    corsResponse(response, request.headers.get('origin'));
    return response;
  } catch (error: any) {
    console.error('Error fetching pages:', error);
    console.error('Error details:', error.message, error.code);
    const errorResponse = NextResponse.json(
      { error: 'Failed to fetch pages', details: error.message },
      { status: 500 }
    );
    corsResponse(errorResponse, request.headers.get('origin'));
    return errorResponse;
  }
}

// POST /api/pages - Create new page (admin only)
export async function POST(request: NextRequest) {
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

    // Only admins can create pages
    if (!isAdminRole(user.role)) {
      const errorResponse = NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
      corsResponse(errorResponse, request.headers.get('origin'));
      return errorResponse;
    }

    const body = await request.json();
    const {
      slug,
      title,
      meta_title,
      meta_description,
      layout_template = 'default',
      layout_id,
      template_variables = {},
      is_active = false,
    } = body;

    // Validate required fields
    if (!slug || !title) {
      const errorResponse = NextResponse.json(
        { error: 'Missing required fields: slug, title' },
        { status: 400 }
      );
      corsResponse(errorResponse, request.headers.get('origin'));
      return errorResponse;
    }

    // Check if slug already exists
    const existingPage = await query(
      'SELECT id FROM pages WHERE slug = $1',
      [slug]
    );

    if (existingPage.rows.length > 0) {
      const errorResponse = NextResponse.json(
        { error: 'A page with this slug already exists' },
        { status: 400 }
      );
      corsResponse(errorResponse, request.headers.get('origin'));
      return errorResponse;
    }

    // Create page
    const result = await query(`
      INSERT INTO pages (
        slug,
        title,
        meta_title,
        meta_description,
        layout_template,
        layout_id,
        template_variables,
        is_active,
        created_by,
        updated_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `, [
      slug,
      title,
      meta_title || title,
      meta_description || '',
      layout_template,
      layout_id || null,
      JSON.stringify(template_variables),
      is_active,
      user.id,
      user.id,
    ]);

    const newPage = result.rows[0];

    // Log page creation in audit trail
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || '';

    await AuditLogModel.create({
      user_id: user.id,
      action: 'create',
      entity_type: 'page',
      entity_id: newPage.id,
      changes: {
        slug: newPage.slug,
        title: newPage.title,
        layout_template: newPage.layout_template,
        is_active: newPage.is_active
      },
      ip_address: ipAddress,
      user_agent: userAgent
    });

    const response = NextResponse.json(
      {
        message: 'Page created successfully',
        page: newPage,
      },
      { status: 201 }
    );
    corsResponse(response, request.headers.get('origin'));
    return response;
  } catch (error: any) {
    console.error('Error creating page:', error);
    const errorResponse = NextResponse.json(
      { error: 'Failed to create page' },
      { status: 500 }
    );
    corsResponse(errorResponse, request.headers.get('origin'));
    return errorResponse;
  }
}
