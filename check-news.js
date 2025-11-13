require('dotenv').config();
const { Pool } = require('@neondatabase/serverless');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function checkNewsArticles() {
  try {
    console.log('Checking news articles in database...\n');
    
    // Check all news articles
    const allNews = await pool.query(
      `SELECT id, title, status, type, published_at, created_at 
       FROM content 
       WHERE type = 'news' 
       ORDER BY created_at DESC`
    );
    
    console.log(`Total news articles in database: ${allNews.rows.length}\n`);
    
    if (allNews.rows.length === 0) {
      console.log('❌ No news articles found in database!');
      console.log('You need to add articles through the CMS dashboard.\n');
    } else {
      console.log('All news articles:');
      allNews.rows.forEach((article, index) => {
        console.log(`${index + 1}. ${article.title}`);
        console.log(`   ID: ${article.id}`);
        console.log(`   Status: ${article.status}`);
        console.log(`   Published: ${article.published_at || 'Not published'}`);
        console.log('');
      });
    }
    
    // Check published news articles
    const publishedNews = await pool.query(
      `SELECT id, title, status 
       FROM content 
       WHERE type = 'news' 
         AND status = 'published' 
         AND deleted_at IS NULL
       ORDER BY published_at DESC, created_at DESC`
    );
    
    console.log(`\nPublished news articles: ${publishedNews.rows.length}`);
    
    if (publishedNews.rows.length === 0) {
      console.log('❌ No PUBLISHED news articles found!');
      console.log('Articles must have status = "published" to appear on the website.\n');
    } else {
      console.log('Published articles:');
      publishedNews.rows.forEach((article, index) => {
        console.log(`${index + 1}. ${article.title} (${article.status})`);
      });
    }
    
    await pool.end();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkNewsArticles();
