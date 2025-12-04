import { NextRequest, NextResponse } from 'next/server';
import ImpactStat from '@/models/ImpactStat';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// GET /api/impact-stats/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const stat = await ImpactStat.getById(params.id);
    
    if (!stat) {
      return NextResponse.json(
        { success: false, error: 'Impact stat not found' },
        { status: 404, headers: corsHeaders }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: stat,
    }, { headers: corsHeaders });
  } catch (error) {
    console.error('Error fetching impact stat:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch impact stat' },
      { status: 500, headers: corsHeaders }
    );
  }
}

// PUT /api/impact-stats/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    // Validate character limits if provided
    if (body.title && body.title.length > 100) {
      return NextResponse.json(
        { success: false, error: 'Title must be 100 characters or less' },
        { status: 400, headers: corsHeaders }
      );
    }
    
    if (body.value && body.value.length > 50) {
      return NextResponse.json(
        { success: false, error: 'Value must be 50 characters or less' },
        { status: 400, headers: corsHeaders }
      );
    }
    
    const stat = await ImpactStat.update(params.id, body);
    
    if (!stat) {
      return NextResponse.json(
        { success: false, error: 'Impact stat not found' },
        { status: 404, headers: corsHeaders }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: stat,
    }, { headers: corsHeaders });
  } catch (error) {
    console.error('Error updating impact stat:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update impact stat' },
      { status: 500, headers: corsHeaders }
    );
  }
}

// DELETE /api/impact-stats/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const stat = await ImpactStat.delete(params.id);
    
    if (!stat) {
      return NextResponse.json(
        { success: false, error: 'Impact stat not found' },
        { status: 404, headers: corsHeaders }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Impact stat deleted successfully',
    }, { headers: corsHeaders });
  } catch (error) {
    console.error('Error deleting impact stat:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete impact stat' },
      { status: 500, headers: corsHeaders }
    );
  }
}
