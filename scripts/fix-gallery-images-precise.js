#!/usr/bin/env node

/**
 * Precise article gallery image extraction
 * Only extracts images from within the article content area, not from sidebars or related posts
 */

require('dotenv').config({ path: '.env' });
const { neon } = require('@neondatabase/serverless');
const https = require('https');
const fs = require('fs');
const path = require('path');

const sql = neon(process.env.DATABASE_URL);

// Load article URLs
const articleUrls = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'article-urls.json'), 'utf8')
).articles;

// Helper to check if an image URL is a logo/placeholder/sidebar element
function shouldExcludeImage(url) {
  if (!url) return true;
  const lowerUrl = url.toLowerCase();

  // Exclude logos and icons
  if (lowerUrl.includes('logo-light') ||
      lowerUrl.includes('logo-dark') ||
      lowerUrl.includes('logo.png') ||
      lowerUrl.includes('site-icon') ||
      lowerUrl.includes('getfund-site-icon') ||
      lowerUrl.includes('getfund-cropped') ||
      lowerUrl.includes('cropped-getfund') ||
      lowerUrl.includes('placeholder') ||
      lowerUrl.includes('favicon') ||
      lowerUrl.includes('icon.png') ||
      lowerUrl.includes('e1655889919253')) {
    return true;
  }

  // Exclude common sidebar/widget images
  if (lowerUrl.includes('dept-150x150') ||
      lowerUrl.includes('dept-170x170') ||
      lowerUrl.includes('widget') ||
      lowerUrl.includes('sidebar') ||
      lowerUrl.includes('avatar') ||
      lowerUrl.includes('author')) {
    return true;
  }

  // Exclude very small thumbnails (150x150, 170x170) which are usually sidebar items
  if (/-150x150\./.test(lowerUrl) || /-170x170\./.test(lowerUrl)) {
    return true;
  }

  return false;
}

// Fetch URL with timeout and retry
async function fetchUrl(url, timeout = 30000, retries = 2) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await new Promise((resolve, reject) => {
        const req = https.get(url, { timeout }, (res) => {
          if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
            let redirectUrl = res.headers.location;
            if (!redirectUrl.startsWith('http')) {
              const urlObj = new URL(url);
              redirectUrl = `${urlObj.protocol}//${urlObj.host}${redirectUrl}`;
            }
            fetchUrl(redirectUrl, timeout, 0).then(resolve).catch(reject);
            return;
          }

          if (res.statusCode !== 200) {
            reject(new Error(`HTTP ${res.statusCode}`));
            return;
          }

          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => resolve(data));
        });

        req.on('timeout', () => {
          req.destroy();
          reject(new Error('Timeout'));
        });
        req.on('error', reject);
      });
    } catch (err) {
      if (attempt === retries) throw err;
      await new Promise(r => setTimeout(r, 2000));
    }
  }
}

