#!/usr/bin/env node

/**
 * Complete article image fix using precise URL mapping
 */

require('dotenv').config({ path: '.env' });
const { neon } = require('@neondatabase/serverless');
const https = require('https');
const { findUrlForArticle } = require('./article-url-mapping');

const sql = neon(process.env.DATABASE_URL);

// Exclude logos, icons, sidebar thumbnails
function shouldExclude(url) {
  if (url == null) return true;
  const l = url.toLowerCase();
  return (
    l.includes('logo') ||
    l.includes('site-icon') ||
    l.includes('cropped-getfund') ||
    l.includes('favicon') ||
    l.includes('e1655889919253') ||
    l.includes('placeholder') ||
    /-70x70\./.test(l) ||
    /-100x100\./.test(l) ||
    /-150x150\./.test(l) ||
    /-170x170\./.test(l)
  );
}

// Fetch URL
async function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { timeout: 30000 }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        let redir = res.headers.location;
        if (redir.indexOf('http') !== 0) {
          const u = new URL(url);
          redir = u.protocol + '//' + u.host + redir;
        }
        return fetchUrl(redir).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) return reject(new Error('HTTP ' + res.statusCode));

      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(data));
    });
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
    req.on('error', reject);
  });
}

// Extract images - simple but effective
function extractImages(html) {
  const imgRegex = /https?:\/\/www\.getfund\.gov\.gh\/wp-content\/uploads\/[^"'\s<>)]+\.(?:jpg|jpeg|png|gif|webp)/gi;
  const allImages = [...new Set(html.match(imgRegex) || [])];

  // Filter and clean URLs
  const validImages = allImages
    .map(img => img.split('?')[0]) // Remove query strings
    .filter(img => !shouldExclude(img));

  // Prefer larger images - sort by size suffix
  validImages.sort((a, b) => {
    const getSizeScore = (url) => {
      if (url.includes('-770x')) return 100;
      if (url.includes('-1024x')) return 90;
      if (url.includes('-768x')) return 80;
      if (url.includes('-scaled')) return 70;
      if (!/-\d+x\d+\./.test(url)) return 60; // Full size images
      return 50;
    };
    return getSizeScore(b) - getSizeScore(a);
  });

  // Return unique base images (prefer larger versions)
  const seen = new Set();
  const result = [];
  for (const img of validImages) {
    const baseUrl = img.replace(/-\d+x\d+(\.[a-z]+)$/i, '$1');
    if (seen.has(baseUrl)) continue;
    seen.add(baseUrl);
    result.push(img);
  }

  return result;
}

async function main() {
  console.log('Fixing all article images...\n');

  const articles = await sql`
    SELECT id, title, slug, featured_image_url, meta_data
    FROM content
    WHERE type = 'news' AND deleted_at IS NULL
    ORDER BY published_at DESC NULLS LAST
  `;

  console.log('Processing ' + articles.length + ' articles...\n');

  let updated = 0;
  let failed = 0;

  for (const article of articles) {
    const sourceUrl = findUrlForArticle(article);

    console.log('\n[' + (updated + failed + 1) + '] ' + article.title.substring(0, 50) + '...');

    if (sourceUrl == null) {
      console.log('    ! No source URL mapped');
      failed++;
      continue;
    }

    const slug = sourceUrl.split('/').slice(-2, -1)[0];
    console.log('    > ' + slug);

    try {
      const html = await fetchUrl(sourceUrl);
      const images = extractImages(html);

      if (images.length > 0) {
        const featured = images[0];
        const metaData = {
          images: images,
          sourceUrl: sourceUrl
        };

        await sql`
          UPDATE content
          SET
            featured_image_url = ${featured},
            meta_data = ${JSON.stringify(metaData)}::jsonb
          WHERE id = ${article.id}
        `;

        console.log('    OK ' + images.length + ' images');
        console.log('    Featured: ' + featured.split('/').pop());
        updated++;
      } else {
        console.log('    ! No valid images found');
        failed++;
      }
    } catch (err) {
      console.log('    ! Error: ' + err.message);
      failed++;
    }

    await new Promise(r => setTimeout(r, 1000));
  }

  console.log('\n\n=== SUMMARY ===');
  console.log('Updated: ' + updated);
  console.log('Failed: ' + failed);
}

main();
