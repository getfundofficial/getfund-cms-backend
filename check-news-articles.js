require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function checkNewsArticles() {
  try {
    console.log('Checking news articles in database...\n');

    // Get the specific article that was edited
    const result = await pool.query(`
      SELECT
        id,
        title,
        slug,
        status,
        body,
        updated_at,
        created_at
      FROM content
      WHERE id = '3189c29f-1ea7-44a3-8033-638f63994d1f'
    `);

    if (result.rows.length > 0) {
      const article = result.rows[0];
      console.log(`Article Details:\n`);
      console.log(`  ID: ${article.id}`);
      console.log(`  Title: ${article.title}`);
      console.log(`  Slug: ${article.slug}`);
      console.log(`  Status: ${article.status}`);
      console.log(`  Created: ${article.created_at}`);
      console.log(`  Updated: ${article.updated_at}`);
      console.log(`\nBody Content Length: ${article.body?.length || 0} characters`);
      console.log(`\nFull Body Content:\n`);
      console.log(article.body);
    } else {
      console.log('Article not found');
    }

    await pool.end();
  } catch (error) {
    console.error('Error checking articles:', error);
    await pool.end();
  }
}

checkNewsArticles();
