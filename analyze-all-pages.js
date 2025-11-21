require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function analyzeAllPages() {
  try {
    console.log('Analyzing all pages and their sections...\n');
    console.log('='.repeat(80));

    const pages = await sql`
      SELECT id, slug, title, layout_template, is_active
      FROM pages
      ORDER BY slug;
    `;

    for (const page of pages) {
      console.log(`\nPage: ${page.title}`);
      console.log(`  Slug: ${page.slug}`);
      console.log(`  Template: ${page.layout_template}`);
      console.log(`  Active: ${page.is_active}`);

      const sections = await sql`
        SELECT section_key, section_type, title, is_active, order_index
        FROM page_sections
        WHERE page_id = ${page.id}
        ORDER BY order_index;
      `;

      if (sections.length > 0) {
        console.log('  Sections:');
        sections.forEach(s => {
          const status = s.is_active ? '✓' : '✗';
          console.log(`    ${status} [${s.order_index}] ${s.title || s.section_key} (${s.section_type})`);
        });
      } else {
        console.log('  Sections: None');
      }

      console.log('-'.repeat(80));
    }

    console.log(`\nTotal pages: ${pages.length}`);
  } catch (error) {
    console.error('Error analyzing pages:', error);
    process.exit(1);
  }
}

analyzeAllPages();
