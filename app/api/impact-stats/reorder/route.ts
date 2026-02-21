export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import ImpactStat from '@/models/ImpactStat';
import { verifyAuth } from '@/lib/auth-middleware';
import { AuditLogModel } from '@/models/AuditLog';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// POST /api/impact-stats/reorder
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!Array.isArray(body.updates)) {
      return NextResponse.json(
        { success: false, error: 'Updates must be an array of {id, order_number}' },
        { status: 400, headers: corsHeaders }
      );
    }
    
    await ImpactStat.reorder(body.updates);

    // Log impact stats reorder in audit trail
    const authResult = await verifyAuth(request);
    if (authResult.authenticated) {
      const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
      const userAgent = request.headers.get('user-agent') || '';

      await AuditLogModel.create({
        user_id: authResult.user?.id,
        action: 'reorder',
        entity_type: 'impact_stat',
        entity_id: null,
        changes: { updates: body.updates },
        ip_address: ipAddress,
        user_agent: userAgent
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Impact stats reordered successfully',
    }, { headers: corsHeaders });
  } catch (error) {
    console.error('Error reordering impact stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to reorder impact stats' },
      { status: 500, headers: corsHeaders }
    );
  }
}
