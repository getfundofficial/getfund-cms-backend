export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import Partner from '@/models/Partner';
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
 * GET /api/partners/[id]
 * Get a single partner by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const partner = await Partner.getById(params.id);

    if (!partner) {
      return NextResponse.json(
        { success: false, error: 'Partner not found' },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json({
      success: true,
      data: partner,
    }, { headers: corsHeaders });
  } catch (error) {
    console.error('Error fetching partner:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch partner' },
      { status: 500, headers: corsHeaders }
    );
  }
}

/**
 * PUT /api/partners/[id]
 * Update a partner
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    const partner = await Partner.update(params.id, body);

    // Log partner update in audit trail
    const authResult = await verifyAuth(request);
    if (authResult.authenticated) {
      const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
      const userAgent = request.headers.get('user-agent') || '';

      await AuditLogModel.create({
        user_id: authResult.user!.id,
        action: 'update',
        entity_type: 'partner',
        entity_id: params.id,
        changes: body,
        ip_address: ipAddress,
        user_agent: userAgent
      });
    }

    return NextResponse.json({
      success: true,
      data: partner,
    }, { headers: corsHeaders });
  } catch (error) {
    console.error('Error updating partner:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update partner' },
      { status: 500, headers: corsHeaders }
    );
  }
}

/**
 * DELETE /api/partners/[id]
 * Delete a partner
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await Partner.delete(params.id);

    // Log partner deletion in audit trail
    const authResult = await verifyAuth(request);
    if (authResult.authenticated) {
      const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
      const userAgent = request.headers.get('user-agent') || '';

      await AuditLogModel.create({
        user_id: authResult.user!.id,
        action: 'delete',
        entity_type: 'partner',
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
      message: 'Partner deleted successfully',
    }, { headers: corsHeaders });
  } catch (error) {
    console.error('Error deleting partner:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete partner' },
      { status: 500, headers: corsHeaders }
    );
  }
}
