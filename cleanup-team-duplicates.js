const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function cleanupDuplicates() {
  try {
    console.log('🧹 Cleaning up duplicate team members...\n');

    // Keep only the most recent entry for each unique name+role combination
    await sql`
      DELETE FROM team_members
      WHERE id IN (
        SELECT id FROM (
          SELECT id,
                 ROW_NUMBER() OVER (PARTITION BY name, role ORDER BY created_at DESC) AS rn
          FROM team_members
          WHERE deleted_at IS NULL
        ) t
        WHERE t.rn > 1
      )
    `;

    console.log('✅ Duplicates removed\n');

    // Verify the cleanup
    const remaining = await sql`
      SELECT role, COUNT(*) as count
      FROM team_members
      WHERE deleted_at IS NULL
      GROUP BY role
      ORDER BY role
    `;

    console.log('📊 Remaining Team Members:');
    remaining.forEach(row => {
      console.log(`  ${row.role}: ${row.count} member(s)`);
    });

    console.log('\n✅ Cleanup completed successfully!');
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

cleanupDuplicates();
