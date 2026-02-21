export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import Event from '@/models/Event';
import { verifyAuth, isAdminRole } from '@/lib/auth-middleware';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

/**
 * GET /api/events
 * Get events with optional date range filter
 * Query params:
 *  - start: start date (YYYY-MM-DD)
 *  - end: end date (YYYY-MM-DD)
 *  - year: year for month view
 *  - month: month for month view (1-12)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const start = searchParams.get('start');
    const end = searchParams.get('end');
    const year = searchParams.get('year');
    const month = searchParams.get('month');

    let data;

    if (start && end) {
      data = await Event.getByDateRange(start, end);
    } else if (year && month) {
      data = await Event.getByMonth(parseInt(year), parseInt(month));
    } else {
      data = await Event.getAll();
    }

    return NextResponse.json({
      success: true,
      data,
    }, { headers: corsHeaders });
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch events' },
      { status: 500, headers: corsHeaders }
    );
  }
}

/**
 * POST /api/events
 * Create a new event (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult.authenticated) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401, headers: corsHeaders }
      );
    }

    // Check admin role
    if (!isAdminRole(authResult.user?.role)) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403, headers: corsHeaders }
      );
    }

    const body = await request.json();

    // Validate required fields
    if (!body.title || !body.event_date) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: title, event_date' },
        { status: 400, headers: corsHeaders }
      );
    }

    const event = await Event.create({
      title: body.title,
      description: body.description,
      event_date: body.event_date,
      event_type: body.event_type || 'other',
      created_by: authResult.user?.id || undefined,
    });

    return NextResponse.json({
      success: true,
      data: event,
    }, { headers: corsHeaders });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create event' },
      { status: 500, headers: corsHeaders }
    );
  }
}
