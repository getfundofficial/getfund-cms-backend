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
 * GET /api/team-members
 * Get all team members, optionally filtered by role
 * Query params:
 *  - role: board_chairman | board_member | management | historical_admin
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');

    let data;

    if (role) {
      data = await TeamMember.getActiveByRole(role as any);
    } else {
      // Return all active members grouped by role
      const [chairman, management, historical] = await Promise.all([
        TeamMember.getBoardChairman(),
        TeamMember.getManagementTeam(),
        TeamMember.getHistoricalAdmins(),
      ]);

      data = {
        chairman,
        management,
        historical_admins: historical,
      };
    }

    return NextResponse.json({
      success: true,
      data,
    }, { headers: corsHeaders });
  } catch (error) {
    console.error('Error fetching team members:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch team members' },
      { status: 500, headers: corsHeaders }
    );
  }
}

/**
 * POST /api/team-members
 * Create a new team member
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.title || !body.role) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: name, title, role' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Validate role
    const validRoles = ['board_chairman', 'board_member', 'management', 'historical_admin'];
    if (!validRoles.includes(body.role)) {
      return NextResponse.json(
        { success: false, error: `Invalid role. Must be one of: ${validRoles.join(', ')}` },
        { status: 400, headers: corsHeaders }
      );
    }

    const member = await TeamMember.create({
      name: body.name,
      title: body.title,
      role: body.role,
      image_url: body.image_url,
      bio: body.bio,
      date_range: body.date_range,
      display_order: body.display_order,
      status: body.status || 'active',
      created_by: body.created_by,
    });

    return NextResponse.json({
      success: true,
      data: member,
    }, { headers: corsHeaders });
  } catch (error) {
    console.error('Error creating team member:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create team member' },
      { status: 500, headers: corsHeaders }
    );
  }
}
// Trigger redeploy - 20251205164625
