const {pool} = require('./src/config/database.js');

async function test() {
  try {
    console.log('Testing database connection...');
    const result = await pool.query('SELECT COUNT(*) FROM content WHERE type=$1', ['news']);
    console.log('✅ News articles in database:', result.rows[0].count);

    const articles = await pool.query('SELECT id, title, status FROM content WHERE type=$1 ORDER BY created_at DESC', ['news']);
    console.log('\nArticles:');
    articles.rows.forEach(article => {
      console.log(`- ${article.title} (${article.status})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

test();
