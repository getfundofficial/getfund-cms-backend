require('dotenv').config();
const { Client } = require('pg');

(async () => {
  const client = new Client({
    connectionString: process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();

  // Get all published news ordered by COALESCE(published_at, created_at) DESC
  const res = await client.query(`
    SELECT id, title,
           published_at,
           created_at,
           published_at IS NULL as pub_is_null,
           COALESCE(published_at, created_at) as effective_date
    FROM content
    WHERE type = 'news' AND status = 'published' AND deleted_at IS NULL
    ORDER BY published_at DESC NULLS LAST, created_at DESC
    LIMIT 10
  `);

  console.log('Top 10 articles:\n');
  res.rows.forEach(r => {
    const pubStr = r.pub_is_null ? 'NULL' : new Date(r.published_at).toISOString();
    const effStr = new Date(r.effective_date).toISOString().split('T')[0];
    console.log(`  [pub: ${pubStr}] [effective: ${effStr}] ${r.title.substring(0, 60)}`);
  });

  // Also check the specific article
  const scholarship = await client.query(`
    SELECT id, title, published_at, created_at, slug
    FROM content
    WHERE title LIKE '%2021 Scholarship%' AND deleted_at IS NULL
  `);
  console.log('\n--- 2021 Scholarship article ---');
  scholarship.rows.forEach(r => {
    console.log(`  id: ${r.id}`);
    console.log(`  title: ${r.title}`);
    console.log(`  slug: ${r.slug}`);
    console.log(`  published_at: ${r.published_at}`);
    console.log(`  created_at: ${r.created_at}`);
  });

  await client.end();
})().catch(e => { console.error(e.message); process.exit(1); });
