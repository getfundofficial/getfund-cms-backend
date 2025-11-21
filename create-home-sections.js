require('dotenv').config();
const { sql } = require('@vercel/postgres');

async function createHomeSections() {
  try {
    console.log('🚀 Creating individual sections for Home page...\n');

    // Get the home page
    const pageResult = await sql`
      SELECT id FROM pages WHERE slug IN ('home', 'homepage', '')
      ORDER BY id LIMIT 1
    `;

    if (pageResult.rows.length === 0) {
      console.log('❌ home page not found');
      return;
    }

    const pageId = pageResult.rows[0].id;
    console.log('✓ Found home page:', pageId);

    // Get admin user
    const userResult = await sql`
      SELECT id FROM users WHERE role = 'admin' LIMIT 1
    `;
    const userId = userResult.rows[0].id;

    // Delete all existing sections first
    await sql`DELETE FROM page_sections WHERE page_id = ${pageId}`;
    console.log('✓ Cleared existing sections\n');

    const sections = [
      {
        section_key: 'hero_slides',
        section_type: 'hero',
        title: 'Hero Carousel Slides',
        order_index: 0,
        content: {
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
              description: 'GETFund builds and renovates classrooms, science labs, and libraries for a brighter future',
              ctaText: '',
              ctaLink: ''
            },
            {
              image: '/images/scholarship/OME1079.jpg',
              headline: 'Empowering Students Through Scholarships',
              description: 'Financial support for talented Ghanaians to pursue higher education',
              ctaText: '',
              ctaLink: ''
            },
            {
              image: '/images/scholarship/GETFund-Projects-02-768x436.jpg',
              headline: 'Investing in Educational Infrastructure',
              description: 'Modern facilities and safe learning environments for all students',
              ctaText: '',
              ctaLink: ''
            }
          ]
        }
      },
      {
        section_key: 'about_getfund',
        section_type: 'text',
        title: 'About GETFund Section',
        order_index: 1,
        content: {
          aboutTitle: 'Empowering Ghana Through Education',
          aboutSubtitle: 'Building Brighter Futures',
          aboutDescription: 'Since its establishment in 2000, the Ghana Education Trust Fund (GETFund) has been transforming Ghana\'s educational landscape. We supplement Government efforts in providing educational infrastructure and facilities at all levels of education.',
          aboutStats: [
            {
              number: '24 Years',
              label: 'Of Excellence',
              description: 'Serving Ghana since 2000'
            },
            {
              number: '5,000+',
              label: 'Institutions',
              description: 'Schools and facilities supported'
            },
            {
              number: 'GH₵8B+',
              label: 'Total Investment',
              description: 'In education infrastructure'
            },
            {
              number: '150,000+',
              label: 'Beneficiaries',
              description: 'Students supported through scholarships'
            }
          ],
          aboutImage: '/images/about/getfund-building.jpg',
          aboutImageAlt: 'GETFund educational infrastructure',
          aboutGETFundHeading: 'About GETFund',
          relevantFactors: [
            'Promotion of the study of Mathematics, Science and Technology',
            'Advancement of female education',
            'Reduction in the high level of illiteracy in historically disadvantaged areas',
            'Promotion of Vocational, Technical Education and Training',
            'Equitable allocation of funds to the Districts at the Pre-Tertiary level of education'
          ],
          ctaText: 'Learn More About Us',
          ctaLink: '/who-we-are'
        }
      },
      {
        section_key: 'vision_mission',
        section_type: 'text',
        title: 'Vision & Mission',
        order_index: 2,
        content: {
          vision: {
            title: 'Our Vision',
            description: 'To become a leading education trust fund in Africa, ensuring quality and accessible education for all Ghanaians'
          },
          mission: {
            title: 'Our Mission',
            description: 'To mobilize and manage financial resources for the provision and expansion of educational infrastructure at all levels of education in Ghana'
          },
          coreValues: {
            title: 'Our Core Values',
            description: 'Integrity, transparency, excellence, and commitment to transforming lives through education'
          }
        }
      },
      {
        section_key: 'news_updates',
        section_type: 'text',
        title: 'News & Updates Section',
        order_index: 3,
        content: {
          newsTitle: 'Latest News & Updates',
          newsSubtitle: 'Stay informed about our latest projects, initiatives, and impact across Ghana'
        }
      }
    ];

    console.log('📝 Creating sections...\n');

    for (const section of sections) {
      await sql`
        INSERT INTO page_sections (
          page_id,
          section_key,
          section_type,
          title,
          content,
          order_index,
          is_active,
          created_by,
          updated_by
        ) VALUES (
          ${pageId},
          ${section.section_key},
          ${section.section_type},
          ${section.title},
          ${JSON.stringify(section.content)}::jsonb,
          ${section.order_index},
          true,
          ${userId},
          ${userId}
        )
      `;
      console.log(`   ✓ Created: ${section.title}`);
    }

    console.log('\n✅ All sections created successfully!');
    console.log('\n📋 Home page now has these editable sections:');
    sections.forEach((s, i) => {
      console.log(`   ${i + 1}. ${s.title} (${s.section_type})`);
    });

  } catch (error) {
    console.error('\n❌ Error:', error);
    throw error;
  }
}

createHomeSections()
  .then(() => {
    console.log('\n🎉 Complete! Refresh the CMS to see all sections.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Failed:', error);
    process.exit(1);
  });
