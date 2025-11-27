const { Pool } = require('pg');
require('dotenv').config();

// Create database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://neondb_owner:npg_PS1tijL0ZpfA@ep-royal-hall-ad0djgcp-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require"
});

async function query(text, params) {
  const result = await pool.query(text, params);
  return result;
}

/**
 * Migration Script: Transfer News & Updates Page Content to CMS
 *
 * This script migrates hardcoded text content from the News & Updates page
 * into the CMS database as page_content sections.
 */

async function migrateNewsUpdates() {
  console.log('\nMigrating News & Updates page content...');

  const content = {
    meta: {
      title: "News & Updates | GETFund",
      description: "Stay updated with the latest news, announcements, and stories from GETFund's work in transforming education across Ghana."
    },
    hero: {
      title: "News & Updates",
      subtitle: "Transforming Ghana's educational landscape through strategic investments and partnerships"
    },
    sidebar: {
      searchLabel: "Search",
      searchPlaceholder: "Search articles...",
      recentPostsLabel: "Recent Posts",
      categoriesLabel: "Categories"
    },
    emptyState: {
      noArticlesMessage: "No articles found matching your criteria."
    }
  };

  // First, ensure the news page exists
  const pageResult = await query(`
    INSERT INTO pages (slug, title, meta_title, meta_description, is_active, layout_template)
    VALUES ('news', 'News & Updates', $1, $2, true, 'default')
    ON CONFLICT (slug) DO UPDATE
    SET meta_title = $1, meta_description = $2, updated_at = NOW()
    RETURNING id
  `, [content.meta.title, content.meta.description]);

  console.log('   ✓ News & Updates page created/updated');

  // Now insert/update the page content section
  const result = await query(`
    INSERT INTO page_sections (page_id, section_key, section_type, title, content, order_index, is_active)
    SELECT id, 'page_content', 'page_content', 'Page Content', $1::jsonb, 1, true
    FROM pages WHERE slug = 'news'
    ON CONFLICT (page_id, section_key) DO UPDATE
    SET content = $1::jsonb, updated_at = NOW()
    RETURNING id
  `, [JSON.stringify(content)]);

  console.log('   ✓ News & Updates page content migrated');
  return result;
}

async function main() {
  console.log('========================================');
  console.log('News & Updates Page Content Migration');
  console.log('========================================');

  try {
    await migrateNewsUpdates();

    console.log('\n========================================');
    console.log('✅ Migration completed successfully!');
    console.log('========================================\n');

    console.log('Next steps:');
    console.log('1. Create NewsUpdatesEditor.tsx component');
    console.log('2. Update SectionEditorPage.tsx to load the editor');
    console.log('3. Update NewsPage.tsx to fetch content from CMS');
    console.log('4. Test the CMS editor at http://localhost:5176/admin');

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run migration
main();
