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
    // Fetch menu items (published pages with show_in_menu = true)
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
        AND is_cta_button = false
      ORDER BY menu_order ASC
      LIMIT 6
    `);

    // Fetch CTA button (published page with is_cta_button = true)
    const ctaButtonResult = await query(`
      SELECT 
        id,
        slug,
        title,
        menu_label,
        is_cta_button
      FROM pages 
      WHERE is_active = true 
        AND is_cta_button = true
      LIMIT 1
    `);

    const menuItems = menuItemsResult.rows.map(item => ({
      id: item.id,
      slug: item.slug,
      title: item.title,
      label: item.menu_label || item.title,
      order: item.menu_order,
      parentId: item.parent_page_id,
    }));

    const ctaButton = ctaButtonResult.rows.length > 0 ? {
      id: ctaButtonResult.rows[0].id,
      slug: ctaButtonResult.rows[0].slug,
      title: ctaButtonResult.rows[0].title,
      label: ctaButtonResult.rows[0].menu_label || ctaButtonResult.rows[0].title,
    } : null;

    const response = NextResponse.json({
      menuItems,
      ctaButton,
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
