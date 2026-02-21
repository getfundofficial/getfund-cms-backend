export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth, isAdminRole } from '@/lib/auth-middleware';

// Configure route to allow longer execution time for database wake-up
export const maxDuration = 180;

interface PageLayout {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
  structure: any;
  metadata: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// GET /api/page-layouts - Get all page layouts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';

    let sqlQuery = 'SELECT * FROM page_layouts';
    const params: any[] = [];

    if (activeOnly) {
      sqlQuery += ' WHERE is_active = true';
    }

    sqlQuery += ' ORDER BY display_name ASC';

    const result = await query(sqlQuery, params);

    return NextResponse.json({
      success: true,
      layouts: result.rows as PageLayout[]
    });
  } catch (error) {
    console.error('Error fetching page layouts:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch page layouts',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST /api/page-layouts - Create new page layout (Admin only)
export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.authenticated || !isAdminRole(authResult.user?.role)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, display_name, description, structure, metadata } = body;

    // Validate required fields
    if (!name || !display_name || !structure) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: name, display_name, structure'
        },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO page_layouts
       (name, display_name, description, structure, metadata)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        name,
        display_name,
        description || null,
        JSON.stringify(structure),
        JSON.stringify(metadata || {})
      ]
    );

    return NextResponse.json({
      success: true,
      layout: result.rows[0] as PageLayout
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating page layout:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create page layout',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
