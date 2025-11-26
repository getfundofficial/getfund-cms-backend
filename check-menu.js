require('dotenv').config();
const { sql } = require('@vercel/postgres');

async function checkMenu() {
  try {
    console.log('📋 Current Menu Structure in Database:\n');

    const result = await sql`
      SELECT
        p.id,
        p.slug,
        p.title,
        p.menu_label,
        p.menu_order,
        p.show_in_menu,
        p.is_cta_button,
        p.parent_page_id,
        parent.slug as parent_slug
      FROM pages p
      LEFT JOIN pages parent ON p.parent_page_id = parent.id
      WHERE p.show_in_menu = true
      ORDER BY p.menu_order ASC, p.slug ASC
    `;

    const parents = result.rows.filter(r => !r.parent_page_id);
    const children = result.rows.filter(r => r.parent_page_id);

    console.log('Parent Menu Items:');
    parents.forEach(item => {
      console.log(`  ${item.menu_order}. ${item.menu_label || item.title} (slug: ${item.slug})`);

      const itemChildren = children.filter(c => c.parent_page_id === item.id);
      if (itemChildren.length > 0) {
        console.log(`     Dropdown children:`);
        itemChildren.forEach(child => {
          console.log(`       - ${child.menu_label || child.title} (slug: ${child.slug})`);
        });
      }
    });

    console.log('\n✅ Menu structure check complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkMenu();
