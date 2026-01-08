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
      `SELECT id, phone, email, address, updated_at
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

// PUT /api/fundraising-contact - Update fundraising contact info (admin only)
export async function PUT(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.authenticated || authResult.user?.role !== 'admin') {
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

    // Check if record exists
    const existing = await query(
      `SELECT id FROM fundraising_contact WHERE is_active = true LIMIT 1`,
      []
    );

    let result;
    if (existing.rows.length === 0) {
      // Insert new record
      result = await query(
        `INSERT INTO fundraising_contact (phone, email, address, updated_by)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [data.phone, data.email, data.address || 'GETFund House, Accra', authResult.user.id]
      );
    } else {
      // Update existing record
      result = await query(
        `UPDATE fundraising_contact
         SET phone = $1,
             email = $2,
             address = $3,
             updated_at = CURRENT_TIMESTAMP,
             updated_by = $4
         WHERE is_active = true
         RETURNING *`,
        [data.phone, data.email, data.address || 'GETFund House, Accra', authResult.user.id]
      );
    }

    const response = NextResponse.json(result.rows[0]);
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
