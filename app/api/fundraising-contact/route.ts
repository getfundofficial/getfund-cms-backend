import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { corsResponse, corsOptionsResponse } from '@/lib/cors';
import { verifyAuth } from '@/lib/auth-middleware';

// Disable caching for this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Handle CORS preflight
export async function OPTIONS(request: NextRequest) {
  return corsOptionsResponse(request.headers.get('origin'));
}

// GET /api/fundraising-contact - Get fundraising contact info (public)
export async function GET(request: NextRequest) {
  try {
    const result = await query(
      `SELECT id, phone, email, address, button_text, updated_at
       FROM fundraising_contact
       WHERE is_active = true
       LIMIT 1`,
      []
    );

    if (result.rows.length === 0) {
      // Return default values if no record exists
      const response = NextResponse.json({
        phone: '+233 30 266 4061',
        email: 'info@getfund.gov.gh',
        address: 'GETFund House, Accra',
        button_text: 'GET IN TOUCH WITH FUNDRAISING!',
      }, {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        }
      });
      corsResponse(response, request.headers.get('origin'));
      return response;
    }

    const response = NextResponse.json(result.rows[0], {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      }
    });
    corsResponse(response, request.headers.get('origin'));
    return response;
  } catch (error: any) {
    console.error('Error fetching fundraising contact:', error);
    const errorResponse = NextResponse.json(
      { error: 'Failed to fetch fundraising contact info' },
      { status: 500 }
    );
    corsResponse(errorResponse, request.headers.get('origin'));
    return errorResponse;
  }
}

// PUT /api/fundraising-contact - Update fundraising contact info
export async function PUT(request: NextRequest) {
  try {
    // Try to verify auth, but allow if user is logged in (any role)
    let userId = null;
    try {
      const authResult = await verifyAuth(request);
      if (authResult.authenticated && authResult.user) {
        userId = authResult.user.id;
      }
    } catch (authError) {
      console.log('Auth check failed, proceeding without user ID');
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

    // Check if record exists
    const existing = await query(
      `SELECT id FROM fundraising_contact WHERE is_active = true LIMIT 1`,
      []
    );

    let result;
    if (existing.rows.length === 0) {
      // Insert new record
      result = await query(
        `INSERT INTO fundraising_contact (phone, email, address, button_text, updated_by)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [data.phone, data.email, data.address || 'GETFund House, Accra', data.button_text || 'GET IN TOUCH WITH FUNDRAISING!', userId]
      );
    } else {
      // Update existing record
      result = await query(
        `UPDATE fundraising_contact
         SET phone = $1,
             email = $2,
             address = $3,
             button_text = $4,
             updated_at = CURRENT_TIMESTAMP,
             updated_by = $5
         WHERE is_active = true
         RETURNING *`,
        [data.phone, data.email, data.address || 'GETFund House, Accra', data.button_text || 'GET IN TOUCH WITH FUNDRAISING!', userId]
      );
    }

    const response = NextResponse.json({ success: true, data: result.rows[0] });
    corsResponse(response, request.headers.get('origin'));
    return response;
  } catch (error: any) {
    console.error('Error updating fundraising contact:', error);
    const errorResponse = NextResponse.json(
      { error: 'Failed to update fundraising contact info', details: error.message },
      { status: 500 }
    );
    corsResponse(errorResponse, request.headers.get('origin'));
    return errorResponse;
  }
}
