export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth-middleware';
import { query } from '@/lib/db';
import { getCorsHeaders } from '@/lib/cors';
import { AuditLogModel } from '@/models/AuditLog';

// GET /api/media/:id - Get single media file
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user } = await verifyAuth(request);

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: getCorsHeaders(request.headers.get('origin')) }
      );
    }

    const result = await query(`
      SELECT
        id,
        filename,
        original_name,
        mime_type,
        size_bytes,
        url,
        alt_text,
        uploaded_by,
        created_at
      FROM media
      WHERE id = $1 AND deleted_at IS NULL
    `, [params.id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Media not found' },
        { status: 404, headers: getCorsHeaders(request.headers.get('origin')) }
      );
    }

    return NextResponse.json(
      { media: result.rows[0] },
      { headers: getCorsHeaders(request.headers.get('origin')) }
    );
  } catch (error: any) {
    console.error('Error fetching media:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: getCorsHeaders(request.headers.get('origin')) }
    );
  }
}

// PUT /api/media/:id - Update media (alt text only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user } = await verifyAuth(request);

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: getCorsHeaders(request.headers.get('origin')) }
      );
    }

    const body = await request.json();
    const { alt_text } = body;

    const result = await query(`
      UPDATE media
      SET alt_text = $1
      WHERE id = $2 AND deleted_at IS NULL
      RETURNING id, filename, original_name, mime_type, size_bytes, url, alt_text, created_at
    `, [alt_text, params.id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Media not found' },
        { status: 404, headers: getCorsHeaders(request.headers.get('origin')) }
      );
    }

    return NextResponse.json(
      {
        message: 'Media updated successfully',
        media: result.rows[0]
      },
      { headers: getCorsHeaders(request.headers.get('origin')) }
    );
  } catch (error: any) {
    console.error('Error updating media:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: getCorsHeaders(request.headers.get('origin')) }
    );
  }
}

// DELETE /api/media/:id - Soft delete media
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user } = await verifyAuth(request);

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: getCorsHeaders(request.headers.get('origin')) }
      );
    }

    // Soft delete (keep file on disk, mark as deleted in database)
    const result = await query(`
      UPDATE media
      SET deleted_at = NOW()
      WHERE id = $1 AND deleted_at IS NULL
      RETURNING id, filename
    `, [params.id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Media not found' },
        { status: 404, headers: getCorsHeaders(request.headers.get('origin')) }
      );
    }

    const deletedMedia = result.rows[0];

    // Log media deletion in audit trail
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || '';

    await AuditLogModel.create({
      user_id: user.id,
      action: 'delete',
      entity_type: 'media',
      entity_id: deletedMedia.id,
      changes: { filename: deletedMedia.filename },
      ip_address: ipAddress,
      user_agent: userAgent
    });

    return NextResponse.json(
      { message: 'Media deleted successfully' },
      { headers: getCorsHeaders(request.headers.get('origin')) }
    );
  } catch (error: any) {
    console.error('Error deleting media:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: getCorsHeaders(request.headers.get('origin')) }
    );
  }
}

// OPTIONS /api/media/:id
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: getCorsHeaders(request.headers.get('origin')),
  });
}
