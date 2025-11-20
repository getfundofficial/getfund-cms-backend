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

// GET /api/content/:id - Get single content item
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const result = await query(
      `SELECT c.*, u.full_name as creator_name
       FROM content c
       LEFT JOIN users u ON c.created_by = u.id
       WHERE c.id = $1 AND c.deleted_at IS NULL`,
      [params.id]
    );

    if (result.rows.length === 0) {
      const errorResponse = NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      );
      corsResponse(errorResponse, request.headers.get('origin'));
      return errorResponse;
    }

    const response = NextResponse.json(result.rows[0]);
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

// PUT /api/content/:id - Update content
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
      `UPDATE content
       SET title = $1, slug = $2, excerpt = $3, body = $4,
           author = $5, category = $6, featured_image_url = $7,
           meta_data = $8, updated_at = NOW()
       WHERE id = $9 AND deleted_at IS NULL
       RETURNING *`,
      [
        title,
        slug,
        excerpt,
        contentBody,
        author,
        category,
        featured_image_url,
        meta_data ? JSON.stringify(meta_data) : null,
        params.id,
      ]
    );

    if (result.rows.length === 0) {
      const errorResponse = NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      );
      corsResponse(errorResponse, request.headers.get('origin'));
      return errorResponse;
    }

    const updatedContent = result.rows[0];

    // Log content update
    await AuditLogModel.create({
      user_id: authResult.user.id,
      action: 'update',
      entity_type: 'content',
      entity_id: params.id,
      changes: {
        title: updatedContent.title,
        type: updatedContent.type,
        status: updatedContent.status,
      },
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
      user_agent: request.headers.get('user-agent') || undefined,
    });

    const response = NextResponse.json(updatedContent);
    corsResponse(response, request.headers.get('origin'));
    return response;
  } catch (error: any) {
    console.error('Error updating content:', error);
    const errorResponse = NextResponse.json(
      { error: error.message || 'Failed to update content' },
      { status: 500 }
    );
    corsResponse(errorResponse, request.headers.get('origin'));
    return errorResponse;
  }
}

// DELETE /api/content/:id - Soft delete content
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Get content details before deletion for audit log
    const contentResult = await query(
      `SELECT id, title, type FROM content WHERE id = $1 AND deleted_at IS NULL`,
      [params.id]
    );

    if (contentResult.rows.length === 0) {
      const errorResponse = NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      );
      corsResponse(errorResponse, request.headers.get('origin'));
      return errorResponse;
    }

    const contentToDelete = contentResult.rows[0];

    // Perform soft delete
    const result = await query(
      `UPDATE content
       SET deleted_at = NOW()
       WHERE id = $1 AND deleted_at IS NULL
       RETURNING id`,
      [params.id]
    );

    if (result.rows.length === 0) {
      const errorResponse = NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      );
      corsResponse(errorResponse, request.headers.get('origin'));
      return errorResponse;
    }

    // Log content deletion
    await AuditLogModel.create({
      user_id: authResult.user.id,
      action: 'delete',
      entity_type: 'content',
      entity_id: params.id,
      changes: {
        title: contentToDelete.title,
        type: contentToDelete.type,
      },
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
      user_agent: request.headers.get('user-agent') || undefined,
    });

    const response = NextResponse.json({ success: true });
    corsResponse(response, request.headers.get('origin'));
    return response;
  } catch (error: any) {
    console.error('Error deleting content:', error);
    const errorResponse = NextResponse.json(
      { error: 'Failed to delete content' },
      { status: 500 }
    );
    corsResponse(errorResponse, request.headers.get('origin'));
    return errorResponse;
  }
}
