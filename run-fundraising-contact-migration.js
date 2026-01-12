const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function runMigration() {
  try {
    console.log('🚀 Starting fundraising_contact migration...\n');

    // Create the table
    console.log('📋 Creating fundraising_contact table...');
    await sql`
      CREATE TABLE IF NOT EXISTS fundraising_contact (
        id SERIAL PRIMARY KEY,
        phone VARCHAR(50) DEFAULT '+233 30 266 4061',
        email VARCHAR(100) DEFAULT 'info@getfund.gov.gh',
        address VARCHAR(200) DEFAULT 'GETFund House, Accra',
        button_text VARCHAR(100) DEFAULT 'GET IN TOUCH WITH FUNDRAISING!',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_by INTEGER
      )
    `;
    console.log('✅ Table created\n');

    // Add button_text column if it doesn't exist (for existing tables)
    console.log('📋 Adding button_text column if missing...');
    try {
      await sql`ALTER TABLE fundraising_contact ADD COLUMN IF NOT EXISTS button_text VARCHAR(100) DEFAULT 'GET IN TOUCH WITH FUNDRAISING!'`;
      console.log('✅ button_text column ensured\n');
    } catch (e) {
      console.log('ℹ️ button_text column already exists\n');
    }

    // Check if default record exists
    const existing = await sql`SELECT id FROM fundraising_contact WHERE is_active = true LIMIT 1`;

    if (existing.length === 0) {
      console.log('📋 Inserting default record...');
      await sql`
        INSERT INTO fundraising_contact (phone, email, address, button_text, is_active)
        VALUES ('+233 30 266 4061', 'info@getfund.gov.gh', 'GETFund House, Accra', 'GET IN TOUCH WITH FUNDRAISING!', true)
      `;
      console.log('✅ Default record inserted\n');
    } else {
      console.log('ℹ️ Default record already exists\n');
    }

    // Verify the data
    const contact = await sql`SELECT * FROM fundraising_contact WHERE is_active = true LIMIT 1`;
    console.log('📊 Fundraising Contact Info:');
    console.log(`  Phone: ${contact[0]?.phone}`);
    console.log(`  Email: ${contact[0]?.email}`);
    console.log(`  Address: ${contact[0]?.address}`);
    console.log(`  Button Text: ${contact[0]?.button_text}`);

    console.log('\n✅ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();
