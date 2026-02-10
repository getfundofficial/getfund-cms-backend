#!/usr/bin/env node

/**
 * Script to fix article images by re-scraping from the source website
 * This ensures each article has the correct featured image from getfund.gov.gh
 */

require('dotenv').config({ path: '.env' });
const { neon } = require('@neondatabase/serverless');
const https = require('https');
const http = require('http');

const sql = neon(process.env.DATABASE_URL);

// Helper to check if an image URL is a logo/placeholder
function isLogoOrPlaceholder(url) {
  if (!url) return true;
  const lowerUrl = url.toLowerCase();
  return (
    lowerUrl.includes('logo-light') ||
    lowerUrl.includes('logo-dark') ||
    lowerUrl.includes('logo.png') ||
    lowerUrl.includes('site-icon') ||
    lowerUrl.includes('getfund-site-icon') ||
    lowerUrl.includes('getfund-cropped') ||
    lowerUrl.includes('cropped-getfund') ||
    lowerUrl.includes('placeholder') ||
    lowerUrl.includes('favicon') ||
    lowerUrl.includes('icon.png')
  );
}

// Fetch a URL with timeout
function fetchUrl(url, timeout = 15000) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;

    const req = protocol.get(url, { timeout }, (res) => {
      let data = '';

      // Handle redirects
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchUrl(res.headers.location, timeout).then(resolve).catch(reject);
      }

      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }

      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.on('error', reject);
  });
}

// Extract the first valid image from an article page
function extractFeaturedImage(html, articleUrl) {
  const images = [];

  // Look for images in the article content
  // Common patterns on WordPress sites like getfund.gov.gh

  // 1. Look for wp-content/uploads images
  const wpImageRegex = /https?:\/\/www\.getfund\.gov\.gh\/wp-content\/uploads\/[^"'\s<>)]+\.(?:jpg|jpeg|png|gif|webp)/gi;
  const wpMatches = html.match(wpImageRegex) || [];

  for (const img of wpMatches) {
    if (!isLogoOrPlaceholder(img)) {
      images.push(img);
    }
  }

  // 2. Look for featured image in meta tags
  const ogImageMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i);
  if (ogImageMatch && ogImageMatch[1] && !isLogoOrPlaceholder(ogImageMatch[1])) {
    images.unshift(ogImageMatch[1]); // Prefer og:image
  }

  // 3. Look for featured image class
  const featuredMatch = html.match(/<img[^>]+class=["'][^"']*(?:wp-post-image|featured|entry-image)[^"']*["'][^>]+src=["']([^"']+)["']/i);
  if (featuredMatch && featuredMatch[1] && !isLogoOrPlaceholder(featuredMatch[1])) {
    images.unshift(featuredMatch[1]);
  }

  // Return the first valid image or null
  return images.length > 0 ? images[0] : null;
}

async function fixArticleImages() {
  console.log('\n=== FIXING ARTICLE IMAGES FROM SOURCE ===\n');

  // Get all articles with their source URLs
  const articles = await sql`
    SELECT id, title, slug, featured_image_url, meta_data
    FROM content
    WHERE type = 'news'
      AND deleted_at IS NULL
    ORDER BY published_at DESC NULLS LAST
  `;

  console.log(`Found ${articles.length} articles to check.`);

  let fixedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  for (const article of articles) {
    // Try to construct the source URL from meta_data or slug
    let sourceUrl = null;

    if (article.meta_data && article.meta_data.sourceUrl) {
      sourceUrl = article.meta_data.sourceUrl;
    }

    if (!sourceUrl) {
      // Skip if we don't have a source URL
      skippedCount++;
      continue;
    }

    // Check if current image is valid
    if (article.featured_image_url && !isLogoOrPlaceholder(article.featured_image_url)) {
      // Already has a valid image
      continue;
    }

    console.log(`\nProcessing: ${article.title.substring(0, 50)}...`);
    console.log(`  Source: ${sourceUrl}`);

    try {
      const html = await fetchUrl(sourceUrl);
      const newImage = extractFeaturedImage(html, sourceUrl);

      if (newImage && !isLogoOrPlaceholder(newImage)) {
        console.log(`  Old: ${article.featured_image_url || 'null'}`);
        console.log(`  New: ${newImage}`);

        await sql`
          UPDATE content
          SET featured_image_url = ${newImage}
          WHERE id = ${article.id}
        `;

        fixedCount++;
      } else {
        console.log(`  No valid image found in source page`);
        skippedCount++;
      }
    } catch (err) {
      console.log(`  Error: ${err.message}`);
      errorCount++;
    }

    // Small delay to avoid overwhelming the server
    await new Promise(r => setTimeout(r, 500));
  }

  console.log('\n=== SUMMARY ===');
  console.log(`Fixed: ${fixedCount}`);
  console.log(`Skipped: ${skippedCount}`);
  console.log(`Errors: ${errorCount}`);
}

// Also update images from meta_data.images (first image)
async function updateFromMetaData() {
  console.log('\n=== UPDATING FROM META_DATA ===\n');

  const articles = await sql`
    SELECT id, title, featured_image_url, meta_data
    FROM content
    WHERE type = 'news'
      AND deleted_at IS NULL
      AND meta_data IS NOT NULL
      AND meta_data::text LIKE '%images%'
  `;

  console.log(`Found ${articles.length} articles with meta_data images.`);

  let fixedCount = 0;

  for (const article of articles) {
    // Check if current image is invalid
    if (isLogoOrPlaceholder(article.featured_image_url)) {
      // Try to get the first valid image from meta_data
      if (article.meta_data && article.meta_data.images && article.meta_data.images.length > 0) {
        for (const img of article.meta_data.images) {
          const imgUrl = typeof img === 'string' ? img : img.url;
          if (imgUrl && !isLogoOrPlaceholder(imgUrl)) {
            console.log(`Fixing: ${article.title.substring(0, 50)}...`);
            console.log(`  Old: ${article.featured_image_url || 'null'}`);
            console.log(`  New: ${imgUrl}`);

            await sql`
              UPDATE content
              SET featured_image_url = ${imgUrl}
              WHERE id = ${article.id}
            `;

            fixedCount++;
            break;
          }
        }
      }
    }
  }

  console.log(`\nFixed ${fixedCount} articles from meta_data.`);
  return fixedCount;
}

async function main() {
  console.log('Starting article image fix...\n');

  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL environment variable is not set!');
    process.exit(1);
  }

  try {
    // First try to update from meta_data (faster)
    await updateFromMetaData();

    // Then try to scrape from source URLs if needed
    await fixArticleImages();

    console.log('\nDone!');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
