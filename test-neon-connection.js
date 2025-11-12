require('dotenv').config();
const { sql } = require('@vercel/postgres');

// Test using sql query directly

async function testConnection() {
  try {
    console.log('Testing Neon database connection...\n');
    
    const result = await sql`SELECT NOW() as now, version() as version`;
    
    console.log('✅ Database connection successful!\n');
    console.log('Server time:', result.rows[0].now);
    console.log('PostgreSQL version:', result.rows[0].version.substring(0, 50) + '...');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Database connection failed:\n');
    console.error('Error:', error.message);
    
    process.exit(1);
  }
}

testConnection();
