import { NextRequest, NextResponse } from 'next/server';
import { MenuItemModel } from '@/models/MenuItem';
import { corsResponse, corsOptionsResponse } from '@/lib/cors';
import { verifyAuth } from '@/lib/auth-middleware';
import { AuditLogModel } from '@/models/AuditLog';

// Handle CORS preflight
export async function OPTIONS(request: NextRequest) {
  return corsOptionsResponse(request.headers.get('origin'));
}

// POST /api/menu-items/reorder - Reorder menu items (admin only)
export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.authenticated || authResult.user?.role !== 'admin') {
      const errorResponse = NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
      corsResponse(errorResponse, request.headers.get('origin'));
      return errorResponse;
    }

    const { items }: { items: Array<{ id: number; order_index: number }> } = await request.json();

    if (!Array.isArray(items)) {
      const errorResponse = NextResponse.json(
        { error: 'Items must be an array' },
        { status: 400 }
      );
      corsResponse(errorResponse, request.headers.get('origin'));
      return errorResponse;
    }

    await MenuItemModel.reorder(items);

    // Log menu reorder
    await AuditLogModel.create({
      user_id: authResult.user.id,
      action: 'reorder',
      entity_type: 'menu_item',
      entity_id: 'multiple',
      changes: {
        items_count: items.length,
      },
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
      user_agent: request.headers.get('user-agent') || undefined,
    });

    const response = NextResponse.json({ success: true });
    corsResponse(response, request.headers.get('origin'));
    return response;
  } catch (error: any) {
    console.error('Error reordering menu items:', error);
    const errorResponse = NextResponse.json(
      { error: 'Failed to reorder menu items' },
      { status: 500 }
    );
    corsResponse(errorResponse, request.headers.get('origin'));
    return errorResponse;
  }
}
