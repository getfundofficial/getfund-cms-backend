export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { MenuItemModel, UpdateMenuItemInput } from '@/models/MenuItem';
import { corsResponse, corsOptionsResponse } from '@/lib/cors';
import { verifyAuth, isAdminRole } from '@/lib/auth-middleware';
import { AuditLogModel } from '@/models/AuditLog';

// Handle CORS preflight
export async function OPTIONS(request: NextRequest) {
  return corsOptionsResponse(request.headers.get('origin'));
}

// GET /api/menu-items/:id - Get a single menu item
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const menuItem = await MenuItemModel.getById(parseInt(params.id));

    if (!menuItem) {
      const errorResponse = NextResponse.json(
        { error: 'Menu item not found' },
        { status: 404 }
      );
      corsResponse(errorResponse, request.headers.get('origin'));
      return errorResponse;
    }

    const response = NextResponse.json(menuItem);
    corsResponse(response, request.headers.get('origin'));
    return response;
  } catch (error: any) {
    console.error('Error fetching menu item:', error);
    const errorResponse = NextResponse.json(
      { error: 'Failed to fetch menu item' },
      { status: 500 }
    );
    corsResponse(errorResponse, request.headers.get('origin'));
    return errorResponse;
  }
}

// PUT /api/menu-items/:id - Update a menu item (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.authenticated || !isAdminRole(authResult.user?.role)) {
      const errorResponse = NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
      corsResponse(errorResponse, request.headers.get('origin'));
      return errorResponse;
    }

    const data: UpdateMenuItemInput = await request.json();
    const menuItem = await MenuItemModel.update(parseInt(params.id), data);

    if (!menuItem) {
      const errorResponse = NextResponse.json(
        { error: 'Menu item not found' },
        { status: 404 }
      );
      corsResponse(errorResponse, request.headers.get('origin'));
      return errorResponse;
    }

    // Log menu item update
    await AuditLogModel.create({
      user_id: authResult.user.id,
      action: 'update',
      entity_type: 'menu_item',
      entity_id: params.id,
      changes: {
        label: menuItem.label,
        url: menuItem.url,
        item_type: menuItem.item_type,
      },
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
      user_agent: request.headers.get('user-agent') || undefined,
    });

    const response = NextResponse.json(menuItem);
    corsResponse(response, request.headers.get('origin'));
    return response;
  } catch (error: any) {
    console.error('Error updating menu item:', error);
    const errorResponse = NextResponse.json(
      { error: 'Failed to update menu item' },
      { status: 500 }
    );
    corsResponse(errorResponse, request.headers.get('origin'));
    return errorResponse;
  }
}

// DELETE /api/menu-items/:id - Delete a menu item (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.authenticated || !isAdminRole(authResult.user?.role)) {
      const errorResponse = NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
      corsResponse(errorResponse, request.headers.get('origin'));
      return errorResponse;
    }

    // Get menu item details before deletion for audit log
    const menuItem = await MenuItemModel.getById(parseInt(params.id));
    if (!menuItem) {
      const errorResponse = NextResponse.json(
        { error: 'Menu item not found' },
        { status: 404 }
      );
      corsResponse(errorResponse, request.headers.get('origin'));
      return errorResponse;
    }

    const success = await MenuItemModel.delete(parseInt(params.id));

    if (!success) {
      const errorResponse = NextResponse.json(
        { error: 'Failed to delete menu item' },
        { status: 500 }
      );
      corsResponse(errorResponse, request.headers.get('origin'));
      return errorResponse;
    }

    // Log menu item deletion
    await AuditLogModel.create({
      user_id: authResult.user.id,
      action: 'delete',
      entity_type: 'menu_item',
      entity_id: params.id,
      changes: {
        label: menuItem.label,
        url: menuItem.url,
        item_type: menuItem.item_type,
      },
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
      user_agent: request.headers.get('user-agent') || undefined,
    });

    const response = NextResponse.json({ success: true });
    corsResponse(response, request.headers.get('origin'));
    return response;
  } catch (error: any) {
    console.error('Error deleting menu item:', error);
    const errorResponse = NextResponse.json(
      { error: 'Failed to delete menu item' },
      { status: 500 }
    );
    corsResponse(errorResponse, request.headers.get('origin'));
    return errorResponse;
  }
}
