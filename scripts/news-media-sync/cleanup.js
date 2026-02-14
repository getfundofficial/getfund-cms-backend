/**
 * Phase 4: Cleanup - deduplicate articles, verify integrity.
 * Checks for duplicate slugs/titles and produces a final report.
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const { Client } = require('pg');

async function cleanup(client) {
  console.log('=== PHASE 4: Cleanup and Deduplication ===\n');

  // Find duplicate articles by slug
  const dupes = await client.query(`
    SELECT slug, COUNT(*) as count, array_agg(id) as ids
    FROM content
    WHERE type = 'news' AND deleted_at IS NULL
    GROUP BY slug HAVING COUNT(*) > 1
  `);

  if (dupes.rows.length > 0) {
    console.log(`Found ${dupes.rows.length} duplicate slug(s):\n`);
    for (const dupe of dupes.rows) {
      console.log(`  "${dupe.slug}" appears ${dupe.count} times`);
      // Keep the one with status='published', or the newest one
      const articles = await client.query(
        `SELECT id, status, published_at, created_at FROM content
         WHERE slug = $1 AND type = 'news' AND deleted_at IS NULL
         ORDER BY CASE WHEN status = 'published' THEN 0 ELSE 1 END, published_at DESC NULLS LAST`,
        [dupe.slug]
      );
      // Soft-delete all but the first (best) one
      const keepId = articles.rows[0].id;
      const deleteIds = articles.rows.slice(1).map(r => r.id);
      for (const id of deleteIds) {
        await client.query('UPDATE content SET deleted_at = NOW() WHERE id = $1', [id]);
        console.log(`    Soft-deleted duplicate: ${id}`);
      }
      console.log(`    Kept: ${keepId}`);
    }
  } else {
    console.log('No duplicate articles found.\n');
  }

  // Final report
  console.log('\n=== FINAL REPORT ===\n');

  const articleCount = await client.query(
    "SELECT COUNT(*) as count FROM content WHERE type = 'news' AND status = 'published' AND deleted_at IS NULL"
  );
  const mediaCount = await client.query(
    'SELECT COUNT(*) as count FROM media WHERE deleted_at IS NULL'
  );
  const withImages = await client.query(
    "SELECT COUNT(*) as count FROM content WHERE type = 'news' AND status = 'published' AND deleted_at IS NULL AND featured_image_url IS NOT NULL AND featured_image_url != ''"
  );
  const withCarousel = await client.query(`
    SELECT COUNT(*) as count FROM content
    WHERE type = 'news' AND status = 'published' AND deleted_at IS NULL
    AND meta_data->'images' IS NOT NULL
    AND jsonb_array_length(COALESCE(meta_data->'images', '[]'::jsonb)) > 1
  `);
  const externalImages = await client.query(`
    SELECT slug, featured_image_url FROM content
    WHERE type = 'news' AND status = 'published' AND deleted_at IS NULL
    AND featured_image_url LIKE 'https://www.getfund.gov.gh%'
  `);

  console.log(`Published articles: ${articleCount.rows[0].count}`);
  console.log(`Articles with images: ${withImages.rows[0].count}`);
  console.log(`Articles with carousel (2+ images): ${withCarousel.rows[0].count}`);
  console.log(`Media library items: ${mediaCount.rows[0].count}`);
  console.log(`Articles still using external images: ${externalImages.rows.length}`);

  if (externalImages.rows.length > 0) {
    console.log('\nArticles with external image URLs:');
    for (const row of externalImages.rows) {
      console.log(`  ${row.slug}: ${row.featured_image_url}`);
    }
  }

  console.log('\nCleanup complete.');
}

module.exports = { cleanup };

if (require.main === module) {
  (async () => {
    const client = new Client({
      connectionString: process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });
    await client.connect();
    await cleanup(client);
    await client.end();
  })().catch(err => { console.error(err); process.exit(1); });
}
