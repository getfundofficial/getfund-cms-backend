export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { corsResponse, corsOptionsResponse } from '@/lib/cors';
import { verifyAuth, isAdminRole } from '@/lib/auth-middleware';
import { AuditLogModel } from '@/models/AuditLog';

// Handle CORS preflight
export async function OPTIONS(request: NextRequest) {
  return corsOptionsResponse(request.headers.get('origin'));
}

// GET /api/pages/:slug/sections/:sectionKey - Get specific section
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string; sectionKey: string } }
) {
  try {
    const { slug, sectionKey } = params;

    // Get section with page info
    const result = await query(`
      SELECT
        ps.*,
        p.slug as page_slug,
        p.title as page_title,
        creator.full_name as creator_name,
        updater.full_name as updater_name
      FROM page_sections ps
      JOIN pages p ON ps.page_id = p.id
      LEFT JOIN users creator ON ps.created_by = creator.id
      LEFT JOIN users updater ON ps.updated_by = updater.id
      WHERE p.slug = $1 AND ps.section_key = $2
    `, [slug, sectionKey]);

    if (result.rows.length === 0) {
      const errorResponse = NextResponse.json(
        { error: 'Section not found' },
        { status: 404 }
      );
      corsResponse(errorResponse, request.headers.get('origin'));
      return errorResponse;
    }

    const response = NextResponse.json({ section: result.rows[0] });
    corsResponse(response, request.headers.get('origin'));
    return response;
  } catch (error: any) {
    console.error('Error fetching section:', error);
    const errorResponse = NextResponse.json(
      { error: 'Failed to fetch section' },
      { status: 500 }
    );
    corsResponse(errorResponse, request.headers.get('origin'));
    return errorResponse;
  }
}

// PUT /api/pages/:slug/sections/:sectionKey - Update section content
export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string; sectionKey: string } }
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
    const { slug, sectionKey } = params;

    // Get section and page info
    const sectionResult = await query(`
      SELECT ps.id, ps.page_id, ps.content as old_content, p.slug
      FROM page_sections ps
      JOIN pages p ON ps.page_id = p.id
      WHERE p.slug = $1 AND ps.section_key = $2
    `, [slug, sectionKey]);

    if (sectionResult.rows.length === 0) {
      const errorResponse = NextResponse.json(
        { error: 'Section not found' },
        { status: 404 }
      );
      corsResponse(errorResponse, request.headers.get('origin'));
      return errorResponse;
    }

    const section = sectionResult.rows[0];
    const sectionId = section.id;
    const pageId = section.page_id;

    // Check permissions (admin or has edit permission)
    if (!isAdminRole(user.role)) {
      // Check section-level permission first
      let permissionResult = await query(`
        SELECT id FROM page_permissions
        WHERE section_id = $1
          AND permission_type = 'edit'
          AND (user_id = $2 OR role = $3)
        LIMIT 1
      `, [sectionId, user.id, user.role]);

      // If no section-level permission, check page-level permission
      if (permissionResult.rows.length === 0) {
        permissionResult = await query(`
          SELECT id FROM page_permissions
          WHERE page_id = $1
            AND permission_type = 'edit'
            AND (user_id = $2 OR role = $3)
          LIMIT 1
        `, [pageId, user.id, user.role]);
      }

      if (permissionResult.rows.length === 0) {
        const errorResponse = NextResponse.json(
          { error: 'Forbidden - No edit permission for this section' },
          { status: 403 }
        );
        corsResponse(errorResponse, request.headers.get('origin'));
        return errorResponse;
      }
    }

    const body = await request.json();
    const {
      title,
      content,
      is_active,
      order_index,
    } = body;

    console.log('[Sections PUT] Received content for update:', JSON.stringify(content, null, 2));
    if (content?.donationOptions) {
      console.log('[Sections PUT] Donation options:', content.donationOptions.map((opt: any, i: number) => ({
        index: i,
        title: opt.title,
        image: opt.image
      })));
    }

    // Create revision before updating
    if (content !== undefined) {
      // Get current version number
      const versionResult = await query(
        'SELECT COALESCE(MAX(version_number), 0) + 1 as next_version FROM page_revisions WHERE section_id = $1',
        [sectionId]
      );
      const nextVersion = versionResult.rows[0].next_version;

      // Save current content as revision
      await query(`
        INSERT INTO page_revisions (
          page_id,
          section_id,
          content_snapshot,
          changed_by,
          change_summary,
          version_number
        ) VALUES ($1, $2, $3, $4, $5, $6)
      `, [
        pageId,
        sectionId,
        section.old_content,
        user.id,
        'Content updated via CMS',
        nextVersion,
      ]);
    }

    // Update section
    const result = await query(`
      UPDATE page_sections
      SET
        title = COALESCE($1, title),
        content = COALESCE($2, content),
        is_active = COALESCE($3, is_active),
        order_index = COALESCE($4, order_index),
        updated_by = $5,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING *
    `, [
      title,
      content !== undefined ? JSON.stringify(content) : null,
      is_active,
      order_index,
      user.id,
      sectionId,
    ]);

    const updatedSection = result.rows[0];

    // Log section update in audit trail
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || '';

    const changes: any = {
      page_slug: slug,
      section_key: sectionKey
    };
    if (title !== undefined) changes.title = title;
    if (content !== undefined) changes.content_updated = true;
    if (is_active !== undefined) changes.is_active = is_active;
    if (order_index !== undefined) changes.order_index = order_index;

    await AuditLogModel.create({
      user_id: user.id,
      action: 'update',
      entity_type: 'page_section',
      entity_id: sectionId,
      changes: changes,
      ip_address: ipAddress,
      user_agent: userAgent
    });

    const response = NextResponse.json({
      message: 'Section updated successfully',
      section: updatedSection,
    });
    corsResponse(response, request.headers.get('origin'));
    return response;
  } catch (error: any) {
    console.error('Error updating section:', error);
    const errorResponse = NextResponse.json(
      { error: 'Failed to update section' },
      { status: 500 }
    );
    corsResponse(errorResponse, request.headers.get('origin'));
    return errorResponse;
  }
}

