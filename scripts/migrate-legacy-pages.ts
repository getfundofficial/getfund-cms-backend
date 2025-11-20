/**
 * Migration Script: Convert Legacy Page Content to New Section Structure
 *
 * This script converts pages stored in the `content` table with legacy JSON content
 * to the new `pages` and `page_sections` table structure.
 */

import { query } from '../lib/db';

async function migrateLegacyPages() {
  console.log('🔄 Starting legacy page migration...\n');

  try {
    // Get all pages from content table
    const contentPages = await query(`
      SELECT id, title, slug, body, excerpt, created_at, updated_at, created_by
      FROM content
      WHERE type = 'page' AND status = 'published'
    `);

    console.log(`Found ${contentPages.rows.length} legacy pages to migrate\n`);

    for (const contentPage of contentPages.rows) {
      console.log(`Migrating: ${contentPage.title} (${contentPage.slug})`);

      // Parse the legacy content structure
      let legacyContent;
      try {
        legacyContent = typeof contentPage.body === 'string'
          ? JSON.parse(contentPage.body)
          : contentPage.body;
      } catch (e) {
        console.error(`  ❌ Failed to parse content for ${contentPage.slug}`);
        continue;
      }

      // Check if page already exists in pages table
      const existingPage = await query(
        'SELECT id FROM pages WHERE slug = $1',
        [contentPage.slug]
      );

      let pageId;

      if (existingPage.rows.length > 0) {
        pageId = existingPage.rows[0].id;
        console.log(`  ✓ Page already exists in pages table`);
      } else {
        // Create new page record
        const newPage = await query(`
          INSERT INTO pages (
            slug, title, meta_title, meta_description,
            is_active, layout_template, created_by, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          RETURNING id
        `, [
          contentPage.slug,
          contentPage.title,
          contentPage.title,
          contentPage.excerpt || `Learn about ${contentPage.title}`,
          true,
          'standard',
          contentPage.created_by,
          contentPage.created_at,
          contentPage.updated_at
        ]);

        pageId = newPage.rows[0].id;
        console.log(`  ✓ Created page record`);
      }

      // Check if sections already exist
      const existingSections = await query(
        'SELECT COUNT(*) as count FROM page_sections WHERE page_id = $1',
        [pageId]
      );

      if (existingSections.rows[0].count > 0) {
        console.log(`  ⚠ Sections already exist, skipping section creation`);
        continue;
      }

      // Create sections from legacy content
      let sectionOrder = 0;

      // Create Hero Section if exists
      if (legacyContent.hero) {
        await query(`
          INSERT INTO page_sections (
            page_id, section_key, section_type, title, content,
            order_index, is_active, created_by
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [
          pageId,
          'hero-section',
          'hero',
          legacyContent.hero.title,
          JSON.stringify({
            title: legacyContent.hero.title,
            subtitle: legacyContent.hero.subtitle || '',
            backgroundImage: legacyContent.hero.backgroundImage || null
          }),
          sectionOrder++,
          true,
          contentPage.created_by
        ]);
        console.log(`  ✓ Created hero section`);
      }

      // Create other sections
      if (legacyContent.sections && Array.isArray(legacyContent.sections)) {
        for (const section of legacyContent.sections) {
          if (section.type === 'text-image') {
            await query(`
              INSERT INTO page_sections (
                page_id, section_key, section_type, title, content,
                order_index, is_active, created_by
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            `, [
              pageId,
              `text-section-${sectionOrder}`,
              'text',
              section.title || '',
              JSON.stringify({
                title: section.title || '',
                subtitle: section.subtitle || '',
                body: section.content || '',
                image: section.image || null,
                imagePosition: 'right'
              }),
              sectionOrder++,
              true,
              contentPage.created_by
            ]);
            console.log(`  ✓ Created text-image section: ${section.title}`);
          } else if (section.type === 'vision-mission') {
            await query(`
              INSERT INTO page_sections (
                page_id, section_key, section_type, title, content,
                order_index, is_active, created_by
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            `, [
              pageId,
              `stats-section-${sectionOrder}`,
              'stats',
              'Our Vision, Mission & Values',
              JSON.stringify({
                items: section.items || []
              }),
              sectionOrder++,
              true,
              contentPage.created_by
            ]);
            console.log(`  ✓ Created vision-mission section`);
          }
        }
      }

      console.log(`  ✅ Migration complete for ${contentPage.slug}\n`);
    }

    console.log('✅ All pages migrated successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

// Run the migration
migrateLegacyPages()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
