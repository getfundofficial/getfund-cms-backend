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
// Returns both title and subtitle for backwards compatibility
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || 'all';

    const config = await ImpactStat.getConfig(page);

    return NextResponse.json({
      success: true,
      data: {
        title: config.title,
        subtitle: config.subtitle
      },
    }, { headers: corsHeaders });
  } catch (error) {
    console.error('Error fetching config:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch config' },
      { status: 500, headers: corsHeaders }
    );
  }
}

// PUT /api/impact-stats/subtitle
// Now supports both title and subtitle updates
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.page) {
      return NextResponse.json(
        { success: false, error: 'Missing required field: page' },
        { status: 400, headers: corsHeaders }
      );
    }

    // At least one of title or subtitle must be provided
    if (!body.title && !body.subtitle) {
      return NextResponse.json(
        { success: false, error: 'At least one of title or subtitle must be provided' },
        { status: 400, headers: corsHeaders }
      );
    }

    if (body.title && body.title.length > 100) {
      return NextResponse.json(
        { success: false, error: 'Title must be 100 characters or less' },
        { status: 400, headers: corsHeaders }
      );
    }

    if (body.subtitle && body.subtitle.length > 200) {
      return NextResponse.json(
        { success: false, error: 'Subtitle must be 200 characters or less' },
        { status: 400, headers: corsHeaders }
      );
    }

    const result = await ImpactStat.updateConfig(body.page, {
      title: body.title,
      subtitle: body.subtitle
    });

    return NextResponse.json({
      success: true,
      data: result,
    }, { headers: corsHeaders });
  } catch (error) {
    console.error('Error updating config:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update config' },
      { status: 500, headers: corsHeaders }
    );
  }
}
