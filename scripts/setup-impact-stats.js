const fs = require('fs');
const path = require('path');
const pool = require('../lib/db');

async function runMigration() {
  try {
    console.log('Running impact stats migration...');
    
    const sqlPath = path.join(__dirname, 'create-impact-stats-tables.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    await pool.query(sql);
    
    console.log('✅ Impact stats tables created successfully');
    console.log('✅ Default stats inserted');
    console.log('✅ Default subtitles configured');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
