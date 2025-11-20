import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { corsResponse, corsOptionsResponse } from '@/lib/cors';

// Handle CORS preflight
export async function OPTIONS(request: NextRequest) {
  return corsOptionsResponse(request.headers.get('origin'));
}

// GET /api/content/published/:slug - Get published content by slug (public endpoint)
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    console.log(`[API] Fetching published content by slug: ${slug}`);

    // Query for published content by slug
    const result = await query(`
      SELECT
        id,
        type,
        title,
        slug,
        excerpt,
        body,
        featured_image_url,
        category,
        author,
        published_at,
        meta_data
      FROM content
      WHERE slug = $1
        AND status = 'published'
        AND deleted_at IS NULL
    `, [slug]);

    if (result.rows.length === 0) {
      console.log(`[API] Content not found for slug: ${slug}`);
      const errorResponse = NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      );
      corsResponse(errorResponse, request.headers.get('origin'));
      return errorResponse;
    }

    const content = result.rows[0];
    console.log(`[API] Found content: ${content.title} (type: ${content.type})`);

    const response = NextResponse.json(content);
    corsResponse(response, request.headers.get('origin'));
    return response;
  } catch (error: any) {
    console.error('[API] Error fetching published content by slug:', error);
    const errorResponse = NextResponse.json(
      { error: 'Failed to fetch content', details: error.message },
      { status: 500 }
    );
    corsResponse(errorResponse, request.headers.get('origin'));
    return errorResponse;
  }
}
