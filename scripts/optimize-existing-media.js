/**
 * Re-process images that were uploaded BEFORE optimization was added to the
 * upload route. Each blob-hosted image is downloaded, resized + re-encoded to
 * WebP, and written back to the SAME blob pathname so its public URL never
 * changes — meaning every page/section/article that references it keeps working
 * with no find-and-replace required.
 *
 * Safe to re-run: an image is only overwritten when the optimized version is
 * actually smaller than what is currently stored, so already-optimized files
 * are skipped on subsequent runs.
 *
 * Usage:
 *   node scripts/optimize-existing-media.js            # DRY RUN (no writes)
 *   node scripts/optimize-existing-media.js --apply    # actually overwrite + update DB
 *
 * Requires: BLOB_READ_WRITE_TOKEN and DATABASE_URL (read from .env.production).
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env.production') });
const { put } = require('@vercel/blob');
const { Client } = require('pg');
const sharp = require('sharp');

const APPLY = process.argv.includes('--apply');
const MAX_DIMENSION = parseInt(process.env.IMAGE_MAX_DIMENSION || '2000', 10);
const WEBP_QUALITY = parseInt(process.env.IMAGE_WEBP_QUALITY || '80', 10);

const kb = (bytes) => `${(bytes / 1024).toFixed(0)}KB`;

async function optimize(buffer) {
  const { data, info } = await sharp(buffer, { failOn: 'none' })
    .rotate()
    .resize(MAX_DIMENSION, MAX_DIMENSION, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: WEBP_QUALITY })
    .toBuffer({ resolveWithObject: true });
  return { data, width: info.width, height: info.height };
}

async function main() {
  console.log(`=== Optimize Existing Media (${APPLY ? 'APPLY' : 'DRY RUN'}) ===\n`);

  if (APPLY && !process.env.BLOB_READ_WRITE_TOKEN) {
    console.error('ERROR: BLOB_READ_WRITE_TOKEN not set (required with --apply)');
    process.exit(1);
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  console.log('Connected to database\n');

  // Only blob-hosted images. GIFs are left untouched to preserve animation.
  const { rows } = await client.query(`
    SELECT id, filename, url, file_path, size_bytes, mime_type
    FROM media
    WHERE deleted_at IS NULL
      AND url LIKE 'https://%blob.vercel-storage.com/%'
      AND mime_type <> 'image/gif'
    ORDER BY size_bytes DESC NULLS LAST
  `);

  console.log(`Found ${rows.length} blob-hosted images to check\n`);

  let optimized = 0;
  let skipped = 0;
  let failed = 0;
  let bytesBefore = 0;
  let bytesAfter = 0;

  for (const row of rows) {
    try {
      const res = await fetch(row.url);
      if (!res.ok) throw new Error(`download HTTP ${res.status}`);
      const original = Buffer.from(await res.arrayBuffer());

      const { data, width, height } = await optimize(original);

      // Only rewrite when we actually save space (keeps the run idempotent).
      if (data.length >= original.length) {
        console.log(`  SKIP (already small): ${row.filename} ${kb(original.length)}`);
        skipped++;
        continue;
      }

      bytesBefore += original.length;
      bytesAfter += data.length;
      optimized++;

      console.log(
        `  ${APPLY ? 'OPTIMIZED' : 'WOULD OPTIMIZE'}: ${row.filename} ` +
          `${kb(original.length)} ${row.mime_type} -> ${kb(data.length)} image/webp (${width}x${height})`
      );

      if (APPLY) {
        // Same pathname + addRandomSuffix:false => identical public URL.
        await put(row.file_path, data, {
          access: 'public',
          contentType: 'image/webp',
          addRandomSuffix: false,
          allowOverwrite: true,
        });
        await client.query(
          'UPDATE media SET size_bytes = $1, mime_type = $2 WHERE id = $3',
          [data.length, 'image/webp', row.id]
        );
      }
    } catch (err) {
      console.log(`  FAIL: ${row.filename} - ${err.message}`);
      failed++;
    }
  }

  const saved = bytesBefore - bytesAfter;
  console.log(
    `\nDone. ${optimized} ${APPLY ? 'optimized' : 'to optimize'}, ${skipped} skipped, ${failed} failed.`
  );
  if (optimized > 0) {
    console.log(
      `Total: ${kb(bytesBefore)} -> ${kb(bytesAfter)} ` +
        `(saved ${kb(saved)}, ${((saved / bytesBefore) * 100).toFixed(0)}%)`
    );
  }
  if (!APPLY && optimized > 0) {
    console.log('\nThis was a DRY RUN. Re-run with --apply to write the changes.');
  }

  await client.end();
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
