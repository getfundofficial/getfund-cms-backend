require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

async function fixAllImages() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  const imagesDir = path.join(__dirname, '../getfund-website/public/images/news');
  const actualImages = fs.readdirSync(imagesDir);

  await client.connect();
  console.log('Connected to database\n');

  // Get all articles
  const result = await client.query(`
    SELECT id, slug, title, featured_image_url
    FROM content
    WHERE type = 'news' AND status = 'published'
    ORDER BY published_at DESC
  `);

  console.log(`Found ${result.rows.length} articles\n`);
  console.log('Checking and fixing image paths...\n');

  let fixed = 0;
  let alreadyGood = 0;
  let needsPlaceholder = 0;

  for (const row of result.rows) {
    const currentPath = row.featured_image_url;
    const currentFilename = currentPath ? currentPath.replace('/images/news/', '') : null;

    // Check if current image exists
    if (currentFilename && actualImages.includes(currentFilename)) {
      alreadyGood++;
      continue;
    }

    // Try to find a matching image by slug
    const slugLower = row.slug.toLowerCase();

    // Try various matching strategies
    let matchedImage = null;

    // Strategy 1: Exact slug match at start of filename
    matchedImage = actualImages.find(img => {
      const imgLower = img.toLowerCase();
      return imgLower.startsWith(slugLower.substring(0, 30));
    });

    // Strategy 2: Key parts of slug in filename
    if (!matchedImage) {
      const slugParts = slugLower.split('-').filter(p => p.length > 3);
      matchedImage = actualImages.find(img => {
        const imgLower = img.toLowerCase();
        let matches = 0;
        for (const part of slugParts.slice(0, 5)) {
          if (imgLower.includes(part)) matches++;
        }
        return matches >= 3;
      });
    }

    // Strategy 3: Check if filename contains significant slug portion
    if (!matchedImage) {
      matchedImage = actualImages.find(img => {
        const imgLower = img.toLowerCase().replace(/[-_]/g, '');
        const slugClean = slugLower.replace(/[-_]/g, '');
        return imgLower.includes(slugClean.substring(0, 25)) ||
               slugClean.includes(imgLower.substring(0, 25).replace(/\.[^.]+$/, ''));
      });
    }

    if (matchedImage) {
      const newPath = `/images/news/${matchedImage}`;
      await client.query(
        'UPDATE content SET featured_image_url = $1 WHERE id = $2',
        [newPath, row.id]
      );
      console.log(`✅ Fixed: ${row.slug.substring(0, 50)}`);
      console.log(`   From: ${currentPath}`);
      console.log(`   To:   ${newPath}\n`);
      fixed++;
    } else {
      // No match found - use placeholder
      if (currentPath !== '/images/news/news-placeholder.svg') {
        await client.query(
          'UPDATE content SET featured_image_url = $1 WHERE id = $2',
          ['/images/news/news-placeholder.svg', row.id]
        );
        console.log(`⚠️  Placeholder: ${row.slug.substring(0, 50)}`);
        console.log(`   No matching image found\n`);
      }
      needsPlaceholder++;
    }
  }

  console.log('='.repeat(50));
  console.log(`\nSummary:`);
  console.log(`  Already correct: ${alreadyGood}`);
  console.log(`  Fixed: ${fixed}`);
  console.log(`  Using placeholder: ${needsPlaceholder}`);
  console.log(`  Total: ${result.rows.length}`);

  await client.end();
}

fixAllImages().catch(console.error);
