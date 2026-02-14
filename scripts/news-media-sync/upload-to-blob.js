/**
 * Phase 2: Upload all news images to Vercel Blob and register in media library.
 * Uploads featured images AND carousel images, then updates DB references.
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const { put } = require('@vercel/blob');
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { NEWS_IMAGES_DIR, getMimeType } = require('./utils');

const MAX_WIDTH = 1200;
const JPEG_QUALITY = 85;

async function optimizeImage(inputPath) {
  const ext = path.extname(inputPath).toLowerCase();
  const buffer = fs.readFileSync(inputPath);
  try {
    let pipeline = sharp(buffer).resize({ width: MAX_WIDTH, withoutEnlargement: true });
    if (ext === '.jpg' || ext === '.jpeg') {
      pipeline = pipeline.jpeg({ quality: JPEG_QUALITY });
    } else if (ext === '.png') {
      pipeline = pipeline.png({ compressionLevel: 8 });
    }
    return await pipeline.toBuffer();
  } catch {
    return buffer;
  }
}

async function uploadToBlob(client) {
  console.log('=== PHASE 2: Uploading images to Vercel Blob + Media Library ===\n');

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.log('WARNING: BLOB_READ_WRITE_TOKEN not set. Registering in media table with local paths only.\n');
  }

  // Get all local news images
  const files = fs.readdirSync(NEWS_IMAGES_DIR)
    .filter(f => /\.(jpg|jpeg|png|gif|webp)$/i.test(f));
  console.log(`Found ${files.length} image files in ${NEWS_IMAGES_DIR}\n`);

  // Get existing media URLs to avoid duplicates
  const existing = await client.query('SELECT url, filename FROM media WHERE deleted_at IS NULL');
  const existingUrls = new Set(existing.rows.map(r => r.url));
  const existingFilenames = new Set(existing.rows.map(r => r.filename));

  let uploaded = 0, registered = 0, skippedCount = 0, failedCount = 0;
  const urlMap = new Map(); // localPath -> blobUrl

  for (const file of files) {
    const localPath = `/images/news/${file}`;
    const fullPath = path.join(NEWS_IMAGES_DIR, file);

    if (existingUrls.has(localPath) || existingFilenames.has(`news/${file}`)) {
      const row = existing.rows.find(r => r.url === localPath || r.filename === `news/${file}`);
      // If entry has a local path URL and we have a blob token, re-upload to blob
      if (row && row.url.startsWith('/images/') && process.env.BLOB_READ_WRITE_TOKEN) {
        // Fall through to upload logic below
      } else {
        // Already in media library with blob URL - skip
        if (row) urlMap.set(localPath, row.url);
        skippedCount++;
        continue;
      }
    }

    const mimeType = getMimeType(file);
    const stats = fs.statSync(fullPath);
    const altText = file.replace(/[-_]/g, ' ').replace(/\.\w+$/, '').replace(/carousel \d+/, '');

    let finalUrl = localPath;

    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const optimized = await optimizeImage(fullPath);
        const blob = await put(`news-images/${file}`, optimized, {
          access: 'public',
          contentType: mimeType,
        });
        finalUrl = blob.url;
        uploaded++;
        console.log(`  BLOB: ${file} -> ${blob.url.substring(0, 60)}...`);
      } catch (err) {
        console.log(`  BLOB FAIL: ${file} - ${err.message}`);
        failedCount++;
        continue;
      }
    }

    // Upsert into media table
    const existsCheck = await client.query(
      'SELECT id FROM media WHERE filename = $1 AND deleted_at IS NULL', [`news/${file}`]
    );
    if (existsCheck.rows.length === 0) {
      await client.query(`
        INSERT INTO media (filename, original_name, mime_type, size_bytes, file_path, url, alt_text, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      `, [`news/${file}`, file, mimeType, stats.size, localPath, finalUrl, altText]);
    } else {
      // Update existing entry with new blob URL
      await client.query(
        'UPDATE media SET url = $1 WHERE filename = $2 AND deleted_at IS NULL',
        [finalUrl, `news/${file}`]
      );
    }

    urlMap.set(localPath, finalUrl);
    registered++;
  }

  console.log(`\n--- Phase 2 Summary ---`);
  console.log(`Uploaded to Blob: ${uploaded}`);
  console.log(`Registered in media: ${registered}`);
  console.log(`Skipped (existing): ${skippedCount}`);
  console.log(`Failed: ${failedCount}\n`);

  return urlMap;
}

module.exports = { uploadToBlob, optimizeImage };

if (require.main === module) {
  (async () => {
    const client = new Client({
      connectionString: process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });
    await client.connect();
    await uploadToBlob(client);
    await client.end();
  })().catch(err => { console.error(err); process.exit(1); });
}
