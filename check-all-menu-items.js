require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function checkAllMenuItems() {
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
      WHERE is_active = true
        AND show_in_menu = true
      ORDER BY menu_order ASC
    `;

    console.log('All menu items that will be shown:');
    console.log('===============================\n');

    result.forEach((item, index) => {
      console.log(`${index + 1}. ${item.menu_label || item.title}`);
      console.log(`   Slug: ${item.slug}`);
      console.log(`   Order: ${item.menu_order}`);
      console.log(`   CTA Button: ${item.is_cta_button}`);
      console.log('');
    });

    console.log(`Total: ${result.length} items`);
  } catch (error) {
    console.error('Error:', error);
  }
}

checkAllMenuItems();
