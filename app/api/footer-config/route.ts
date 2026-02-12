import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { corsResponse, corsOptionsResponse } from '@/lib/cors';
import { verifyAuth, isAdminRole } from '@/lib/auth-middleware';
import { AuditLogModel } from '@/models/AuditLog';

// Handle CORS preflight
export async function OPTIONS(request: NextRequest) {
  return corsOptionsResponse(request.headers.get('origin'));
}

// GET /api/footer-config - Get active footer configuration (public)
export async function GET(request: NextRequest) {
  try {
    const result = await query(
      `SELECT
        id,
        logo_url,
        about_text,
        phone,
        email,
        address,
        office_hours_weekday,
        office_hours_weekend,
        background_color,
        social_links,
        quick_links,
        is_active,
        updated_at
      FROM footer_config
      WHERE is_active = true
      LIMIT 1`,
      []
    );

    if (result.rows.length === 0) {
      const errorResponse = NextResponse.json(
        { error: 'Footer configuration not found' },
        { status: 404 }
      );
      corsResponse(errorResponse, request.headers.get('origin'));
      return errorResponse;
    }

    const config = result.rows[0];
    const response = NextResponse.json(config);
    corsResponse(response, request.headers.get('origin'));
    return response;
  } catch (error: any) {
    console.error('Error fetching footer config:', error);
    const errorResponse = NextResponse.json(
      { error: 'Failed to fetch footer configuration' },
      { status: 500 }
    );
    corsResponse(errorResponse, request.headers.get('origin'));
    return errorResponse;
  }
}

// PUT /api/footer-config - Update footer configuration (admin only)
export async function PUT(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.authenticated || !isAdminRole(authResult.user?.role)) {
      const errorResponse = NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
      corsResponse(errorResponse, request.headers.get('origin'));
      return errorResponse;
    }

    const data = await request.json();

    // Validate required fields
    if (!data.phone || !data.email) {
      const errorResponse = NextResponse.json(
        { error: 'Phone and email are required' },
        { status: 400 }
      );
      corsResponse(errorResponse, request.headers.get('origin'));
      return errorResponse;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      const errorResponse = NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
      corsResponse(errorResponse, request.headers.get('origin'));
      return errorResponse;
    }

    // Get current config for audit log
    const currentResult = await query(
      `SELECT * FROM footer_config WHERE is_active = true LIMIT 1`,
      []
    );

    // Update footer config
    const result = await query(
      `UPDATE footer_config
      SET
        logo_url = $1,
        about_text = $2,
        phone = $3,
        email = $4,
        address = $5,
        office_hours_weekday = $6,
        office_hours_weekend = $7,
        background_color = $8,
        social_links = $9,
        quick_links = $10,
        updated_at = CURRENT_TIMESTAMP,
        updated_by = $11
      WHERE is_active = true
      RETURNING *`,
      [
        data.logo_url,
        data.about_text,
        data.phone,
        data.email,
        data.address,
        data.office_hours_weekday,
        data.office_hours_weekend,
        data.background_color || '#1e3a5f',
        JSON.stringify(data.social_links || {}),
        JSON.stringify(data.quick_links || []),
        authResult.user.id,
      ]
    );

    const updatedConfig = result.rows[0];

    // Log footer config update
    await AuditLogModel.create({
      user_id: authResult.user.id,
      action: 'update',
      entity_type: 'footer_config',
      entity_id: updatedConfig.id.toString(),
      changes: {
        before: currentResult.rows[0],
        after: updatedConfig,
      },
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
      user_agent: request.headers.get('user-agent') || undefined,
    });

    const response = NextResponse.json(updatedConfig);
    corsResponse(response, request.headers.get('origin'));
    return response;
  } catch (error: any) {
    console.error('Error updating footer config:', error);
    const errorResponse = NextResponse.json(
      { error: 'Failed to update footer configuration', details: error.message },
      { status: 500 }
    );
    corsResponse(errorResponse, request.headers.get('origin'));
    return errorResponse;
  }
}
