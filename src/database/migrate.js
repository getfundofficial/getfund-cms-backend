require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

async function runMigrations() {
  console.log('Running database migrations...\n');

  const client = new Client({
    connectionString: process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });
  const migrationsDir = path.join(__dirname, 'migrations');
  const migrationFiles = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();

  try {
    await client.connect();
    console.log('Connected to database\n');

    // Enable UUID extension if not exists
    await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

    // Create migrations tracking table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        filename VARCHAR(255) PRIMARY KEY,
        executed_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Get already-executed migrations
    const executed = await client.query('SELECT filename FROM schema_migrations');
    const executedSet = new Set(executed.rows.map(r => r.filename));

    let ranCount = 0;
    let skippedCount = 0;

    for (const file of migrationFiles) {
      if (executedSet.has(file)) {
        skippedCount++;
        continue;
      }

      console.log(`Running migration: ${file}`);
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');

      await client.query(sql);
      await client.query(
        'INSERT INTO schema_migrations (filename) VALUES ($1)',
        [file]
      );
      console.log(`Completed: ${file}\n`);
      ranCount++;
    }

    if (skippedCount > 0) {
      console.log(`Skipped ${skippedCount} already-executed migrations`);
    }
    console.log(`Ran ${ranCount} new migrations`);
    console.log('\nAll migrations completed successfully!');
    await client.end();
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
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
