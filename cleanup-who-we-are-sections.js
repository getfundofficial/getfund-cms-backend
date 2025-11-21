require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function cleanupWhoWeAreSections() {
  try {
    console.log('Cleaning up redundant sections from Who We Are page...\n');

    // Get the who-we-are page ID
    const page = await sql`
      SELECT id, title FROM pages WHERE slug = 'who-we-are' LIMIT 1;
    `;

    if (page.length === 0) {
      console.error('✗ Who We Are page not found');
      process.exit(1);
    }

    const pageId = page[0].id;
    console.log(`Found page: ${page[0].title} (${pageId})\n`);

    // Section keys to delete (everything except page_content)
    const sectionsToDelete = [
      'hero',
      'ghana_education_trust_fund',
      'vision_mission_values',
      'educational_financing',
      'funding_formula',
      'leadership_governance',
      'footer_cta'
    ];

    console.log('Deleting redundant sections:');

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
        console.log(`  ⊘ Not found: ${sectionKey}`);
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

    console.log('\n✓ Cleanup completed successfully!');
  } catch (error) {
    console.error('Error cleaning up sections:', error);
    process.exit(1);
  }
}

cleanupWhoWeAreSections();
