import { NextRequest, NextResponse } from 'next/server';
import { MenuItemModel, CreateMenuItemInput } from '@/models/MenuItem';
import { corsResponse, corsOptionsResponse } from '@/lib/cors';
import { verifyAuth, isAdminRole } from '@/lib/auth-middleware';
import { AuditLogModel } from '@/models/AuditLog';

// Handle CORS preflight
export async function OPTIONS(request: NextRequest) {
  return corsOptionsResponse(request.headers.get('origin'));
}

// GET /api/menu-items - Get all menu items (public) or all items including inactive (admin)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('includeInactive') === 'true';

    let menuItems;
    if (includeInactive) {
      // Verify admin for getting inactive items
      const authResult = await verifyAuth(request);
      if (!authResult.authenticated || !isAdminRole(authResult.user?.role)) {
        const errorResponse = NextResponse.json(
          { error: 'Unauthorized - Admin access required' },
          { status: 403 }
        );
        corsResponse(errorResponse, request.headers.get('origin'));
        return errorResponse;
      }
      menuItems = await MenuItemModel.getAll();
    } else {
      // Public endpoint for active menu items
      menuItems = await MenuItemModel.getAllActive();
    }

    const response = NextResponse.json(menuItems);
    corsResponse(response, request.headers.get('origin'));
    return response;
  } catch (error: any) {
    console.error('Error fetching menu items:', error);
    const errorResponse = NextResponse.json(
      { error: 'Failed to fetch menu items' },
      { status: 500 }
    );
    corsResponse(errorResponse, request.headers.get('origin'));
    return errorResponse;
  }
}

// POST /api/menu-items - Create a new menu item (admin only)
export async function POST(request: NextRequest) {
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

    const data: CreateMenuItemInput = await request.json();

    // Validate required fields
    if (!data.label || !data.url || !data.item_type) {
      const errorResponse = NextResponse.json(
        { error: 'Label, URL, and item type are required' },
        { status: 400 }
      );
      corsResponse(errorResponse, request.headers.get('origin'));
      return errorResponse;
    }

    // Validate item type
    if (data.item_type !== 'menu' && data.item_type !== 'cta') {
      const errorResponse = NextResponse.json(
        { error: 'Item type must be either "menu" or "cta"' },
        { status: 400 }
      );
      corsResponse(errorResponse, request.headers.get('origin'));
      return errorResponse;
    }

    const menuItem = await MenuItemModel.create(data);

    // Log menu item creation
    await AuditLogModel.create({
      user_id: authResult.user.id,
      action: 'create',
      entity_type: 'menu_item',
      entity_id: menuItem.id.toString(),
      changes: {
        label: menuItem.label,
        url: menuItem.url,
        item_type: menuItem.item_type,
      },
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
      user_agent: request.headers.get('user-agent') || undefined,
    });

    const response = NextResponse.json(menuItem, { status: 201 });
    corsResponse(response, request.headers.get('origin'));
    return response;
  } catch (error: any) {
    console.error('Error creating menu item:', error);

    // Handle database constraint errors
    if (error.message && (
      error.message.includes('Cannot add more than 5 menu items') ||
      error.message.includes('Cannot add more than 2 CTA buttons')
    )) {
      const errorResponse = NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
      corsResponse(errorResponse, request.headers.get('origin'));
      return errorResponse;
    }

    const errorResponse = NextResponse.json(
      { error: 'Failed to create menu item' },
      { status: 500 }
    );
    corsResponse(errorResponse, request.headers.get('origin'));
    return errorResponse;
  }
}
