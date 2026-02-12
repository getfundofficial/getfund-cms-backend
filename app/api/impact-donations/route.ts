import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { corsResponse, corsOptionsResponse } from '@/lib/cors';
import { verifyAuth, isAdminRole } from '@/lib/auth-middleware';

export async function OPTIONS(request: NextRequest) {
  return corsOptionsResponse(request.headers.get('origin'));
}

// POST /api/impact-donations - Submit a new impact donation (public, no auth required)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      donation_type,
      donation_description,
      amount,
      currency = 'GHS',
      donor_email,
      donor_phone,
      donor_name,
      donor_type = 'Individual',
      frequency = 'one-time',
      is_anonymous = false,
      payment_reference,
      payment_status = 'pending',
      payment_method,
      metadata = {},
      notes
    } = body;

    // Validation
    if (!donation_type || !amount) {
      const errorResponse = NextResponse.json(
        { success: false, error: 'Missing required fields: donation_type and amount are required' },
        { status: 400 }
      );
      return corsResponse(errorResponse, request.headers.get('origin'));
    }

    // Amount validation
    if (typeof amount !== 'number' || amount <= 0) {
      const errorResponse = NextResponse.json(
        { success: false, error: 'Amount must be a positive number' },
        { status: 400 }
      );
      return corsResponse(errorResponse, request.headers.get('origin'));
    }

    // Email validation (if provided)
    if (donor_email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(donor_email)) {
        const errorResponse = NextResponse.json(
          { success: false, error: 'Invalid email format' },
          { status: 400 }
        );
        return corsResponse(errorResponse, request.headers.get('origin'));
      }
    }

    const result = await query(`
      INSERT INTO impact_donations (
        donation_type, donation_description, amount, currency,
        donor_email, donor_phone, donor_name, donor_type,
        frequency, is_anonymous, payment_reference, payment_status,
        payment_method, metadata, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING id, created_at
    `, [
      donation_type.trim(),
      donation_description?.trim() || null,
      amount,
      currency,
      donor_email?.trim().toLowerCase() || null,
      donor_phone?.trim() || null,
      donor_name?.trim() || null,
      donor_type,
      frequency,
      is_anonymous,
      payment_reference || null,
      payment_status,
      payment_method || null,
      JSON.stringify(metadata),
      notes?.trim() || null
    ]);

    const response = NextResponse.json({
      success: true,
      message: 'Donation recorded successfully',
      data: {
        id: result.rows[0].id,
        created_at: result.rows[0].created_at
      }
    }, { status: 201 });
    return corsResponse(response, request.headers.get('origin'));
  } catch (error: any) {
    console.error('Error recording impact donation:', error);

    // Handle unique constraint violation for payment_reference
    if (error.code === '23505') {
      const errorResponse = NextResponse.json(
        { success: false, error: 'Duplicate payment reference' },
        { status: 409 }
      );
      return corsResponse(errorResponse, request.headers.get('origin'));
    }

    const errorResponse = NextResponse.json(
      { success: false, error: 'Failed to record donation' },
      { status: 500 }
    );
    return corsResponse(errorResponse, request.headers.get('origin'));
  }
}

// GET /api/impact-donations - List impact donations with pagination/filters (admin only)
export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.authenticated || !isAdminRole(authResult.user?.role)) {
      const errorResponse = NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
      return corsResponse(errorResponse, request.headers.get('origin'));
    }

    const { searchParams } = new URL(request.url);
    const donation_type = searchParams.get('donation_type');
    const payment_status = searchParams.get('payment_status');
    const search = searchParams.get('search');
    const start_date = searchParams.get('start_date');
    const end_date = searchParams.get('end_date');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = (page - 1) * limit;

    let sql = `SELECT * FROM impact_donations WHERE 1=1`;
    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (donation_type) {
      params.push(donation_type);
      conditions.push(`donation_type = $${paramIndex++}`);
    }

    if (payment_status) {
      params.push(payment_status);
      conditions.push(`payment_status = $${paramIndex++}`);
    }

    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(donor_name ILIKE $${paramIndex} OR donor_email ILIKE $${paramIndex} OR donation_type ILIKE $${paramIndex})`);
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

    // Count query
    let countSql = `SELECT COUNT(*) as total FROM impact_donations WHERE 1=1`;
    if (conditions.length > 0) {
      countSql += ` AND ${conditions.join(' AND ')}`;
    }

    // Stats query (total amount by status)
    let statsSql = `
      SELECT
        payment_status,
        COUNT(*) as count,
        COALESCE(SUM(amount), 0) as total_amount
      FROM impact_donations
      GROUP BY payment_status
    `;

    const [donationsResult, countResult, statsResult] = await Promise.all([
      query(sql, params),
      query(countSql, params.slice(0, -2)),
      query(statsSql, [])
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
    console.error('Error fetching impact donations:', error);
    const errorResponse = NextResponse.json(
      { success: false, error: 'Failed to fetch donations' },
      { status: 500 }
    );
    return corsResponse(errorResponse, request.headers.get('origin'));
  }
}

// PATCH /api/impact-donations - Update donation status (admin only)
export async function PATCH(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.authenticated || !isAdminRole(authResult.user?.role)) {
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
      updates.push(`notes = $${paramIndex++}`);
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
      UPDATE impact_donations
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

    const response = NextResponse.json({
      success: true,
      message: 'Donation updated successfully',
      data: result.rows[0]
    });
    return corsResponse(response, request.headers.get('origin'));
  } catch (error: any) {
    console.error('Error updating impact donation:', error);
    const errorResponse = NextResponse.json(
      { success: false, error: 'Failed to update donation' },
      { status: 500 }
    );
    return corsResponse(errorResponse, request.headers.get('origin'));
  }
}
