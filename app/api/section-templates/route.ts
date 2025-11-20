import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth-middleware';

// Configure route to allow longer execution time for database wake-up
export const maxDuration = 180;

interface SectionTemplate {
  id: string;
  component_type: string;
  display_name: string;
  description: string | null;
  schema: any;
  default_props: any;
  preview_template: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// GET /api/section-templates - Get all section templates
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';
    const componentType = searchParams.get('type');

    let sqlQuery = 'SELECT * FROM section_templates';
    const params: any[] = [];
    const conditions: string[] = [];

    if (activeOnly) {
      conditions.push('is_active = true');
    }

    if (componentType) {
      conditions.push(`component_type = $${params.length + 1}`);
      params.push(componentType);
    }

    if (conditions.length > 0) {
      sqlQuery += ' WHERE ' + conditions.join(' AND ');
    }

    sqlQuery += ' ORDER BY component_type ASC, display_name ASC';

    const result = await query(sqlQuery, params);

    return NextResponse.json({
      success: true,
      templates: result.rows as SectionTemplate[]
    });
  } catch (error) {
    console.error('Error fetching section templates:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch section templates',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST /api/section-templates - Create new section template (Admin only)
export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.authenticated || authResult.user?.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      component_type,
      display_name,
      description,
      schema,
      default_props,
      preview_template
    } = body;

    // Validate required fields
    if (!component_type || !display_name || !schema) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: component_type, display_name, schema'
        },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO section_templates
       (component_type, display_name, description, schema, default_props, preview_template)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        component_type,
        display_name,
        description || null,
        JSON.stringify(schema),
        JSON.stringify(default_props || {}),
        preview_template || null
      ]
    );

    return NextResponse.json({
      success: true,
      template: result.rows[0] as SectionTemplate
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating section template:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create section template',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
