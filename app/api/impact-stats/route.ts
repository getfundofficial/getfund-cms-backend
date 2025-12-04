import { NextRequest, NextResponse } from 'next/server';
import ImpactStat from '@/models/ImpactStat';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// GET /api/impact-stats?page=why-fundraising
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page');
    
    const stats = await ImpactStat.getAll(page);
    const subtitle = await ImpactStat.getSubtitle(page || 'all');
    
    return NextResponse.json({
      success: true,
      data: {
        stats,
        subtitle,
      },
    }, { headers: corsHeaders });
  } catch (error) {
    console.error('Error fetching impact stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch impact stats' },
      { status: 500, headers: corsHeaders }
    );
  }
}

// POST /api/impact-stats
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.title || !body.value || !body.page) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: title, value, page' },
        { status: 400, headers: corsHeaders }
      );
    }
    
    // Validate character limits
    if (body.title.length > 100) {
      return NextResponse.json(
        { success: false, error: 'Title must be 100 characters or less' },
        { status: 400, headers: corsHeaders }
      );
    }
    
    if (body.value.length > 50) {
      return NextResponse.json(
        { success: false, error: 'Value must be 50 characters or less' },
        { status: 400, headers: corsHeaders }
      );
    }
    
    // Validate color format (hex color or predefined colors)
    const validColors = ['green', 'teal', 'orange', 'primary', 'gold'];
    const isHexColor = /^#[0-9A-F]{6}$/i.test(body.color);
    
    if (body.color && !validColors.includes(body.color) && !isHexColor) {
      return NextResponse.json(
        { success: false, error: 'Invalid color. Use: green, teal, orange, primary, gold, or hex color' },
        { status: 400, headers: corsHeaders }
      );
    }
    
    const stat = await ImpactStat.create({
      title: body.title,
      value: body.value,
      color: body.color || 'primary',
      page: body.page,
      order_number: body.order_number || 999,
    });
    
    return NextResponse.json({
      success: true,
      data: stat,
    }, { headers: corsHeaders });
  } catch (error) {
    console.error('Error creating impact stat:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create impact stat' },
      { status: 500, headers: corsHeaders }
    );
  }
}
