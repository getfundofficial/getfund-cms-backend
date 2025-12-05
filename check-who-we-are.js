const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function checkWhoWeAre() {
  try {
    const result = await sql`SELECT meta_data FROM content WHERE slug = 'who-we-are'`;
    console.log(JSON.stringify(result[0].meta_data, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
}

checkWhoWeAre();
