import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { corsResponse, corsOptionsResponse } from '@/lib/cors';
import { verifyAuth } from '@/lib/auth-middleware';

// Handle CORS preflight
export async function OPTIONS(request: NextRequest) {
  return corsOptionsResponse(request.headers.get('origin'));
}

// PUT /api/pages/:slug/menu-config - Update menu configuration
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
    const body = await request.json();

    const {
      show_in_menu,
      menu_order,
      menu_label,
      is_cta_button,
      parent_page_id
    } = body;

    // Build update query dynamically
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (typeof show_in_menu !== 'undefined') {
      updates.push(`show_in_menu = $${paramIndex++}`);
      values.push(show_in_menu);
    }

    if (typeof menu_order !== 'undefined') {
      updates.push(`menu_order = $${paramIndex++}`);
      values.push(menu_order);
    }

    if (typeof menu_label !== 'undefined') {
      updates.push(`menu_label = $${paramIndex++}`);
      values.push(menu_label);
    }

    if (typeof is_cta_button !== 'undefined') {
      updates.push(`is_cta_button = $${paramIndex++}`);
      values.push(is_cta_button);
    }

    if (typeof parent_page_id !== 'undefined') {
      updates.push(`parent_page_id = $${paramIndex++}`);
      values.push(parent_page_id);
    }

    if (updates.length === 0) {
      const errorResponse = NextResponse.json(
        { error: 'No updates provided' },
        { status: 400 }
      );
      corsResponse(errorResponse, request.headers.get('origin'));
      return errorResponse;
    }

    // Add updated_by and updated_at
    updates.push(`updated_by = $${paramIndex++}`);
    values.push(user.id);
    updates.push(`updated_at = NOW()`);

    // Add slug as last parameter
    values.push(slug);

    const result = await query(`
      UPDATE pages
      SET ${updates.join(', ')}
      WHERE slug = $${paramIndex}
      RETURNING *
    `, values);

    if (result.rows.length === 0) {
      const errorResponse = NextResponse.json(
        { error: 'Page not found' },
        { status: 404 }
      );
      corsResponse(errorResponse, request.headers.get('origin'));
      return errorResponse;
    }

    const response = NextResponse.json({
      message: 'Menu configuration updated successfully',
      page: result.rows[0],
    });
    corsResponse(response, request.headers.get('origin'));
    return response;
  } catch (error: any) {
    console.error('Error updating menu config:', error);
    const errorResponse = NextResponse.json(
      { error: 'Failed to update menu configuration' },
      { status: 500 }
    );
    corsResponse(errorResponse, request.headers.get('origin'));
    return errorResponse;
  }
}
