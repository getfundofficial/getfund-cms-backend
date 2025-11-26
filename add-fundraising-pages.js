require('dotenv').config();
const { sql } = require('@vercel/postgres');

async function addFundraisingPages() {
  try {
    console.log('🚀 Adding Fundraising navigation pages to database...\n');

    // Step 1: Create Fundraising parent page
    console.log('📝 Creating Fundraising parent page...');
    const fundraisingParent = await sql`
      INSERT INTO pages (slug, title, menu_label, menu_order, show_in_menu, is_cta_button, is_active)
      VALUES ('fundraising', 'Fundraising', 'Fundraising', 5, true, false, true)
      ON CONFLICT (slug) DO UPDATE
      SET menu_label = 'Fundraising', menu_order = 5, show_in_menu = true
      RETURNING id, slug, title
    `;

    const fundraisingId = fundraisingParent.rows[0].id;
    console.log(`   ✓ Created parent: ${fundraisingParent.rows[0].slug} (ID: ${fundraisingId})\n`);

    // Step 2: Create child pages under Fundraising
    console.log('📝 Creating Fundraising child pages...\n');

    const childPages = [
      { slug: 'why-fundraising', title: 'Why Fundraising?', label: 'Why Fundraising?', order: 0 },
      { slug: 'ways-to-donate', title: 'Ways to donate', label: 'Ways to donate', order: 1 },
      { slug: 'partnerships', title: 'Partnerships', label: 'Partnerships', order: 2 },
      { slug: 'beneficiaries-give-back', title: 'Beneficiaries Give back', label: 'Beneficiaries Give back', order: 3 },
      { slug: 'events', title: 'Events', label: 'Events', order: 4 },
    ];

    for (const page of childPages) {
      const result = await sql`
        INSERT INTO pages (slug, title, menu_label, menu_order, show_in_menu, is_active, parent_page_id)
        VALUES (${page.slug}, ${page.title}, ${page.label}, ${page.order}, true, true, ${fundraisingId})
        ON CONFLICT (slug) DO UPDATE
        SET parent_page_id = ${fundraisingId}, menu_order = ${page.order}, show_in_menu = true, menu_label = ${page.label}
        RETURNING slug, title
      `;

      if (result.rows.length > 0) {
        console.log(`   ✓ Created/Updated: ${result.rows[0].slug} → "${result.rows[0].title}"`);
      }
    }

    // Step 3: Update menu order for existing pages
    console.log('\n📝 Updating menu order for existing pages...\n');

    const menuUpdates = [
      { slug: 'who-we-are', order: 0, label: 'Who we are' },
      { slug: 'what-we-do', order: 1, label: 'What we do' },
      { slug: 'impact', order: 2, label: 'Our work & Impact' },
      { slug: 'news', order: 3, label: 'News & updates' },
      { slug: 'resources', order: 4, label: 'Resources' },
    ];

    for (const update of menuUpdates) {
      const result = await sql`
        UPDATE pages
        SET menu_order = ${update.order}, menu_label = ${update.label}, show_in_menu = true
        WHERE slug = ${update.slug}
        RETURNING slug, menu_label, menu_order
      `;

      if (result.rows.length > 0) {
        console.log(`   ✓ Updated: ${result.rows[0].slug} → Order: ${result.rows[0].menu_order}, Label: "${result.rows[0].menu_label}"`);
      }
    }

    console.log('\n✅ Fundraising navigation setup complete!');
    console.log('\n📋 Summary:');
    console.log('   - Created Fundraising parent page (order: 5)');
    console.log('   - Created 5 child pages under Fundraising dropdown');
    console.log('   - Updated existing page menu orders');
    console.log('\n🔗 Navigation structure:');
    console.log('   1. Who we are');
    console.log('   2. What we do');
    console.log('   3. Our work & Impact');
    console.log('   4. News & updates');
    console.log('   5. Resources');
    console.log('   6. Fundraising (dropdown)');
    console.log('      ├─ Why Fundraising?');
    console.log('      ├─ Ways to donate');
    console.log('      ├─ Partnerships');
    console.log('      ├─ Beneficiaries Give back');
    console.log('      └─ Events');
    console.log('   7. Donate (button)');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

addFundraisingPages()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('💥 Failed:', error);
    process.exit(1);
  });
