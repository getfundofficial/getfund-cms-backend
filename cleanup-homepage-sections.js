require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function cleanupHomepageSections() {
  try {
    console.log('Cleaning up homepage sections...\n');

    // Get the home page ID
    const homePage = await sql`
      SELECT id FROM pages WHERE slug = 'home' LIMIT 1;
    `;

    if (homePage.length === 0) {
      console.error('✗ Home page not found');
      process.exit(1);
    }

    const pageId = homePage[0].id;

    // List current sections
    console.log('Current homepage sections:');
    const currentSections = await sql`
      SELECT section_key, section_type, title
      FROM page_sections
      WHERE page_id = ${pageId}
      ORDER BY order_index;
    `;
    currentSections.forEach(s => {
      console.log(`  - ${s.title} (${s.section_type}, ${s.section_key})`);
    });

    // Delete the 4 redundant sections
    const sectionsToDelete = ['hero_slides', 'about_getfund', 'vision_mission', 'news_updates'];

    console.log('\nDeleting redundant sections:');
    for (const sectionKey of sectionsToDelete) {
      const result = await sql`
        DELETE FROM page_sections
        WHERE page_id = ${pageId}
          AND section_key = ${sectionKey}
        RETURNING section_key, title;
      `;

      if (result.length > 0) {
        console.log(`  ✓ Deleted: ${result[0].title} (${result[0].section_key})`);
      } else {
        console.log(`  - Section not found: ${sectionKey}`);
      }
    }

    // List remaining sections
    console.log('\nRemaining homepage sections:');
    const remainingSections = await sql`
      SELECT section_key, section_type, title
      FROM page_sections
      WHERE page_id = ${pageId}
      ORDER BY order_index;
    `;
    remainingSections.forEach(s => {
      console.log(`  - ${s.title} (${s.section_type}, ${s.section_key})`);
    });

    console.log('\n✓ Homepage cleanup completed successfully!');
  } catch (error) {
    console.error('Error cleaning up homepage:', error);
    process.exit(1);
  }
}

cleanupHomepageSections();
