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
    // Fetch all menu items (including CTA buttons) - published pages with show_in_menu = true
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
      ORDER BY menu_order ASC
      LIMIT 10
    `);

    const menuItems = menuItemsResult.rows.map(item => ({
      id: item.id,
      slug: item.slug,
      title: item.title,
      label: item.menu_label || item.title,
      order: item.menu_order,
      parentId: item.parent_page_id,
    }));

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
