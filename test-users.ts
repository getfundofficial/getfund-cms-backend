import { query } from './lib/db';

async function testUsers() {
  try {
    const result = await query(`
      SELECT id, email, full_name, role
      FROM users
      WHERE role = 'admin'
      LIMIT 5
    `);

    console.log('Admin users:');
    console.log(JSON.stringify(result.rows, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
  process.exit(0);
}

testUsers();
