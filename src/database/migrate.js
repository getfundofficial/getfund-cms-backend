const fs = require('fs');
const path = require('path');
const { pool } = require('../config/database');

async function runMigrations() {
  console.log('🔄 Running database migrations...\n');

  const migrationsDir = path.join(__dirname, 'migrations');
  const migrationFiles = fs.readdirSync(migrationsDir).sort();

  try {
    // Enable UUID extension if not exists
    await pool.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    console.log('✅ UUID extension enabled');

    for (const file of migrationFiles) {
      if (!file.endsWith('.sql')) continue;

      console.log(`📝 Running migration: ${file}`);
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');

      await pool.query(sql);
      console.log(`✅ Completed: ${file}\n`);
    }

    console.log('🎉 All migrations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();
