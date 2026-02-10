#!/usr/bin/env node

/**
 * Script to fix article gallery images by re-scraping from the source website
 * Updates the meta_data.images array for each article
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
    lowerUrl.includes('e1655889919253')
  );
}

// Fetch a URL with timeout
function fetchUrl(url, timeout = 25000) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;

    const req = protocol.get(url, { timeout }, (res) => {
      let data = '';

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

// Extract ALL images from an article page
function extractAllImages(html) {
  const images = [];
  const seenUrls = new Set();

  // Find all wp-content/uploads images
  const imageRegex = /https?:\/\/www\.getfund\.gov\.gh\/wp-content\/uploads\/[^"'\s<>)]+\.(?:jpg|jpeg|png|gif|webp)/gi;
  const matches = html.match(imageRegex) || [];

  for (const img of matches) {
    // Normalize URL (remove query strings, get best quality version)
    let cleanUrl = img.split('?')[0];

    // Skip logos and placeholders
    if (isLogoOrPlaceholder(cleanUrl)) continue;

    // Skip if already seen
    if (seenUrls.has(cleanUrl)) continue;
    seenUrls.add(cleanUrl);

    // Skip thumbnails if we have the full version
    const withoutSize = cleanUrl.replace(/-\d+x\d+(\.[a-z]+)$/i, '$1');
    if (withoutSize !== cleanUrl && seenUrls.has(withoutSize)) continue;

    images.push(cleanUrl);
  }

  return images;
}

// Normalize title for matching
function normalizeTitle(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/^[\s\u00A0]+/, '')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Find matching article URL
function findMatchingUrl(dbArticle) {
  const dbTitleNorm = normalizeTitle(dbArticle.title);
  const dbSlug = dbArticle.slug.toLowerCase();

  for (const article of articleUrls) {
    const urlTitleNorm = normalizeTitle(article.title);

    if (dbTitleNorm === urlTitleNorm ||
        dbTitleNorm.includes(urlTitleNorm) ||
        urlTitleNorm.includes(dbTitleNorm)) {
      return article.url;
    }

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
  console.log('Fixing article gallery images...\n');

  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL environment variable is not set!');
    process.exit(1);
  }

  // Get all articles
  const articles = await sql`
    SELECT id, title, slug, meta_data
    FROM content
    WHERE type = 'news' AND deleted_at IS NULL
    ORDER BY published_at DESC NULLS LAST
  `;

  console.log(`Total articles: ${articles.length}\n`);

  let updatedCount = 0;
  let matchedCount = 0;

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
      const images = extractAllImages(html);

      console.log(`    Found ${images.length} images`);

      if (images.length > 0) {
        // Update meta_data with new images
        const currentMetaData = article.meta_data || {};
        const newMetaData = {
          ...currentMetaData,
          images: images,
          sourceUrl: sourceUrl
        };

        await sql`
          UPDATE content
          SET meta_data = ${JSON.stringify(newMetaData)}::jsonb
          WHERE id = ${article.id}
        `;

        updatedCount++;
        console.log(`    ✓ Updated with ${images.length} images`);

        // Show first 3 images
        for (let i = 0; i < Math.min(3, images.length); i++) {
          console.log(`      ${i + 1}. ${images[i].substring(images[i].lastIndexOf('/') + 1)}`);
        }
        if (images.length > 3) {
          console.log(`      ... and ${images.length - 3} more`);
        }
      }
    } catch (err) {
      console.log(`    ✗ Error: ${err.message}`);
    }

    // Delay to avoid overwhelming the server
    await new Promise(r => setTimeout(r, 1000));
  }

  console.log('\n\n=== SUMMARY ===');
  console.log(`Articles matched: ${matchedCount}`);
  console.log(`Articles updated: ${updatedCount}`);
  console.log('\nDone!');
}

main();
