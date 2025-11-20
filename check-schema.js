/**
 * Check the actual content table structure
 */

const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function checkSchema() {
  try {
    // Get table columns
    const columns = await sql`
      SELECT column_name, data_type, character_maximum_length, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'content'
      ORDER BY ordinal_position
    `;

    console.log('\n📋 Content Table Structure:\n');
    columns.forEach(col => {
      console.log(`  ${col.column_name.padEnd(30)} ${col.data_type.padEnd(20)} ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });

    // Get check constraints
    const checks = await sql`
      SELECT constraint_name, check_clause
      FROM information_schema.check_constraints
      WHERE constraint_schema = 'public' 
      AND constraint_name LIKE 'content%'
    `;

    if (checks.length > 0) {
      console.log('\n🔒 Constraints:\n');
      checks.forEach(c => {
        console.log(`  ${c.constraint_name}: ${c.check_clause}`);
      });
    }

    // Show sample data
    const sample = await sql`
      SELECT id, type, title, slug, status
      FROM content
      LIMIT 5
    `;

    if (sample.length > 0) {
      console.log('\n📊 Sample Data:\n');
      sample.forEach(row => {
        console.log(`  [${row.type}] ${row.title} (/${row.slug}) - ${row.status}`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkSchema();
