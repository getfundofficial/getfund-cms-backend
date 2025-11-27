/**
 * Blob Storage Service
 * Handles file uploads using Vercel Blob Storage for production
 * Falls back to local filesystem in development
 */

import { put, del, list } from '@vercel/blob';
import fs from 'fs/promises';
import path from 'path';

const USE_BLOB_STORAGE = process.env.NODE_ENV === 'production' || process.env.USE_BLOB_STORAGE === 'true';
const LOCAL_UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';

export interface UploadResult {
  url: string;
  pathname: string;
  contentType: string;
  size: number;
}

/**
 * Upload a file to Blob storage (production) or local filesystem (development)
 */
export async function uploadFile(
  file: File | Buffer,
  filename: string,
  options: {
    contentType?: string;
    folder?: string;
  } = {}
): Promise<UploadResult> {
  const { contentType = 'application/octet-stream', folder = 'uploads' } = options;

  // Generate a unique pathname with folder structure
  const timestamp = Date.now();
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
  const pathname = `${folder}/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${timestamp}-${sanitizedFilename}`;

  if (USE_BLOB_STORAGE) {
    // Production: Use Vercel Blob
    console.log('[Blob Storage] Uploading to Vercel Blob:', pathname);

    try {
      const blob = await put(pathname, file, {
        access: 'public',
        contentType,
      });

      // Get file size from Blob API (contentLength) or from input
      const fileSize = file instanceof Buffer
        ? file.length
        : 'size' in file
          ? file.size
          : 0;

      return {
        url: blob.url,
        pathname: blob.pathname,
        contentType: blob.contentType || contentType,
        size: fileSize,
      };
    } catch (error) {
      console.error('[Blob Storage] Upload failed:', error);
      throw new Error(`Failed to upload file to Blob storage: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  } else {
    // Development: Use local filesystem
    console.log('[Blob Storage] Uploading to local filesystem:', pathname);

    try {
      const fullPath = path.join(process.cwd(), LOCAL_UPLOAD_DIR, pathname);
      const dir = path.dirname(fullPath);

      // Ensure directory exists
      await fs.mkdir(dir, { recursive: true });

      // Write file
      if (file instanceof Buffer) {
        await fs.writeFile(fullPath, file);
      } else if ('arrayBuffer' in file && typeof file.arrayBuffer === 'function') {
        // File object - convert to Buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        await fs.writeFile(fullPath, buffer);
      } else {
        throw new Error('Invalid file type: must be Buffer or File');
      }

      // Get file stats for size
      const stats = await fs.stat(fullPath);

      // Return local URL (will be proxied in development or served by Next.js)
      const url = `http://localhost:${process.env.PORT || 5000}/${pathname}`;

      return {
        url,
        pathname: `/${pathname}`,
        contentType,
        size: stats.size,
      };
    } catch (error) {
      console.error('[Blob Storage] Local upload failed:', error);
      throw new Error(`Failed to upload file to local storage: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

/**
 * Delete a file from Blob storage or local filesystem
 */
export async function deleteFile(urlOrPathname: string): Promise<void> {
  if (USE_BLOB_STORAGE) {
    // Production: Delete from Vercel Blob
    console.log('[Blob Storage] Deleting from Vercel Blob:', urlOrPathname);

    try {
      await del(urlOrPathname);
    } catch (error) {
      console.error('[Blob Storage] Delete failed:', error);
      throw new Error(`Failed to delete file from Blob storage: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  } else {
    // Development: Delete from local filesystem
    console.log('[Blob Storage] Deleting from local filesystem:', urlOrPathname);

    try {
      // Extract pathname from URL if needed
      const pathname = urlOrPathname.startsWith('http')
        ? new URL(urlOrPathname).pathname
        : urlOrPathname;

      const fullPath = path.join(process.cwd(), LOCAL_UPLOAD_DIR, pathname);
      await fs.unlink(fullPath);
    } catch (error) {
      console.error('[Blob Storage] Local delete failed:', error);
      // Don't throw error if file doesn't exist
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw new Error(`Failed to delete file from local storage: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }
}

/**
 * List files in Blob storage (production only)
 */
export async function listFiles(options: { prefix?: string; limit?: number } = {}) {
  if (!USE_BLOB_STORAGE) {
    throw new Error('List operation is only supported in production with Blob storage');
  }

  const { prefix, limit } = options;

  try {
    const result = await list({ prefix, limit });
    return result.blobs;
  } catch (error) {
    console.error('[Blob Storage] List failed:', error);
    throw new Error(`Failed to list files: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get the public URL for a file
 * Ensures URLs are in the correct format for the current environment
 */
export function getPublicUrl(urlOrPathname: string): string {
  // If it's already a full Blob URL, return as-is
  if (urlOrPathname.startsWith('https://') && urlOrPathname.includes('blob.vercel-storage.com')) {
    return urlOrPathname;
  }

  // If it's a local URL in development, return as-is
  if (urlOrPathname.startsWith('http://localhost')) {
    return urlOrPathname;
  }

  // If it's a relative path in development, convert to local URL
  if (!USE_BLOB_STORAGE && urlOrPathname.startsWith('/')) {
    return `http://localhost:${process.env.PORT || 5000}${urlOrPathname}`;
  }

  // Otherwise return as-is
  return urlOrPathname;
}