// DELETE /api/pages/:slug/sections/:sectionKey - Delete section
export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string; sectionKey: string } }
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

    // Only admins can delete sections
    if (!isAdminRole(user.role)) {
      const errorResponse = NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
      corsResponse(errorResponse, request.headers.get('origin'));
      return errorResponse;
    }

    const { slug, sectionKey } = params;

    // Delete section
    const result = await query(`
      DELETE FROM page_sections
      WHERE id = (
        SELECT ps.id FROM page_sections ps
        JOIN pages p ON ps.page_id = p.id
        WHERE p.slug = $1 AND ps.section_key = $2
      )
      RETURNING id, section_key, section_type, title
    `, [slug, sectionKey]);

    if (result.rows.length === 0) {
      const errorResponse = NextResponse.json(
        { error: 'Section not found' },
        { status: 404 }
      );
      corsResponse(errorResponse, request.headers.get('origin'));
      return errorResponse;
    }

    const deletedSection = result.rows[0];

    // Log section deletion in audit trail
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || '';

    await AuditLogModel.create({
      user_id: user.id,
      action: 'delete',
      entity_type: 'page_section',
      entity_id: deletedSection.id,
      changes: {
        page_slug: slug,
        section_key: deletedSection.section_key,
        section_type: deletedSection.section_type,
        title: deletedSection.title,
        deleted_by: user.id
      },
      ip_address: ipAddress,
      user_agent: userAgent
    });

    const response = NextResponse.json({
      message: 'Section deleted successfully',
    });
    corsResponse(response, request.headers.get('origin'));
    return response;
  } catch (error: any) {
    console.error('Error deleting section:', error);
    const errorResponse = NextResponse.json(
      { error: 'Failed to delete section' },
      { status: 500 }
    );
    corsResponse(errorResponse, request.headers.get('origin'));
    return errorResponse;
  }
}
