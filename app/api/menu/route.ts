export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { corsResponse, corsOptionsResponse } from '@/lib/cors';

// Handle CORS preflight
export async function OPTIONS(request: NextRequest) {
  return corsOptionsResponse(request.headers.get('origin'));
}

// GET /api/menu - Get menu configuration for public website
export async function GET(request: NextRequest) {
  try {
    // Fetch all menu items including:
    // 1. Pages with show_in_menu = true (parent menu items)
    // 2. Pages with parent_page_id AND show_in_menu = true (child pages for dropdowns)
    const menuItemsResult = await query(`
      SELECT
        id,
        slug,
        title,
        menu_label,
        menu_order,
        show_in_menu,
        is_cta_button,
        parent_page_id
      FROM pages
      WHERE is_active = true
        AND show_in_menu = true
        -- The pages table now serves more than one site (migration 053). Without
        -- this, EFPI's pages would appear in GETFund's navigation.
        AND site = 'getfund'
      ORDER BY menu_order ASC
      LIMIT 50
    `);

    const allItems = menuItemsResult.rows
      // Filter out "SUPPORT US" from menu
      .filter(item => item.slug !== 'support-us' && item.menu_label !== 'SUPPORT US')
      .map(item => ({
        id: item.id,
        slug: item.slug,
        title: item.title,
        label: item.menu_label || item.title,
        order: item.menu_order,
        parentId: item.parent_page_id,
      }));

    // Build hierarchical structure: separate parent items and children
    const parentItems = allItems.filter(item => !item.parentId);
    const childItems = allItems.filter(item => item.parentId);

    // Attach children to their parent items
    const menuItems = parentItems.map(parent => {
      const children = childItems
        .filter(child => child.parentId === parent.id)
        .sort((a, b) => (a.order || 0) - (b.order || 0));

      return {
        ...parent,
        children: children.length > 0 ? children : undefined,
      };
    });

    const response = NextResponse.json({
      menuItems,
      ctaButton: null, // Deprecated: CTA button is now part of menuItems
    });

    return corsResponse(response, request.headers.get('origin'));
  } catch (error: any) {
    console.error('Error fetching menu configuration:', error);
    const errorResponse = NextResponse.json(
      { error: 'Failed to fetch menu configuration' },
      { status: 500 }
    );
    return corsResponse(errorResponse, request.headers.get('origin'));
  }
}
