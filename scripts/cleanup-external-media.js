/**
 * Remove external getfund.gov.gh media entries from the media library.
 *
 * These entries point to images on the external getfund.gov.gh server which
 * blocks cross-origin image loading in browsers (hotlink protection).
 * The 57 news article images are already stored with proper frontend URLs
 * (https://getfund-website-hq.vercel.app/images/news/...) so these external
 * duplicates are unnecessary and appear broken in the CMS.
 */

require('dotenv').config();
const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  console.log('Connected to database.\n');

  // Count external getfund.gov.gh entries
  const countResult = await client.query(
    "SELECT COUNT(*) as count FROM media WHERE url LIKE '%getfund.gov.gh%' AND deleted_at IS NULL"
  );
  const externalCount = parseInt(countResult.rows[0].count);
  console.log(`Found ${externalCount} external getfund.gov.gh media entries.\n`);

  if (externalCount === 0) {
    console.log('Nothing to clean up.');
    await client.end();
    return;
  }

  // Show a sample of what will be removed
  const sampleResult = await client.query(
    "SELECT id, url, original_name FROM media WHERE url LIKE '%getfund.gov.gh%' AND deleted_at IS NULL LIMIT 5"
  );
  console.log('Sample entries to be removed:');
  for (const row of sampleResult.rows) {
    console.log(`  - ${row.original_name}: ${row.url}`);
  }
  console.log('');

  // Soft-delete all external getfund.gov.gh entries
  const deleteResult = await client.query(
    "UPDATE media SET deleted_at = NOW() WHERE url LIKE '%getfund.gov.gh%' AND deleted_at IS NULL"
  );
  console.log(`Soft-deleted ${deleteResult.rowCount} external media entries.\n`);

  // Show remaining count
  const remainingResult = await client.query(
    'SELECT COUNT(*) as count FROM media WHERE deleted_at IS NULL'
  );
  console.log(`Remaining active media items: ${remainingResult.rows[0].count}`);

  await client.end();
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
