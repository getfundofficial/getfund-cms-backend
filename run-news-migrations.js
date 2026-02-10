require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

async function runNewsMigrations() {
  console.log('🔄 Running news article migrations...\n');

  const client = new Client({
    connectionString: process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  const migrationsDir = path.join(__dirname, 'src/database/migrations');
  const migrationFiles = [
    '037_insert_news_articles.sql',
    '038_update_news_articles_full_content.sql'
  ];

  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    for (const file of migrationFiles) {
      console.log(`📝 Running migration: ${file}`);
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');

      await client.query(sql);
      console.log(`✅ Completed: ${file}\n`);
    }

    // Count the news articles
    const result = await client.query("SELECT COUNT(*) FROM content WHERE type = 'news'");
    console.log(`📊 Total news articles in database: ${result.rows[0].count}`);

    console.log('\n🎉 News migrations completed successfully!');
    await client.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    try {
      await client.end();
    } catch (e) {
      // Ignore error on cleanup
    }
    process.exit(1);
  }
}

runNewsMigrations();
