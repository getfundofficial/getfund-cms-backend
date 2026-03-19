export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { corsResponse, corsOptionsResponse } from '@/lib/cors';
import { verifyAuth } from '@/lib/auth-middleware';

// Configure route to allow longer execution time for database wake-up
export const maxDuration = 180; // 180 seconds (3 minutes)

// Handle CORS preflight
export async function OPTIONS(request: NextRequest) {
  return corsOptionsResponse(request.headers.get('origin'));
}

// GET /api/content/stats - Get dashboard statistics
export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.authenticated) {
      const errorResponse = NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
      corsResponse(errorResponse, request.headers.get('origin'));
      return errorResponse;
    }

    // Get counts by status
    const statsResult = await query(
      `SELECT
        status,
        COUNT(*) as count
       FROM content
       WHERE deleted_at IS NULL
       GROUP BY status`
    );

    // Get counts by type
    const typeResult = await query(
      `SELECT
        type,
        COUNT(*) as count
       FROM content
       WHERE deleted_at IS NULL
       GROUP BY type`
    );

    // Get recent activity count (last 7 days)
    const recentResult = await query(
      `SELECT COUNT(*) as count
       FROM content
       WHERE deleted_at IS NULL
         AND updated_at >= NOW() - INTERVAL '7 days'`
    );

    // Get total pages count
    const pagesResult = await query(
      `SELECT COUNT(*) as count
       FROM pages`
    );

    // Get total news articles count
    const newsResult = await query(
      `SELECT COUNT(*) as count
       FROM content
       WHERE deleted_at IS NULL
         AND type = 'news'`
    );

    const stats = {
      total: 0,
      draft: 0,
      in_review: 0,
      approved: 0,
      published: 0,
      changes_requested: 0,
      by_type: {} as Record<string, number>,
      recent_updates: parseInt(recentResult.rows[0]?.count || '0'),
      total_pages: parseInt(pagesResult.rows[0]?.count || '0'),
      total_news: parseInt(newsResult.rows[0]?.count || '0'),
    };

    // Process status counts
    statsResult.rows.forEach((row) => {
      const count = parseInt(row.count);
      stats.total += count;

      switch (row.status) {
        case 'draft':
          stats.draft = count;
          break;
        case 'in_review':
          stats.in_review = count;
          break;
        case 'approved':
          stats.approved = count;
          break;
        case 'published':
          stats.published = count;
          break;
        case 'changes_requested':
          stats.changes_requested = count;
          break;
      }
    });

    // Process type counts
    typeResult.rows.forEach((row) => {
      stats.by_type[row.type] = parseInt(row.count);
    });

    const response = NextResponse.json(stats);
    corsResponse(response, request.headers.get('origin'));
    return response;
  } catch (error: any) {
    console.error('Error fetching content stats:', error);
    const errorResponse = NextResponse.json(
      { error: 'Failed to fetch content statistics' },
      { status: 500 }
    );
    corsResponse(errorResponse, request.headers.get('origin'));
    return errorResponse;
  }
}
