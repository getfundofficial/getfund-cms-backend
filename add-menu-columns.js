require('dotenv').config();
const { sql } = require('@vercel/postgres');

async function addMenuColumns() {
  try {
    console.log('🚀 Adding menu configuration columns to pages table...\n');

    // Add menu-related columns
    await sql`
      ALTER TABLE pages 
      ADD COLUMN IF NOT EXISTS show_in_menu BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS menu_order INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS menu_label VARCHAR(100),
      ADD COLUMN IF NOT EXISTS is_cta_button BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS parent_page_id UUID REFERENCES pages(id) ON DELETE CASCADE
    `;
    
    console.log('✓ Added columns: show_in_menu, menu_order, menu_label, is_cta_button, parent_page_id\n');

    // Set initial menu configuration based on current pages
    const menuConfig = [
      { slug: 'who-we-are', show_in_menu: true, menu_order: 1, menu_label: 'WHO WE ARE' },
      { slug: 'what-we-do', show_in_menu: true, menu_order: 2, menu_label: 'WHAT WE DO' },
      { slug: 'impact', show_in_menu: true, menu_order: 3, menu_label: 'IMPACT' },
      { slug: 'news', show_in_menu: true, menu_order: 4, menu_label: 'NEWS & UPDATES' },
      { slug: 'resources', show_in_menu: true, menu_order: 5, menu_label: 'RESOURCES' },
      { slug: 'support-us', show_in_menu: true, menu_order: 6, menu_label: 'SUPPORT US' },
      { slug: 'contact', show_in_menu: false, menu_order: 0, menu_label: 'CONTACT US', is_cta_button: true }
    ];

    console.log('📝 Setting initial menu configuration...\n');

    for (const config of menuConfig) {
      const result = await sql`
        UPDATE pages 
        SET 
          show_in_menu = ${config.show_in_menu},
          menu_order = ${config.menu_order},
          menu_label = ${config.menu_label},
          is_cta_button = ${config.is_cta_button || false}
        WHERE slug = ${config.slug}
        RETURNING slug, menu_label
      `;
      
      if (result.rows.length > 0) {
        console.log(`   ✓ Configured: ${result.rows[0].slug} → "${result.rows[0].menu_label}"`);
      }
    }

    console.log('\n✅ Menu configuration complete!');
    console.log('\n📋 Summary:');
    console.log('   - 6 items in main menu');
    console.log('   - 1 CTA button (Contact Us)');
    console.log('   - Pages can now be reordered and toggled for menu display');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

addMenuColumns()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('💥 Failed:', error);
    process.exit(1);
  });
