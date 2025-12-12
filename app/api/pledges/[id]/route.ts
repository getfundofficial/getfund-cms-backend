import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { corsResponse, corsOptionsResponse } from '@/lib/cors';
import { verifyAuth } from '@/lib/auth-middleware';

export async function OPTIONS(request: NextRequest) {
  return corsOptionsResponse(request.headers.get('origin'));
}

// GET /api/pledges/[id] - Get a single pledge (admin only)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.authenticated || authResult.user?.role !== 'admin') {
      const errorResponse = NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
      return corsResponse(errorResponse, request.headers.get('origin'));
    }

    const result = await query(
      'SELECT * FROM pledge_to_support WHERE id = $1',
      [params.id]
    );

    if (result.rows.length === 0) {
      const errorResponse = NextResponse.json(
        { success: false, error: 'Pledge not found' },
        { status: 404 }
      );
      return corsResponse(errorResponse, request.headers.get('origin'));
    }

    const response = NextResponse.json({
      success: true,
      pledge: result.rows[0]
    });
    return corsResponse(response, request.headers.get('origin'));
  } catch (error: any) {
    console.error('Error fetching pledge:', error);
    const errorResponse = NextResponse.json(
      { success: false, error: 'Failed to fetch pledge' },
      { status: 500 }
    );
    return corsResponse(errorResponse, request.headers.get('origin'));
  }
}

// PUT /api/pledges/[id] - Update a pledge (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const {
      first_name,
      last_name,
      email,
      phone_country_code,
      phone_number,
      country,
      address,
      donation_description,
      status,
      notes
    } = body;

    // Check if pledge exists
    const existingResult = await query(
      'SELECT id FROM pledge_to_support WHERE id = $1',
      [params.id]
    );

    if (existingResult.rows.length === 0) {
      const errorResponse = NextResponse.json(
        { success: false, error: 'Pledge not found' },
        { status: 404 }
      );
      return corsResponse(errorResponse, request.headers.get('origin'));
    }

    // Validate status if provided
    const validStatuses = ['pending', 'contacted', 'completed', 'cancelled'];
    if (status && !validStatuses.includes(status)) {
      const errorResponse = NextResponse.json(
        { success: false, error: 'Invalid status value' },
        { status: 400 }
      );
      return corsResponse(errorResponse, request.headers.get('origin'));
    }

    // Email validation if provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        const errorResponse = NextResponse.json(
          { success: false, error: 'Invalid email format' },
          { status: 400 }
        );
        return corsResponse(errorResponse, request.headers.get('origin'));
      }
    }

    // Build dynamic update query
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (first_name !== undefined) {
      updates.push(`first_name = $${paramIndex++}`);
      values.push(first_name.trim());
    }
    if (last_name !== undefined) {
      updates.push(`last_name = $${paramIndex++}`);
      values.push(last_name.trim());
    }
    if (email !== undefined) {
      updates.push(`email = $${paramIndex++}`);
      values.push(email.trim().toLowerCase());
    }
    if (phone_country_code !== undefined) {
      updates.push(`phone_country_code = $${paramIndex++}`);
      values.push(phone_country_code.trim());
    }
    if (phone_number !== undefined) {
      updates.push(`phone_number = $${paramIndex++}`);
      values.push(phone_number.trim());
    }
    if (country !== undefined) {
      updates.push(`country = $${paramIndex++}`);
      values.push(country.trim());
    }
    if (address !== undefined) {
      updates.push(`address = $${paramIndex++}`);
      values.push(address?.trim() || null);
    }
    if (donation_description !== undefined) {
      updates.push(`donation_description = $${paramIndex++}`);
      values.push(donation_description.trim());
    }
    if (status !== undefined) {
      updates.push(`status = $${paramIndex++}`);
      values.push(status);
    }
    if (notes !== undefined) {
      updates.push(`notes = $${paramIndex++}`);
      values.push(notes?.trim() || null);
    }

    if (updates.length === 0) {
      const errorResponse = NextResponse.json(
        { success: false, error: 'No fields to update' },
        { status: 400 }
      );
      return corsResponse(errorResponse, request.headers.get('origin'));
    }

    values.push(params.id);
    const updateSql = `
      UPDATE pledge_to_support
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await query(updateSql, values);

    const response = NextResponse.json({
      success: true,
      message: 'Pledge updated successfully',
      pledge: result.rows[0]
    });
    return corsResponse(response, request.headers.get('origin'));
  } catch (error: any) {
    console.error('Error updating pledge:', error);
    const errorResponse = NextResponse.json(
      { success: false, error: 'Failed to update pledge' },
      { status: 500 }
    );
    return corsResponse(errorResponse, request.headers.get('origin'));
  }
}

// DELETE /api/pledges/[id] - Delete a pledge (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.authenticated || authResult.user?.role !== 'admin') {
      const errorResponse = NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
      return corsResponse(errorResponse, request.headers.get('origin'));
    }

    const result = await query(
      'DELETE FROM pledge_to_support WHERE id = $1 RETURNING id',
      [params.id]
    );

    if (result.rows.length === 0) {
      const errorResponse = NextResponse.json(
        { success: false, error: 'Pledge not found' },
        { status: 404 }
      );
      return corsResponse(errorResponse, request.headers.get('origin'));
    }

    const response = NextResponse.json({
      success: true,
      message: 'Pledge deleted successfully'
    });
    return corsResponse(response, request.headers.get('origin'));
  } catch (error: any) {
    console.error('Error deleting pledge:', error);
    const errorResponse = NextResponse.json(
      { success: false, error: 'Failed to delete pledge' },
      { status: 500 }
    );
    return corsResponse(errorResponse, request.headers.get('origin'));
  }
}
