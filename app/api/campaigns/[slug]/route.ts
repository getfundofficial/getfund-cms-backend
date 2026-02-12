import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { corsResponse, corsOptionsResponse } from '@/lib/cors';
import { verifyAuth, isAdminRole } from '@/lib/auth-middleware';
import { AuditLogModel } from '@/models/AuditLog';

export async function OPTIONS(request: NextRequest) {
  return corsOptionsResponse(request.headers.get('origin'));
}

// GET /api/campaigns/[slug] - Get single campaign
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const authResult = await verifyAuth(request);
    const { slug } = params;

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
      WHERE c.slug = $1 AND c.deleted_at IS NULL
    `;

    // Public API: only show active campaigns
    if (!authResult.authenticated) {
      sql += ` AND c.status = 'active'`;
    }

    const result = await query(sql, [slug]);

    if (result.rows.length === 0) {
      const errorResponse = NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
      return corsResponse(errorResponse, request.headers.get('origin'));
    }

    const response = NextResponse.json({ campaign: result.rows[0] });
    return corsResponse(response, request.headers.get('origin'));
  } catch (error: any) {
    console.error('Error fetching campaign:', error);
    const errorResponse = NextResponse.json(
      { error: 'Failed to fetch campaign' },
      { status: 500 }
    );
    return corsResponse(errorResponse, request.headers.get('origin'));
  }
}

// PUT /api/campaigns/[slug] - Update campaign (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.authenticated || !isAdminRole(authResult.user?.role)) {
      const errorResponse = NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
      return corsResponse(errorResponse, request.headers.get('origin'));
    }

    const { slug } = params;
    const body = await request.json();
    const {
      title,
      description,
      image_url,
      goal_amount,
      start_date,
      end_date,
      status,
      is_featured,
      display_order,
      button_text,
      currency
    } = body;

    // Validation
    if (description && description.length > 5000) {
      const errorResponse = NextResponse.json(
        { error: 'Description must be 5000 characters or less' },
        { status: 400 }
      );
      return corsResponse(errorResponse, request.headers.get('origin'));
    }

    if (goal_amount !== undefined && goal_amount <= 0) {
      const errorResponse = NextResponse.json(
        { error: 'Goal amount must be greater than 0' },
        { status: 400 }
      );
      return corsResponse(errorResponse, request.headers.get('origin'));
    }

    // Build update query dynamically
    const updateFields: string[] = [];
    const updateValues: any[] = [];
    let paramIndex = 1;

    if (title !== undefined) {
      updateFields.push(`title = $${paramIndex++}`);
      updateValues.push(title);
    }
    if (description !== undefined) {
      updateFields.push(`description = $${paramIndex++}`);
      updateValues.push(description);
    }
    if (image_url !== undefined) {
      updateFields.push(`image_url = $${paramIndex++}`);
      updateValues.push(image_url);
    }
    if (goal_amount !== undefined) {
      updateFields.push(`goal_amount = $${paramIndex++}`);
      updateValues.push(goal_amount);
    }
    if (start_date !== undefined) {
      updateFields.push(`start_date = $${paramIndex++}`);
      updateValues.push(start_date);
    }
    if (end_date !== undefined) {
      updateFields.push(`end_date = $${paramIndex++}`);
      updateValues.push(end_date);
    }
    if (status !== undefined) {
      updateFields.push(`status = $${paramIndex++}`);
      updateValues.push(status);
    }
    if (is_featured !== undefined) {
      updateFields.push(`is_featured = $${paramIndex++}`);
      updateValues.push(is_featured);
    }
    if (display_order !== undefined) {
      updateFields.push(`display_order = $${paramIndex++}`);
      updateValues.push(display_order);
    }
    if (button_text !== undefined) {
      updateFields.push(`button_text = $${paramIndex++}`);
      updateValues.push(button_text);
    }
    if (currency !== undefined) {
      updateFields.push(`currency = $${paramIndex++}`);
      updateValues.push(currency);
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

    updateValues.push(slug);
    const sql = `
      UPDATE fundraising_campaigns
      SET ${updateFields.join(', ')}
      WHERE slug = $${paramIndex} AND deleted_at IS NULL
      RETURNING *
    `;

    const result = await query(sql, updateValues);

    if (result.rows.length === 0) {
      const errorResponse = NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
      return corsResponse(errorResponse, request.headers.get('origin'));
    }

    const updatedCampaign = result.rows[0];

    // Log campaign update in audit trail
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || '';

    await AuditLogModel.create({
      user_id: authResult.user?.id,
      action: 'update',
      entity_type: 'campaign',
      entity_id: updatedCampaign.id,
      changes: body,
      ip_address: ipAddress,
      user_agent: userAgent
    });

    const response = NextResponse.json({
      message: 'Campaign updated successfully',
      campaign: updatedCampaign
    });
    return corsResponse(response, request.headers.get('origin'));
  } catch (error: any) {
    console.error('Error updating campaign:', error);
    const errorResponse = NextResponse.json(
      { error: error.message || 'Failed to update campaign' },
      { status: 500 }
    );
    return corsResponse(errorResponse, request.headers.get('origin'));
  }
}

// DELETE /api/campaigns/[slug] - Soft delete campaign (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.authenticated || !isAdminRole(authResult.user?.role)) {
      const errorResponse = NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
      return corsResponse(errorResponse, request.headers.get('origin'));
    }

    const { slug } = params;

    const result = await query(`
      UPDATE fundraising_campaigns
      SET deleted_at = CURRENT_TIMESTAMP,
          updated_by = $1
      WHERE slug = $2 AND deleted_at IS NULL
      RETURNING id, slug
    `, [authResult.user?.id, slug]);

    if (result.rows.length === 0) {
      const errorResponse = NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
      return corsResponse(errorResponse, request.headers.get('origin'));
    }

    const deletedCampaign = result.rows[0];

    // Log campaign deletion in audit trail
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || '';

    await AuditLogModel.create({
      user_id: authResult.user?.id,
      action: 'delete',
      entity_type: 'campaign',
      entity_id: deletedCampaign.id,
      changes: { slug: deletedCampaign.slug },
      ip_address: ipAddress,
      user_agent: userAgent
    });

    const response = NextResponse.json({
      message: 'Campaign deleted successfully'
    });
    return corsResponse(response, request.headers.get('origin'));
  } catch (error: any) {
    console.error('Error deleting campaign:', error);
    const errorResponse = NextResponse.json(
      { error: 'Failed to delete campaign' },
      { status: 500 }
    );
    return corsResponse(errorResponse, request.headers.get('origin'));
  }
}
