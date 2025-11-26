require('dotenv').config();
const { sql } = require('@vercel/postgres');

async function setupFundraisingCMS() {
  try {
    console.log('🔧 Setting up CMS structure for Fundraising pages...\n');

    // Step 1: Check current menu ordering issue
    console.log('1️⃣ Checking menu ordering...');
    const allPages = await sql`
      SELECT id, slug, title, menu_label, menu_order, show_in_menu, parent_page_id
      FROM pages
      WHERE show_in_menu = true
      ORDER BY COALESCE(parent_page_id::text, ''), menu_order, slug
    `;

    console.log('\nCurrent menu structure:');
    const parentPages = allPages.rows.filter(p => !p.parent_page_id);
    const childPages = allPages.rows.filter(p => p.parent_page_id);

    parentPages.forEach(p => {
      console.log(`  [${p.menu_order}] ${p.menu_label || p.title} (${p.slug})`);
      const children = childPages.filter(c => c.parent_page_id === p.id);
      children.forEach(c => {
        console.log(`    └─ [${c.menu_order}] ${c.menu_label || c.title} (${c.slug})`);
      });
    });

    // Step 2: Fix the duplicate menu_order issue
    console.log('\n\n2️⃣ Fixing menu ordering for child pages...');

    // Child pages shouldn't appear in main menu, only parent should
    const childPagesToHide = await sql`
      UPDATE pages
      SET show_in_menu = false
      WHERE parent_page_id IS NOT NULL
      RETURNING slug, title
    `;

    if (childPagesToHide.rows.length > 0) {
      console.log(`   ✓ Hidden ${childPagesToHide.rows.length} child pages from main menu`);
      childPagesToHide.rows.forEach(p => {
        console.log(`     - ${p.title} (${p.slug})`);
      });
    }

    // Step 3: Get fundraising page IDs
    console.log('\n\n3️⃣ Creating page sections for fundraising pages...');

    const fundraisingPages = await sql`
      SELECT id, slug, title
      FROM pages
      WHERE parent_page_id IN (SELECT id FROM pages WHERE slug = 'fundraising')
      ORDER BY menu_order
    `;

    console.log(`   Found ${fundraisingPages.rows.length} fundraising pages`);

    // Step 4: Create page sections for each fundraising page
    for (const page of fundraisingPages.rows) {
      console.log(`\n   Processing: ${page.title} (${page.slug})`);

      // Check if page already has sections
      const existingSections = await sql`
        SELECT COUNT(*) as count
        FROM page_sections
        WHERE page_id = ${page.id}
      `;

      if (existingSections.rows[0].count > 0) {
        console.log(`     ℹ Already has ${existingSections.rows[0].count} section(s)`);
        continue;
      }

      // Create page_content section (like other pages)
      const result = await sql`
        INSERT INTO page_sections (
          page_id,
          section_key,
          section_type,
          title,
          content,
          order_index,
          is_active
        ) VALUES (
          ${page.id},
          'page_content',
          'page_content',
          ${page.title + ' Page Content'},
          '{"tabs": []}'::jsonb,
          0,
          true
        )
        RETURNING id, section_key, title
      `;

      console.log(`     ✓ Created section: ${result.rows[0].title}`);
    }

    // Step 5: Update layout template to 'standard' (like other pages)
    console.log('\n\n4️⃣ Updating layout templates...');
    const templateUpdate = await sql`
      UPDATE pages
      SET layout_template = 'standard'
      WHERE parent_page_id IN (SELECT id FROM pages WHERE slug = 'fundraising')
        AND layout_template != 'standard'
      RETURNING slug, title
    `;

    if (templateUpdate.rows.length > 0) {
      console.log(`   ✓ Updated ${templateUpdate.rows.length} pages to 'standard' layout`);
    }

    // Step 6: Verify final structure
    console.log('\n\n5️⃣ Final verification...');
    const finalCheck = await sql`
      SELECT p.slug, p.title, p.layout_template,
             (SELECT COUNT(*) FROM page_sections ps WHERE ps.page_id = p.id) as section_count
      FROM pages p
      WHERE p.parent_page_id IN (SELECT id FROM pages WHERE slug = 'fundraising')
      ORDER BY p.menu_order
    `;

    console.log('\nFundraising pages summary:');
    finalCheck.rows.forEach(p => {
      console.log(`  ✓ ${p.title} (${p.slug})`);
      console.log(`    - Layout: ${p.layout_template}`);
      console.log(`    - Sections: ${p.section_count}`);
    });

    console.log('\n✅ CMS setup complete!');
    console.log('\nNext steps:');
    console.log('1. Check the CMS admin at http://localhost:5174/admin/pages');
    console.log('2. Each fundraising page should now have a "Page Sections" area');
    console.log('3. Add content sections through the CMS interface');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

setupFundraisingCMS();
