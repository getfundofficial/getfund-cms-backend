require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function migrateHeroSlides() {
  try {
    console.log('🔄 Starting hero slides migration...\n');

    // Step 1: Get existing hero slides from content table
    console.log('📝 Fetching existing hero slides...');
    const heroSlides = await sql`
      SELECT id, title, slug, excerpt, body, featured_image_url, status, created_by, created_at
      FROM content
      WHERE type = 'hero_slide' AND deleted_at IS NULL
      ORDER BY created_at ASC
    `;

    console.log(`✓ Found ${heroSlides.length} hero slides\n`);

    if (heroSlides.length === 0) {
      console.log('ℹ️  No hero slides to migrate. Exiting.');
      return;
    }

    // Step 2: Create or get home page
    console.log('📄 Checking for home page...');
    let homePage = await sql`
      SELECT id FROM pages WHERE slug = 'home'
    `;

    if (homePage.length === 0) {
      console.log('📄 Creating home page...');
      const admin = await sql`SELECT id FROM users WHERE role = 'admin' LIMIT 1`;
      const adminId = admin[0]?.id;

      homePage = await sql`
        INSERT INTO pages (slug, title, meta_title, meta_description, is_active, created_by, updated_by)
        VALUES ('home', 'Home', 'GETFund - Home', 'Ghana Education Trust Fund', true, ${adminId}, ${adminId})
        RETURNING id
      `;
      console.log('✓ Home page created');
    } else {
      console.log('✓ Home page exists');
    }

    const pageId = homePage[0].id;

    // Step 3: Check if hero section already exists
    console.log('\n📦 Checking for existing hero section...');
    const existingSection = await sql`
      SELECT id FROM page_sections
      WHERE page_id = ${pageId} AND section_key = 'hero'
    `;

    let sectionId;
    if (existingSection.length === 0) {
      console.log('📦 Creating hero section...');
      const section = await sql`
        INSERT INTO page_sections (
          page_id,
          section_key,
          title,
          section_type,
          display_order,
          is_active,
          settings
        ) VALUES (
          ${pageId},
          'hero',
          'Hero Banner',
          'hero',
          0,
          true,
          '{"autoplay": true, "interval": 5000}'
        )
        RETURNING id
      `;
      sectionId = section[0].id;
      console.log('✓ Hero section created');
    } else {
      sectionId = existingSection[0].id;
      console.log('✓ Hero section exists');
    }

    // Step 4: Migrate each hero slide as section content
    console.log('\n🎨 Migrating hero slides to section content...');
    let migratedCount = 0;

    for (const slide of heroSlides) {
      try {
        // Parse body to get button text and link if available
        let buttonText = 'Learn More';
        let buttonLink = '#';

        if (slide.body) {
          try {
            const bodyData = JSON.parse(slide.body);
            if (bodyData.buttonText) buttonText = bodyData.buttonText;
            if (bodyData.buttonLink) buttonLink = bodyData.buttonLink;
          } catch (e) {
            // Body is not JSON, treat as description
          }
        }

        const contentData = {
          title: slide.title,
          subtitle: slide.excerpt || '',
          description: typeof slide.body === 'string' && !slide.body.startsWith('{') ? slide.body : '',
          imageUrl: slide.featured_image_url || '',
          buttonText: buttonText,
          buttonLink: buttonLink,
          order: migratedCount
        };

        await sql`
          INSERT INTO page_section_content (
            section_id,
            content_data,
            display_order,
            is_active
          ) VALUES (
            ${sectionId},
            ${JSON.stringify(contentData)},
            ${migratedCount},
            ${slide.status === 'published'}
          )
        `;

        console.log(`  ✓ Migrated: ${slide.title}`);
        migratedCount++;
      } catch (error) {
        console.error(`  ✗ Failed to migrate: ${slide.title}`, error.message);
      }
    }

    console.log(`\n✅ Migration completed!`);
    console.log(`   Migrated: ${migratedCount}/${heroSlides.length} slides`);
    console.log(`   Page ID: ${pageId}`);
    console.log(`   Section ID: ${sectionId}`);
    console.log('\n💡 Next steps:');
    console.log('   1. Restart your backend server');
    console.log('   2. Navigate to Pages → Home in the CMS');
    console.log('   3. You should see your hero slides in the Hero Banner section');

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

migrateHeroSlides();
