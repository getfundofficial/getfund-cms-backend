#!/usr/bin/env node

/**
 * Script to re-scrape and fix article images from the source website
 * Matches articles by title/slug and updates with correct featured images
 */

require('dotenv').config({ path: '.env' });
const { neon } = require('@neondatabase/serverless');
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const sql = neon(process.env.DATABASE_URL);

// Load article URLs
const articleUrls = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'article-urls.json'), 'utf8')
).articles;

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
    lowerUrl.includes('icon.png') ||
    lowerUrl.includes('e1655889919253') // Common logo pattern
  );
}

// Fetch a URL with timeout
function fetchUrl(url, timeout = 20000) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;

    const req = protocol.get(url, { timeout }, (res) => {
      let data = '';

      // Handle redirects
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        let redirectUrl = res.headers.location;
        if (!redirectUrl.startsWith('http')) {
          const urlObj = new URL(url);
          redirectUrl = `${urlObj.protocol}//${urlObj.host}${redirectUrl}`;
        }
        return fetchUrl(redirectUrl, timeout).then(resolve).catch(reject);
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

// Extract the featured image from an article page
function extractFeaturedImage(html) {
  // 1. Look for og:image meta tag (most reliable for featured image)
  const ogImageMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i)
    || html.match(/<meta\s+content=["']([^"']+)["']\s+property=["']og:image["']/i);

  if (ogImageMatch && ogImageMatch[1] && !isLogoOrPlaceholder(ogImageMatch[1])) {
    return ogImageMatch[1];
  }

  // 2. Look for twitter:image
  const twitterImageMatch = html.match(/<meta\s+name=["']twitter:image["']\s+content=["']([^"']+)["']/i)
    || html.match(/<meta\s+content=["']([^"']+)["']\s+name=["']twitter:image["']/i);

  if (twitterImageMatch && twitterImageMatch[1] && !isLogoOrPlaceholder(twitterImageMatch[1])) {
    return twitterImageMatch[1];
  }

  // 3. Look for wp-post-image class (WordPress featured image)
  const wpImageMatch = html.match(/<img[^>]+class=["'][^"']*wp-post-image[^"']*["'][^>]+src=["']([^"']+)["']/i)
    || html.match(/<img[^>]+src=["']([^"']+)["'][^>]+class=["'][^"']*wp-post-image[^"']*["']/i);

  if (wpImageMatch && wpImageMatch[1] && !isLogoOrPlaceholder(wpImageMatch[1])) {
    return wpImageMatch[1];
  }

  // 4. Look for featured-image container
  const featuredContainerMatch = html.match(/<div[^>]+class=["'][^"']*(?:featured-image|post-thumbnail|entry-image)[^"']*["'][^>]*>[\s\S]*?<img[^>]+src=["']([^"']+)["']/i);

  if (featuredContainerMatch && featuredContainerMatch[1] && !isLogoOrPlaceholder(featuredContainerMatch[1])) {
    return featuredContainerMatch[1];
  }

  // 5. Look for first image in article content
  const articleContentMatch = html.match(/<(?:article|div[^>]+class=["'][^"']*(?:entry-content|post-content|article-content)[^"']*["'])[^>]*>[\s\S]*?<img[^>]+src=["']([^"']+)["']/i);

  if (articleContentMatch && articleContentMatch[1] && !isLogoOrPlaceholder(articleContentMatch[1])) {
    return articleContentMatch[1];
  }

  // 6. Get first wp-content/uploads image that's not a logo
  const allImages = html.match(/https?:\/\/www\.getfund\.gov\.gh\/wp-content\/uploads\/[^"'\s<>)]+\.(?:jpg|jpeg|png|gif|webp)/gi) || [];

  for (const img of allImages) {
    if (!isLogoOrPlaceholder(img)) {
      return img;
    }
  }

  return null;
}

// Normalize title for matching
function normalizeTitle(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Find matching article URL for a database article
function findMatchingUrl(dbArticle) {
  const dbTitleNorm = normalizeTitle(dbArticle.title);
  const dbSlug = dbArticle.slug.toLowerCase();

  for (const article of articleUrls) {
    const urlTitleNorm = normalizeTitle(article.title);

    // Try title match
    if (dbTitleNorm === urlTitleNorm ||
        dbTitleNorm.includes(urlTitleNorm) ||
        urlTitleNorm.includes(dbTitleNorm)) {
      return article.url;
    }

    // Try slug match
    const urlSlug = article.url.split('/').filter(Boolean).pop() || '';
    if (dbSlug === urlSlug ||
        dbSlug.includes(urlSlug) ||
        urlSlug.includes(dbSlug)) {
      return article.url;
    }
  }

  return null;
}

async function main() {
  console.log('Re-scraping article images from source...\n');

  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL environment variable is not set!');
    process.exit(1);
  }

  // Get all articles
  const articles = await sql`
    SELECT id, title, slug, featured_image_url
    FROM content
    WHERE type = 'news'
      AND deleted_at IS NULL
    ORDER BY published_at DESC NULLS LAST
  `;

  console.log(`Found ${articles.length} articles in database.`);
  console.log(`Found ${articleUrls.length} source URLs.\n`);

  let fixedCount = 0;
  let matchedCount = 0;
  let errorCount = 0;

  for (const article of articles) {
    const sourceUrl = findMatchingUrl(article);

    if (!sourceUrl) {
      continue;
    }

    matchedCount++;
    console.log(`\n[${matchedCount}] ${article.title.substring(0, 50)}...`);
    console.log(`    Source: ${sourceUrl}`);

    try {
      const html = await fetchUrl(sourceUrl);
      const newImage = extractFeaturedImage(html);

      if (newImage) {
        // Check if different from current
        if (article.featured_image_url !== newImage) {
          console.log(`    Current: ${article.featured_image_url || 'null'}`);
          console.log(`    New:     ${newImage}`);

          await sql`
            UPDATE content
            SET featured_image_url = ${newImage}
            WHERE id = ${article.id}
          `;

          fixedCount++;
          console.log(`    ✓ Updated!`);
        } else {
          console.log(`    ✓ Already correct`);
        }
      } else {
        console.log(`    ✗ No valid image found`);
      }
    } catch (err) {
      console.log(`    ✗ Error: ${err.message}`);
      errorCount++;
    }

    // Small delay to avoid overwhelming the server
    await new Promise(r => setTimeout(r, 800));
  }

  console.log('\n\n=== SUMMARY ===');
  console.log(`Articles matched to URLs: ${matchedCount}`);
  console.log(`Images updated: ${fixedCount}`);
  console.log(`Errors: ${errorCount}`);
  console.log('\nDone!');
}

main();
