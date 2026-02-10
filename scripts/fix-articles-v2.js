require('dotenv').config();
const { Client } = require('pg');
const https = require('https');
const fs = require('fs');
const path = require('path');

// Load article URLs
const urlData = JSON.parse(fs.readFileSync(path.join(__dirname, 'article-urls.json'), 'utf8'));

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml'
      },
      timeout: 15000
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

function extractContent(html) {
  const result = { images: [], paragraphs: [], fullBody: '' };

  // Extract all images from wp-content/uploads
  const imgRegex = /<img[^>]+src=["']([^"']*getfund\.gov\.gh\/wp-content\/uploads[^"']*)["'][^>]*>/gi;
  let match;
  while ((match = imgRegex.exec(html)) !== null) {
    let src = match[1];
    // Get highest resolution version
    src = src.replace(/-\d+x\d+\./, '.');
    if (!result.images.includes(src)) {
      result.images.push(src);
    }
  }

  // Find main content area
  const contentMatch = html.match(/<div[^>]*class="[^"]*entry-content[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<(?:footer|div[^>]*class="[^"]*post-footer|aside)/i) ||
                       html.match(/<div[^>]*class="[^"]*entry-content[^"]*"[^>]*>([\s\S]*?)<\/div>/i) ||
                       html.match(/<article[^>]*>([\s\S]*?)<\/article>/i);

  if (contentMatch) {
    const content = contentMatch[1];

    // Extract paragraphs
    const pRegex = /<p[^>]*>([\s\S]*?)<\/p>/gi;
    while ((match = pRegex.exec(content)) !== null) {
      let text = match[1]
        .replace(/<br\s*\/?>/gi, ' ')
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#8217;/g, "'")
        .replace(/&#8216;/g, "'")
        .replace(/&#8220;/g, '"')
        .replace(/&#8221;/g, '"')
        .replace(/&#8211;/g, '–')
        .replace(/&#8212;/g, '—')
        .replace(/\s+/g, ' ')
        .trim();

      if (text.length > 30 && !text.startsWith('Share') && !text.includes('Posted by')) {
        result.paragraphs.push(text);
      }
    }

    // Build HTML body
    let bodyParts = [];
    const otherImages = [...result.images.slice(1)];

    result.paragraphs.forEach((p, i) => {
      bodyParts.push(`<p>${p}</p>`);

      // Insert images between paragraphs
      if (otherImages.length > 0 && (i + 1) % 2 === 0 && i < result.paragraphs.length - 1) {
        const img = otherImages.shift();
        if (img) {
          bodyParts.push(`<figure class="article-image"><img src="${img}" alt="GETFund project" /></figure>`);
        }
      }
    });

    // Add remaining images at the end
    otherImages.forEach(img => {
      bodyParts.push(`<figure class="article-image"><img src="${img}" alt="GETFund project" /></figure>`);
    });

    result.fullBody = bodyParts.join('\n\n');
  }

  return result;
}

function normalizeTitle(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 50);
}

async function fixArticles() {
  console.log('🔄 Starting comprehensive article fix...\n');

  const client = new Client({
    connectionString: process.env.DATABASE_URL_UNPOOLED,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    // Get all articles needing update
    const dbArticles = await client.query(`
      SELECT id, title, slug, body, featured_image_url
      FROM content
      WHERE type = 'news'
      AND LENGTH(body) < 1200
    `);

    console.log(`📊 Found ${dbArticles.rows.length} articles needing update`);
    console.log(`📋 Have ${urlData.articles.length} source URLs\n`);

    let fixed = 0, failed = 0;

    for (const article of dbArticles.rows) {
      const normalizedDbTitle = normalizeTitle(article.title);

      // Find matching URL
      const matchingUrl = urlData.articles.find(u => {
        const normalizedSourceTitle = normalizeTitle(u.title);
        return normalizedDbTitle.includes(normalizedSourceTitle.substring(0, 30)) ||
               normalizedSourceTitle.includes(normalizedDbTitle.substring(0, 30)) ||
               u.url.includes(article.slug.substring(0, 20));
      });

      if (!matchingUrl) {
        console.log(`❌ No URL found for: ${article.title.substring(0, 50)}...`);
        failed++;
        continue;
      }

      console.log(`\n📝 ${article.title.substring(0, 50)}...`);
      console.log(`   URL: ${matchingUrl.url}`);

      try {
        const response = await fetchUrl(matchingUrl.url);

        if (response.status !== 200) {
          console.log(`   ❌ HTTP ${response.status}`);
          failed++;
          continue;
        }

        const content = extractContent(response.data);

        if (content.paragraphs.length === 0 || content.fullBody.length < article.body?.length) {
          console.log(`   ⚠️ Content extraction failed or shorter than existing`);
          failed++;
          continue;
        }

        const mainImage = content.images[0] || article.featured_image_url;
        const metaData = {
          images: content.images,
          source_url: matchingUrl.url,
          scraped_at: new Date().toISOString()
        };

        await client.query(`
          UPDATE content
          SET body = $1, featured_image_url = $2, meta_data = $3, updated_at = NOW()
          WHERE id = $4
        `, [content.fullBody, mainImage, JSON.stringify(metaData), article.id]);

        console.log(`   ✅ Updated: ${article.body?.length || 0} → ${content.fullBody.length} chars, ${content.images.length} images`);
        fixed++;

        await new Promise(r => setTimeout(r, 800));

      } catch (err) {
        console.log(`   ❌ Error: ${err.message}`);
        failed++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`\n🎉 Complete! Fixed: ${fixed}, Failed: ${failed}, Total: ${dbArticles.rows.length}`);

    // Show stats
    const stats = await client.query(`
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE LENGTH(body) >= 1000) as good,
        COUNT(*) FILTER (WHERE LENGTH(body) < 1000) as short
      FROM content WHERE type = 'news'
    `);
    console.log(`\n📊 Final stats: ${stats.rows[0].good} good, ${stats.rows[0].short} short, ${stats.rows[0].total} total`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

fixArticles();
