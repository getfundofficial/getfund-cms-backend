export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { corsResponse, corsOptionsResponse } from '@/lib/cors';
import { verifyAuth } from '@/lib/auth-middleware';

// Handle CORS preflight
export async function OPTIONS(request: NextRequest) {
  return corsOptionsResponse(request.headers.get('origin'));
}

// Default regional data for Ghana
const DEFAULT_REGIONS = [
  { name: 'Ashanti', totalProjects: 748, basicEducation: 451, secondaryEducation: 281, tertiaryEducation: 12, modelSchools: 2, tvetCenters: 2 },
  { name: 'Eastern', totalProjects: 541, basicEducation: 301, secondaryEducation: 230, tertiaryEducation: 8, modelSchools: 1, tvetCenters: 1 },
  { name: 'Northern', totalProjects: 172, basicEducation: 101, secondaryEducation: 66, tertiaryEducation: 5, modelSchools: 0, tvetCenters: 0 },
  { name: 'Greater Accra', totalProjects: 77, basicEducation: 66, secondaryEducation: 1, tertiaryEducation: 0, modelSchools: 10, tvetCenters: 0 },
  { name: 'Upper East', totalProjects: 121, basicEducation: 68, secondaryEducation: 47, tertiaryEducation: 6, modelSchools: 0, tvetCenters: 0 },
  { name: 'Bono', totalProjects: 142, basicEducation: 73, secondaryEducation: 64, tertiaryEducation: 4, modelSchools: 1, tvetCenters: 0 },
  { name: 'Western', totalProjects: 110, basicEducation: 54, secondaryEducation: 55, tertiaryEducation: 1, modelSchools: 0, tvetCenters: 0 },
  { name: 'Ahafo', totalProjects: 102, basicEducation: 62, secondaryEducation: 34, tertiaryEducation: 5, modelSchools: 1, tvetCenters: 0 },
  { name: 'Central', totalProjects: 91, basicEducation: 91, secondaryEducation: 0, tertiaryEducation: 0, modelSchools: 0, tvetCenters: 0 },
  { name: 'Volta', totalProjects: 93, basicEducation: 47, secondaryEducation: 41, tertiaryEducation: 5, modelSchools: 0, tvetCenters: 0 },
  { name: 'Oti', totalProjects: 90, basicEducation: 47, secondaryEducation: 41, tertiaryEducation: 2, modelSchools: 0, tvetCenters: 0 },
  { name: 'Upper West', totalProjects: 86, basicEducation: 41, secondaryEducation: 41, tertiaryEducation: 4, modelSchools: 0, tvetCenters: 0 },
  { name: 'Bono East', totalProjects: 55, basicEducation: 23, secondaryEducation: 31, tertiaryEducation: 0, modelSchools: 1, tvetCenters: 0 },
  { name: 'Western North', totalProjects: 51, basicEducation: 24, secondaryEducation: 19, tertiaryEducation: 7, modelSchools: 1, tvetCenters: 0 },
  { name: 'North East', totalProjects: 50, basicEducation: 20, secondaryEducation: 27, tertiaryEducation: 2, modelSchools: 1, tvetCenters: 0 },
  { name: 'Savannah', totalProjects: 34, basicEducation: 13, secondaryEducation: 21, tertiaryEducation: 0, modelSchools: 0, tvetCenters: 0 },
];

// GET /api/regional-map - Get regional map data
export async function GET(request: NextRequest) {
  try {
    // Try to get from impact page's regional_impact section
    const result = await query(`
      SELECT ps.content, ps.title
      FROM page_sections ps
      JOIN pages p ON ps.page_id = p.id
      WHERE p.slug = 'impact' AND ps.section_key = 'regional_impact'
    `);

    if (result.rows.length > 0 && result.rows[0].content) {
      const content = typeof result.rows[0].content === 'string'
        ? JSON.parse(result.rows[0].content)
        : result.rows[0].content;

      const response = NextResponse.json({
        title: content.title || 'Regional Impact',
        subtitle: content.subtitle || 'Ensuring equitable distribution of educational resources across all regions',
        description: content.description || '',
        regions: content.regions || DEFAULT_REGIONS,
      });
      return corsResponse(response, request.headers.get('origin'));
    }

    // Return default data if no CMS data exists
    const response = NextResponse.json({
      title: 'Regional Impact',
      subtitle: 'Ensuring equitable distribution of educational resources across all regions',
      description: '',
      regions: DEFAULT_REGIONS,
    });
    return corsResponse(response, request.headers.get('origin'));
  } catch (error: any) {
    console.error('Error fetching regional map data:', error);
    const errorResponse = NextResponse.json(
      { error: 'Failed to fetch regional map data' },
      { status: 500 }
    );
    return corsResponse(errorResponse, request.headers.get('origin'));
  }
}

