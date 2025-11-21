require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

// Define page_content for each page based on current frontend structure
const pageContents = {
  'who-we-are': {
    // Hero Section
    heroTitle: 'About Us',
    heroSubtitle: 'Supporting the delivery of quality education to Ghanaians from basic to tertiary level',

    // Main Content
    mainImage: '/images/about/getfund-board.jpg',
    mainImageAlt: 'GETFund Board',
    mainHeading: 'Ghana Education Trust Fund',
    redHeading: 'Since its establishment in the year 2000,',
    paragraph1: 'The fund has remained committed to its mandate espoused in its governing legislation, Act 581. The object of the Fund is to provide funding to supplement government\'s effort for the provision of educational infrastructure and facilities at all levels.',
    paragraph2: 'GETFund has since its inception remained a significant player in Ghana\'s education sector not only by way of providing physical infrastructure, but also through the enhancement of our human capital, awarding scholarships to many deserving citizens.',

    // Mission, Vision, Values
    vision: {
      title: 'Our Vision',
      description: 'To become a leading education trust fund in Africa, ensuring quality and accessible education for all Ghanaians'
    },
    mission: {
      title: 'Our Mission',
      description: 'To mobilize and manage financial resources for the provision and expansion of educational infrastructure at all levels of education in Ghana'
    },
    values: {
      title: 'Our Values',
      description: 'Integrity, transparency, excellence, and commitment to transforming lives through education'
    },

    // Educational Financing
    financingTitle: 'The Issue of Educational Financing',
    costSharingPolicy: 'Currently in Ghana, due to government\'s inability to solely sustain tertiary education efforts, the cost of self financing has been introduced by HEP through the adoption of the discredited to cost sharing NCHE 1998.',
    publicResponsibility: 'Notwithstanding all cost sharing options/variable cost options available from the public, the policy will not only politicize and elaborate Ghanaians but it is central capable of reaching their full purpose of HEP promotion if the purpose of HEP funding is not adequately equalized by the government.',

    // Funding Formula
    fundingFormulaTitle: 'Funding Formula',
    fundingFormulaIntro: 'The law establishing GETFund further emphasizes a distribution formula that must be approved by Parliament each year, requiring that some crucial factors related to education delivery and development are considered in the process of preparing the Formula. These relevant factors should include but not limited to:',
    relevantFactors: [
      'promotion of the study of Mathematics, Science and Technology',
      'advancement of female education',
      'reduction in the high level of illiteracy in historically disadvantaged areas',
      'promotion of Vocational, Technical Education and Training',
      'equitable allocation of funds to the Districts at the Pre-Tertiary level of education'
    ],

    // Leadership & Governance
    leadershipTitle: 'Leadership & Governance',
    leadershipSubtitle: 'Strong leadership and transparent governance for educational transformation',
    boardImage: '/images/about/getfund-board.jpg',
    boardTitle: 'Committed Board of Directors',
    boardDescription: 'Our experienced board of directors includes all spheres of education, finance, and public administration to guide GETFund\'s strategic direction and ensure accountability to all our initiatives.',
    boardCommitments: [
      { title: 'Strategic Direction', description: 'Setting priorities and overseeing implementation' },
      { title: 'Performance Monitoring', description: 'Ensuring all projects achieve educational outcomes' },
      { title: 'Stakeholder Engagement', description: 'Building partnerships for educational success' }
    ],

    // Footer Message
    footerMessage: 'Supporting the delivery of quality education.'
  },

  'impact': {
    // Hero Section
    heroTitle: 'Our Impact',
    heroSubtitle: 'Transforming lives and communities through quality education across Ghana',

    // Impact Statistics
    statsTitle: 'Our Impact in Numbers',
    statsSubtitle: 'Measurable results that showcase our commitment to educational excellence',
    stats: [
      { number: '5,000+', label: 'Schools Supported', description: 'Educational institutions nationwide', icon: 'building' },
      { number: '2M+', label: 'Students Reached', description: 'Beneficiaries of our programs', icon: 'users' },
      { number: '50+', label: 'Infrastructure Projects', description: 'Completed and ongoing', icon: 'trending-up' },
      { number: '16', label: 'Regions Covered', description: 'Nationwide impact', icon: 'award' },
      { number: '15,000+', label: 'Scholarships Awarded', description: 'Supporting academic excellence', icon: 'graduation-cap' },
      { number: 'GHS 5B+', label: 'Total Investment', description: 'Since establishment', icon: 'trending-up' }
    ],

    // Impact Stories
    storiesTitle: 'Stories of Impact',
    storiesSubtitle: 'Real people, real transformations, real futures',
    stories: [
      {
        id: '1',
        name: 'Akosua Mensah',
        story: 'GETFund scholarship enabled me to pursue medical studies abroad. Now I\'m back serving my community as a doctor.',
        image: '/images/impact/student-1.jpg',
        category: 'Scholarship Beneficiary'
      },
      {
        id: '2',
        name: 'Kofi Asante',
        story: 'The new science laboratory at our school has transformed how we teach and learn. Students are now excelling in STEM subjects.',
        image: '/images/impact/teacher-1.jpg',
        category: 'Teacher'
      },
      {
        id: '3',
        name: 'Ama Owusu',
        story: 'Thanks to GETFund\'s infrastructure support, our school now has modern classrooms and a library. Enrollment has doubled!',
        image: '/images/impact/principal-1.jpg',
        category: 'School Principal'
      }
    ],

    // Achievements Timeline
    achievementsTitle: 'Key Achievements',
    achievementsSubtitle: 'Milestones in our journey to transform education in Ghana',
    achievements: [
      { year: '2000', title: 'GETFund Established', description: 'Ghana Education Trust Fund established by Act of Parliament (Act 581) to provide supplementary funding for education.' },
      { year: '2005', title: '1,000 Schools Supported', description: 'Reached milestone of supporting infrastructure development in 1,000 schools across Ghana.' },
      { year: '2010', title: 'International Scholarship Program', description: 'Launched comprehensive international scholarship program for postgraduate studies.' },
      { year: '2015', title: 'STEM Initiative', description: 'Major investment in Science, Technology, Engineering, and Mathematics education infrastructure.' },
      { year: '2020', title: 'Digital Learning', description: 'Implemented digital learning infrastructure to support education during pandemic and beyond.' },
      { year: '2024', title: '5,000+ Schools Milestone', description: 'Celebrated supporting over 5,000 educational institutions nationwide with 2M+ student beneficiaries.' }
    ],

    // Regional Impact
    regionalTitle: 'Regional Impact',
    regionalSubtitle: 'Ensuring equitable distribution of educational resources across all regions',
    regions: [
      { name: 'Greater Accra', schools: 850, students: 425000, projects: 12 },
      { name: 'Ashanti Region', schools: 920, students: 460000, projects: 15 },
      { name: 'Northern Region', schools: 680, students: 340000, projects: 10 },
      { name: 'Western Region', schools: 520, students: 260000, projects: 8 }
    ],

    // Call to Action
    ctaTitle: 'Be Part of Our Impact Story',
    ctaDescription: 'Join us in transforming education and creating opportunities for future generations',
    ctaButtonText: 'Support Our Mission',
    ctaButtonLink: '/support-us'
  },

  'resources': {
    // Hero Section
    heroTitle: 'Resources & Publications',
    heroSubtitle: 'Access our comprehensive collection of reports, policies, research studies, and strategic documents that showcase Ghana\'s educational development journey.',

    // Stats
    stats: {
      documentsAvailable: 50,
      policyDocuments: 15,
      researchStudies: 25,
      annualReports: 12
    },

    // Annual Reports
    annualReportsTitle: 'Annual Reports',
    annualReportsDescription: 'Comprehensive yearly summaries of our activities, achievements, and financial performance',

    // Policies & Guidelines
    policiesGuidelinesTitle: 'Policies & Guidelines',
    policiesGuidelinesDescription: 'Official policies, guidelines, and frameworks governing our operations and programs',

    // Research & Studies
    researchStudiesTitle: 'Research & Studies',
    researchStudiesDescription: 'In-depth research studies and impact assessments of our educational initiatives',

    // Strategic Publications
    strategicPublicationsTitle: 'Strategic Publications',
    strategicPublicationsDescription: 'Strategic plans, frameworks, and roadmaps for Ghana\'s educational development',

    // Newsletter Subscription
    newsletterTitle: 'Stay Updated with Our Latest Publications',
    newsletterSubtitle: 'Subscribe to our newsletter to receive notifications about new reports, policies, and research studies as published.',
    newsletterPlaceholder: 'Enter your email address',
    newsletterButtonText: 'Subscribe',
    newsletterFooterText: 'Need help finding a specific document?',
    newsletterContactEmail: 'info@getfund.gov.gh',
    newsletterContactPhone: '+233 (0)302 664 928-930'
  }
};

