export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth, isAdminRole } from '@/lib/auth-middleware';

// Configure route to allow longer execution time for database wake-up
export const maxDuration = 180;

interface SectionTemplate {
  id: string;
  component_type: string;
  display_name: string;
  description: string | null;
  schema: any;
  default_props: any;
  preview_template: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// GET /api/section-templates/[id] - Get single section template
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await query(
      'SELECT * FROM section_templates WHERE id = $1',
      [params.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Section template not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      template: result.rows[0] as SectionTemplate
    });
  } catch (error) {
    console.error('Error fetching section template:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch section template',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// PUT /api/section-templates/[id] - Update section template (Admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.authenticated || !isAdminRole(authResult.user?.role)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      display_name,
      description,
      schema,
      default_props,
      preview_template,
      is_active
    } = body;

    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (display_name !== undefined) {
      updates.push(`display_name = $${paramCount++}`);
      values.push(display_name);
    }
    if (description !== undefined) {
      updates.push(`description = $${paramCount++}`);
      values.push(description);
    }
    if (schema !== undefined) {
      updates.push(`schema = $${paramCount++}`);
      values.push(JSON.stringify(schema));
    }
    if (default_props !== undefined) {
      updates.push(`default_props = $${paramCount++}`);
      values.push(JSON.stringify(default_props));
    }
    if (preview_template !== undefined) {
      updates.push(`preview_template = $${paramCount++}`);
      values.push(preview_template);
    }
    if (is_active !== undefined) {
      updates.push(`is_active = $${paramCount++}`);
      values.push(is_active);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No fields to update' },
        { status: 400 }
      );
    }

    updates.push(`updated_at = NOW()`);
    values.push(params.id);

    const result = await query(
      `UPDATE section_templates
       SET ${updates.join(', ')}
       WHERE id = $${paramCount}
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Section template not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      template: result.rows[0] as SectionTemplate
    });
  } catch (error) {
    console.error('Error updating section template:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update section template',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE /api/section-templates/[id] - Delete section template (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.authenticated || !isAdminRole(authResult.user?.role)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    // Check if template is in use by any sections
    const usageCheck = await query(
      'SELECT COUNT(*) as count FROM page_sections WHERE template_id = $1',
      [params.id]
    );

    if (parseInt(usageCheck.rows[0].count) > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cannot delete template that is in use by page sections'
        },
        { status: 400 }
      );
    }

    const result = await query(
      'DELETE FROM section_templates WHERE id = $1 RETURNING id',
      [params.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Section template not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Section template deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting section template:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete section template',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
