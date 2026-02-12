import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { corsResponse, corsOptionsResponse } from '@/lib/cors';
import { verifyAuth, isAdminRole } from '@/lib/auth-middleware';
import { AuditLogModel } from '@/models/AuditLog';

// Handle CORS preflight
export async function OPTIONS(request: NextRequest) {
  return corsOptionsResponse(request.headers.get('origin'));
}

// POST /api/content/:id/approve - Approve content for publishing
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.authenticated) {
      const errorResponse = NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
      corsResponse(errorResponse, request.headers.get('origin'));
      return errorResponse;
    }

    // Check if user has approval permissions (approver or admin)
    const hasPermission =
      isAdminRole(authResult.user.role) ||
      authResult.user.role === 'approver';

    if (!hasPermission) {
      const errorResponse = NextResponse.json(
        { error: 'You do not have permission to approve content' },
        { status: 403 }
      );
      corsResponse(errorResponse, request.headers.get('origin'));
      return errorResponse;
    }

    // Update content status to approved
    const result = await query(
      `UPDATE content
       SET status = $1, updated_at = NOW()
       WHERE id = $2 AND deleted_at IS NULL
       RETURNING *`,
      ['approved', params.id]
    );

    if (result.rows.length === 0) {
      const errorResponse = NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      );
      corsResponse(errorResponse, request.headers.get('origin'));
      return errorResponse;
    }

    const approvedContent = result.rows[0];

    // Log content approval
    await AuditLogModel.create({
      user_id: authResult.user.id,
      action: 'approve',
      entity_type: 'content',
      entity_id: params.id,
      changes: {
        title: approvedContent.title,
        type: approvedContent.type,
        status: 'approved',
      },
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
      user_agent: request.headers.get('user-agent') || undefined,
    });

    const response = NextResponse.json(approvedContent);
    corsResponse(response, request.headers.get('origin'));
    return response;
  } catch (error: any) {
    console.error('Error approving content:', error);
    const errorResponse = NextResponse.json(
      { error: 'Failed to approve content' },
      { status: 500 }
    );
    corsResponse(errorResponse, request.headers.get('origin'));
    return errorResponse;
  }
}
