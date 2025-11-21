require('dotenv').config();
const { sql } = require('@vercel/postgres');

async function cleanupAllPages() {
  try {
    console.log('🧹 Cleaning up all page sections...\n');

    const pages = ['home', 'what-we-do', 'resources'];
    
    for (const slug of pages) {
      console.log(`\n📄 Processing ${slug} page...`);
      
      // Get the page
      const pageResult = await sql`
        SELECT id FROM pages WHERE slug = ${slug}
      `;

      if (pageResult.rows.length === 0) {
        console.log(`   ⚠️  ${slug} page not found`);
        continue;
      }

      const pageId = pageResult.rows[0].id;

      // Get all sections
      const sectionsResult = await sql`
        SELECT id, section_key, section_type, title 
        FROM page_sections 
        WHERE page_id = ${pageId}
      `;

      console.log(`   Current: ${sectionsResult.rows.length} sections`);

      // Delete all sections EXCEPT page_content
      const deleteResult = await sql`
        DELETE FROM page_sections 
        WHERE page_id = ${pageId} 
        AND section_key != 'page_content'
        RETURNING section_key
      `;

      if (deleteResult.rows.length > 0) {
        console.log(`   ✓ Deleted ${deleteResult.rows.length} old sections`);
      } else {
        console.log(`   ℹ️  No old sections to delete`);
      }

      // Verify
      const remaining = await sql`
        SELECT section_key FROM page_sections WHERE page_id = ${pageId}
      `;
      console.log(`   ✅ Now has ${remaining.rows.length} section (page_content only)`);
    }

    console.log('\n🎉 All pages cleaned up!');
    console.log('   Each page now has only one page_content section with all structured content.');

  } catch (error) {
    console.error('\n❌ Error:', error);
    throw error;
  }
}

cleanupAllPages()
  .then(() => {
    console.log('\n✅ Complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Failed:', error);
    process.exit(1);
  });
