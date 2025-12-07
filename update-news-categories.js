/**
 * Script to update all news articles to have the correct category
 * This ensures articles with 'News' tags are properly categorized as 'NEWS'
 */

require('dotenv').config();
const { Pool } = require('pg');

// Database configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function updateNewsCategories() {
  const client = await pool.connect();

  try {
    console.log('Starting category update...');

    // Update all content items of type 'news' to have category 'NEWS' if they don't already have one
    const result = await client.query(`
      UPDATE content
      SET category = 'NEWS'
      WHERE type = 'news'
      AND (category IS NULL OR category = '' OR category = 'news' OR category = 'News');
    `);

    console.log(`✓ Updated ${result.rowCount} news articles to category 'NEWS'`);

    // Show current category distribution
    const stats = await client.query(`
      SELECT category, COUNT(*) as count
      FROM content
      WHERE type = 'news'
      GROUP BY category
      ORDER BY count DESC;
    `);

    console.log('\nCurrent category distribution:');
    stats.rows.forEach(row => {
      console.log(`  ${row.category || '(null)'}: ${row.count} articles`);
    });

  } catch (error) {
    console.error('Error updating categories:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the update
updateNewsCategories()
  .then(() => {
    console.log('\n✓ Category update completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n✗ Category update failed:', error);
    process.exit(1);
  });
