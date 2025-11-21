require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

const homepageContent = {
  "heroSlides": [
    {
      "image": "/images/hero/main-slider-3.jpg",
      "headline": "Every Ghanaian Child Deserves the Opportunity to be Educated",
      "description": "Supporting the delivery of quality education to Ghanaians from basic to tertiary level",
      "ctaText": "Apply for Scholarship",
      "ctaLink": "/scholarship-apply"
    },
    {
      "image": "/images/hero/main-slider-1.jpg",
      "headline": "Transforming Schools Across Ghana",
      "description": "GETFund builds and renovates classrooms, science labs, and libraries for a brighter future"
    },
    {
      "image": "/images/scholarship/OME1079.jpg",
      "headline": "Empowering Students Through Scholarships",
      "description": "Financial support for talented Ghanaians to pursue higher education"
    },
    {
      "image": "/images/scholarship/GETFund-Projects-02-768x436.jpg",
      "headline": "Investing in Educational Infrastructure",
      "description": "Modern facilities and safe learning environments for all students"
    },
    {
      "image": "/images/infrastructure/school-building.jpg",
      "headline": "Building the Future of Ghana",
      "description": "GETFund is committed to sustainable growth in the education sector"
    }
  ],
  "aboutHeading": "Who We Are",
  "aboutSubheading": "The Ghana Education Trust Fund is a statutory body established to provide financial resources for educational development.",
  "mission": {
    "title": "Our Mission",
    "description": "To mobilize and manage financial resources for the provision and expansion of educational infrastructure at all levels of education in Ghana"
  },
  "vision": {
    "title": "Our Vision",
    "description": "To be a leading education trust fund in Africa, ensuring quality and accessible education for all Ghanaians"
  },
  "coreValues": {
    "title": "Core Values",
    "description": "Integrity, transparency, excellence, and commitment to transforming lives through education"
  },
  "aboutGETFundHeading": "About GETFund",
  "aboutGETFundContent": [
    "Since its establishment in the year 2000, the fund has remained committed to its mandate espoused in its governing legislation, Act 581. The object of the Fund is to provide funding to supplement government's effort for the provision of educational infrastructure and facilities at all levels.",
    "GETFund has since its inception remained a significant player in Ghana's education sector not only by way of providing physical infrastructure, but also through the enhancement of our human capital, awarding scholarships to many deserving citizens.",
    "The law establishing GETFund further emphasizes a distribution formula that must be approved by Parliament each year, requiring that some crucial factors related to education delivery and development are considered in the process of preparing the Formula."
  ],
  "relevantFactors": [
    "Promotion of the study of Mathematics, Science and Technology",
    "Advancement of female education",
    "Reduction in the high level of illiteracy in historically disadvantaged areas",
    "Promotion of Vocational, Technical Education and Training",
    "Equitable allocation of funds to the Districts at the Pre-Tertiary level of education 22"
  ],
  "newsTitle": "News & Updates",
  "newsSubtitle": "Stay updated with the latest developments and achievements from GETFund"
};

async function createHomePageContent() {
  try {
    console.log('Creating/updating homepage page_content section...');

    // Get the admin user ID
    const adminUser = await sql`
      SELECT id FROM users WHERE email = 'admin@getfund.gov.gh' LIMIT 1;
    `;

    if (adminUser.length === 0) {
      console.error('✗ Admin user not found');
      process.exit(1);
    }

    const userId = adminUser[0].id;

    // Get the home page ID
    const homePage = await sql`
      SELECT id FROM pages WHERE slug = 'home' LIMIT 1;
    `;

    if (homePage.length === 0) {
      console.error('✗ Home page not found');
      process.exit(1);
    }

    const pageId = homePage[0].id;

    // Check if page_content section exists
    const existing = await sql`
      SELECT id FROM page_sections
      WHERE page_id = ${pageId}
        AND section_type = 'page_content'
      LIMIT 1;
    `;

    if (existing.length > 0) {
      // Update existing section
      console.log('Updating existing page_content section...');
      const result = await sql`
        UPDATE page_sections
        SET content = ${JSON.stringify(homepageContent)}::jsonb,
            updated_at = NOW(),
            updated_by = ${userId}
        WHERE id = ${existing[0].id}
        RETURNING id, title;
      `;
      console.log('✓ Successfully updated homepage content');
      console.log('  Section ID:', result[0].id);
    } else {
      // Create new section
      console.log('Creating new page_content section...');
      const result = await sql`
        INSERT INTO page_sections (
          id,
          page_id,
          section_key,
          section_type,
          title,
          content,
          order_index,
          is_active,
          created_by,
          updated_by,
          created_at,
          updated_at
        ) VALUES (
          gen_random_uuid(),
          ${pageId},
          'page_content',
          'page_content',
          'Home Page Content',
          ${JSON.stringify(homepageContent)}::jsonb,
          0,
          true,
          ${userId},
          ${userId},
          NOW(),
          NOW()
        )
        RETURNING id, title;
      `;
      console.log('✓ Successfully created homepage content section');
      console.log('  Section ID:', result[0].id);
    }

  } catch (error) {
    console.error('Error creating homepage content:', error);
    process.exit(1);
  }
}

createHomePageContent();
