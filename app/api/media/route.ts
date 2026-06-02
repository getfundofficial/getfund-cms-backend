export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth-middleware';
import { query } from '@/lib/db';
import { getCorsHeaders } from '@/lib/cors';
import { uploadFile, uploadImageSet } from '@/lib/blob-storage';
import { processImageSet } from '@/lib/image-processing';
import { AuditLogModel } from '@/models/AuditLog';

// GET /api/media - Get all media files
export async function GET(request: NextRequest) {
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
      WHERE deleted_at IS NULL
      ORDER BY created_at DESC
    `);

    // Resolve relative /images/ paths to the website URL for production
    const websiteUrl = process.env.WEBSITE_URL || '';
    const media = result.rows.map((row: any) => ({
      ...row,
      url: row.url && row.url.startsWith('/images/') && websiteUrl
        ? `${websiteUrl}${row.url}`
        : row.url,
    }));

    return NextResponse.json(
      { media },
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

// POST /api/media - Upload new media file
export async function POST(request: NextRequest) {
  try {
    const { user } = await verifyAuth(request);

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: getCorsHeaders(request.headers.get('origin')) }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const altText = formData.get('alt_text') as string || '';

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400, headers: getCorsHeaders(request.headers.get('origin')) }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.' },
        { status: 400, headers: getCorsHeaders(request.headers.get('origin')) }
      );
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5MB.' },
        { status: 400, headers: getCorsHeaders(request.headers.get('origin')) }
      );
    }

    // Resize + compress to a set of responsive WebP variants before storing, so
    // the public site downloads a small file sized to its slot (via <img srcset>)
    // instead of the full-resolution original. Falls back to storing the
    // untouched file for animated GIFs or anything sharp can't decode.
    const originalBuffer = Buffer.from(await file.arrayBuffer());

    let fileUrl: string;
    let filename: string;
    let storedPathname: string;
    let storedContentType: string;
    let storedSize: number;

    const processed = await processImageSet(originalBuffer, file.type);
    if (processed) {
      const uploaded = await uploadImageSet(file.name, processed.variants, {
        folder: 'uploads',
      });
      // The canonical (largest) variant is the default src; the frontend derives
      // the smaller variant URLs from its `-<width>w.webp` name.
      fileUrl = uploaded.canonical.url;
      storedPathname = uploaded.canonical.pathname;
      storedContentType = uploaded.contentType;
      storedSize = uploaded.canonical.size;
      filename = uploaded.canonical.pathname.split('/').pop() || file.name;
      console.log(
        `[Media] Optimized ${file.name}: ${(file.size / 1024).toFixed(0)}KB ${file.type}` +
          ` -> ${uploaded.variants.length} WebP variant(s) ` +
          `[${uploaded.variants.map((v) => `${v.width}w:${(v.size / 1024).toFixed(0)}KB`).join(', ')}]`
      );
    } else {
      // Unprocessable (e.g. animated GIF) — store the original untouched.
      const uploadResult = await uploadFile(originalBuffer, file.name, {
        contentType: file.type,
        folder: 'uploads',
      });
      fileUrl = uploadResult.url;
      storedPathname = uploadResult.pathname;
      storedContentType = uploadResult.contentType;
      storedSize = uploadResult.size;
      filename = uploadResult.pathname.split('/').pop() || file.name;
    }

    // Save to database
    const result = await query(`
      INSERT INTO media (
        filename,
        original_name,
        mime_type,
        size_bytes,
        file_path,
        url,
        alt_text,
        uploaded_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, filename, original_name, mime_type, size_bytes, url, alt_text, created_at
    `, [
      filename,
      file.name,
      storedContentType,
      storedSize,
      storedPathname,
      fileUrl,
      altText,
      user.id
    ]);

    const newMedia = result.rows[0];

    // Log media upload in audit trail
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || '';

    await AuditLogModel.create({
      user_id: user.id,
      action: 'upload',
      entity_type: 'media',
      entity_id: newMedia.id,
      changes: {
        filename: newMedia.filename,
        original_name: newMedia.original_name,
        mime_type: newMedia.mime_type,
        size_bytes: newMedia.size_bytes
      },
      ip_address: ipAddress,
      user_agent: userAgent
    });

    return NextResponse.json(
      {
        message: 'File uploaded successfully',
        media: newMedia
      },
      {
        status: 201,
        headers: getCorsHeaders(request.headers.get('origin'))
      }
    );
  } catch (error: any) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500, headers: getCorsHeaders(request.headers.get('origin')) }
    );
  }
}

// DELETE /api/media - Bulk delete media files
export async function DELETE(request: NextRequest) {
  try {
    const { user } = await verifyAuth(request);

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: getCorsHeaders(request.headers.get('origin')) }
      );
    }

    const body = await request.json();
    const { ids } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'Please provide an array of media IDs to delete' },
        { status: 400, headers: getCorsHeaders(request.headers.get('origin')) }
      );
    }

    // Soft delete all specified media items
    const placeholders = ids.map((_: string, i: number) => `$${i + 1}`).join(', ');
    const result = await query(
      `UPDATE media SET deleted_at = NOW() WHERE id IN (${placeholders}) AND deleted_at IS NULL RETURNING id, filename`,
      ids
    );

    const deletedCount = result.rows.length;

    // Log bulk deletion in audit trail
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || '';

    await AuditLogModel.create({
      user_id: user.id,
      action: 'bulk_delete',
      entity_type: 'media',
      entity_id: 'bulk',
      changes: {
        deleted_count: deletedCount,
        ids: ids,
      },
      ip_address: ipAddress,
      user_agent: userAgent,
    });

    return NextResponse.json(
      {
        message: `${deletedCount} media item${deletedCount !== 1 ? 's' : ''} deleted successfully`,
        deleted_count: deletedCount,
      },
      { headers: getCorsHeaders(request.headers.get('origin')) }
    );
  } catch (error: any) {
    console.error('Error bulk deleting media:', error);
    return NextResponse.json(
      { error: 'Failed to delete media items' },
      { status: 500, headers: getCorsHeaders(request.headers.get('origin')) }
    );
  }
}

// OPTIONS /api/media
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: getCorsHeaders(request.headers.get('origin')),
  });
}
