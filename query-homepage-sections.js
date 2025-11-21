require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function queryHomepageSections() {
  try {
    console.log('Querying all homepage sections...\n');

    const sections = await sql`
      SELECT
        id,
        section_key,
        section_type,
        title,
        content
      FROM page_sections
      WHERE page_id = (SELECT id FROM pages WHERE slug = 'home' LIMIT 1)
      ORDER BY order_index
    `;

    sections.forEach((section, index) => {
      console.log(`\n--- Section ${index + 1} ---`);
      console.log(`ID: ${section.id}`);
      console.log(`Section Key: ${section.section_key}`);
      console.log(`Section Type: ${section.section_type}`);
      console.log(`Title: ${section.title}`);

      if (section.content && section.content.heroSlides) {
        console.log(`Hero Slides Count: ${section.content.heroSlides.length}`);
        section.content.heroSlides.forEach((slide, idx) => {
          console.log(`  Slide ${idx + 1}: ${slide.headline}`);
        });
      }

      if (section.section_type === 'page_content') {
        console.log('Page Content Keys:', Object.keys(section.content || {}));
      }
    });

  } catch (error) {
    console.error('Error querying sections:', error);
    process.exit(1);
  }
}

queryHomepageSections();
