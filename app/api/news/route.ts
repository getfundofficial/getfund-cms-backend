import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { corsResponse, corsOptionsResponse } from '@/lib/cors';

// Handle CORS preflight
export async function OPTIONS(request: NextRequest) {
  return corsOptionsResponse(request.headers.get('origin'));
}

export async function GET(request: NextRequest) {
  try {
    // Query to fetch all published news articles, ordered by published_at descending
    const result = await query(
      `SELECT
        id,
        title,
        slug,
        excerpt,
        body,
        author,
        category,
        featured_image_url,
        published_at,
        created_at
      FROM content
      WHERE type = 'news'
        AND status = 'published'
        AND deleted_at IS NULL
      ORDER BY published_at DESC, created_at DESC`,
      []
    );

    const articles = result.rows.map((row: any) => ({
      id: row.id,
      title: row.title,
      slug: row.slug,
      excerpt: row.excerpt || '',
      content: row.body || '',
      image_url: row.featured_image_url || null,
      author: row.author || 'GETFund',
      category: row.category || 'News',
      date: row.published_at || row.created_at,
      published_date: row.published_at || row.created_at,
    }));

    const response = NextResponse.json(articles);
    corsResponse(response, request.headers.get('origin'));
    return response;
  } catch (error: any) {
    console.error('Error fetching news articles:', error);
    const errorResponse = NextResponse.json(
      { error: 'Failed to fetch news articles' },
      { status: 500 }
    );
    corsResponse(errorResponse, request.headers.get('origin'));
    return errorResponse;
  }
}
