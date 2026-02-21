/**
 * Seed Scholarship Sub-Pages in CMS
 * Creates page entries and sets up menu hierarchy so Scholarships appears
 * as a dropdown with 4 children in the website navigation.
 *
 * Run: node scripts/seed-scholarship-pages.js
 * Requires: DATABASE_URL (from .env.production)
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env.production') });
const { Client } = require('pg');

const SCHOLARSHIP_CHILDREN = [
  {
    slug: 'scholarships/overview',
    title: 'Programme Overview',
    meta_title: 'Programme Overview | GETFund Scholarships',
    meta_description: 'GETFund Scholarship Programme - Empowering Ghanaian students through postgraduate and undergraduate scholarships.',
    menu_label: 'Programme Overview',
    menu_order: 1,
  },
  {
    slug: 'scholarships/partner-universities',
    title: 'Partner Universities',
    meta_title: 'Partner Universities | GETFund Scholarships',
    meta_description: 'GETFund partner universities across the UK and USA providing world-class education for Ghanaian scholars.',
    menu_label: 'Partner Universities',
    menu_order: 2,
  },
  {
    slug: 'scholarships/how-to-apply',
    title: 'How to Apply',
    meta_title: 'How to Apply | GETFund Scholarships',
    meta_description: 'Learn how to apply for GETFund scholarships - eligibility requirements, application procedure, required documents.',
    menu_label: 'How to Apply',
    menu_order: 3,
  },
  {
    slug: 'scholarships/getfund-scholars',
    title: 'GETFund Scholars',
    meta_title: 'GETFund Scholars | Ghana Education Trust Fund',
    meta_description: 'Browse the database of GETFund scholarship beneficiaries - over 16,000 scholars empowered across 14+ years.',
    menu_label: 'GETFund Scholars',
    menu_order: 4,
  },
];

async function main() {
  console.log('=== Seed Scholarship Pages ===\n');

  const client = new Client({
    connectionString: process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  console.log('Connected to database\n');

  // 1. Find or verify the parent "scholarships" page exists
  let parentResult = await client.query(
    "SELECT id FROM pages WHERE slug = 'scholarships'"
  );

  let parentId;
  if (parentResult.rows.length > 0) {
    parentId = parentResult.rows[0].id;
    console.log(`Found existing "scholarships" page: ${parentId}`);

    // Update it to show in menu
    await client.query(`
      UPDATE pages SET show_in_menu = true, menu_order = 3, menu_label = 'Scholarships'
      WHERE id = $1
    `, [parentId]);
    console.log('  Updated menu settings for parent page');
  } else {
    // Create the parent page
    const insertResult = await client.query(`
      INSERT INTO pages (slug, title, meta_title, meta_description, is_active, layout_template, show_in_menu, menu_order, menu_label)
      VALUES ('scholarships', 'Scholarships', 'Scholarships | Ghana Education Trust Fund', 'GETFund Scholarship Programme', true, 'scholarships', true, 3, 'Scholarships')
      RETURNING id
    `);
    parentId = insertResult.rows[0].id;
    console.log(`Created "scholarships" parent page: ${parentId}`);
  }

  // 2. Create child pages
  let created = 0;
  let skipped = 0;

  for (const child of SCHOLARSHIP_CHILDREN) {
    const existing = await client.query(
      'SELECT id FROM pages WHERE slug = $1',
      [child.slug]
    );

    if (existing.rows.length > 0) {
      console.log(`  SKIP: "${child.slug}" already exists`);
      // Still update parent_page_id and menu settings
      await client.query(`
        UPDATE pages SET
          parent_page_id = $1,
          show_in_menu = true,
          menu_order = $2,
          menu_label = $3
        WHERE slug = $4
      `, [parentId, child.menu_order, child.menu_label, child.slug]);
      skipped++;
      continue;
    }

    await client.query(`
      INSERT INTO pages (slug, title, meta_title, meta_description, is_active, layout_template, show_in_menu, menu_order, menu_label, parent_page_id)
      VALUES ($1, $2, $3, $4, true, 'default', true, $5, $6, $7)
    `, [child.slug, child.title, child.meta_title, child.meta_description, child.menu_order, child.menu_label, parentId]);

    created++;
    console.log(`  Created: "${child.slug}" (menu_order: ${child.menu_order})`);
  }

  await client.end();

  console.log(`\n=== Done ===`);
  console.log(`Created: ${created}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Parent:  ${parentId}`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
