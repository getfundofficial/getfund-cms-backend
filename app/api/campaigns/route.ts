import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { corsResponse, corsOptionsResponse } from '@/lib/cors';
import { verifyAuth } from '@/lib/auth-middleware';
import { AuditLogModel } from '@/models/AuditLog';

export async function OPTIONS(request: NextRequest) {
  return corsOptionsResponse(request.headers.get('origin'));
}

// GET /api/campaigns - Get all campaigns (public: active only; admin: all)
export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request);
    const { searchParams } = new URL(request.url);
    const featured = searchParams.get('featured') === 'true';
    const status = searchParams.get('status');

    let sql = `
      SELECT
        c.*,
        ROUND((c.raised_amount / NULLIF(c.goal_amount, 0)) * 100, 2) as percentage_funded,
        CASE
          WHEN c.end_date IS NOT NULL
          THEN GREATEST(0, EXTRACT(DAY FROM c.end_date - CURRENT_TIMESTAMP)::INTEGER)
          ELSE NULL
        END as days_left,
        (SELECT COUNT(*) FROM campaign_donations WHERE campaign_id = c.id AND payment_status = 'completed') as donation_count
      FROM fundraising_campaigns c
      WHERE c.deleted_at IS NULL
    `;

    const conditions = [];
    const params: any[] = [];

    // Public API: only show active campaigns
    if (!authResult.authenticated) {
      conditions.push("c.status = 'active'");
    } else if (status) {
      // Admin can filter by status
      params.push(status);
      conditions.push(`c.status = $${params.length}`);
    }

    if (featured) {
      conditions.push("c.is_featured = true");
    }

    if (conditions.length > 0) {
      sql += ` AND ${conditions.join(' AND ')}`;
    }

    sql += ` ORDER BY c.display_order ASC, c.created_at DESC`;

    const result = await query(sql, params);

    const response = NextResponse.json({ campaigns: result.rows });
    return corsResponse(response, request.headers.get('origin'));
  } catch (error: any) {
    console.error('Error fetching campaigns:', error);
    const errorResponse = NextResponse.json(
      { error: 'Failed to fetch campaigns' },
      { status: 500 }
    );
    return corsResponse(errorResponse, request.headers.get('origin'));
  }
}

// POST /api/campaigns - Create campaign (admin only)
export async function POST(request: NextRequest) {
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
      title,
      slug,
      description,
      image_url,
      goal_amount,
      start_date,
      end_date,
      status = 'draft',
      is_featured = false,
      display_order = 0,
      button_text = 'Donate Now',
      currency = 'GHS'
    } = body;

    // Validation
    if (!title || !slug || !description || !goal_amount) {
      const errorResponse = NextResponse.json(
        { error: 'Missing required fields: title, slug, description, goal_amount' },
        { status: 400 }
      );
      return corsResponse(errorResponse, request.headers.get('origin'));
    }

    // Validate slug format (lowercase alphanumeric with hyphens)
    if (!/^[a-z0-9-]+$/.test(slug)) {
      const errorResponse = NextResponse.json(
        { error: 'Slug must contain only lowercase letters, numbers, and hyphens' },
        { status: 400 }
      );
      return corsResponse(errorResponse, request.headers.get('origin'));
    }

    // Validate amounts
    if (goal_amount <= 0) {
      const errorResponse = NextResponse.json(
        { error: 'Goal amount must be greater than 0' },
        { status: 400 }
      );
      return corsResponse(errorResponse, request.headers.get('origin'));
    }

    // Validate description length
    if (description.length > 5000) {
      const errorResponse = NextResponse.json(
        { error: 'Description must be 5000 characters or less' },
        { status: 400 }
      );
      return corsResponse(errorResponse, request.headers.get('origin'));
    }

    const result = await query(`
      INSERT INTO fundraising_campaigns (
        title, slug, description, image_url, goal_amount, start_date, end_date,
        status, is_featured, display_order, button_text, currency, created_by, updated_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *
    `, [
      title,
      slug,
      description,
      image_url || null,
      goal_amount,
      start_date || new Date(),
      end_date || null,
      status,
      is_featured,
      display_order,
      button_text,
      currency,
      authResult.user?.id,
      authResult.user?.id
    ]);

    const newCampaign = result.rows[0];

    // Log campaign creation in audit trail
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || '';

    await AuditLogModel.create({
      user_id: authResult.user?.id,
      action: 'create',
      entity_type: 'campaign',
      entity_id: newCampaign.id,
      changes: {
        title: newCampaign.title,
        slug: newCampaign.slug,
        goal_amount: newCampaign.goal_amount,
        status: newCampaign.status,
        is_featured: newCampaign.is_featured
      },
      ip_address: ipAddress,
      user_agent: userAgent
    });

    const response = NextResponse.json(
      { message: 'Campaign created successfully', campaign: newCampaign },
      { status: 201 }
    );
    return corsResponse(response, request.headers.get('origin'));
  } catch (error: any) {
    console.error('Error creating campaign:', error);

    // Handle unique constraint violation
    if (error.code === '23505' && error.constraint === 'fundraising_campaigns_slug_key') {
      const errorResponse = NextResponse.json(
        { error: 'A campaign with this slug already exists' },
        { status: 409 }
      );
      return corsResponse(errorResponse, request.headers.get('origin'));
    }

    const errorResponse = NextResponse.json(
      { error: error.message || 'Failed to create campaign' },
      { status: 500 }
    );
    return corsResponse(errorResponse, request.headers.get('origin'));
  }
}
