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
 * GET /api/partners/[id]
 * Get a single partner by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const partner = await Partner.getById(params.id);

    if (!partner) {
      return NextResponse.json(
        { success: false, error: 'Partner not found' },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json({
      success: true,
      data: partner,
    }, { headers: corsHeaders });
  } catch (error) {
    console.error('Error fetching partner:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch partner' },
      { status: 500, headers: corsHeaders }
    );
  }
}

/**
 * PUT /api/partners/[id]
 * Update a partner
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    const partner = await Partner.update(params.id, body);

    return NextResponse.json({
      success: true,
      data: partner,
    }, { headers: corsHeaders });
  } catch (error) {
    console.error('Error updating partner:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update partner' },
      { status: 500, headers: corsHeaders }
    );
  }
}

/**
 * DELETE /api/partners/[id]
 * Delete a partner
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await Partner.delete(params.id);

    return NextResponse.json({
      success: true,
      message: 'Partner deleted successfully',
    }, { headers: corsHeaders });
  } catch (error) {
    console.error('Error deleting partner:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete partner' },
      { status: 500, headers: corsHeaders }
    );
  }
}
