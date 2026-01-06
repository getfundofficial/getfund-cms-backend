import { NextRequest, NextResponse } from 'next/server';
import Partner from '@/models/Partner';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

/**
 * GET /api/partners
 * Get all partners
 * Query params:
 *  - all: true - returns all partners including inactive (for CMS admin)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const all = searchParams.get('all');

    let data;

    if (all === 'true') {
      // Return all partners (for CMS admin)
      data = await Partner.getAll();
    } else {
      // Return only active partners (for public website)
      data = await Partner.getActive();
    }

    return NextResponse.json({
      success: true,
      data,
    }, { headers: corsHeaders });
  } catch (error) {
    console.error('Error fetching partners:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch partners' },
      { status: 500, headers: corsHeaders }
    );
  }
}

/**
 * POST /api/partners
 * Create a new partner
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.logo_url) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: name, logo_url' },
        { status: 400, headers: corsHeaders }
      );
    }

    const partner = await Partner.create({
      name: body.name,
      logo_url: body.logo_url,
      website_url: body.website_url,
      description: body.description,
      display_order: body.display_order,
      is_active: body.is_active,
    });

    return NextResponse.json({
      success: true,
      data: partner,
    }, { headers: corsHeaders });
  } catch (error) {
    console.error('Error creating partner:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create partner' },
      { status: 500, headers: corsHeaders }
    );
  }
}

/**
 * PUT /api/partners
 * Update display order for multiple partners
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.orderData || !Array.isArray(body.orderData)) {
      return NextResponse.json(
        { success: false, error: 'Missing orderData array' },
        { status: 400, headers: corsHeaders }
      );
    }

    await Partner.updateOrder(body.orderData);

    return NextResponse.json({
      success: true,
      message: 'Order updated successfully',
    }, { headers: corsHeaders });
  } catch (error) {
    console.error('Error updating partner order:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update partner order' },
      { status: 500, headers: corsHeaders }
    );
  }
}
