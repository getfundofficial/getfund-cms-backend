import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { corsResponse, corsOptionsResponse } from '@/lib/cors';
import { verifyAuth } from '@/lib/auth-middleware';
import { AuditLogModel } from '@/models/AuditLog';

// Configure route to allow longer execution time for database wake-up
export const maxDuration = 180; // 180 seconds (3 minutes)

// Handle CORS preflight
export async function OPTIONS(request: NextRequest) {
  return corsOptionsResponse(request.headers.get('origin'));
}

// GET /api/content - Get all content (for CMS management)
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

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');

    let sql = `
      SELECT
        c.*,
        u.full_name as creator_name
      FROM content c
      LEFT JOIN users u ON c.created_by = u.id
      WHERE c.deleted_at IS NULL
    `;

    const params: any[] = [];
    let paramIndex = 1;

    if (type) {
      sql += ` AND c.type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }

    if (status) {
      sql += ` AND c.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    sql += ` ORDER BY c.updated_at DESC`;

    if (limit) {
      sql += ` LIMIT $${paramIndex}`;
      params.push(parseInt(limit));
      paramIndex++;
    }

    if (offset) {
      sql += ` OFFSET $${paramIndex}`;
      params.push(parseInt(offset));
      paramIndex++;
    }

    const result = await query(sql, params);

    const response = NextResponse.json(result.rows);
    corsResponse(response, request.headers.get('origin'));
    return response;
  } catch (error: any) {
    console.error('Error fetching content:', error);
    const errorResponse = NextResponse.json(
      { error: 'Failed to fetch content' },
      { status: 500 }
    );
    corsResponse(errorResponse, request.headers.get('origin'));
    return errorResponse;
  }
}

// POST /api/content - Create new content
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const {
      type,
      title,
      slug,
      excerpt,
      body: contentBody,
      author,
      category,
      featured_image_url,
      meta_data,
    } = body;

    const result = await query(
      `INSERT INTO content (
        type, title, slug, excerpt, body, author, category,
        featured_image_url, meta_data, status, created_by, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
      RETURNING *`,
      [
        type,
        title,
        slug,
        excerpt,
        contentBody,
        author,
        category,
        featured_image_url,
        meta_data ? JSON.stringify(meta_data) : null,
        'draft',
        authResult.user.id,
      ]
    );

    const createdContent = result.rows[0];

    // Log content creation
    await AuditLogModel.create({
      user_id: authResult.user.id,
      action: 'create',
      entity_type: 'content',
      entity_id: createdContent.id,
      changes: {
        type,
        title,
        slug,
        status: 'draft',
      },
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
      user_agent: request.headers.get('user-agent') || undefined,
    });

    const response = NextResponse.json(createdContent, { status: 201 });
    corsResponse(response, request.headers.get('origin'));
    return response;
  } catch (error: any) {
    console.error('Error creating content:', error);
    const errorResponse = NextResponse.json(
      { error: error.message || 'Failed to create content' },
      { status: 500 }
    );
    corsResponse(errorResponse, request.headers.get('origin'));
    return errorResponse;
  }
}
