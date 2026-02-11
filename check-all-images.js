require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function checkAll() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  const imagesDir = path.join(__dirname, '../getfund-website/public/images/news');
  const actualImages = fs.readdirSync(imagesDir);

  await client.connect();

  const result = await client.query(`
    SELECT slug, title, featured_image_url
    FROM content
    WHERE type = 'news' AND status = 'published'
    ORDER BY published_at DESC
  `);

  console.log('Total articles:', result.rows.length);
  console.log('\nArticles with missing/invalid images:\n');

  let missing = 0;
  const missingList = [];

  for (const row of result.rows) {
    const imgPath = row.featured_image_url;

    if (!imgPath) {
      console.log('NULL:', row.slug);
      missingList.push({ slug: row.slug, reason: 'NULL', current: null });
      missing++;
      continue;
    }

    if (imgPath.startsWith('http')) {
      console.log('EXTERNAL:', row.slug);
      console.log('  URL:', imgPath.substring(0, 80));
      missingList.push({ slug: row.slug, reason: 'EXTERNAL', current: imgPath });
      missing++;
      continue;
    }

    const filename = imgPath.replace('/images/news/', '');
    if (!actualImages.includes(filename)) {
      console.log('FILE NOT FOUND:', row.slug);
      console.log('  Expected:', filename);
      missingList.push({ slug: row.slug, reason: 'FILE_NOT_FOUND', current: imgPath });
      missing++;
    }
  }

  console.log('\n=================================');
  console.log('Total articles:', result.rows.length);
  console.log('Total missing:', missing);
  console.log('Total valid:', result.rows.length - missing);

  await client.end();
}

checkAll();
