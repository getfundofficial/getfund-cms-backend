import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { corsResponse, corsOptionsResponse } from '@/lib/cors';
import { verifyAuth } from '@/lib/auth-middleware';

export async function OPTIONS(request: NextRequest) {
  return corsOptionsResponse(request.headers.get('origin'));
}

// GET /api/lottery/config - Get lottery configuration (public)
export async function GET(request: NextRequest) {
  try {
    const result = await query(`
      SELECT
        lc.*,
        (SELECT COUNT(*) FROM lottery_entries WHERE draw_month = date_trunc('month', lc.next_draw_date)::date AND is_valid = true) as current_entries_count
      FROM lottery_config lc
      WHERE id = 1
    `);

    if (result.rows.length === 0) {
      const errorResponse = NextResponse.json(
        { error: 'Lottery configuration not found' },
        { status: 404 }
      );
      return corsResponse(errorResponse, request.headers.get('origin'));
    }

    const response = NextResponse.json({ config: result.rows[0] });
    return corsResponse(response, request.headers.get('origin'));
  } catch (error: any) {
    console.error('Error fetching lottery config:', error);
    const errorResponse = NextResponse.json(
      { error: 'Failed to fetch lottery configuration' },
      { status: 500 }
    );
    return corsResponse(errorResponse, request.headers.get('origin'));
  }
}

// PUT /api/lottery/config - Update lottery configuration (admin only)
export async function PUT(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.authenticated || authResult.user?.role !== 'admin') {
      const errorResponse = NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
      return corsResponse(errorResponse, request.headers.get('origin'));
    }

    const body = await request.json();
    const {
      prizes,
      next_draw_date,
      draw_frequency,
      how_it_works_steps,
      is_active,
      banner_color,
      section_title,
      section_description,
      sharing_enabled,
      share_text,
      share_hashtags
    } = body;

    // Validation
    if (prizes && !Array.isArray(prizes)) {
      const errorResponse = NextResponse.json(
        { error: 'Prizes must be an array' },
        { status: 400 }
      );
      return corsResponse(errorResponse, request.headers.get('origin'));
    }

    if (how_it_works_steps && !Array.isArray(how_it_works_steps)) {
      const errorResponse = NextResponse.json(
        { error: 'How it works steps must be an array' },
        { status: 400 }
      );
      return corsResponse(errorResponse, request.headers.get('origin'));
    }

    if (banner_color && !/^#[0-9A-Fa-f]{6}$/.test(banner_color)) {
      const errorResponse = NextResponse.json(
        { error: 'Banner color must be a valid hex color (e.g., #FCD34D)' },
        { status: 400 }
      );
      return corsResponse(errorResponse, request.headers.get('origin'));
    }

    if (draw_frequency && !['weekly', 'monthly', 'quarterly'].includes(draw_frequency)) {
      const errorResponse = NextResponse.json(
        { error: 'Draw frequency must be weekly, monthly, or quarterly' },
        { status: 400 }
      );
      return corsResponse(errorResponse, request.headers.get('origin'));
    }

    // Build update query dynamically
    const updateFields: string[] = [];
    const updateValues: any[] = [];
    let paramIndex = 1;

    if (prizes !== undefined) {
      updateFields.push(`prizes = $${paramIndex++}`);
      updateValues.push(JSON.stringify(prizes));
    }
    if (next_draw_date !== undefined) {
      updateFields.push(`next_draw_date = $${paramIndex++}`);
      updateValues.push(next_draw_date);
    }
    if (draw_frequency !== undefined) {
      updateFields.push(`draw_frequency = $${paramIndex++}`);
      updateValues.push(draw_frequency);
    }
    if (how_it_works_steps !== undefined) {
      updateFields.push(`how_it_works_steps = $${paramIndex++}`);
      updateValues.push(JSON.stringify(how_it_works_steps));
    }
    if (is_active !== undefined) {
      updateFields.push(`is_active = $${paramIndex++}`);
      updateValues.push(is_active);
    }
    if (banner_color !== undefined) {
      updateFields.push(`banner_color = $${paramIndex++}`);
      updateValues.push(banner_color);
    }
    if (section_title !== undefined) {
      updateFields.push(`section_title = $${paramIndex++}`);
      updateValues.push(section_title);
    }
    if (section_description !== undefined) {
      updateFields.push(`section_description = $${paramIndex++}`);
      updateValues.push(section_description);
    }
    if (sharing_enabled !== undefined) {
      updateFields.push(`sharing_enabled = $${paramIndex++}`);
      updateValues.push(sharing_enabled);
    }
    if (share_text !== undefined) {
      updateFields.push(`share_text = $${paramIndex++}`);
      updateValues.push(share_text);
    }
    if (share_hashtags !== undefined) {
      updateFields.push(`share_hashtags = $${paramIndex++}`);
      updateValues.push(share_hashtags);
    }

    if (updateFields.length === 0) {
      const errorResponse = NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
      return corsResponse(errorResponse, request.headers.get('origin'));
    }

    updateFields.push(`updated_by = $${paramIndex++}`);
    updateValues.push(authResult.user?.id);
    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);

    const sql = `
      UPDATE lottery_config
      SET ${updateFields.join(', ')}
      WHERE id = 1
      RETURNING *
    `;

    const result = await query(sql, updateValues);

    const response = NextResponse.json({
      message: 'Lottery configuration updated successfully',
      config: result.rows[0]
    });
    return corsResponse(response, request.headers.get('origin'));
  } catch (error: any) {
    console.error('Error updating lottery config:', error);
    const errorResponse = NextResponse.json(
      { error: error.message || 'Failed to update lottery configuration' },
      { status: 500 }
    );
    return corsResponse(errorResponse, request.headers.get('origin'));
  }
}
