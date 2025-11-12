const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  password: 'password',
  host: 'localhost',
  port: 5432,
  database: 'getfund_cms'
});

async function addImages() {
  try {
    console.log('📸 Adding images to news articles...\n');

    // Update each article with its corresponding image
    const updates = [
      {
        slug: 'getfund-commences-accelerated-infrastructure-program-at-ambariya-schools',
        image: '/images/recent-projects/ambariya.png'
      },
      {
        slug: 'getfund-kicks-off-multi-project-construction-in-northern-region',
        image: '/images/recent-projects/nobisco.png'
      },
      {
        slug: 'nr-getfund-launches-major-infrastructure-expansion-at-ghana-shs',
        image: '/images/recent-projects/ghanasco.png'
      }
    ];

    for (const update of updates) {
      const result = await pool.query(
        `UPDATE content
         SET featured_image_url = $1, updated_at = NOW()
         WHERE slug = $2
         RETURNING title, featured_image_url`,
        [update.image, update.slug]
      );

      if (result.rows.length > 0) {
        console.log(`✅ Updated: ${result.rows[0].title}`);
        console.log(`   Image: ${result.rows[0].featured_image_url}\n`);
      } else {
        console.log(`⚠️  Article not found: ${update.slug}\n`);
      }
    }

    console.log('🎉 Images added successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to add images:', error);
    process.exit(1);
  }
}

addImages();
