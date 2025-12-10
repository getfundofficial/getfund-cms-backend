import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { corsResponse, corsOptionsResponse } from '@/lib/cors';
import { verifyAuth } from '@/lib/auth-middleware';

export async function OPTIONS(request: NextRequest) {
  return corsOptionsResponse(request.headers.get('origin'));
}

// GET /api/lottery/entries - Get lottery entries (admin only)
export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.authenticated || authResult.user?.role !== 'admin') {
      const errorResponse = NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
      return corsResponse(errorResponse, request.headers.get('origin'));
    }

    const { searchParams } = new URL(request.url);
    const draw_month = searchParams.get('draw_month');
    const is_winner = searchParams.get('is_winner');
    const campaign_id = searchParams.get('campaign_id');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100); // Max 100 per page
    const offset = (page - 1) * limit;

    let sql = `
      SELECT
        le.*,
        fc.title as campaign_title
      FROM lottery_entries le
      LEFT JOIN fundraising_campaigns fc ON le.campaign_id = fc.id
      WHERE 1=1
    `;

    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (draw_month) {
      params.push(draw_month);
      conditions.push(`le.draw_month = $${paramIndex++}`);
    }

    if (is_winner !== null && is_winner !== undefined) {
      params.push(is_winner === 'true');
      conditions.push(`le.is_winner = $${paramIndex++}`);
    }

    if (campaign_id) {
      params.push(campaign_id);
      conditions.push(`le.campaign_id = $${paramIndex++}`);
    }

    if (conditions.length > 0) {
      sql += ` AND ${conditions.join(' AND ')}`;
    }

    sql += ` ORDER BY le.created_at DESC`;
    sql += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(limit, offset);

    // Get total count for pagination
    let countSql = `
      SELECT COUNT(*) as total
      FROM lottery_entries le
      WHERE 1=1
    `;
    if (conditions.length > 0) {
      countSql += ` AND ${conditions.join(' AND ')}`;
    }

    const [entriesResult, countResult] = await Promise.all([
      query(sql, params),
      query(countSql, params.slice(0, -2)) // Exclude limit and offset for count
    ]);

    const total = parseInt(countResult.rows[0]?.total || '0');
    const totalPages = Math.ceil(total / limit);

    const response = NextResponse.json({
      entries: entriesResult.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    });
    return corsResponse(response, request.headers.get('origin'));
  } catch (error: any) {
    console.error('Error fetching lottery entries:', error);
    const errorResponse = NextResponse.json(
      { error: 'Failed to fetch lottery entries' },
      { status: 500 }
    );
    return corsResponse(errorResponse, request.headers.get('origin'));
  }
}
