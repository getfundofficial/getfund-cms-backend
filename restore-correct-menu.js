require('dotenv').config();
const { sql } = require('@vercel/postgres');

async function restoreCorrectMenu() {
  try {
    console.log('🔧 Restoring Correct Menu Structure...\n');

    console.log('📋 Target Menu Structure:');
    console.log('1. WHO WE ARE');
    console.log('2. WHAT WE DO');
    console.log('3. OUR WORK & IMPACT');
    console.log('4. NEWS & UPDATES');
    console.log('5. RESOURCES');
    console.log('6. FUNDRAISING (dropdown)');
    console.log('   ├─ Why Fundraising?');
    console.log('   ├─ Ways to donate');
    console.log('   ├─ Partnerships');
    console.log('   ├─ Beneficiaries Give back');
    console.log('   └─ Events');
    console.log('7. [DONATE] (button)\n');

    // Step 1: Update main menu items with correct labels and order
    console.log('1️⃣ Updating main menu items...\n');

    const menuUpdates = [
      { slug: 'who-we-are', label: 'WHO WE ARE', order: 0, show: true },
      { slug: 'what-we-do', label: 'WHAT WE DO', order: 1, show: true },
      { slug: 'impact', label: 'OUR WORK & IMPACT', order: 2, show: true },
      { slug: 'news', label: 'NEWS & UPDATES', order: 3, show: true },
      { slug: 'resources', label: 'RESOURCES', order: 4, show: true },
      { slug: 'fundraising', label: 'FUNDRAISING', order: 5, show: true },
    ];

    for (const item of menuUpdates) {
      const result = await sql`
        UPDATE pages
        SET
          menu_label = ${item.label},
          menu_order = ${item.order},
          show_in_menu = ${item.show},
          parent_page_id = NULL
        WHERE slug = ${item.slug}
        RETURNING slug, menu_label, menu_order, show_in_menu
      `;

      if (result.rows.length > 0) {
        const row = result.rows[0];
        console.log(`   ✓ ${row.slug} → "${row.menu_label}" (order: ${row.menu_order})`);
      } else {
        console.log(`   ⚠️  Page not found: ${item.slug}`);
      }
    }

    // Step 2: Hide pages that shouldn't be in main menu
    console.log('\n2️⃣ Hiding pages from main menu...\n');

    const pagesToHide = ['support-us', 'contact', 'home', 'fundraising-campaigns'];

    for (const slug of pagesToHide) {
      await sql`
        UPDATE pages
        SET show_in_menu = false
        WHERE slug = ${slug}
      `;
      console.log(`   ✓ Hidden: ${slug}`);
    }

    // Step 3: Set up Fundraising dropdown children
    console.log('\n3️⃣ Setting up Fundraising dropdown...\n');

    // Get fundraising parent ID
    const fundraisingParent = await sql`
      SELECT id FROM pages WHERE slug = 'fundraising'
    `;

    if (fundraisingParent.rows.length === 0) {
      console.log('   ⚠️  Fundraising parent page not found!');
    } else {
      const fundraisingId = fundraisingParent.rows[0].id;

      const fundraisingChildren = [
        { slug: 'why-fundraising', label: 'Why Fundraising?', order: 0 },
        { slug: 'ways-to-donate', label: 'Ways to donate', order: 1 },
        { slug: 'partnerships', label: 'Partnerships', order: 2 },
        { slug: 'beneficiaries-give-back', label: 'Beneficiaries Give back', order: 3 },
        { slug: 'events', label: 'Events', order: 4 },
      ];

      for (const child of fundraisingChildren) {
        const result = await sql`
          UPDATE pages
          SET
            parent_page_id = ${fundraisingId},
            menu_label = ${child.label},
            menu_order = ${child.order},
            show_in_menu = false
          WHERE slug = ${child.slug}
          RETURNING slug, menu_label
        `;

        if (result.rows.length > 0) {
          console.log(`   ✓ ${result.rows[0].slug} → "${result.rows[0].menu_label}"`);
        } else {
          console.log(`   ⚠️  Child page not found: ${child.slug}`);
        }
      }
    }

    // Step 4: Update Header fallback menu in code
    console.log('\n4️⃣ Note: You should also update the fallback menu in Header.tsx\n');
    console.log('   The fallback menu (lines 27-42 and 47-62) should match this structure.');
    console.log('   This ensures correct display even when backend is offline.\n');

    // Step 5: Verify final structure
    console.log('5️⃣ Verifying final menu structure...\n');

    const allMenuItems = await sql`
      SELECT
        p.id,
        p.slug,
        p.title,
        p.menu_label,
        p.menu_order,
        p.show_in_menu,
        p.parent_page_id
      FROM pages p
      WHERE p.is_active = true
        AND (p.show_in_menu = true OR p.parent_page_id IS NOT NULL)
      ORDER BY p.menu_order ASC
    `;

    const parents = allMenuItems.rows.filter(r => !r.parent_page_id && r.show_in_menu);
    const children = allMenuItems.rows.filter(r => r.parent_page_id);

    console.log('✅ Final Menu Structure:\n');
    console.log('========================\n');

    parents.forEach((item, idx) => {
      console.log(`${idx + 1}. ${item.menu_label || item.title}`);

      const itemChildren = children.filter(c => c.parent_page_id === item.id);
      if (itemChildren.length > 0) {
        console.log('   (dropdown):');
        itemChildren.sort((a, b) => a.menu_order - b.menu_order);
        itemChildren.forEach(child => {
          console.log(`   • ${child.menu_label || child.title}`);
        });
      }
    });

    console.log(`\n${parents.length + 1}. DONATE (button - in Header component)\n`);

    console.log('✅ Menu structure restored successfully!');
    console.log('\n📋 Next steps:');
    console.log('   1. Make sure backend is running: cd getfund-cms-backend && npm run dev');
    console.log('   2. Test the menu API: curl http://localhost:5000/api/menu');
    console.log('   3. Refresh your frontend at http://localhost:5173/');
    console.log('   4. Menu should now show: WHO WE ARE, WHAT WE DO, etc.');
    console.log('\n💡 Optional: Update the fallback menu in getfund-website/src/components/Header.tsx');
    console.log('   to match this structure (lines 27-42 and 47-62)');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

restoreCorrectMenu()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('💥 Failed:', error);
    process.exit(1);
  });
