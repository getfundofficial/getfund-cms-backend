require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

async function checkImages() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  // Get list of actual image files
  const imagesDir = path.join(__dirname, '../getfund-website/public/images/news');
  const actualImages = fs.readdirSync(imagesDir).filter(f => !f.endsWith('.svg'));

  console.log('📂 Available image files:', actualImages.length);

  try {
    await client.connect();

    const result = await client.query(`
      SELECT slug, title, featured_image_url
      FROM content
      WHERE type = 'news' AND status = 'published'
      ORDER BY published_at DESC
    `);

    console.log('\n🔍 Checking database entries...\n');

    const missing = [];
    const found = [];

    for (const row of result.rows) {
      const imgPath = row.featured_image_url;
      if (!imgPath || imgPath === '/images/news/news-placeholder.svg') {
        missing.push({ slug: row.slug, title: row.title, current: imgPath });
        continue;
      }

      const filename = imgPath.replace('/images/news/', '');
      if (!actualImages.includes(filename)) {
        missing.push({ slug: row.slug, title: row.title, current: imgPath });
      } else {
        found.push({ slug: row.slug, title: row.title });
      }
    }

    console.log(`✅ Found: ${found.length} articles with valid images`);
    console.log(`❌ Missing: ${missing.length} articles with missing/invalid images\n`);

    if (missing.length > 0) {
      console.log('Articles with missing images:');
      missing.forEach(m => {
        console.log(`  - ${m.slug}`);
        console.log(`    Current: ${m.current}`);

        // Try to find a matching image
        const possibleMatches = actualImages.filter(img => {
          const slugPart = m.slug.substring(0, 30).toLowerCase();
          return img.toLowerCase().includes(slugPart.substring(0, 20));
        });
        if (possibleMatches.length > 0) {
          console.log(`    Possible match: ${possibleMatches[0]}`);
        }
        console.log('');
      });
    }

    await client.end();
  } catch (error) {
    console.error('Error:', error.message);
    try { await client.end(); } catch (e) {}
  }
}

checkImages();
