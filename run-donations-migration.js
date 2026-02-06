require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

async function runDonationsMigration() {
  console.log('🔄 Running donations table migration...\n');

  const client = new Client({
    connectionString: process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    // Enable UUID extension if not exists
    await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    console.log('✅ UUID extension enabled\n');

    // Run the donations table migration
    const migrationPath = path.join(__dirname, 'src/database/migrations/035_create_donations_table.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log('📝 Running migration: 035_create_donations_table.sql');
    await client.query(sql);
    console.log('✅ Donations table created successfully!\n');

    // Verify the table was created
    const result = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'donations'
      ORDER BY ordinal_position
    `);

    console.log('📋 Donations table structure:');
    console.log('─'.repeat(60));
    result.rows.forEach(row => {
      console.log(`  ${row.column_name.padEnd(25)} ${row.data_type.padEnd(20)} ${row.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    console.log('─'.repeat(60));

    console.log('\n🎉 Migration completed successfully!');
    await client.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    if (error.detail) {
      console.error('Detail:', error.detail);
    }
    try {
      await client.end();
    } catch (e) {
      // Ignore error on cleanup
    }
    process.exit(1);
  }
}

runDonationsMigration();
