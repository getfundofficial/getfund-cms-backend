const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function createNewsPage() {
  try {
    console.log('🚀 Creating News & Updates page...\n');

    // Get admin user ID
    const adminUser = await pool.query(`SELECT id FROM users WHERE email = 'admin@getfund.gov.gh' LIMIT 1`);
    if (adminUser.rows.length === 0) {
      console.error('❌ Admin user not found');
      return;
    }
    const adminId = adminUser.rows[0].id;

    // Create the News & Updates page
    const pageResult = await pool.query(`
      INSERT INTO pages (
        slug, title, meta_title, meta_description,
        layout_template, show_in_menu, menu_order, menu_label,
        is_active, created_by, updated_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      ON CONFLICT (slug) DO UPDATE SET
        title = EXCLUDED.title,
        meta_title = EXCLUDED.meta_title,
        meta_description = EXCLUDED.meta_description,
        show_in_menu = EXCLUDED.show_in_menu,
        menu_order = EXCLUDED.menu_order,
        menu_label = EXCLUDED.menu_label,
        updated_at = CURRENT_TIMESTAMP
      RETURNING id
    `, [
      'news',
      'News & Updates',
      'News & Updates - GETFund',
      'Stay updated with the latest news, announcements, and developments from GETFund.',
      'generic',
      true,  // show_in_menu
      4,     // menu_order (after Impact, before Resources)
      'NEWS & UPDATES',
      true,
      adminId,
      adminId
    ]);

    const pageId = pageResult.rows[0].id;
    console.log('✅ News & Updates page created\n');

    // Update menu order for pages after position 4
    await pool.query(`
      UPDATE pages 
      SET menu_order = menu_order + 1 
      WHERE show_in_menu = true 
      AND menu_order >= 4 
      AND slug != 'news'
    `);

    console.log('✅ Menu order updated\n');

    // Create a hero section for the page
    await pool.query(`
      INSERT INTO page_sections (
        page_id, section_key, section_type, title, content,
        order_index, is_active, created_by, updated_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (page_id, section_key) DO UPDATE SET
        content = EXCLUDED.content,
        updated_at = CURRENT_TIMESTAMP
    `, [
      pageId,
      'hero',
      'hero',
      'News & Updates Hero',
      JSON.stringify({
        title: 'News & Updates',
        subtitle: 'Stay informed about the latest developments, announcements, and success stories from GETFund',
        backgroundImage: '/images/hero/news-hero.jpg'
      }),
      0,
      true,
      adminId,
      adminId
    ]);

    console.log('✅ Hero section created\n');
    console.log('📋 Current Menu Order:');
    
    const menuItems = await pool.query(`
      SELECT slug, menu_label, menu_order 
      FROM pages 
      WHERE show_in_menu = true 
      ORDER BY menu_order
    `);
    
    menuItems.rows.forEach(item => {
      console.log(`  ${item.menu_order}. ${item.menu_label || item.slug}`);
    });

    console.log('\n✨ News & Updates page is ready! Visit http://localhost:5173/news\n');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

createNewsPage();
