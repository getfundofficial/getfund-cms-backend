require('dotenv').config();
const { Client } = require('pg');
const https = require('https');

// Helper to fetch URL content
function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; GETFundBot/1.0)' }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
      res.on('error', reject);
    }).on('error', reject);
  });
}

// Extract article content from HTML
function extractArticleContent(html) {
  const result = {
    images: [],
    paragraphs: [],
    fullBody: ''
  };

  // Extract all images from article content
  const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
  let match;
  while ((match = imgRegex.exec(html)) !== null) {
    const src = match[1];
    if (src.includes('getfund.gov.gh/wp-content/uploads')) {
      result.images.push(src);
    }
  }

  // Try to find the article content section
  const contentMatch = html.match(/<div[^>]*class="[^"]*entry-content[^"]*"[^>]*>([\s\S]*?)<\/div>/i) ||
                       html.match(/<article[^>]*>([\s\S]*?)<\/article>/i) ||
                       html.match(/<div[^>]*class="[^"]*post-content[^"]*"[^>]*>([\s\S]*?)<\/div>/i);

  if (contentMatch) {
    const content = contentMatch[1];

    // Extract paragraphs
    const pRegex = /<p[^>]*>([\s\S]*?)<\/p>/gi;
    while ((match = pRegex.exec(content)) !== null) {
      let text = match[1]
        .replace(/<[^>]+>/g, '') // Remove HTML tags
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#8217;/g, "'")
        .replace(/&#8220;/g, '"')
        .replace(/&#8221;/g, '"')
        .trim();

      if (text.length > 20) {
        result.paragraphs.push(text);
      }
    }

    // Build HTML body with images interspersed
    let bodyParts = [];
    const mainImage = result.images[0];
    const otherImages = result.images.slice(1);

    result.paragraphs.forEach((p, i) => {
      bodyParts.push(`<p>${p}</p>`);

      // Insert additional images after every 2 paragraphs
      if (otherImages.length > 0 && (i + 1) % 2 === 0) {
        const img = otherImages.shift();
        if (img) {
          bodyParts.push(`<figure class="article-image"><img src="${img}" alt="Article image" /><figcaption>GETFund project documentation</figcaption></figure>`);
        }
      }
    });

    // Add any remaining images at the end
    otherImages.forEach(img => {
      bodyParts.push(`<figure class="article-image"><img src="${img}" alt="Article image" /></figure>`);
    });

    result.fullBody = bodyParts.join('\n\n');
  }

  return result;
}

// Find the original URL for an article
async function findOriginalUrl(slug, client) {
  // Get the article's created date to construct URL
  const result = await client.query(
    `SELECT created_at FROM content WHERE slug = $1`,
    [slug]
  );

  if (!result.rows[0]) return null;

  const date = new Date(result.rows[0].created_at);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  // Try different URL patterns
  const urlPatterns = [
    `https://www.getfund.gov.gh/${year}/${month}/${day}/${slug}/`,
    `https://www.getfund.gov.gh/${year}/${month}/${slug}/`,
    `https://www.getfund.gov.gh/news/${slug}/`,
    `https://www.getfund.gov.gh/${slug}/`
  ];

  for (const url of urlPatterns) {
    try {
      const response = await fetchUrl(url);
      if (response.status === 200 && response.data.includes('<article')) {
        return { url, html: response.data };
      }
    } catch (e) {
      // Try next pattern
    }
  }

  return null;
}

async function fixAllArticles() {
  console.log('🔄 Starting article content fix...\n');

  const client = new Client({
    connectionString: process.env.DATABASE_URL_UNPOOLED,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    // Get all articles with short body
    const articles = await client.query(`
      SELECT id, title, slug, body, featured_image_url
      FROM content
      WHERE type = 'news'
      AND LENGTH(body) < 1000
      ORDER BY created_at DESC
    `);

    console.log(`📊 Found ${articles.rows.length} articles with short content\n`);

    let fixed = 0;
    let failed = 0;

    for (const article of articles.rows) {
      console.log(`\n📝 Processing: ${article.title.substring(0, 50)}...`);
      console.log(`   Current body length: ${article.body?.length || 0}`);

      // Find original URL and scrape
      const source = await findOriginalUrl(article.slug, client);

      if (!source) {
        console.log(`   ❌ Could not find original URL`);
        failed++;
        continue;
      }

      console.log(`   Found: ${source.url}`);

      // Extract content
      const content = extractArticleContent(source.html);

      if (content.paragraphs.length === 0) {
        console.log(`   ❌ Could not extract content`);
        failed++;
        continue;
      }

      console.log(`   📸 Found ${content.images.length} images`);
      console.log(`   📄 Found ${content.paragraphs.length} paragraphs`);

      // Update database
      const mainImage = content.images[0] || article.featured_image_url;
      const metaData = {
        images: content.images,
        source_url: source.url
      };

      await client.query(`
        UPDATE content
        SET
          body = $1,
          featured_image_url = $2,
          meta_data = $3,
          updated_at = NOW()
        WHERE id = $4
      `, [content.fullBody, mainImage, JSON.stringify(metaData), article.id]);

      console.log(`   ✅ Updated! New body length: ${content.fullBody.length}`);
      fixed++;

      // Small delay to be nice to the server
      await new Promise(r => setTimeout(r, 500));
    }

    console.log('\n' + '='.repeat(50));
    console.log(`\n🎉 Completed!`);
    console.log(`   ✅ Fixed: ${fixed}`);
    console.log(`   ❌ Failed: ${failed}`);
    console.log(`   📊 Total: ${articles.rows.length}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

fixAllArticles();
