const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes('localhost') ? false : {
    rejectUnauthorized: false
  }
});

async function runMigration() {
  try {
    console.log('Running impact stats migration...');
    
    const sqlPath = path.join(__dirname, 'create-impact-stats-tables.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    await pool.query(sql);
    
    console.log('✅ Impact stats tables created successfully');
    console.log('✅ Default stats inserted');
    console.log('✅ Default subtitles configured');
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    await pool.end();
    process.exit(1);
  }
}

runMigration();