async function createPageContentSections() {
  try {
    console.log('Creating page_content sections for Who We Are, Impact, and Resources pages...\n');

    // Get admin user
    const adminUser = await sql`
      SELECT id FROM users WHERE email = 'admin@getfund.gov.gh' LIMIT 1;
    `;

    if (adminUser.length === 0) {
      console.error('✗ Admin user not found');
      process.exit(1);
    }

    const userId = adminUser[0].id;

    // Process each page
    for (const [slug, content] of Object.entries(pageContents)) {
      console.log(`\nProcessing page: ${slug}`);

      // Get page ID
      const page = await sql`
        SELECT id FROM pages WHERE slug = ${slug} LIMIT 1;
      `;

      if (page.length === 0) {
        console.log(`  ✗ Page "${slug}" not found, skipping...`);
        continue;
      }

      const pageId = page[0].id;

      // Check if page_content section exists
      const existing = await sql`
        SELECT id FROM page_sections
        WHERE page_id = ${pageId}
          AND section_type = 'page_content'
        LIMIT 1;
      `;

      if (existing.length > 0) {
        // Update existing
        await sql`
          UPDATE page_sections
          SET content = ${JSON.stringify(content)}::jsonb,
              updated_at = NOW(),
              updated_by = ${userId}
          WHERE id = ${existing[0].id};
        `;
        console.log(`  ✓ Updated existing page_content section`);
      } else {
        // Create new
        await sql`
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
            ${slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} || ' Page Content',
            ${JSON.stringify(content)}::jsonb,
            0,
            true,
            ${userId},
            ${userId},
            NOW(),
            NOW()
          );
        `;
        console.log(`  ✓ Created new page_content section`);
      }
    }

    console.log('\n✓ All page_content sections created/updated successfully!');
  } catch (error) {
    console.error('Error creating page_content sections:', error);
    process.exit(1);
  }
}

createPageContentSections();
