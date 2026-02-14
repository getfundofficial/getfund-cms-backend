/**
 * Update the CMS media library:
 * 1. Remove broken/invalid image links from the media table
 * 2. Add all 57 news article images to the media library
 *
 * This ensures the media library reflects all available news images
 * and removes any entries pointing to non-existent files.
 */

require('dotenv').config();
const { Client } = require('pg');
const https = require('https');
const http = require('http');
const path = require('path');
const fs = require('fs');

const NEWS_IMAGES_DIR = path.join(__dirname, '../../getfund-website/public/images/news');

async function checkUrlAccessible(url) {
  return new Promise((resolve) => {
    try {
      const protocol = url.startsWith('https') ? https : http;
      const req = protocol.get(url, { timeout: 8000 }, (res) => {
        resolve(res.statusCode >= 200 && res.statusCode < 400);
      });
      req.on('error', () => resolve(false));
      req.on('timeout', () => { req.destroy(); resolve(false); });
    } catch {
      resolve(false);
    }
  });
}

function getFileSizeBytes(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return stats.size;
  } catch {
    return 0;
  }
}

function getMimeType(filename) {
  const ext = path.extname(filename).toLowerCase();
  const mimeTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
  };
  return mimeTypes[ext] || 'image/jpeg';
}

async function main() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  console.log('Connected to database.\n');

  // ============================================
  // STEP 1: Remove broken image links from media
  // ============================================
  console.log('=== STEP 1: Checking for broken media entries ===\n');

  const mediaResult = await client.query(
    'SELECT id, url, filename, original_name FROM media WHERE deleted_at IS NULL ORDER BY created_at DESC'
  );
  console.log(`Found ${mediaResult.rows.length} media entries in library.\n`);

  let brokenCount = 0;
  let removedCount = 0;

  for (const item of mediaResult.rows) {
    const url = item.url;
    let isBroken = false;

    if (!url || url.trim() === '') {
      isBroken = true;
      console.log(`  BROKEN (empty URL): ${item.original_name || item.filename} [${item.id}]`);
    } else if (url.startsWith('http://') || url.startsWith('https://')) {
      // External URL - check if accessible
      const accessible = await checkUrlAccessible(url);
      if (!accessible) {
        isBroken = true;
        console.log(`  BROKEN (404/timeout): ${url} [${item.id}]`);
      }
    } else if (url.startsWith('/')) {
      // Local path - check if file exists in frontend public dir
      const localPath = path.join(__dirname, '../../getfund-website/public', url);
      if (!fs.existsSync(localPath)) {
        // Also check CMS public dir
        const cmsPath = path.join(__dirname, '../public', url);
        if (!fs.existsSync(cmsPath)) {
          isBroken = true;
          console.log(`  BROKEN (file missing): ${url} [${item.id}]`);
        }
      }
    }

    if (isBroken) {
      brokenCount++;
      // Soft delete the broken entry
      await client.query(
        'UPDATE media SET deleted_at = NOW() WHERE id = $1',
        [item.id]
      );
      removedCount++;
    }
  }

  if (brokenCount === 0) {
    console.log('  No broken media entries found.\n');
  } else {
    console.log(`\n  Soft-deleted ${removedCount} broken media entries.\n`);
  }

  // ============================================
  // STEP 2: Add news images to media library
  // ============================================
  console.log('=== STEP 2: Adding news images to media library ===\n');

  // Get all news articles with their featured images
  const articlesResult = await client.query(
    "SELECT slug, title, featured_image_url FROM content WHERE type = 'news' AND status = 'published' AND deleted_at IS NULL ORDER BY published_at DESC"
  );
  console.log(`Found ${articlesResult.rows.length} published news articles.\n`);

  // Get existing media URLs to avoid duplicates
  const existingMedia = await client.query(
    'SELECT url FROM media WHERE deleted_at IS NULL'
  );
  const existingUrls = new Set(existingMedia.rows.map(r => r.url));

  let addedCount = 0;
  let skippedCount = 0;

  for (const article of articlesResult.rows) {
    const imageUrl = article.featured_image_url;
    if (!imageUrl) {
      console.log(`  SKIP (no image): ${article.slug}`);
      skippedCount++;
      continue;
    }

    // Check if already in media library
    if (existingUrls.has(imageUrl)) {
      console.log(`  EXISTS: ${imageUrl}`);
      skippedCount++;
      continue;
    }

    // Get file info
    const filename = path.basename(imageUrl);
    const localFilePath = path.join(NEWS_IMAGES_DIR, filename);
    const sizeBytes = getFileSizeBytes(localFilePath);
    const mimeType = getMimeType(filename);

    // Generate alt text from article title
    const altText = article.title;

    await client.query(
      `INSERT INTO media (filename, original_name, mime_type, size_bytes, file_path, url, alt_text, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
       ON CONFLICT DO NOTHING`,
      [
        `news/${filename}`,
        filename,
        mimeType,
        sizeBytes,
        imageUrl,
        imageUrl,
        altText,
      ]
    );

    existingUrls.add(imageUrl);
    addedCount++;
    console.log(`  ADDED: ${filename} (${(sizeBytes / 1024).toFixed(0)} KB) - "${article.title}"`);
  }

  console.log(`\nDone! Added ${addedCount} images, skipped ${skippedCount}.\n`);

  // ============================================
  // STEP 3: Summary
  // ============================================
  const finalCount = await client.query(
    'SELECT COUNT(*) as count FROM media WHERE deleted_at IS NULL'
  );
  console.log(`=== SUMMARY ===`);
  console.log(`  Broken entries removed: ${removedCount}`);
  console.log(`  News images added: ${addedCount}`);
  console.log(`  Total media items now: ${finalCount.rows[0].count}`);

  await client.end();
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
