require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

async function runMigrations() {
  console.log('🔄 Running database migrations...\n');

  // Use unpooled connection for migrations (bypasses pgbouncer)
  const client = new Client({
    connectionString: process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  const migrationsDir = path.join(__dirname, 'migrations');
  const migrationFiles = fs.readdirSync(migrationsDir).sort();

  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    // Enable UUID extension if not exists
    await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    console.log('✅ UUID extension enabled\n');

    for (const file of migrationFiles) {
      if (!file.endsWith('.sql')) continue;

      console.log(`📝 Running migration: ${file}`);
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');

      await client.query(sql);
      console.log(`✅ Completed: ${file}\n`);
    }

    console.log('🎉 All migrations completed successfully!');
    await client.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    console.error('Error details:', error.message);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
    try {
      await client.end();
    } catch (e) {
      // Ignore error on cleanup
    }
    process.exit(1);
  }
}

runMigrations();
