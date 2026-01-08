// Run: node run-company-events-migration.js
// Make sure to set DATABASE_URL environment variable first

const { neon } = require('@neondatabase/serverless');

async function runMigration() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error('ERROR: DATABASE_URL environment variable is not set');
    console.log('Usage: DATABASE_URL=your_connection_string node run-company-events-migration.js');
    process.exit(1);
  }

  const sql = neon(databaseUrl);

  console.log('Running company_events migration...');

  try {
    // Create company_events table
    await sql`
      CREATE TABLE IF NOT EXISTS company_events (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        event_date DATE NOT NULL,
        event_type VARCHAR(50) DEFAULT 'other',
        created_by UUID REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✓ company_events table created');

    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_company_events_date ON company_events(event_date)`;
    console.log('✓ Index on event_date created');

    await sql`CREATE INDEX IF NOT EXISTS idx_company_events_type ON company_events(event_type)`;
    console.log('✓ Index on event_type created');

    console.log('\n✅ Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
