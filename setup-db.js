const readline = require('readline');
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const dbConnectionString = "postgresql://neondb_owner:npg_PS1tijL0ZpfA@ep-royal-hall-ad0djgcp-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require"

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function testConnection(password) {
  const pool = new Pool({
    //connectionString: `postgresql://postgres:${password}@localhost:5432/postgres`,
    connectionString: dbConnectionString,
    ssl: false
  });

  try {
    await pool.query('SELECT 1');
    await pool.end();
    return true;
  } catch (error) {
    await pool.end();
    return false;
  }
}

async function setup() {
  console.log('🔧 PostgreSQL Connection Setup\n');
  console.log('Let\'s find your PostgreSQL password and set up the database.\n');

  // Try common passwords first
  const commonPasswords = ['postgres', 'admin', 'root', 'password', ''];

  console.log('Testing common passwords...');
  for (const pwd of commonPasswords) {
    process.stdout.write(`  Trying "${pwd || '(empty)'}"... `);
    if (await testConnection(pwd)) {
      console.log('✅ Success!\n');
      return pwd;
    }
    console.log('❌');
  }

  console.log('\n❌ Common passwords didn\'t work.');
  console.log('Please enter your PostgreSQL password (set during installation):\n');

  let password = await question('PostgreSQL password: ');

  console.log('\nTesting connection...');
  if (await testConnection(password)) {
    console.log('✅ Connection successful!\n');
    return password;
  } else {
    console.log('❌ Connection failed with that password.\n');
    console.log('Please check your PostgreSQL installation and try again.');
    console.log('You can also reset the password using:');
    console.log('  psql -U postgres');
    console.log('  ALTER USER postgres PASSWORD \'your_new_password\';');
    return null;
  }
}

async function updateEnvFile(password) {
  const envPath = path.join(__dirname, '.env');
  let envContent = fs.readFileSync(envPath, 'utf8');

  const newUrl = `postgresql://postgres:${password}@localhost:5432/getfund_cms`;
  envContent = envContent.replace(
    /DATABASE_URL=postgresql:\/\/postgres:.*@localhost:5432\/getfund_cms/,
    `DATABASE_URL=${newUrl}`
  );

  fs.writeFileSync(envPath, envContent);
  console.log('✅ Updated .env file with correct password\n');
}

async function createDatabase(password) {
  const pool = new Pool({
    connectionString: dbConnectionString,
    ssl: false
  });

  try {
    // Check if database exists
    const result = await pool.query(
      "SELECT 1 FROM pg_database WHERE datname = 'getfund_cms'"
    );

    if (result.rows.length === 0) {
      console.log('Creating database "getfund_cms"...');
      await pool.query('CREATE DATABASE getfund_cms');
      console.log('✅ Database created\n');
    } else {
      console.log('✅ Database "getfund_cms" already exists\n');
    }

    await pool.end();
    return true;
  } catch (error) {
    console.error('❌ Error creating database:', error.message);
    await pool.end();
    return false;
  }
}

async function main() {
  try {
    const password = await setup();

    if (password === null) {
      process.exit(1);
    }

    await updateEnvFile(password);
    await createDatabase(password);

    console.log('🎉 Setup complete! You can now run:');
    console.log('   npm run migrate');
    console.log('   npm run seed');
    console.log('   npm run dev\n');

    rl.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    rl.close();
    process.exit(1);
  }
}

main();
