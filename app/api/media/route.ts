import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth-middleware';
import { query } from '@/lib/db';
import { getCorsHeaders } from '@/lib/cors';
import { uploadFile } from '@/lib/blob-storage';

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

    return NextResponse.json(
      { media: result.rows },
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

    // Validate file size (100MB max)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 100MB.' },
        { status: 400, headers: getCorsHeaders(request.headers.get('origin')) }
      );
    }

    // Upload file to Blob storage (or local filesystem in development)
    const uploadResult = await uploadFile(file, file.name, {
      contentType: file.type,
      folder: 'uploads',
    });

    const fileUrl = uploadResult.url;
    const filename = uploadResult.pathname.split('/').pop() || file.name;

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
      uploadResult.contentType,
      uploadResult.size,
      uploadResult.pathname,
      fileUrl,
      altText,
      user.id
    ]);

    return NextResponse.json(
      {
        message: 'File uploaded successfully',
        media: result.rows[0]
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

// OPTIONS /api/media
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: getCorsHeaders(request.headers.get('origin')),
  });
}
