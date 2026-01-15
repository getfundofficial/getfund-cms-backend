/**
 * Script to download news images locally for faster loading
 * Run with: node scripts/download-news-images.js
 */

const { Pool } = require('pg');
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Target directory for news images
const NEWS_IMAGES_DIR = path.join(__dirname, '../../getfund-website/public/images/news');

// Ensure the directory exists
if (!fs.existsSync(NEWS_IMAGES_DIR)) {
  fs.mkdirSync(NEWS_IMAGES_DIR, { recursive: true });
}

/**
 * Download an image from URL and save locally
 */
async function downloadImage(url, filename) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;

    const request = protocol.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    }, (response) => {
      // Handle redirects
      if (response.statusCode === 301 || response.statusCode === 302) {
        const redirectUrl = response.headers.location;
        console.log(`  Redirecting to: ${redirectUrl}`);
        downloadImage(redirectUrl, filename).then(resolve).catch(reject);
        return;
      }

      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: ${response.statusCode}`));
        return;
      }

      const filePath = path.join(NEWS_IMAGES_DIR, filename);
      const fileStream = fs.createWriteStream(filePath);

      response.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close();
        resolve(filePath);
      });

      fileStream.on('error', (err) => {
        fs.unlink(filePath, () => {}); // Delete partial file
        reject(err);
      });
    });

    request.on('error', reject);
    request.setTimeout(30000, () => {
      request.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

/**
 * Generate a safe filename from a URL or title
 */
function generateFilename(url, title, id) {
  // Try to get extension from URL
  const urlPath = new URL(url).pathname;
  const ext = path.extname(urlPath) || '.jpg';

  // Create slug from title
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 50);

  return `${slug}-${id}${ext}`;
}

async function main() {
  console.log('📸 Downloading news images locally...\n');

  try {
    // Get all news articles with external images
    const result = await pool.query(`
      SELECT id, title, featured_image_url
      FROM content
      WHERE type = 'news'
        AND status = 'published'
        AND featured_image_url IS NOT NULL
        AND featured_image_url != ''
        AND featured_image_url NOT LIKE '/images/%'
      ORDER BY published_at DESC
    `);

    console.log(`Found ${result.rows.length} articles with external images\n`);

    let successCount = 0;
    let failCount = 0;

    for (const row of result.rows) {
      const { id, title, featured_image_url } = row;

      // Skip if already a local path
      if (featured_image_url.startsWith('/images/')) {
        console.log(`✓ ${title.substring(0, 40)}... - Already local`);
        continue;
      }

      console.log(`Downloading: ${title.substring(0, 40)}...`);
      console.log(`  URL: ${featured_image_url}`);

      try {
        const filename = generateFilename(featured_image_url, title, id);
        const localPath = `/images/news/${filename}`;

        await downloadImage(featured_image_url, filename);

        // Update database with local path
        await pool.query(
          'UPDATE content SET featured_image_url = $1 WHERE id = $2',
          [localPath, id]
        );

        console.log(`  ✓ Saved as: ${localPath}\n`);
        successCount++;
      } catch (error) {
        console.log(`  ✗ Failed: ${error.message}\n`);
        failCount++;
      }
    }

    console.log('\n========================================');
    console.log(`✓ Successfully downloaded: ${successCount}`);
    console.log(`✗ Failed: ${failCount}`);
    console.log('========================================\n');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

main();
