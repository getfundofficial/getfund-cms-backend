import { NextRequest, NextResponse } from 'next/server';
import TeamMember from '@/models/TeamMember';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

/**
 * GET /api/team-members/[id]
 * Get a single team member by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const member = await TeamMember.getById(params.id);

    if (!member) {
      return NextResponse.json(
        { success: false, error: 'Team member not found' },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json({
      success: true,
      data: member,
    }, { headers: corsHeaders });
  } catch (error) {
    console.error('Error fetching team member:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch team member' },
      { status: 500, headers: corsHeaders }
    );
  }
}

/**
 * PUT /api/team-members/[id]
 * Update a team member
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    // Validate role if provided
    if (body.role) {
      const validRoles = ['board_chairman', 'board_member', 'management', 'historical_admin'];
      if (!validRoles.includes(body.role)) {
        return NextResponse.json(
          { success: false, error: `Invalid role. Must be one of: ${validRoles.join(', ')}` },
          { status: 400, headers: corsHeaders }
        );
      }
    }

    const member = await TeamMember.update(params.id, body);

    return NextResponse.json({
      success: true,
      data: member,
    }, { headers: corsHeaders });
  } catch (error) {
    console.error('Error updating team member:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update team member' },
      { status: 500, headers: corsHeaders }
    );
  }
}

/**
 * DELETE /api/team-members/[id]
 * Soft delete a team member
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await TeamMember.delete(params.id);

    return NextResponse.json({
      success: true,
      message: 'Team member deleted successfully',
    }, { headers: corsHeaders });
  } catch (error) {
    console.error('Error deleting team member:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete team member' },
      { status: 500, headers: corsHeaders }
    );
  }
}
