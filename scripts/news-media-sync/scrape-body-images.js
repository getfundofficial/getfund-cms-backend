/**
 * Phase 1: Scrape all body images from source articles.
 * For each article, fetches the getfund.gov.gh page and extracts
 * every image in the article body. Downloads ALL images locally
 * and updates the body HTML to include <img> tags.
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const { Client } = require('pg');
const path = require('path');
const fs = require('fs');
const { fetchWithRetry, downloadImage, extractAllBodyImages, NEWS_IMAGES_DIR } = require('./utils');
const { extractArticleContent } = require('../scrape-exact-content');

// Merged URL mappings from scrape-exact-content.js and article-url-mapping.js
const { findUrlForArticle } = require('../article-url-mapping');
const SLUG_TO_URL = require('../scrape-exact-content').SLUG_TO_URL || {};

function findSourceUrl(article) {
  if (SLUG_TO_URL[article.slug]) return SLUG_TO_URL[article.slug];
  const mapped = findUrlForArticle(article);
  if (mapped) return mapped;
  return null;
}

function sanitizeCarouselFilename(slug, originalUrl, index) {
  const ext = path.extname(new URL(originalUrl).pathname).toLowerCase() || '.jpg';
  return `${slug}-carousel-${index + 1}${ext}`;
}

/**
 * Delete carousel files under non-canonical slug variants (orphans from previous runs).
 */
function cleanupOrphanCarouselFiles(canonicalSlugs) {
  const allFiles = fs.readdirSync(NEWS_IMAGES_DIR).filter(f => /-carousel-\d+\./.test(f));
  const slugSet = new Set(canonicalSlugs);
  let deleted = 0;

  for (const f of allFiles) {
    const match = f.match(/^(.+)-carousel-\d+\.\w+$/);
    if (match && !slugSet.has(match[1])) {
      fs.unlinkSync(path.join(NEWS_IMAGES_DIR, f));
      deleted++;
    }
  }

  if (deleted > 0) {
    console.log(`Cleaned up ${deleted} orphan carousel files from non-canonical slugs.\n`);
  }
}

async function scrapeBodyImages(client) {
  console.log('=== PHASE 1: Scraping body images from source articles ===\n');

  const result = await client.query(`
    SELECT id, slug, title, featured_image_url, meta_data, body
    FROM content
    WHERE type = 'news' AND status = 'published' AND deleted_at IS NULL
    ORDER BY published_at DESC
  `);
  console.log(`Found ${result.rows.length} published articles.\n`);

  // Clean up orphan carousel files from previous runs with variant slugs
  const canonicalSlugs = result.rows.map(r => r.slug);
  cleanupOrphanCarouselFiles(canonicalSlugs);

  const keepAlive = setInterval(async () => {
    try { await client.query('SELECT 1'); } catch {}
  }, 30000);

  let scraped = 0, downloaded = 0, failed = 0, skipped = 0, bodyUpdated = 0;
  const articlesWithImages = [];

  for (const article of result.rows) {
    const sourceUrl = findSourceUrl(article);
    if (!sourceUrl) {
      skipped++;
      continue;
    }

    console.log(`[${scraped + skipped + 1}/${result.rows.length}] ${article.slug}`);

    try {
      const html = await fetchWithRetry(sourceUrl);
      const bodyImages = extractAllBodyImages(html);

      // Update body HTML to include <img> tags if current body has none
      const bodyHasImages = article.body && /<img\s/i.test(article.body);
      if (!bodyHasImages) {
        const contentWithImages = extractArticleContent(html);
        if (contentWithImages && /<img\s/i.test(contentWithImages)) {
          await client.query('UPDATE content SET body = $1 WHERE id = $2', [contentWithImages, article.id]);
          bodyUpdated++;
          console.log(`  BODY UPDATED with ${(contentWithImages.match(/<img\s/gi) || []).length} image(s)`);
        }
      }

      console.log(`  Found ${bodyImages.length} image(s) in source`);

      // Delete existing carousel files for this article (extraction logic changed, indices may differ)
      const existingFiles = fs.readdirSync(NEWS_IMAGES_DIR)
        .filter(f => f.startsWith(`${article.slug}-carousel-`));
      if (existingFiles.length > 0) {
        for (const f of existingFiles) {
          fs.unlinkSync(path.join(NEWS_IMAGES_DIR, f));
        }
        console.log(`  Cleared ${existingFiles.length} old carousel file(s)`);
      }

      // Download ALL images
      const localPaths = [];
      for (let i = 0; i < bodyImages.length; i++) {
        const imgUrl = bodyImages[i];
        const filename = sanitizeCarouselFilename(article.slug, imgUrl, i);
        const destPath = path.join(NEWS_IMAGES_DIR, filename);
        const localPath = `/images/news/${filename}`;

        try {
          await downloadImage(imgUrl, destPath);
          localPaths.push(localPath);
          downloaded++;
          console.log(`  DOWNLOADED: ${filename}`);
        } catch (err) {
          console.log(`  FAILED: ${filename} - ${err.message}`);
          failed++;
        }
      }

      articlesWithImages.push({
        id: article.id,
        slug: article.slug,
        title: article.title,
        images: localPaths,
        sourceImages: bodyImages,
      });

      scraped++;
      await new Promise(r => setTimeout(r, 1000));
    } catch (err) {
      console.log(`  ERROR: ${err.message}`);
      failed++;
    }
  }

  clearInterval(keepAlive);

  console.log(`\n--- Phase 1 Summary ---`);
  console.log(`Scraped: ${scraped}, Downloaded: ${downloaded}`);
  console.log(`Failed: ${failed}, Skipped: ${skipped}`);
  console.log(`Body HTML updated: ${bodyUpdated}`);
  console.log(`Articles with images: ${articlesWithImages.length}\n`);

  return articlesWithImages;
}

module.exports = { scrapeBodyImages, findSourceUrl };

if (require.main === module) {
  (async () => {
    const client = new Client({
      connectionString: process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });
    await client.connect();
    await scrapeBodyImages(client);
    await client.end();
  })().catch(err => { console.error(err); process.exit(1); });
}
