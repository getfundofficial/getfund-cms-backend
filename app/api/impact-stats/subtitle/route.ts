import { NextRequest, NextResponse } from 'next/server';
import ImpactStat from '@/models/ImpactStat';

// Disable caching for this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// GET /api/impact-stats/subtitle?page=why-fundraising
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || 'all';

    const config = await ImpactStat.getConfig(page);

    return NextResponse.json({
      success: true,
      data: {
        title: config.title,
        subtitle: config.subtitle,
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
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.page) {
      return NextResponse.json(
        { success: false, error: 'Missing required field: page' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Validate lengths if provided
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

    // Update the config - pass values directly, let the model handle nulls
    const result = await ImpactStat.updateConfig(body.page, {
      title: body.title || null,
      subtitle: body.subtitle || null,
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