// Extract images ONLY from article content area
function extractArticleImages(html) {
  const images = [];
  const seenUrls = new Set();

  // First, try to find the article content section
  // Common WordPress content selectors
  let contentHtml = '';

  // Try to extract just the article content
  const contentPatterns = [
    // WordPress entry-content
    /<div[^>]+class="[^"]*entry-content[^"]*"[^>]*>([\s\S]*?)<\/div>\s*(?:<div[^>]+class="[^"]*(?:post-tags|sharedaddy|related|comments|sidebar)[^"]*"|<footer|<aside|$)/i,
    // Post content
    /<div[^>]+class="[^"]*post-content[^"]*"[^>]*>([\s\S]*?)<\/div>\s*(?:<div[^>]+class="[^"]*(?:related|sidebar|widget)[^"]*"|$)/i,
    // Article body
    /<article[^>]*>([\s\S]*?)<\/article>/i,
    // Main content
    /<main[^>]*>([\s\S]*?)<\/main>/i,
  ];

  for (const pattern of contentPatterns) {
    const match = html.match(pattern);
    if (match && match[1] && match[1].length > 500) {
      contentHtml = match[1];
      break;
    }
  }

  // If we couldn't isolate content, use the full page but be more strict
  if (!contentHtml) {
    contentHtml = html;
  }

  // Remove sidebar, widget, and related post sections from contentHtml
  contentHtml = contentHtml
    .replace(/<aside[\s\S]*?<\/aside>/gi, '')
    .replace(/<div[^>]+class="[^"]*(?:sidebar|widget|related-posts|recent-posts|popular-posts)[^"]*"[\s\S]*?<\/div>\s*<\/div>/gi, '')
    .replace(/<section[^>]+class="[^"]*(?:related|recent|popular)[^"]*"[\s\S]*?<\/section>/gi, '');

  // Extract og:image first (this is usually the featured image)
  const ogMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i) ||
                  html.match(/<meta\s+content=["']([^"']+)["']\s+property=["']og:image["']/i);

  if (ogMatch && ogMatch[1] && !shouldExcludeImage(ogMatch[1])) {
    const cleanUrl = ogMatch[1].split('?')[0];
    if (!seenUrls.has(cleanUrl)) {
      images.push(cleanUrl);
      seenUrls.add(cleanUrl);
    }
  }

  // Find images in the content
  // Look for img tags with src containing wp-content/uploads
  const imgTagRegex = /<img[^>]+src=["']([^"']+getfund\.gov\.gh\/wp-content\/uploads\/[^"']+)["'][^>]*>/gi;
  let match;

  while ((match = imgTagRegex.exec(contentHtml)) !== null) {
    let imgUrl = match[1];

    // Skip if should be excluded
    if (shouldExcludeImage(imgUrl)) continue;

    // Clean the URL
    imgUrl = imgUrl.split('?')[0];

    // Skip duplicates
    if (seenUrls.has(imgUrl)) continue;

    // Skip if we already have a higher quality version (without size suffix)
    const baseUrl = imgUrl.replace(/-\d+x\d+(\.[a-z]+)$/i, '$1');
    if (baseUrl !== imgUrl && seenUrls.has(baseUrl)) continue;

    seenUrls.add(imgUrl);
    images.push(imgUrl);
  }

  // Also look for images in WordPress galleries
  const galleryImgRegex = /data-(?:src|large-file|medium-file)=["']([^"']+getfund\.gov\.gh\/wp-content\/uploads\/[^"']+)["']/gi;

  while ((match = galleryImgRegex.exec(contentHtml)) !== null) {
    let imgUrl = match[1];
    if (shouldExcludeImage(imgUrl)) continue;
    imgUrl = imgUrl.split('?')[0];
    if (seenUrls.has(imgUrl)) continue;
    seenUrls.add(imgUrl);
    images.push(imgUrl);
  }

  // Deduplicate: prefer full-size images over thumbnails
  const finalImages = [];
  const baseUrls = new Set();

  for (const img of images) {
    const baseUrl = img.replace(/-\d+x\d+(\.[a-z]+)$/i, '$1');

    // If this is a thumbnail and we have the full version, skip
    if (baseUrl !== img && baseUrls.has(baseUrl)) continue;

    // If this is full version and we had a thumbnail, it's already added
    baseUrls.add(baseUrl);
    finalImages.push(img);
  }

  return finalImages;
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

    // Exact or partial title match
    if (dbTitleNorm === urlTitleNorm ||
        (dbTitleNorm.length > 20 && urlTitleNorm.length > 20 &&
         (dbTitleNorm.includes(urlTitleNorm.substring(0, 30)) ||
          urlTitleNorm.includes(dbTitleNorm.substring(0, 30))))) {
      return article.url;
    }

    // Slug match
    const urlSlug = article.url.split('/').filter(Boolean).pop() || '';
    if (dbSlug === urlSlug ||
        (dbSlug.length > 10 && urlSlug.length > 10 &&
         (dbSlug.includes(urlSlug.substring(0, 20)) ||
          urlSlug.includes(dbSlug.substring(0, 20))))) {
      return article.url;
    }
  }

  return null;
}

async function main() {
  console.log('Precisely extracting article gallery images...\n');

  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL not set!');
    process.exit(1);
  }

  // Get all articles
  const articles = await sql`
    SELECT id, title, slug, featured_image_url, meta_data
    FROM content
    WHERE type = 'news' AND deleted_at IS NULL
    ORDER BY published_at DESC NULLS LAST
  `;

  console.log(`Processing ${articles.length} articles...\n`);

  let updatedCount = 0;
  let matchedCount = 0;

  for (const article of articles) {
    const sourceUrl = findMatchingUrl(article);

    if (!sourceUrl) {
      console.log(`[SKIP] No source URL: ${article.title.substring(0, 40)}...`);
      continue;
    }

    matchedCount++;
    console.log(`\n[${matchedCount}] ${article.title.substring(0, 50)}...`);

    try {
      const html = await fetchUrl(sourceUrl);
      const images = extractArticleImages(html);

      console.log(`    Source: ${sourceUrl.substring(sourceUrl.indexOf('.gh/') + 4)}`);
      console.log(`    Found ${images.length} article-specific images`);

      if (images.length > 0) {
        // Use the first image as featured if current is bad
        let featuredImage = article.featured_image_url;
        if (shouldExcludeImage(featuredImage) && images.length > 0) {
          featuredImage = images[0];
        }

        // Update meta_data with clean images array
        const newMetaData = {
          ...(article.meta_data || {}),
          images: images,
          sourceUrl: sourceUrl,
          imageCount: images.length
        };

        await sql`
          UPDATE content
          SET
            meta_data = ${JSON.stringify(newMetaData)}::jsonb,
            featured_image_url = ${featuredImage}
          WHERE id = ${article.id}
        `;

        updatedCount++;

        // Show image filenames
        console.log(`    Images:`);
        for (let i = 0; i < Math.min(5, images.length); i++) {
          const filename = images[i].substring(images[i].lastIndexOf('/') + 1);
          console.log(`      ${i + 1}. ${filename}`);
        }
        if (images.length > 5) {
          console.log(`      ... and ${images.length - 5} more`);
        }
      } else {
        console.log(`    No valid images found in article content`);
      }

    } catch (err) {
      console.log(`    ERROR: ${err.message}`);
    }

    // Delay between requests
    await new Promise(r => setTimeout(r, 1200));
  }

  console.log('\n\n=== SUMMARY ===');
  console.log(`Articles matched: ${matchedCount}`);
  console.log(`Articles updated: ${updatedCount}`);
  console.log('\nDone!');
}

main();
