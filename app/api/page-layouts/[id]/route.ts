import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth, isAdminRole } from '@/lib/auth-middleware';

// Configure route to allow longer execution time for database wake-up
export const maxDuration = 180;

interface PageLayout {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
  structure: any;
  metadata: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// GET /api/page-layouts/[id] - Get single page layout
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await query(
      'SELECT * FROM page_layouts WHERE id = $1',
      [params.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Page layout not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      layout: result.rows[0] as PageLayout
    });
  } catch (error) {
    console.error('Error fetching page layout:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch page layout',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// PUT /api/page-layouts/[id] - Update page layout (Admin only)
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
    const { display_name, description, structure, metadata, is_active } = body;

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
    if (structure !== undefined) {
      updates.push(`structure = $${paramCount++}`);
      values.push(JSON.stringify(structure));
    }
    if (metadata !== undefined) {
      updates.push(`metadata = $${paramCount++}`);
      values.push(JSON.stringify(metadata));
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
      `UPDATE page_layouts
       SET ${updates.join(', ')}
       WHERE id = $${paramCount}
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Page layout not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      layout: result.rows[0] as PageLayout
    });
  } catch (error) {
    console.error('Error updating page layout:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update page layout',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE /api/page-layouts/[id] - Delete page layout (Admin only)
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

    // Check if layout is in use by any pages
    const usageCheck = await query(
      'SELECT COUNT(*) as count FROM pages WHERE layout_id = $1',
      [params.id]
    );

    if (parseInt(usageCheck.rows[0].count) > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cannot delete layout that is in use by pages'
        },
        { status: 400 }
      );
    }

    const result = await query(
      'DELETE FROM page_layouts WHERE id = $1 RETURNING id',
      [params.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Page layout not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Page layout deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting page layout:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete page layout',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
