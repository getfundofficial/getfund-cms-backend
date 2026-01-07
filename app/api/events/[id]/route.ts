import { NextRequest, NextResponse } from 'next/server';
import Event from '@/models/Event';
import { verifyAuth } from '@/lib/auth-middleware';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

/**
 * GET /api/events/[id]
 * Get a single event by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const event = await Event.getById(parseInt(id));

    if (!event) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json({
      success: true,
      data: event,
    }, { headers: corsHeaders });
  } catch (error) {
    console.error('Error fetching event:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch event' },
      { status: 500, headers: corsHeaders }
    );
  }
}

/**
 * PUT /api/events/[id]
 * Update an event (admin only)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    if (authResult.user?.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403, headers: corsHeaders }
      );
    }

    const { id } = await params;
    const body = await request.json();

    const event = await Event.update(parseInt(id), {
      title: body.title,
      description: body.description,
      event_date: body.event_date,
      event_type: body.event_type,
    });

    if (!event) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json({
      success: true,
      data: event,
    }, { headers: corsHeaders });
  } catch (error) {
    console.error('Error updating event:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update event' },
      { status: 500, headers: corsHeaders }
    );
  }
}

/**
 * DELETE /api/events/[id]
 * Delete an event (admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    if (authResult.user?.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403, headers: corsHeaders }
      );
    }

    const { id } = await params;
    const deleted = await Event.delete(parseInt(id));

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Event deleted successfully',
    }, { headers: corsHeaders });
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete event' },
      { status: 500, headers: corsHeaders }
    );
  }
}
