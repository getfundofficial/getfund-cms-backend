import { NextRequest, NextResponse } from 'next/server';
import ImpactStat from '@/models/ImpactStat';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// GET /api/impact-stats/subtitle?page=why-fundraising
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || 'all';
    
    const subtitle = await ImpactStat.getSubtitle(page);
    
    return NextResponse.json({
      success: true,
      data: { subtitle },
    }, { headers: corsHeaders });
  } catch (error) {
    console.error('Error fetching subtitle:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch subtitle' },
      { status: 500, headers: corsHeaders }
    );
  }
}

// PUT /api/impact-stats/subtitle
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.page || !body.subtitle) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: page, subtitle' },
        { status: 400, headers: corsHeaders }
      );
    }
    
    if (body.subtitle.length > 200) {
      return NextResponse.json(
        { success: false, error: 'Subtitle must be 200 characters or less' },
        { status: 400, headers: corsHeaders }
      );
    }
    
    const result = await ImpactStat.updateSubtitle(body.page, body.subtitle);
    
    return NextResponse.json({
      success: true,
      data: result,
    }, { headers: corsHeaders });
  } catch (error) {
    console.error('Error updating subtitle:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update subtitle' },
      { status: 500, headers: corsHeaders }
    );
  }
}