// PUT /api/regional-map - Update regional map data
export async function PUT(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.authenticated) {
      const errorResponse = NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
      return corsResponse(errorResponse, request.headers.get('origin'));
    }

    const user = authResult.user!;
    const body = await request.json();
    const { title, subtitle, description, regions } = body;

    // Validate regions data
    if (regions && !Array.isArray(regions)) {
      const errorResponse = NextResponse.json(
        { error: 'regions must be an array' },
        { status: 400 }
      );
      return corsResponse(errorResponse, request.headers.get('origin'));
    }

    // Validate each region has required fields
    if (regions) {
      for (const region of regions) {
        if (!region.name || typeof region.totalProjects !== 'number') {
          const errorResponse = NextResponse.json(
            { error: 'Each region must have a name and totalProjects (number)' },
            { status: 400 }
          );
          return corsResponse(errorResponse, request.headers.get('origin'));
        }
      }
    }

    // Get impact page ID
    const pageResult = await query(
      "SELECT id FROM pages WHERE slug = 'impact'"
    );

    if (pageResult.rows.length === 0) {
      // Create the impact page if it doesn't exist
      const createPageResult = await query(`
        INSERT INTO pages (slug, title, meta_title, meta_description, is_active, created_by, updated_by)
        VALUES ('impact', 'Our Impact', 'Our Impact - GETFund', 'See the impact of GETFund across Ghana', true, $1, $1)
        RETURNING id
      `, [user.id]);
      pageResult.rows = createPageResult.rows;
    }

    const pageId = pageResult.rows[0].id;

    // Check if regional_impact section exists
    const sectionResult = await query(
      "SELECT id, content FROM page_sections WHERE page_id = $1 AND section_key = 'regional_impact'",
      [pageId]
    );

    const content = {
      title: title || 'Regional Impact',
      subtitle: subtitle || 'Ensuring equitable distribution of educational resources across all regions',
      description: description || '',
      regions: regions || DEFAULT_REGIONS,
    };

    if (sectionResult.rows.length === 0) {
      // Create the section
      await query(`
        INSERT INTO page_sections (
          page_id, section_key, section_type, title, content, order_index, is_active, created_by, updated_by
        ) VALUES ($1, 'regional_impact', 'regional_impact', $2, $3, 1, true, $4, $4)
      `, [pageId, title || 'Regional Impact', JSON.stringify(content), user.id]);
    } else {
      // Update existing section
      await query(`
        UPDATE page_sections
        SET content = $1, title = $2, updated_by = $3, updated_at = CURRENT_TIMESTAMP
        WHERE page_id = $4 AND section_key = 'regional_impact'
      `, [JSON.stringify(content), title || 'Regional Impact', user.id, pageId]);
    }

    const response = NextResponse.json({
      message: 'Regional map data updated successfully',
      data: content,
    });
    return corsResponse(response, request.headers.get('origin'));
  } catch (error: any) {
    console.error('Error updating regional map data:', error);
    const errorResponse = NextResponse.json(
      { error: 'Failed to update regional map data' },
      { status: 500 }
    );
    return corsResponse(errorResponse, request.headers.get('origin'));
  }
}

// PATCH /api/regional-map - Update a single region
export async function PATCH(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.authenticated) {
      const errorResponse = NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
      return corsResponse(errorResponse, request.headers.get('origin'));
    }

    const user = authResult.user!;
    const body = await request.json();
    const { regionName, data } = body;

    if (!regionName || !data) {
      const errorResponse = NextResponse.json(
        { error: 'regionName and data are required' },
        { status: 400 }
      );
      return corsResponse(errorResponse, request.headers.get('origin'));
    }

    // Get current regional data
    const result = await query(`
      SELECT ps.content, ps.id, p.id as page_id
      FROM page_sections ps
      JOIN pages p ON ps.page_id = p.id
      WHERE p.slug = 'impact' AND ps.section_key = 'regional_impact'
    `);

    let content: any;
    let pageId: string;
    let sectionExists = false;

    if (result.rows.length > 0 && result.rows[0].content) {
      content = typeof result.rows[0].content === 'string'
        ? JSON.parse(result.rows[0].content)
        : result.rows[0].content;
      pageId = result.rows[0].page_id;
      sectionExists = true;
    } else {
      // Get or create impact page
      const pageResult = await query("SELECT id FROM pages WHERE slug = 'impact'");
      if (pageResult.rows.length === 0) {
        const createPageResult = await query(`
          INSERT INTO pages (slug, title, meta_title, meta_description, is_active, created_by, updated_by)
          VALUES ('impact', 'Our Impact', 'Our Impact - GETFund', 'See the impact of GETFund across Ghana', true, $1, $1)
          RETURNING id
        `, [user.id]);
        pageId = createPageResult.rows[0].id;
      } else {
        pageId = pageResult.rows[0].id;
      }

      content = {
        title: 'Regional Impact',
        subtitle: 'Ensuring equitable distribution of educational resources across all regions',
        description: '',
        regions: DEFAULT_REGIONS,
      };
    }

    // Find and update the specific region
    const regions = content.regions || DEFAULT_REGIONS;
    const regionIndex = regions.findIndex((r: any) =>
      r.name.toLowerCase() === regionName.toLowerCase()
    );

    if (regionIndex === -1) {
      const errorResponse = NextResponse.json(
        { error: `Region "${regionName}" not found` },
        { status: 404 }
      );
      return corsResponse(errorResponse, request.headers.get('origin'));
    }

    // Update region data
    regions[regionIndex] = {
      ...regions[regionIndex],
      ...data,
      name: regions[regionIndex].name, // Preserve original name
    };

    content.regions = regions;

    if (sectionExists) {
      await query(`
        UPDATE page_sections
        SET content = $1, updated_by = $2, updated_at = CURRENT_TIMESTAMP
        WHERE page_id = $3 AND section_key = 'regional_impact'
      `, [JSON.stringify(content), user.id, pageId]);
    } else {
      await query(`
        INSERT INTO page_sections (
          page_id, section_key, section_type, title, content, order_index, is_active, created_by, updated_by
        ) VALUES ($1, 'regional_impact', 'regional_impact', $2, $3, 1, true, $4, $4)
      `, [pageId, content.title, JSON.stringify(content), user.id]);
    }

    const response = NextResponse.json({
      message: `Region "${regionName}" updated successfully`,
      region: regions[regionIndex],
    });
    return corsResponse(response, request.headers.get('origin'));
  } catch (error: any) {
    console.error('Error updating region:', error);
    const errorResponse = NextResponse.json(
      { error: 'Failed to update region' },
      { status: 500 }
    );
    return corsResponse(errorResponse, request.headers.get('origin'));
  }
}
