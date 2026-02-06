import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { corsResponse, corsOptionsResponse } from '@/lib/cors';
import { verifyAuth } from '@/lib/auth-middleware';
import { sanitizeUrls } from '@/lib/url-utils';

// Handle CORS preflight
export async function OPTIONS(request: NextRequest) {
  return corsOptionsResponse(request.headers.get('origin'));
}

// GET /api/pages/:slug - Get page with all sections
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    // First, try to get from pages table (new section-based structure)
    const pageResult = await query(`
      SELECT
        p.*,
        creator.full_name as creator_name,
        updater.full_name as updater_name,
        pl.name as layout_name,
        pl.display_name as layout_display_name,
        pl.structure as layout_structure
      FROM pages p
      LEFT JOIN users creator ON p.created_by = creator.id
      LEFT JOIN users updater ON p.updated_by = updater.id
      LEFT JOIN page_layouts pl ON p.layout_id = pl.id
      WHERE p.slug = $1
    `, [slug]);

    // If not found in pages table, try content table (legacy structure)
    if (pageResult.rows.length === 0) {
      const contentResult = await query(`
        SELECT
          id,
          title,
          slug,
          body as content,
          excerpt,
          meta_data,
          published_at,
          updated_at
        FROM content
        WHERE type = 'page'
          AND slug = $1
          AND status = 'published'
          AND deleted_at IS NULL
      `, [slug]);

      if (contentResult.rows.length > 0) {
        const pageData = contentResult.rows[0];

        // Parse the body JSON content
        let parsedContent = {};
        if (pageData.content) {
          try {
            parsedContent = typeof pageData.content === 'string'
              ? JSON.parse(pageData.content)
              : pageData.content;
          } catch (e) {
            console.error('Error parsing page content:', e);
          }
        }

        const page = {
          id: pageData.id,
          slug: pageData.slug,
          title: pageData.title,
          meta_title: pageData.title,
          meta_description: pageData.excerpt,
          is_active: true,
          layout_template: 'standard',
          content: sanitizeUrls(parsedContent),
          sections: [],
          published_at: pageData.published_at,
          updated_at: pageData.updated_at,
        };

        const response = NextResponse.json({ page });
        corsResponse(response, request.headers.get('origin'));
        return response;
      }

      // Not found in either table
      const errorResponse = NextResponse.json(
        { error: 'Page not found' },
        { status: 404 }
      );
      corsResponse(errorResponse, request.headers.get('origin'));
      return errorResponse;
    }

    const page = pageResult.rows[0];

    // Check authentication for non-active pages
    const authResult = await verifyAuth(request);
    if (!page.is_active && !authResult.authenticated) {
      const errorResponse = NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
      return corsResponse(errorResponse, request.headers.get('origin'));
    }

    // Get all sections for the page with template information
    const sectionsResult = await query(`
      SELECT
        ps.*,
        creator.full_name as creator_name,
        updater.full_name as updater_name,
        st.component_type as template_component_type,
        st.display_name as template_display_name,
        st.schema as template_schema,
        st.default_props as template_default_props
      FROM page_sections ps
      LEFT JOIN users creator ON ps.created_by = creator.id
      LEFT JOIN users updater ON ps.updated_by = updater.id
      LEFT JOIN section_templates st ON ps.template_id = st.id
      WHERE ps.page_id = $1
        AND (ps.is_active = true OR $2 = true)
      ORDER BY ps.order_index ASC, ps.created_at ASC
    `, [page.id, authResult.authenticated]);

    // Sanitize URLs in sections content to remove localhost references
    const sanitizedSections = sectionsResult.rows.map(section => {
      const sanitizedContent = sanitizeUrls(section.content);

      // Debug logging for ways-to-donate page
      if (slug === 'ways-to-donate' && section.section_type === 'page_content') {
        console.log('[Pages GET] ways-to-donate section content:', {
          raw_donationOptions: section.content?.donationOptions?.map((opt: any, i: number) => ({
            index: i,
            title: opt.title,
            image: opt.image
          })),
          sanitized_donationOptions: sanitizedContent?.donationOptions?.map((opt: any, i: number) => ({
            index: i,
            title: opt.title,
            image: opt.image
          }))
        });
      }

      return {
        ...section,
        content: sanitizedContent,
      };
    });

    const response = NextResponse.json({
      page: {
        ...page,
        sections: sanitizedSections,
      },
    });
    return corsResponse(response, request.headers.get('origin'));
  } catch (error: any) {
    console.error('Error fetching page:', error);
    const errorResponse = NextResponse.json(
      { error: 'Failed to fetch page' },
      { status: 500 }
    );
    return corsResponse(errorResponse, request.headers.get('origin'));
  }
}

// PUT /api/pages/:slug - Update page metadata
export async function PUT(
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

    // Check permissions (admin or has edit permission)
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
      title,
      meta_title,
      meta_description,
      layout_template,
      layout_id,
      template_variables,
    } = body;

    // Build dynamic update query
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (title !== undefined) {
      updates.push(`title = $${paramCount++}`);
      values.push(title);
    }
    if (meta_title !== undefined) {
      updates.push(`meta_title = $${paramCount++}`);
      values.push(meta_title);
    }
    if (meta_description !== undefined) {
      updates.push(`meta_description = $${paramCount++}`);
      values.push(meta_description);
    }
    if (layout_template !== undefined) {
      updates.push(`layout_template = $${paramCount++}`);
      values.push(layout_template);
    }
    if (layout_id !== undefined) {
      updates.push(`layout_id = $${paramCount++}`);
      values.push(layout_id);
    }
    if (template_variables !== undefined) {
      updates.push(`template_variables = $${paramCount++}`);
      values.push(JSON.stringify(template_variables));
    }

    // Always update these fields
    updates.push(`updated_by = $${paramCount++}`);
    values.push(user.id);
    updates.push(`updated_at = CURRENT_TIMESTAMP`);

    // Add page ID as last parameter
    values.push(pageId);

    // Update page
    const result = await query(`
      UPDATE pages
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `, values);

    const response = NextResponse.json({
      message: 'Page updated successfully',
      page: result.rows[0],
    });
    corsResponse(response, request.headers.get('origin'));
    return response;
  } catch (error: any) {
    console.error('Error updating page:', error);
    const errorResponse = NextResponse.json(
      { error: 'Failed to update page' },
      { status: 500 }
    );
    corsResponse(errorResponse, request.headers.get('origin'));
    return errorResponse;
  }
}

// DELETE /api/pages/:slug - Delete page (admin only)
export async function DELETE(
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

    // Only admins can delete pages
    if (user.role !== 'admin') {
      const errorResponse = NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
      corsResponse(errorResponse, request.headers.get('origin'));
      return errorResponse;
    }

    const { slug } = params;

    // Delete page (CASCADE will delete sections, permissions, revisions)
    const result = await query(
      'DELETE FROM pages WHERE slug = $1 RETURNING id',
      [slug]
    );

    if (result.rows.length === 0) {
      const errorResponse = NextResponse.json(
        { error: 'Page not found' },
        { status: 404 }
      );
      corsResponse(errorResponse, request.headers.get('origin'));
      return errorResponse;
    }

    const response = NextResponse.json({
      message: 'Page deleted successfully',
    });
    corsResponse(response, request.headers.get('origin'));
    return response;
  } catch (error: any) {
    console.error('Error deleting page:', error);
    const errorResponse = NextResponse.json(
      { error: 'Failed to delete page' },
      { status: 500 }
    );
    corsResponse(errorResponse, request.headers.get('origin'));
    return errorResponse;
  }
}
