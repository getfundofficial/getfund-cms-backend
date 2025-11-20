/**
 * Get first user ID from database
 */

const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function getUser() {
  const users = await sql`SELECT id, email FROM users LIMIT 1`;
  if (users.length > 0) {
    console.log(`User ID: ${users[0].id}`);
    console.log(`Email: ${users[0].email}`);
  } else {
    console.log('No users found');
  }
}

getUser();
