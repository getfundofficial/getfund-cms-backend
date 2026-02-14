/**
 * Wipe all scraped news articles and associated media.
 * Hard deletes from the content and media tables.
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  console.log('Connected to database.\n');

  // Count before
  const before = await client.query(
    "SELECT COUNT(*) as count FROM content WHERE type = 'news'"
  );
  console.log(`News articles before: ${before.rows[0].count}`);

  const mediaBefore = await client.query(
    "SELECT COUNT(*) as count FROM media WHERE filename LIKE 'news/%'"
  );
  console.log(`News media entries before: ${mediaBefore.rows[0].count}\n`);

  // Delete all news articles (hard delete)
  const deleted = await client.query(
    "DELETE FROM content WHERE type = 'news' RETURNING id, slug"
  );
  console.log(`Deleted ${deleted.rowCount} news articles.`);

  // Delete associated media entries for news images
  const mediaDeleted = await client.query(
    "DELETE FROM media WHERE filename LIKE 'news/%' RETURNING id, filename"
  );
  console.log(`Deleted ${mediaDeleted.rowCount} news media entries.\n`);

  // Verify
  const after = await client.query(
    "SELECT COUNT(*) as count FROM content WHERE type = 'news'"
  );
  console.log(`News articles after: ${after.rows[0].count}`);

  const mediaAfter = await client.query(
    "SELECT COUNT(*) as count FROM media WHERE filename LIKE 'news/%'"
  );
  console.log(`News media entries after: ${mediaAfter.rows[0].count}`);

  console.log('\nCleanup complete. Database is clean for fresh content.');

  await client.end();
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
