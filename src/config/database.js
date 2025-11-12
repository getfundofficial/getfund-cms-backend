const { Pool } = require('pg');
require('dotenv').config();

// PostgreSQL connection pool (works with local PostgreSQL, Supabase, or Neon)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Use SSL for cloud databases (Supabase, Neon, etc.)
  ssl: process.env.DATABASE_URL?.includes('localhost')
    ? false
    : { rejectUnauthorized: false }
});

// Test database connection
pool.on('connect', () => {
  console.log('✅ Database connected successfully');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected database error:', err);
  process.exit(-1);
});

module.exports = { pool };
