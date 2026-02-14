/**
 * Upload all locally-stored news images to Vercel Blob
 * and update the media table + content table URLs.
 *
 * Run: node scripts/upload-to-blob-and-fix.js
 * Requires: BLOB_READ_WRITE_TOKEN and DATABASE_URL
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env.production') });
const { put } = require('@vercel/blob');
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

let sharp;
try { sharp = require('sharp'); } catch { sharp = null; }

const NEWS_IMAGES_DIR = path.resolve(__dirname, '../../../getfund-website/public/images/news');
const MAX_WIDTH = 1200;

function getMimeType(filename) {
  const ext = path.extname(filename).toLowerCase();
  const map = {
    '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
    '.png': 'image/png', '.gif': 'image/gif', '.webp': 'image/webp',
  };
  return map[ext] || 'image/jpeg';
}

async function optimizeImage(filePath) {
  if (!sharp) return fs.readFileSync(filePath);
  try {
    const ext = path.extname(filePath).toLowerCase();
    let pipeline = sharp(fs.readFileSync(filePath))
      .resize({ width: MAX_WIDTH, withoutEnlargement: true });
    if (ext === '.jpg' || ext === '.jpeg') {
      pipeline = pipeline.jpeg({ quality: 85 });
    } else if (ext === '.png') {
      pipeline = pipeline.png({ compressionLevel: 8 });
    }
    return await pipeline.toBuffer();
  } catch {
    return fs.readFileSync(filePath);
  }
}

async function main() {
  console.log('=== Upload News Images to Vercel Blob ===\n');

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error('ERROR: BLOB_READ_WRITE_TOKEN not set');
    process.exit(1);
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  console.log('Connected to database\n');

  // Get all media items that have local /images/news/ URLs
  const result = await client.query(`
    SELECT id, filename, url, file_path
    FROM media
    WHERE deleted_at IS NULL
      AND url LIKE '/images/news/%'
  `);

  console.log(`Found ${result.rows.length} media items with local paths to upload\n`);

  let uploaded = 0;
  let failed = 0;
  const urlMap = new Map(); // old local URL -> new blob URL

  for (const row of result.rows) {
    const originalName = row.filename.replace('news/', '');
    const fullPath = path.join(NEWS_IMAGES_DIR, originalName);

    if (!fs.existsSync(fullPath)) {
      console.log(`  SKIP (not found): ${originalName}`);
      failed++;
      continue;
    }

    try {
      const optimized = await optimizeImage(fullPath);
      const blob = await put(`news-images/${originalName}`, optimized, {
        access: 'public',
        contentType: getMimeType(originalName),
      });

      // Update media table
      await client.query(
        'UPDATE media SET url = $1, file_path = $2 WHERE id = $3',
        [blob.url, `news-images/${originalName}`, row.id]
      );

      urlMap.set(row.url, blob.url);
      uploaded++;

      if (uploaded % 10 === 0) {
        console.log(`  Uploaded ${uploaded}/${result.rows.length}...`);
      }
    } catch (err) {
      console.log(`  FAIL: ${originalName} - ${err.message}`);
      failed++;
    }
  }

  console.log(`\nBlob upload done: ${uploaded} uploaded, ${failed} failed\n`);

  // Now update content table: featured_image_url
  console.log('Updating content featured_image_url...');
  let contentUpdated = 0;
  for (const [oldUrl, newUrl] of urlMap) {
    const res = await client.query(
      "UPDATE content SET featured_image_url = $1 WHERE featured_image_url = $2 AND type = 'news'",
      [newUrl, oldUrl]
    );
    contentUpdated += res.rowCount;
  }
  console.log(`  Updated ${contentUpdated} content featured images\n`);

  // Update meta_data.images arrays in content
  console.log('Updating content meta_data.images...');
  const articlesWithMeta = await client.query(`
    SELECT id, meta_data FROM content
    WHERE type = 'news' AND meta_data IS NOT NULL AND meta_data::text LIKE '%/images/news/%'
  `);

  let metaUpdated = 0;
  for (const row of articlesWithMeta.rows) {
    let metaData = row.meta_data;
    if (metaData && metaData.images) {
      let changed = false;
      metaData.images = metaData.images.map((imgUrl) => {
        if (urlMap.has(imgUrl)) {
          changed = true;
          return urlMap.get(imgUrl);
        }
        return imgUrl;
      });
      if (changed) {
        await client.query(
          'UPDATE content SET meta_data = $1::jsonb WHERE id = $2',
          [JSON.stringify(metaData), row.id]
        );
        metaUpdated++;
      }
    }
  }
  console.log(`  Updated ${metaUpdated} article meta_data.images\n`);

  console.log('========================================');
  console.log('  COMPLETE');
  console.log('========================================');
  console.log(`  Images uploaded to Blob:   ${uploaded}`);
  console.log(`  Images failed:             ${failed}`);
  console.log(`  Featured images updated:   ${contentUpdated}`);
  console.log(`  Meta images updated:       ${metaUpdated}`);
  console.log('========================================\n');

  await client.end();
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
