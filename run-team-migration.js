const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function executeSQLFile(filepath, description) {
  console.log(`📋 ${description}...`);
  const sqlContent = fs.readFileSync(filepath, 'utf8');

  // Remove comments and split by semicolons
  const statements = sqlContent
    .split('\n')
    .filter(line => !line.trim().startsWith('--'))
    .join('\n')
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  for (const statement of statements) {
    try {
      await sql.transaction([sql(statement)]);
    } catch (error) {
      // Ignore "already exists" errors
      if (!error.message.includes('already exists')) {
        throw error;
      }
    }
  }
  console.log(`✅ ${description} completed\n`);
}

async function runMigration() {
  try {
    console.log('🚀 Starting team members migration...\n');

    // Execute table creation
    await executeSQLFile(
      path.join(__dirname, 'migrations', 'create-team-members-table.sql'),
      'Creating team_members table'
    );

    // Execute seed data
    await executeSQLFile(
      path.join(__dirname, 'migrations', 'seed-team-members.sql'),
      'Seeding initial team member data'
    );

    // Verify the data
    const teamMembers = await sql`
      SELECT role, COUNT(*) as count
      FROM team_members
      WHERE deleted_at IS NULL
      GROUP BY role
      ORDER BY role
    `;

    console.log('📊 Team Members Summary:');
    teamMembers.forEach(row => {
      console.log(`  ${row.role}: ${row.count} member(s)`);
    });

    console.log('\n✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

runMigration();
