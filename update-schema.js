/**
 * Add 'page' type to content table
 */

const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function updateSchema() {
  console.log('🔧 Updating content table schema...\n');

  try {
    // Drop existing constraint
    console.log('📝 Dropping old type constraint...');
    await sql`
      ALTER TABLE content DROP CONSTRAINT IF EXISTS content_type_check
    `;

    // Add new constraint with 'page' type
    console.log('✅ Adding new constraint with page type...');
    await sql`
      ALTER TABLE content 
      ADD CONSTRAINT content_type_check 
      CHECK (type IN ('news', 'hero_slide', 'page'))
    `;

    console.log('✨ Schema update complete!\n');

    // Verify
    const constraints = await sql`
      SELECT check_clause
      FROM information_schema.check_constraints
      WHERE constraint_name = 'content_type_check'
    `;

    console.log('📋 Updated constraint:');
    console.log(`   ${constraints[0].check_clause}\n`);

  } catch (error) {
    console.error('❌ Update failed:', error);
    process.exit(1);
  }
}

updateSchema();
