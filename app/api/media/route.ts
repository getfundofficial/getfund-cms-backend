import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { verifyAuth } from '@/lib/auth-middleware';
import { query } from '@/lib/db';
import { getCorsHeaders } from '@/lib/cors';

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

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5MB.' },
        { status: 400, headers: getCorsHeaders(request.headers.get('origin')) }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const extension = path.extname(file.name);
    const filename = `${timestamp}-${randomString}${extension}`;

    // Create year/month directory structure
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', String(year), month);

    // Create directory if it doesn't exist
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Save file
    const filePath = path.join(uploadDir, filename);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Generate URL
    const fileUrl = `/uploads/${year}/${month}/${filename}`;

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
      file.type,
      file.size,
      filePath,
      fileUrl,
      altText,
      user.userId
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
