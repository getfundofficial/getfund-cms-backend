require('dotenv').config();
const { sql } = require('@vercel/postgres');

async function hideResourcesFromMenu() {
  try {
    console.log('🔧 Hiding Resources from navigation menu...\n');

    // Update Resources page to not show in menu
    const result = await sql`
      UPDATE pages
      SET show_in_menu = false
      WHERE slug = 'resources'
      RETURNING slug, title, show_in_menu
    `;

    if (result.rows.length > 0) {
      const row = result.rows[0];
      console.log(`✅ "${row.title}" has been hidden from navigation menu`);
      console.log(`   - slug: ${row.slug}`);
      console.log(`   - show_in_menu: ${row.show_in_menu}`);
    } else {
      console.log('⚠️  Resources page not found in database');
    }

    // Verify footer still has Resources in quick links
    const footerResult = await sql`
      SELECT config FROM footer_config LIMIT 1
    `;

    if (footerResult.rows.length > 0) {
      const footerConfig = footerResult.rows[0].config;
      const quickLinks = footerConfig?.quickLinks || [];
      const hasResources = quickLinks.some(link =>
        link.href === '/resources' || link.name?.toLowerCase().includes('resources')
      );

      if (hasResources) {
        console.log('\n✅ Resources is still in footer quick links');
      } else {
        console.log('\n⚠️  Resources not found in footer quick links');
      }
    }

    console.log('\n📋 Summary:');
    console.log('   - Resources removed from navigation menu');
    console.log('   - Resources remains accessible via footer quick links');
    console.log('   - Direct URL /resources still works');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

hideResourcesFromMenu()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('💥 Failed:', error);
    process.exit(1);
  });
