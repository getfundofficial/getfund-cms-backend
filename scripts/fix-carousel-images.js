/**
 * Fix carousel images for news articles:
 * 1. Download all external getfund.gov.gh carousel images locally
 * 2. Remove placeholder/icon images from carousel arrays
 * 3. Update database with local paths
 */

require('dotenv').config();
const { Client } = require('pg');
const https = require('https');
const http = require('http');
const path = require('path');
const fs = require('fs');

const NEWS_IMAGES_DIR = path.resolve(__dirname, '../../../getfund-website/public/images/news');
const FRONTEND_URL = process.env.NEXT_PUBLIC_WEBSITE_URL || 'https://getfund-website-hq.vercel.app';

// Placeholder image patterns to exclude from carousels
const PLACEHOLDER_PATTERNS = [
  'cropped-getfund',
  'site-icon',
  'dept.png',
  'cj.png',
  'img_1149',
  'grp-pix',
  'logo-light',
  'logo-dark',
  'favicon',
  'getfund-cropped',
];

function isPlaceholder(url) {
  const lower = url.toLowerCase();
  return PLACEHOLDER_PATTERNS.some(p => lower.includes(p));
}

function downloadImage(url, destPath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const req = protocol.get(url, { timeout: 15000, headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'image/*,*/*',
      'Referer': 'https://www.getfund.gov.gh/',
    }}, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        const redirectUrl = res.headers.location;
        if (redirectUrl) {
          downloadImage(redirectUrl, destPath).then(resolve).catch(reject);
          return;
        }
      }

      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        return;
      }

      const fileStream = fs.createWriteStream(destPath);
      res.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close();
        const stats = fs.statSync(destPath);
        if (stats.size < 100) {
          fs.unlinkSync(destPath);
          reject(new Error(`Downloaded file too small (${stats.size} bytes): ${url}`));
        } else {
          resolve(stats.size);
        }
      });
      fileStream.on('error', (err) => {
        fs.unlinkSync(destPath);
        reject(err);
      });
    });

    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error(`Timeout: ${url}`)); });
  });
}

function sanitizeFilename(slug, originalUrl, index) {
  const ext = path.extname(new URL(originalUrl).pathname).toLowerCase() || '.jpg';
  return `${slug}-carousel-${index + 1}${ext}`;
}

async function main() {
  console.log(`News images dir: ${NEWS_IMAGES_DIR}`);

  if (!fs.existsSync(NEWS_IMAGES_DIR)) {
    console.error('News images directory not found!');
    process.exit(1);
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  console.log('Connected to database.\n');

  // Get all articles with carousel images
  const result = await client.query(`
    SELECT id, slug, title, featured_image_url,
           meta_data->'images' as images,
           meta_data
    FROM content
    WHERE type = 'news' AND status = 'published' AND deleted_at IS NULL
    AND meta_data->'images' IS NOT NULL
    AND jsonb_array_length(COALESCE(meta_data->'images', '[]'::jsonb)) > 0
    ORDER BY published_at DESC
  `);

  console.log(`Found ${result.rows.length} articles with carousel images.\n`);

  let downloadedCount = 0;
  let skippedCount = 0;
  let removedPlaceholders = 0;
  let failedCount = 0;
  let updatedArticles = 0;

  for (const article of result.rows) {
    const images = article.images || [];
    if (images.length === 0) continue;

    console.log(`\n=== ${article.slug} (${images.length} images) ===`);

    const newImages = [];
    let carouselIndex = 0;

    for (const imageUrl of images) {
      // Skip placeholders
      if (isPlaceholder(imageUrl)) {
        console.log(`  REMOVE (placeholder): ${path.basename(imageUrl)}`);
        removedPlaceholders++;
        continue;
      }

      // Already a local path - keep it
      if (imageUrl.startsWith('/images/news/')) {
        // Check if it matches the featured image path pattern
        const localFile = path.join(NEWS_IMAGES_DIR, path.basename(imageUrl));
        if (fs.existsSync(localFile)) {
          newImages.push(imageUrl);
          console.log(`  OK (local): ${path.basename(imageUrl)}`);
        } else {
          console.log(`  SKIP (missing local): ${imageUrl}`);
        }
        continue;
      }

      // Already a full frontend URL - convert to relative
      if (imageUrl.includes('getfund-website-hq.vercel.app')) {
        const relativePath = imageUrl.replace(FRONTEND_URL, '');
        newImages.push(relativePath);
        console.log(`  OK (frontend URL): ${path.basename(imageUrl)}`);
        continue;
      }

      // External URL - download it
      if (imageUrl.startsWith('http')) {
        const filename = sanitizeFilename(article.slug, imageUrl, carouselIndex);
        const destPath = path.join(NEWS_IMAGES_DIR, filename);
        carouselIndex++;

        // Check if already downloaded
        if (fs.existsSync(destPath)) {
          const localPath = `/images/news/${filename}`;
          newImages.push(localPath);
          console.log(`  EXISTS: ${filename}`);
          skippedCount++;
          continue;
        }

        try {
          const size = await downloadImage(imageUrl, destPath);
          const localPath = `/images/news/${filename}`;
          newImages.push(localPath);
          downloadedCount++;
          console.log(`  DOWNLOADED: ${filename} (${(size / 1024).toFixed(0)} KB)`);
        } catch (err) {
          console.log(`  FAILED: ${imageUrl} - ${err.message}`);
          failedCount++;
        }
      }
    }

    // Update database if images changed
    const imagesChanged = JSON.stringify(newImages) !== JSON.stringify(images);
    if (imagesChanged && newImages.length > 0) {
      const updatedMeta = { ...(article.meta_data || {}), images: newImages };
      await client.query(
        'UPDATE content SET meta_data = $1 WHERE id = $2',
        [JSON.stringify(updatedMeta), article.id]
      );
      updatedArticles++;
      console.log(`  UPDATED DB: ${newImages.length} images`);
    } else if (newImages.length === 0) {
      // Remove empty images array
      const updatedMeta = { ...(article.meta_data || {}) };
      delete updatedMeta.images;
      await client.query(
        'UPDATE content SET meta_data = $1 WHERE id = $2',
        [JSON.stringify(updatedMeta), article.id]
      );
      updatedArticles++;
      console.log(`  UPDATED DB: removed empty images array`);
    }
  }

  console.log('\n=== SUMMARY ===');
  console.log(`  Images downloaded: ${downloadedCount}`);
  console.log(`  Already existed: ${skippedCount}`);
  console.log(`  Placeholders removed: ${removedPlaceholders}`);
  console.log(`  Failed downloads: ${failedCount}`);
  console.log(`  Articles updated in DB: ${updatedArticles}`);

  await client.end();
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
