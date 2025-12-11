require('dotenv').config();
const { sql } = require('@vercel/postgres');

async function fixHomePageData() {
  try {
    console.log('🚀 Fixing Home Page Data...\n');

    // Step 1: Check if home page exists
    console.log('1️⃣ Checking if home page exists...');
    const homePage = await sql`
      SELECT id, slug, title, layout_template, is_active
      FROM pages
      WHERE slug = 'home'
    `;

    let pageId;

    if (homePage.rows.length === 0) {
      console.log('   ℹ️  Home page does not exist, creating it...');

      const newPage = await sql`
        INSERT INTO pages (
          slug,
          title,
          meta_title,
          meta_description,
          layout_template,
          is_active,
          show_in_menu,
          menu_order
        ) VALUES (
          'home',
          'Home',
          'GETFund Ghana - Empowering Education',
          'Ghana Education Trust Fund (GETFund) provides financial resources for educational development across Ghana.',
          'home',
          true,
          false,
          0
        )
        RETURNING id, slug, title
      `;

      pageId = newPage.rows[0].id;
      console.log(`   ✓ Created home page (ID: ${pageId})\n`);
    } else {
      pageId = homePage.rows[0].id;
      console.log(`   ✓ Home page exists (ID: ${pageId})`);
      console.log(`     - Layout: ${homePage.rows[0].layout_template}`);
      console.log(`     - Active: ${homePage.rows[0].is_active}\n`);

      // Update layout template if needed
      if (homePage.rows[0].layout_template !== 'home') {
        await sql`
          UPDATE pages
          SET layout_template = 'home'
          WHERE id = ${pageId}
        `;
        console.log('   ✓ Updated layout_template to "home"\n');
      }
    }

    // Step 2: Check existing sections
    console.log('2️⃣ Checking existing sections...');
    const existingSections = await sql`
      SELECT id, section_key, section_type, title
      FROM page_sections
      WHERE page_id = ${pageId}
      ORDER BY order_index
    `;

    console.log(`   Found ${existingSections.rows.length} existing section(s):`);
    existingSections.rows.forEach(s => {
      console.log(`     - ${s.section_key} (${s.section_type})`);
    });
    console.log('');

    // Step 3: Create/Update hero_slides section
    console.log('3️⃣ Creating/Updating hero_slides section...');

    const heroSlidesContent = {
      slides: [
        {
          image: '/images/hero/main-slider-3.jpg',
          headline: 'Every Ghanaian Child Deserves the Opportunity to be Educated',
          description: 'Supporting the delivery of quality education to Ghanaians from basic to tertiary level',
          ctaText: 'Apply for Scholarship',
          ctaLink: '/scholarship-apply'
        },
        {
          image: '/images/hero/main-slider-1.jpg',
          headline: 'Transforming Schools Across Ghana',
          description: 'GETFund builds and renovates classrooms, science labs, and libraries for a brighter future.',
          ctaText: '',
          ctaLink: ''
        },
        {
          image: '/images/scholarship/GETFund-Projects-02-768x436.jpg',
          headline: 'Investing in Educational Infrastructure',
          description: 'Modern facilities and safe learning environments for all students.',
          ctaText: '',
          ctaLink: ''
        },
        {
          image: '/images/scholarship/OME1079.jpg',
          headline: 'Empowering Students Through Scholarships',
          description: 'Financial support for talented Ghanaians to pursue higher education.',
          ctaText: '',
          ctaLink: ''
        },
        {
          image: '/images/infrastructure/school-building.jpg',
          headline: 'Building the Future of Ghana',
          description: 'GETFund is committed to sustainable growth in the education sector.',
          ctaText: '',
          ctaLink: ''
        }
      ]
    };

    const existingHeroSection = existingSections.rows.find(s => s.section_key === 'hero_slides');

    if (existingHeroSection) {
      await sql`
        UPDATE page_sections
        SET
          content = ${JSON.stringify(heroSlidesContent)},
          is_active = true,
          updated_at = NOW()
        WHERE id = ${existingHeroSection.id}
      `;
      console.log('   ✓ Updated existing hero_slides section\n');
    } else {
      await sql`
        INSERT INTO page_sections (
          page_id,
          section_key,
          section_type,
          title,
          content,
          order_index,
          is_active
        ) VALUES (
          ${pageId},
          'hero_slides',
          'hero',
          'Hero Slides',
          ${JSON.stringify(heroSlidesContent)},
          0,
          true
        )
      `;
      console.log('   ✓ Created new hero_slides section\n');
    }

    // Step 4: Create/Update vision_mission section
    console.log('4️⃣ Creating/Updating vision_mission section...');

    const visionMissionContent = {
      mission: {
        title: 'Our Mission',
        description: 'To mobilize and manage financial resources for the provision and expansion of educational infrastructure at all levels of education in Ghana'
      },
      vision: {
        title: 'Our Vision',
        description: 'To be a leading education trust fund in Africa, ensuring quality and accessible education for all Ghanaians'
      },
      coreValues: {
        title: 'Core Values',
        description: 'Integrity, transparency, excellence, and commitment to transforming lives through education'
      }
    };

    const existingVisionSection = existingSections.rows.find(s => s.section_key === 'vision_mission');

    if (existingVisionSection) {
      await sql`
        UPDATE page_sections
        SET
          content = ${JSON.stringify(visionMissionContent)},
          is_active = true,
          updated_at = NOW()
        WHERE id = ${existingVisionSection.id}
      `;
      console.log('   ✓ Updated existing vision_mission section\n');
    } else {
      await sql`
        INSERT INTO page_sections (
          page_id,
          section_key,
          section_type,
          title,
          content,
          order_index,
          is_active
        ) VALUES (
          ${pageId},
          'vision_mission',
          'page_content',
          'Vision & Mission',
          ${JSON.stringify(visionMissionContent)},
          1,
          true
        )
      `;
      console.log('   ✓ Created new vision_mission section\n');
    }

    // Step 5: Create/Update about_getfund section
    console.log('5️⃣ Creating/Updating about_getfund section...');

    const aboutGetfundContent = {
      aboutTitle: 'Empowering Ghana Through Education',
      aboutSubtitle: 'Building Brighter Futures',
      aboutDescription: 'The Ghana Education Trust Fund (GETFund) is a statutory body established to provide financial resources for educational development. Since our inception in 2000, we have remained committed to supplementing government efforts in providing educational infrastructure and facilities at all levels.',
      aboutStats: [
        {
          number: '5000+',
          label: 'Scholarships Awarded',
          description: 'Supporting talented students'
        },
        {
          number: '200+',
          label: 'Schools Built',
          description: 'Across all regions'
        },
        {
          number: '1000+',
          label: 'Infrastructure Projects',
          description: 'Completed nationwide'
        }
      ],
      aboutImage: '/images/about/getfund-building.jpg',
      aboutImageAlt: 'GETFund Office Building',
      ctaText: 'Learn More About Us',
      ctaLink: '/who-we-are',
      aboutGETFundHeading: 'About GETFund',
      relevantFactors: [
        'Established by Act 581 in 2000',
        'Funded through a 2.5% VAT levy',
        'Supports all levels of education',
        'Provides scholarships and infrastructure'
      ]
    };

    const existingAboutSection = existingSections.rows.find(s => s.section_key === 'about_getfund');

    if (existingAboutSection) {
      await sql`
        UPDATE page_sections
        SET
          content = ${JSON.stringify(aboutGetfundContent)},
          is_active = true,
          updated_at = NOW()
        WHERE id = ${existingAboutSection.id}
      `;
      console.log('   ✓ Updated existing about_getfund section\n');
    } else {
      await sql`
        INSERT INTO page_sections (
          page_id,
          section_key,
          section_type,
          title,
          content,
          order_index,
          is_active
        ) VALUES (
          ${pageId},
          'about_getfund',
          'page_content',
          'About GETFund',
          ${JSON.stringify(aboutGetfundContent)},
          2,
          true
        )
      `;
      console.log('   ✓ Created new about_getfund section\n');
    }

    // Step 6: Create/Update news_updates section
    console.log('6️⃣ Creating/Updating news_updates section...');

    const newsUpdatesContent = {
      newsTitle: 'Latest News & Updates',
      newsSubtitle: 'Stay informed about our latest projects, events, and educational initiatives across Ghana'
    };

    const existingNewsSection = existingSections.rows.find(s => s.section_key === 'news_updates');

    if (existingNewsSection) {
      await sql`
        UPDATE page_sections
        SET
          content = ${JSON.stringify(newsUpdatesContent)},
          is_active = true,
          updated_at = NOW()
        WHERE id = ${existingNewsSection.id}
      `;
      console.log('   ✓ Updated existing news_updates section\n');
    } else {
      await sql`
        INSERT INTO page_sections (
          page_id,
          section_key,
          section_type,
          title,
          content,
          order_index,
          is_active
        ) VALUES (
          ${pageId},
          'news_updates',
          'page_content',
          'News & Updates',
          ${JSON.stringify(newsUpdatesContent)},
          3,
          true
        )
      `;
      console.log('   ✓ Created new news_updates section\n');
    }

    // Step 7: Verify final structure
    console.log('7️⃣ Verifying final structure...');
    const finalSections = await sql`
      SELECT section_key, section_type, order_index, is_active
      FROM page_sections
      WHERE page_id = ${pageId}
      ORDER BY order_index
    `;

    console.log('\n✅ Final Home Page Structure:');
    console.log(`   Page ID: ${pageId}`);
    console.log(`   Sections (${finalSections.rows.length}):`);
    finalSections.rows.forEach(s => {
      console.log(`     ${s.order_index}. ${s.section_key} (${s.section_type}) - ${s.is_active ? 'Active' : 'Inactive'}`);
    });

    console.log('\n✅ Home page data fixed successfully!');
    console.log('\n📋 Next steps:');
    console.log('   1. Make sure backend server is running: cd getfund-cms-backend && npm run dev');
    console.log('   2. Make sure frontend server is running: cd getfund-website && npm run dev');
    console.log('   3. Visit http://localhost:5173/ to see the homepage');
    console.log('   4. Check browser console for any errors');
    console.log('   5. Verify hero carousel is displaying with 5 slides');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixHomePageData()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('💥 Failed:', error);
    process.exit(1);
  });
