require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function cleanupPageSections() {
  try {
    console.log('Cleaning up redundant sections from multiple pages...\n');

    const pagesToClean = [
      {
        slug: 'impact',
        sectionsToDelete: ['hero', 'stats', 'gallery', 'text', 'cta']
      },
      {
        slug: 'resources',
        sectionsToDelete: ['hero', 'stats', 'gallery', 'cta']
      },
      {
        slug: 'support-us',
        sectionsToDelete: ['hero', 'text']
      }
    ];

    for (const pageConfig of pagesToClean) {
      console.log(`\n${'='.repeat(80)}`);
      console.log(`Processing: ${pageConfig.slug.toUpperCase()}`);
      console.log('='.repeat(80));

      // Get the page ID
      const page = await sql`
        SELECT id, title FROM pages WHERE slug = ${pageConfig.slug} LIMIT 1;
      `;

      if (page.length === 0) {
        console.error(`✗ Page not found: ${pageConfig.slug}`);
        continue;
      }

      const pageId = page[0].id;
      console.log(`Found page: ${page[0].title} (${pageId})\n`);

      console.log('Deleting redundant sections:');

      for (const sectionType of pageConfig.sectionsToDelete) {
        const result = await sql`
          DELETE FROM page_sections
          WHERE page_id = ${pageId}
            AND section_type = ${sectionType}
          RETURNING section_key, title, section_type;
        `;

        if (result.length > 0) {
          result.forEach(section => {
            console.log(`  ✓ Deleted: ${section.title} (${section.section_type} - ${section.section_key})`);
          });
        } else {
          console.log(`  ⊘ No sections found with type: ${sectionType}`);
        }
      }

      // Verify what's left
      console.log('\nRemaining sections:');
      const remainingSections = await sql`
        SELECT section_key, title, section_type
        FROM page_sections
        WHERE page_id = ${pageId}
        ORDER BY order_index;
      `;

      if (remainingSections.length === 0) {
        console.log('  ✗ No sections remaining!');
      } else {
        remainingSections.forEach((section, index) => {
          console.log(`  ${index}. ${section.title} (${section.section_type} - ${section.section_key})`);
        });
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log('✓ Cleanup completed successfully for all pages!');
    console.log('='.repeat(80));
  } catch (error) {
    console.error('Error cleaning up sections:', error);
    process.exit(1);
  }
}

cleanupPageSections();
