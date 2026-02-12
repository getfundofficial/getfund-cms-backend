import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { corsResponse, corsOptionsResponse } from '@/lib/cors';
import { verifyAuth } from '@/lib/auth-middleware';
import { AuditLogModel } from '@/models/AuditLog';

export async function OPTIONS(request: NextRequest) {
  return corsOptionsResponse(request.headers.get('origin'));
}

// GET /api/donations - List all donations with pagination/filters (admin only)
export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.authenticated || authResult.user?.role !== 'admin') {
      const errorResponse = NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
      return corsResponse(errorResponse, request.headers.get('origin'));
    }

    const { searchParams } = new URL(request.url);
    const donation_type = searchParams.get('donation_type'); // 'general', 'campaign', 'impact'
    const donation_category = searchParams.get('donation_category');
    const payment_status = searchParams.get('payment_status');
    const donor_type = searchParams.get('donor_type');
    const search = searchParams.get('search');
    const start_date = searchParams.get('start_date');
    const end_date = searchParams.get('end_date');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = (page - 1) * limit;

    let sql = `SELECT * FROM donations WHERE 1=1`;
    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (donation_type) {
      params.push(donation_type);
      conditions.push(`donation_type = $${paramIndex++}`);
    }

    if (donation_category) {
      params.push(donation_category);
      conditions.push(`donation_category = $${paramIndex++}`);
    }

    if (payment_status) {
      params.push(payment_status);
      conditions.push(`payment_status = $${paramIndex++}`);
    }

    if (donor_type) {
      params.push(donor_type);
      conditions.push(`donor_type = $${paramIndex++}`);
    }

    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(donor_name ILIKE $${paramIndex} OR donor_email ILIKE $${paramIndex} OR donation_category ILIKE $${paramIndex})`);
      paramIndex++;
    }

    if (start_date) {
      params.push(start_date);
      conditions.push(`created_at >= $${paramIndex++}`);
    }

    if (end_date) {
      params.push(end_date);
      conditions.push(`created_at <= $${paramIndex++}`);
    }

    if (conditions.length > 0) {
      sql += ` AND ${conditions.join(' AND ')}`;
    }

    sql += ` ORDER BY created_at DESC`;
    sql += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(limit, offset);

    // Count query (without pagination params)
    let countSql = `SELECT COUNT(*) as total FROM donations WHERE 1=1`;
    if (conditions.length > 0) {
      countSql += ` AND ${conditions.join(' AND ')}`;
    }

    // Stats query (total amount by status, filtered by donation_type if provided)
    let statsSql = `
      SELECT
        payment_status,
        COUNT(*) as count,
        COALESCE(SUM(amount), 0) as total_amount
      FROM donations
    `;
    const statsParams: any[] = [];
    if (donation_type) {
      statsSql += ` WHERE donation_type = $1`;
      statsParams.push(donation_type);
    }
    statsSql += ` GROUP BY payment_status`;

    const [donationsResult, countResult, statsResult] = await Promise.all([
      query(sql, params),
      query(countSql, params.slice(0, -2)),
      query(statsSql, statsParams)
    ]);

    const total = parseInt(countResult.rows[0]?.total || '0');
    const totalPages = Math.ceil(total / limit);

    // Format stats
    const stats = {
      pending: { count: 0, total_amount: 0 },
      completed: { count: 0, total_amount: 0 },
      failed: { count: 0, total_amount: 0 },
      refunded: { count: 0, total_amount: 0 }
    };

    statsResult.rows.forEach((row: any) => {
      if (stats[row.payment_status as keyof typeof stats]) {
        stats[row.payment_status as keyof typeof stats] = {
          count: parseInt(row.count),
          total_amount: parseFloat(row.total_amount)
        };
      }
    });

    const response = NextResponse.json({
      success: true,
      donations: donationsResult.rows,
      stats,
      pagination: { page, limit, total, totalPages }
    });
    return corsResponse(response, request.headers.get('origin'));
  } catch (error: any) {
    console.error('Error fetching donations:', error);
    const errorResponse = NextResponse.json(
      { success: false, error: 'Failed to fetch donations' },
      { status: 500 }
    );
    return corsResponse(errorResponse, request.headers.get('origin'));
  }
}

// PATCH /api/donations - Update donation status (admin only)
export async function PATCH(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.authenticated || authResult.user?.role !== 'admin') {
      const errorResponse = NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
      return corsResponse(errorResponse, request.headers.get('origin'));
    }

    const body = await request.json();
    const { id, payment_status, notes } = body;

    if (!id) {
      const errorResponse = NextResponse.json(
        { success: false, error: 'Donation ID is required' },
        { status: 400 }
      );
      return corsResponse(errorResponse, request.headers.get('origin'));
    }

    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (payment_status) {
      params.push(payment_status);
      updates.push(`payment_status = $${paramIndex++}`);

      // Set paid_at if status is completed
      if (payment_status === 'completed') {
        updates.push(`paid_at = CURRENT_TIMESTAMP`);
      }
    }

    if (notes !== undefined) {
      params.push(notes);
      updates.push(`metadata = jsonb_set(COALESCE(metadata, '{}'), '{notes}', $${paramIndex++}::jsonb)`);
    }

    if (updates.length === 0) {
      const errorResponse = NextResponse.json(
        { success: false, error: 'No updates provided' },
        { status: 400 }
      );
      return corsResponse(errorResponse, request.headers.get('origin'));
    }

    params.push(id);
    const sql = `
      UPDATE donations
      SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await query(sql, params);

    if (result.rows.length === 0) {
      const errorResponse = NextResponse.json(
        { success: false, error: 'Donation not found' },
        { status: 404 }
      );
      return corsResponse(errorResponse, request.headers.get('origin'));
    }

    const updatedDonation = result.rows[0];

    // Log donation status change in audit trail
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || '';

    await AuditLogModel.create({
      user_id: authResult.user?.id,
      action: 'status_change',
      entity_type: 'donation',
      entity_id: updatedDonation.id,
      changes: body,
      ip_address: ipAddress,
      user_agent: userAgent
    });

    const response = NextResponse.json({
      success: true,
      message: 'Donation updated successfully',
      data: updatedDonation
    });
    return corsResponse(response, request.headers.get('origin'));
  } catch (error: any) {
    console.error('Error updating donation:', error);
    const errorResponse = NextResponse.json(
      { success: false, error: 'Failed to update donation' },
      { status: 500 }
    );
    return corsResponse(errorResponse, request.headers.get('origin'));
  }
}
