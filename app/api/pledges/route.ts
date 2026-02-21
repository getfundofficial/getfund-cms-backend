export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { corsResponse, corsOptionsResponse } from '@/lib/cors';
import { verifyAuth, isAdminRole } from '@/lib/auth-middleware';
import { sendPledgeNotification } from '@/lib/email';
import { AuditLogModel } from '@/models/AuditLog';

export async function OPTIONS(request: NextRequest) {
  return corsOptionsResponse(request.headers.get('origin'));
}

// POST /api/pledges - Submit a new pledge (public, no auth required)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      first_name,
      last_name,
      email,
      phone_country_code,
      phone_number,
      country,
      address,
      donation_description
    } = body;

    // Validation
    if (!first_name || !last_name || !email || !phone_country_code ||
        !phone_number || !country || !donation_description) {
      const errorResponse = NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
      return corsResponse(errorResponse, request.headers.get('origin'));
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      const errorResponse = NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
      return corsResponse(errorResponse, request.headers.get('origin'));
    }

    // Phone number validation (minimum 5 digits)
    if (phone_number.length < 5) {
      const errorResponse = NextResponse.json(
        { success: false, error: 'Phone number must be at least 5 digits' },
        { status: 400 }
      );
      return corsResponse(errorResponse, request.headers.get('origin'));
    }

    // Donation description validation (minimum 10 characters)
    if (donation_description.length < 10) {
      const errorResponse = NextResponse.json(
        { success: false, error: 'Donation description must be at least 10 characters' },
        { status: 400 }
      );
      return corsResponse(errorResponse, request.headers.get('origin'));
    }

    const result = await query(`
      INSERT INTO pledge_to_support (
        first_name, last_name, email, phone_country_code,
        phone_number, country, address, donation_description
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, created_at
    `, [
      first_name.trim(),
      last_name.trim(),
      email.trim().toLowerCase(),
      phone_country_code.trim(),
      phone_number.trim(),
      country.trim(),
      address?.trim() || null,
      donation_description.trim()
    ]);

    const pledgeData = {
      id: result.rows[0].id,
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      email: email.trim().toLowerCase(),
      phone_country_code: phone_country_code.trim(),
      phone_number: phone_number.trim(),
      country: country.trim(),
      address: address?.trim() || undefined,
      donation_description: donation_description.trim(),
      created_at: result.rows[0].created_at
    };

    // Send email notification to organization (non-blocking)
    sendPledgeNotification(pledgeData).catch(err => {
      console.error('Failed to send pledge notification email:', err);
    });

    // Log pledge creation in audit trail (no user_id for public submissions)
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || '';

    await AuditLogModel.create({
      user_id: null,
      action: 'create',
      entity_type: 'pledge',
      entity_id: result.rows[0].id,
      changes: {
        email: pledgeData.email,
        country: pledgeData.country
      },
      ip_address: ipAddress,
      user_agent: userAgent
    });

    const response = NextResponse.json({
      success: true,
      message: 'Pledge submitted successfully',
      data: { id: result.rows[0].id, created_at: result.rows[0].created_at }
    }, { status: 201 });
    return corsResponse(response, request.headers.get('origin'));
  } catch (error: any) {
    console.error('Error creating pledge:', error);
    const errorResponse = NextResponse.json(
      { success: false, error: 'Failed to submit pledge' },
      { status: 500 }
    );
    return corsResponse(errorResponse, request.headers.get('origin'));
  }
}

// GET /api/pledges - List pledges with pagination/filters (admin only)
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
    const country = searchParams.get('country');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const start_date = searchParams.get('start_date');
    const end_date = searchParams.get('end_date');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = (page - 1) * limit;

    let sql = `SELECT * FROM pledge_to_support WHERE 1=1`;
    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (country) {
      params.push(country);
      conditions.push(`country = $${paramIndex++}`);
    }

    if (status) {
      params.push(status);
      conditions.push(`status = $${paramIndex++}`);
    }

    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(first_name ILIKE $${paramIndex} OR last_name ILIKE $${paramIndex} OR email ILIKE $${paramIndex})`);
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
    let countSql = `SELECT COUNT(*) as total FROM pledge_to_support WHERE 1=1`;
    if (conditions.length > 0) {
      countSql += ` AND ${conditions.join(' AND ')}`;
    }

    const [pledgesResult, countResult] = await Promise.all([
      query(sql, params),
      query(countSql, params.slice(0, -2))
    ]);

    const total = parseInt(countResult.rows[0]?.total || '0');
    const totalPages = Math.ceil(total / limit);

    const response = NextResponse.json({
      success: true,
      pledges: pledgesResult.rows,
      pagination: { page, limit, total, totalPages }
    });
    return corsResponse(response, request.headers.get('origin'));
  } catch (error: any) {
    console.error('Error fetching pledges:', error);
    const errorResponse = NextResponse.json(
      { success: false, error: 'Failed to fetch pledges' },
      { status: 500 }
    );
    return corsResponse(errorResponse, request.headers.get('origin'));
  }
}
