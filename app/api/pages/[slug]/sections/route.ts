import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { corsResponse, corsOptionsResponse } from '@/lib/cors';
import { verifyAuth } from '@/lib/auth-middleware';
import { AuditLogModel } from '@/models/AuditLog';

// Handle CORS preflight
export async function OPTIONS(request: NextRequest) {
  return corsOptionsResponse(request.headers.get('origin'));
}

// GET /api/pages/:slug/sections - Get all sections for a page
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
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

    // Get all sections
    const sectionsResult = await query(`
      SELECT
        ps.*,
        creator.full_name as creator_name,
        updater.full_name as updater_name
      FROM page_sections ps
      LEFT JOIN users creator ON ps.created_by = creator.id
      LEFT JOIN users updater ON ps.updated_by = updater.id
      WHERE ps.page_id = $1
      ORDER BY ps.order_index ASC, ps.created_at ASC
    `, [pageId]);

    const response = NextResponse.json({ sections: sectionsResult.rows });
    corsResponse(response, request.headers.get('origin'));
    return response;
  } catch (error: any) {
    console.error('Error fetching sections:', error);
    const errorResponse = NextResponse.json(
      { error: 'Failed to fetch sections' },
      { status: 500 }
    );
    corsResponse(errorResponse, request.headers.get('origin'));
    return errorResponse;
  }
}

// POST /api/pages/:slug/sections - Create new section
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

    // Check permissions (admin or has edit permission on page)
    if (user.role !== 'admin') {
      const permissionResult = await query(`
        SELECT id FROM page_permissions
        WHERE page_id = $1
          AND permission_type = 'edit'
          AND (user_id = $2 OR role = $3)
        LIMIT 1
      `, [pageId, user.id, user.role]);

      if (permissionResult.rows.length === 0) {
        const errorResponse = NextResponse.json(
          { error: 'Forbidden - No edit permission for this page' },
          { status: 403 }
        );
        corsResponse(errorResponse, request.headers.get('origin'));
        return errorResponse;
      }
    }

    const body = await request.json();
    const {
      section_key,
      section_type,
      title,
      content = {},
      order_index = 0,
      is_active = true,
    } = body;

    // Validate required fields
    if (!section_key || !section_type) {
      const errorResponse = NextResponse.json(
        { error: 'Missing required fields: section_key, section_type' },
        { status: 400 }
      );
      corsResponse(errorResponse, request.headers.get('origin'));
      return errorResponse;
    }

    // Validate section type
    const validTypes = [
      'text', 'html', 'image', 'gallery', 'stats', 'hero', 'cta',
      'regional_impact', 'page_content', 'map', 'achievements', 'scholarship',
      'project_portfolio', 'resources', 'impact_stories'
    ];
    if (!validTypes.includes(section_type)) {
      const errorResponse = NextResponse.json(
        { error: `Invalid section_type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      );
      corsResponse(errorResponse, request.headers.get('origin'));
      return errorResponse;
    }

    // Check if section_key already exists for this page
    const existingSection = await query(
      'SELECT id FROM page_sections WHERE page_id = $1 AND section_key = $2',
      [pageId, section_key]
    );

    if (existingSection.rows.length > 0) {
      const errorResponse = NextResponse.json(
        { error: 'A section with this key already exists on this page' },
        { status: 400 }
      );
      corsResponse(errorResponse, request.headers.get('origin'));
      return errorResponse;
    }

    // Create section
    const result = await query(`
      INSERT INTO page_sections (
        page_id,
        section_key,
        section_type,
        title,
        content,
        order_index,
        is_active,
        created_by,
        updated_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [
      pageId,
      section_key,
      section_type,
      title || '',
      JSON.stringify(content),
      order_index,
      is_active,
      user.id,
      user.id,
    ]);

    const newSection = result.rows[0];

    // Log section creation in audit trail
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || '';

    await AuditLogModel.create({
      user_id: user.id,
      action: 'create',
      entity_type: 'page_section',
      entity_id: newSection.id,
      changes: {
        page_slug: slug,
        section_key: newSection.section_key,
        section_type: newSection.section_type,
        title: newSection.title
      },
      ip_address: ipAddress,
      user_agent: userAgent
    });

    const response = NextResponse.json(
      {
        message: 'Section created successfully',
        section: newSection,
      },
      { status: 201 }
    );
    corsResponse(response, request.headers.get('origin'));
    return response;
  } catch (error: any) {
    console.error('Error creating section:', error);
    const errorResponse = NextResponse.json(
      { error: 'Failed to create section' },
      { status: 500 }
    );
    corsResponse(errorResponse, request.headers.get('origin'));
    return errorResponse;
  }
}
