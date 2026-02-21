export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import TeamMember from '@/models/TeamMember';
import { AuditLogModel } from '@/models/AuditLog';
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
    console.log('[TeamMember PUT] Updating member:', params.id);
    console.log('[TeamMember PUT] Body:', JSON.stringify(body));

    // Validate role if provided
    if (body.role) {
      const validRoles = ['board_chairman', 'board_member', 'management', 'historical_admin', 'deputy_administrator', 'financial_controller'];
      if (!validRoles.includes(body.role)) {
        return NextResponse.json(
          { success: false, error: `Invalid role. Must be one of: ${validRoles.join(', ')}` },
          { status: 400, headers: corsHeaders }
        );
      }
    }

    const member = await TeamMember.update(params.id, body);
    console.log('[TeamMember PUT] Updated member:', JSON.stringify(member));

    if (!member) {
      return NextResponse.json(
        { success: false, error: 'Team member not found or update failed' },
        { status: 404, headers: corsHeaders }
      );
    }

    // Log team member update in audit trail
    const authResult = await verifyAuth(request);
    if (authResult.authenticated) {
      const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
      const userAgent = request.headers.get('user-agent') || '';

      await AuditLogModel.create({
        user_id: authResult.user!.id,
        action: 'update',
        entity_type: 'team_member',
        entity_id: params.id,
        changes: body,
        ip_address: ipAddress,
        user_agent: userAgent
      });
    }

    return NextResponse.json({
      success: true,
      data: member,
    }, { headers: corsHeaders });
  } catch (error: any) {
    console.error('[TeamMember PUT] Error updating team member:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update team member' },
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

    // Log team member deletion in audit trail
    const authResult = await verifyAuth(request);
    if (authResult.authenticated) {
      const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
      const userAgent = request.headers.get('user-agent') || '';

      await AuditLogModel.create({
        user_id: authResult.user!.id,
        action: 'delete',
        entity_type: 'team_member',
        entity_id: params.id,
        changes: {
          deleted_by: authResult.user!.id
        },
        ip_address: ipAddress,
        user_agent: userAgent
      });
    }

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
