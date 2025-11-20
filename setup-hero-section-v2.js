require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

// Default hero slides from the website
const defaultHeroSlides = [
  {
    title: "Every Ghanaian Child Deserves the Opportunity to be Educated",
    subtitle: "Supporting the delivery of quality education to Ghanaians from basic to tertiary level",
    imageUrl: "/images/hero/main-slider-3.jpg",
    buttonText: "Apply for Scholarship",
    buttonLink: "/scholarship-apply",
    order: 0,
    isActive: true
  },
  {
    title: "Transforming Schools Across Ghana",
    subtitle: "GETFund builds and renovates classrooms, science labs, and libraries for a brighter future.",
    imageUrl: "/images/hero/main-slider-1.jpg",
    buttonText: "",
    buttonLink: "",
    order: 1,
    isActive: true
  },
  {
    title: "Investing in Educational Infrastructure",
    subtitle: "Modern facilities and safe learning environments for all students.",
    imageUrl: "/images/scholarship/GETFund-Projects-02-768x436.jpg",
    buttonText: "",
    buttonLink: "",
    order: 2,
    isActive: true
  },
  {
    title: "Empowering Students Through Scholarships",
    subtitle: "Financial support for talented Ghanaians to pursue higher education.",
    imageUrl: "/images/scholarship/OME1079.jpg",
    buttonText: "",
    buttonLink: "",
    order: 3,
    isActive: true
  },
  {
    title: "Building the Future of Ghana",
    subtitle: "GETFund is committed to sustainable growth in the education sector.",
    imageUrl: "/images/infrastructure/school-building.jpg",
    buttonText: "",
    buttonLink: "",
    order: 4,
    isActive: true
  }
];

async function setupHeroSection() {
  try {
    console.log('🚀 Setting up Hero Section...\n');

    // Step 1: Get or create admin user
    console.log('👤 Getting admin user...');
    const admin = await sql`SELECT id FROM users WHERE role = 'admin' LIMIT 1`;

    if (admin.length === 0) {
      throw new Error('No admin user found. Please run seed script first.');
    }
    const adminId = admin[0].id;
    console.log('✓ Admin user found');

    // Step 2: Create or get home page
    console.log('\n📄 Setting up home page...');
    let homePage = await sql`SELECT id FROM pages WHERE slug = 'home'`;

    if (homePage.length === 0) {
      console.log('  Creating home page...');
      homePage = await sql`
        INSERT INTO pages (
          slug,
          title,
          meta_title,
          meta_description,
          is_active,
          created_by,
          updated_by
        ) VALUES (
          'home',
          'Home',
          'GETFund - Ghana Education Trust Fund',
          'Supporting quality education in Ghana from basic to tertiary level',
          true,
          ${adminId},
          ${adminId}
        )
        RETURNING id
      `;
      console.log('  ✓ Home page created');
    } else {
      console.log('  ✓ Home page already exists');
    }

    const pageId = homePage[0].id;

    // Step 3: Create or get hero section
    console.log('\n🎨 Setting up hero section...');
    let heroSection = await sql`
      SELECT id FROM page_sections
      WHERE page_id = ${pageId} AND section_key = 'hero'
    `;

    let sectionId;
    if (heroSection.length === 0) {
      console.log('  Creating hero section...');
      heroSection = await sql`
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
          '{"autoplay": true, "interval": 5000}'::jsonb
        )
        RETURNING id
      `;
      sectionId = heroSection[0].id;
      console.log('  ✓ Hero section created');
    } else {
      sectionId = heroSection[0].id;
      console.log('  ✓ Hero section already exists');
    }

    // Step 4: Update hero section with slides data
    console.log('\n📸 Adding hero slides to section content...');

    const slidesData = {
      slides: defaultHeroSlides.map(slide => ({
        title: slide.title,
        subtitle: slide.subtitle,
        imageUrl: slide.imageUrl,
        buttonText: slide.buttonText,
        buttonLink: slide.buttonLink,
        order: slide.order,
        isActive: slide.isActive
      }))
    };

    await sql`
      UPDATE page_sections
      SET content = ${JSON.stringify(slidesData)}::jsonb,
          updated_at = NOW()
      WHERE id = ${sectionId}
    `;

    console.log(`  ✓ Added ${defaultHeroSlides.length} slides to hero section`);

    console.log('\n✅ Hero section setup completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`   Page ID: ${pageId}`);
    console.log(`   Section ID: ${sectionId}`);
    console.log(`   Slides added: ${defaultHeroSlides.length}`);
    console.log('\n💡 Next steps:');
    console.log('   1. Navigate to: http://localhost:5174/admin/pages');
    console.log('   2. Click on the "Home" page');
    console.log('   3. You should see the "Hero Banner" section with all slides');

  } catch (error) {
    console.error('\n❌ Setup failed:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

setupHeroSection();
