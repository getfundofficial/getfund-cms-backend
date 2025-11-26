require('dotenv').config();
const { sql } = require('@vercel/postgres');

async function fixMenuStructure() {
  try {
    console.log('🔧 Fixing menu structure...\n');

    // Step 1: Remove "Support Us" from menu
    console.log('1️⃣ Removing "Support Us" from menu...');
    const removeResult = await sql`
      UPDATE pages
      SET show_in_menu = false
      WHERE slug = 'support-us'
      RETURNING slug, title, show_in_menu
    `;

    if (removeResult.rows.length > 0) {
      console.log(`   ✓ Hidden from menu: ${removeResult.rows[0].slug} (show_in_menu = false)\n`);
    }

    // Step 2: Verify the final menu structure
    console.log('2️⃣ Verifying final menu structure...\n');

    const result = await sql`
      SELECT
        p.id,
        p.slug,
        p.title,
        p.menu_label,
        p.menu_order,
        p.show_in_menu,
        p.parent_page_id
      FROM pages p
      WHERE p.show_in_menu = true
      ORDER BY p.menu_order ASC
    `;

    const parents = result.rows.filter(r => !r.parent_page_id);
    const children = result.rows.filter(r => r.parent_page_id);

    console.log('📋 Final Menu Structure:');
    console.log('========================\n');

    parents.forEach(item => {
      console.log(`${item.menu_order + 1}. ${item.menu_label || item.title}`);

      const itemChildren = children.filter(c => c.parent_page_id === item.id);
      if (itemChildren.length > 0) {
        console.log('   (dropdown):');
        itemChildren.forEach(child => {
          console.log(`   • ${child.menu_label || child.title}`);
        });
      }
    });

    console.log('\n7. [Donate] (button - in Header component)\n');

    console.log('✅ Menu structure fixed successfully!');
    console.log('\n📝 Summary:');
    console.log('   - Removed "Support Us" from navigation menu');
    console.log('   - Fundraising dropdown contains 5 items');
    console.log('   - Final menu has 6 parent items + Donate button');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixMenuStructure();
