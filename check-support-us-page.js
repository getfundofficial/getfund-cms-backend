require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function checkSupportUsPage() {
  try {
    const result = await sql`
      SELECT
        id,
        slug,
        title,
        menu_label,
        menu_order,
        show_in_menu,
        is_cta_button,
        is_active
      FROM pages
      WHERE slug = 'support-us' OR is_cta_button = true
      ORDER BY menu_order
    `;

    console.log('Support Us page data:');
    console.log(JSON.stringify(result, null, 2));

    if (result.length === 0) {
      console.log('\n⚠️  No Support Us page found in database');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

checkSupportUsPage();
