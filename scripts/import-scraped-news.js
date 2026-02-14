/**
 * Import scraped GETFund news into the CMS.
 *
 * Reads scraped-news-output.json, then for each article:
 *   1. Downloads all images locally to /images/news/
 *   2. Registers each image in the `media` table
 *   3. Inserts or updates the article in the `content` table
 *   4. Sets featured_image_url to the first real article image
 *   5. Stores gallery/carousel images in meta_data.images
 *
 * If BLOB_READ_WRITE_TOKEN is set, uploads to Vercel Blob instead.
 *
 * Run: node scripts/import-scraped-news.js
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { Client } = require('pg');
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

let put;
try { put = require('@vercel/blob').put; } catch { put = null; }

let sharp;
try { sharp = require('sharp'); } catch { sharp = null; }

// --- Config ---
const SCRAPED_FILE = path.join(__dirname, 'scraped-news-output.json');
const NEWS_IMAGES_DIR = path.resolve(__dirname, '../../../getfund-website/public/images/news');
const USE_BLOB = !!process.env.BLOB_READ_WRITE_TOKEN && put;
const DELAY_MS = 500;
const MAX_IMG_WIDTH = 1200;

// Patterns to skip (logos, icons, placeholders)
const SKIP_PATTERNS = [
  'getfund-logo', 'logo-light', 'logo-dark', 'site-icon',
  'favicon', 'e1655889919253', 'cropped-getfund',
];

// --- Helpers ---

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function downloadImage(url, destPath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const req = protocol.get(url, {
      timeout: 20000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        Accept: 'image/*,*/*',
        Referer: 'https://www.getfund.gov.gh/',
      },
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadImage(res.headers.location, destPath).then(resolve, reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode}`));
      }
      const stream = fs.createWriteStream(destPath);
      res.pipe(stream);
      stream.on('finish', () => {
        stream.close();
        const stats = fs.statSync(destPath);
        if (stats.size < 200) {
          fs.unlinkSync(destPath);
          reject(new Error(`Too small: ${stats.size}b`));
        } else {
          resolve(stats.size);
        }
      });
      stream.on('error', (err) => {
        try { fs.unlinkSync(destPath); } catch {}
        reject(err);
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

async function optimizeImage(filePath) {
  if (!sharp) return fs.readFileSync(filePath);
  try {
    const ext = path.extname(filePath).toLowerCase();
    let pipeline = sharp(fs.readFileSync(filePath))
      .resize({ width: MAX_IMG_WIDTH, withoutEnlargement: true });
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

function getMimeType(filename) {
  const ext = path.extname(filename).toLowerCase();
  const map = {
    '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
    '.png': 'image/png', '.gif': 'image/gif', '.webp': 'image/webp',
  };
  return map[ext] || 'image/jpeg';
}

function isSkippable(url) {
  if (!url) return true;
  const lower = url.toLowerCase();
  return SKIP_PATTERNS.some((p) => lower.includes(p));
}

function cleanTitle(title) {
  if (!title) return 'Untitled';
  return title
    .replace(/\s*[-–|]\s*Ghana Education Trust Fund$/i, '')
    .replace(/\s*[-–|]\s*GETFund$/i, '')
    .trim();
}

function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 120);
}

function cleanBody(body) {
  if (!body) return '';
  // Remove trailing HTML fragments
  let text = body.replace(/\r?\n<div class="[\s\S]*$/m, '');
  text = text.replace(/<div class="[\s\S]*$/m, '');
  // Remove leftover HTML tags except for basic formatting
  text = text.replace(/<(?!\/?(p|br|strong|em|b|i|h[1-6]|ul|ol|li|a|blockquote)\b)[^>]+>/gi, '');
  // Clean up whitespace
  text = text.replace(/\n{3,}/g, '\n\n').trim();
  return text;
}

function bodyToHtml(body) {
  if (!body) return '';
  const cleaned = cleanBody(body);
  // Wrap paragraphs in <p> tags if not already HTML
  if (!cleaned.includes('<p>')) {
    return cleaned
      .split(/\n\n+/)
      .filter((p) => p.trim())
      .map((p) => `<p>${p.trim()}</p>`)
      .join('\n');
  }
  return cleaned;
}

function safeFilename(url, slug, index) {
  const urlPath = new URL(url).pathname;
  const ext = path.extname(urlPath) || '.jpg';
  const basename = path.basename(urlPath, ext)
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .substring(0, 50);

  if (index === 0) {
    return `${slug.substring(0, 50)}-featured${ext}`;
  }
  return `${slug.substring(0, 40)}-${basename}${ext}`;
}

// --- Main logic ---

async function main() {
  console.log('=== GETFund News CMS Import ===\n');

  // Ensure images dir exists
  if (!fs.existsSync(NEWS_IMAGES_DIR)) {
    fs.mkdirSync(NEWS_IMAGES_DIR, { recursive: true });
  }

  // Load scraped data
  if (!fs.existsSync(SCRAPED_FILE)) {
    console.error(`Scraped file not found: ${SCRAPED_FILE}`);
    console.error('Run scrape-news-full.js first.');
    process.exit(1);
  }

  const raw = JSON.parse(fs.readFileSync(SCRAPED_FILE, 'utf-8'));
  console.log(`Loaded ${raw.length} raw articles from scraped data`);

  // Deduplicate: remove #respond/ and duplicate URLs
  const seen = new Set();
  const articles = [];
  for (const a of raw) {
    const cleanUrl = a.url.replace(/#.*\/$/, '/');
    if (seen.has(cleanUrl)) continue;
    seen.add(cleanUrl);
    if (a.error) continue;
    articles.push({ ...a, url: cleanUrl });
  }
  console.log(`After dedup: ${articles.length} unique articles\n`);

  // Connect to DB
  const client = new Client({
    connectionString: process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  console.log('Connected to database');
  console.log(`Image storage: ${USE_BLOB ? 'Vercel Blob' : 'Local filesystem'}\n`);

  // Get existing articles and media to avoid duplicates
  const existingContent = await client.query(
    "SELECT slug FROM content WHERE type = 'news'"
  );
  const existingSlugs = new Set(existingContent.rows.map((r) => r.slug));

  const existingMedia = await client.query(
    'SELECT filename, url FROM media WHERE deleted_at IS NULL'
  );
  const existingFilenames = new Set(existingMedia.rows.map((r) => r.filename));

  let stats = {
    articlesInserted: 0,
    articlesUpdated: 0,
    articlesSkipped: 0,
    imagesDownloaded: 0,
    imagesRegistered: 0,
    imagesSkipped: 0,
    imagesFailed: 0,
  };

  for (let i = 0; i < articles.length; i++) {
    const article = articles[i];
    const title = cleanTitle(article.title);
    const slug = generateSlug(title);
    const htmlBody = bodyToHtml(article.body);
    const excerpt = cleanBody(article.body).substring(0, 250).trim();
    const publishedAt = article.date || new Date().toISOString();

    console.log(`\n[${i + 1}/${articles.length}] ${title.substring(0, 60)}...`);

    // Filter out logos/icons from images
    const validImages = (article.images || []).filter(
      (img) => !isSkippable(img.url)
    );

    // --- Download & register images ---
    const imageUrls = []; // URLs to store in meta_data.images
    let featuredImageUrl = null;

    for (let j = 0; j < validImages.length; j++) {
      const img = validImages[j];
      const filename = safeFilename(img.url, slug, j);
      const mediaKey = `news/${filename}`;
      const localPath = `/images/news/${filename}`;
      const fullPath = path.join(NEWS_IMAGES_DIR, filename);

      // Skip if already in media library
      if (existingFilenames.has(mediaKey)) {
        const existing = existingMedia.rows.find((r) => r.filename === mediaKey);
        const url = existing ? existing.url : localPath;
        if (j === 0) featuredImageUrl = url;
        else imageUrls.push(url);
        stats.imagesSkipped++;
        continue;
      }

      // Download image
      try {
        if (!fs.existsSync(fullPath)) {
          await downloadImage(img.url, fullPath);
          stats.imagesDownloaded++;
        }

        let finalUrl = localPath;

        // Upload to Blob if configured
        if (USE_BLOB) {
          try {
            const optimized = await optimizeImage(fullPath);
            const blob = await put(`news-images/${filename}`, optimized, {
              access: 'public',
              contentType: getMimeType(filename),
            });
            finalUrl = blob.url;
            console.log(`  BLOB: ${filename}`);
          } catch (err) {
            console.log(`  BLOB fail, using local: ${err.message}`);
          }
        }

        // Register in media table
        const fileStats = fs.statSync(fullPath);
        const altText = title.substring(0, 200);

        await client.query(`
          INSERT INTO media (filename, original_name, mime_type, size_bytes, file_path, url, alt_text, created_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
          ON CONFLICT DO NOTHING
        `, [
          mediaKey,
          filename,
          getMimeType(filename),
          fileStats.size,
          localPath,
          finalUrl,
          altText,
        ]);
        existingFilenames.add(mediaKey);
        stats.imagesRegistered++;

        if (j === 0) featuredImageUrl = finalUrl;
        else imageUrls.push(finalUrl);

        console.log(`  IMG: ${filename} (${(fileStats.size / 1024).toFixed(0)}KB)`);
      } catch (err) {
        console.log(`  IMG FAIL: ${filename} - ${err.message}`);
        stats.imagesFailed++;
      }

      await sleep(DELAY_MS);
    }

    // If no featured image found, use placeholder
    if (!featuredImageUrl) {
      featuredImageUrl = '/images/news/news-placeholder.svg';
    }

    // --- Insert or update article ---
    const metaData = imageUrls.length > 0
      ? JSON.stringify({ images: imageUrls })
      : null;

    if (existingSlugs.has(slug)) {
      // Update existing article
      await client.query(`
        UPDATE content SET
          title = $1,
          body = $2,
          excerpt = $3,
          featured_image_url = $4,
          meta_data = COALESCE($5::jsonb, meta_data),
          published_at = $6,
          updated_at = NOW()
        WHERE slug = $7 AND type = 'news'
      `, [title, htmlBody, excerpt, featuredImageUrl, metaData, publishedAt, slug]);

      stats.articlesUpdated++;
      console.log(`  UPDATED in CMS`);
    } else {
      // Insert new article
      await client.query(`
        INSERT INTO content (
          type, title, slug, excerpt, body, status,
          featured_image_url, meta_data, author, category,
          published_at, created_at, updated_at
        ) VALUES (
          'news', $1, $2, $3, $4, 'published',
          $5, $6::jsonb, 'GETFund', 'NEWS',
          $7, NOW(), NOW()
        )
        ON CONFLICT (slug) DO UPDATE SET
          title = EXCLUDED.title,
          body = EXCLUDED.body,
          excerpt = EXCLUDED.excerpt,
          featured_image_url = EXCLUDED.featured_image_url,
          meta_data = COALESCE(EXCLUDED.meta_data, content.meta_data),
          published_at = EXCLUDED.published_at,
          updated_at = NOW()
      `, [title, slug, excerpt, htmlBody, featuredImageUrl, metaData, publishedAt]);

      existingSlugs.add(slug);
      stats.articlesInserted++;
      console.log(`  INSERTED into CMS`);
    }
  }

  // --- Summary ---
  console.log('\n========================================');
  console.log('  IMPORT COMPLETE');
  console.log('========================================');
  console.log(`  Articles inserted:  ${stats.articlesInserted}`);
  console.log(`  Articles updated:   ${stats.articlesUpdated}`);
  console.log(`  Articles skipped:   ${stats.articlesSkipped}`);
  console.log(`  Images downloaded:  ${stats.imagesDownloaded}`);
  console.log(`  Images registered:  ${stats.imagesRegistered}`);
  console.log(`  Images skipped:     ${stats.imagesSkipped}`);
  console.log(`  Images failed:      ${stats.imagesFailed}`);
  console.log('========================================\n');

  await client.end();
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
