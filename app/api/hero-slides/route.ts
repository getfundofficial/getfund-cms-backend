import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { corsResponse, corsOptionsResponse } from '@/lib/cors';
import { toRelativePath } from '@/lib/url-utils';

// Handle CORS preflight
export async function OPTIONS(request: NextRequest) {
  return corsOptionsResponse(request.headers.get('origin'));
}

export async function GET(request: NextRequest) {
  try {
    // Query to fetch all published hero slides, ordered by published_at descending
    const result = await query(
      `SELECT
        id,
        title,
        excerpt,
        featured_image_url,
        meta_data,
        published_at,
        created_at
      FROM content
      WHERE type = 'hero_slide'
        AND status = 'published'
        AND deleted_at IS NULL
      ORDER BY published_at DESC, created_at DESC`,
      []
    );

    const slides = result.rows.map((row: any) => {
      const metaData = row.meta_data || {};

      return {
        id: row.id,
        title: row.title,
        subtitle: row.excerpt || metaData.subtitle || '',
        image_url: toRelativePath(row.featured_image_url || metaData.image_url) || '',
        link_text: metaData.link_text || metaData.buttonText || '',
        link_url: metaData.link_url || metaData.buttonLink || '',
      };
    });

    const response = NextResponse.json(slides);
    corsResponse(response, request.headers.get('origin'));
    return response;
  } catch (error: any) {
    console.error('Error fetching hero slides:', error);
    const errorResponse = NextResponse.json(
      { error: 'Failed to fetch hero slides' },
      { status: 500 }
    );
    corsResponse(errorResponse, request.headers.get('origin'));
    return errorResponse;
  }
}
