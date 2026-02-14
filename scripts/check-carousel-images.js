require('dotenv').config();
const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();

  // Get all carousel image URLs
  const result = await client.query(`
    SELECT slug, 
           jsonb_array_elements_text(meta_data->'images') as image_url
    FROM content 
    WHERE type = 'news' AND status = 'published' AND deleted_at IS NULL
    AND meta_data->'images' IS NOT NULL 
    AND jsonb_array_length(COALESCE(meta_data->'images', '[]'::jsonb)) > 0
    ORDER BY slug
  `);

  // Categorize URLs
  const external = [];
  const local = [];
  const placeholder = [];
  
  for (const row of result.rows) {
    const url = row.image_url;
    if (url.includes('getfund.gov.gh')) {
      external.push({ slug: row.slug, url });
    } else if (url.includes('cropped-GETfund') || url.includes('Site-icon') || url.includes('Dept.png') || url.includes('CJ.png') || url.includes('IMG_1149.jpg') || url.includes('Grp-Pix.jpg')) {
      placeholder.push({ slug: row.slug, url });
    } else {
      local.push({ slug: row.slug, url });
    }
  }

  console.log(`Total carousel image entries: ${result.rows.length}`);
  console.log(`  External (getfund.gov.gh): ${external.length}`);
  console.log(`  Local (proper): ${local.length}`);
  console.log(`  Placeholder/icon: ${placeholder.length}`);
  
  console.log('\n=== EXTERNAL URLs (need to be downloaded) ===');
  const bySlug = {};
  for (const e of external) {
    if (!bySlug[e.slug]) bySlug[e.slug] = [];
    bySlug[e.slug].push(e.url);
  }
  for (const [slug, urls] of Object.entries(bySlug)) {
    console.log(`\n${slug}:`);
    for (const url of urls) {
      console.log(`  ${url}`);
    }
  }
  
  console.log('\n=== PLACEHOLDER IMAGES (should be removed) ===');
  for (const p of placeholder) {
    console.log(`  ${p.slug}: ${p.url}`);
  }

  console.log('\n=== LOCAL IMAGES (working) ===');
  for (const l of local) {
    console.log(`  ${l.slug}: ${l.url}`);
  }

  await client.end();
}

main().catch(err => { console.error(err); process.exit(1); });
