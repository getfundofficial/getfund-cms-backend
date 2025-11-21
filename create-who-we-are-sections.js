require('dotenv').config();
const { sql } = require('@vercel/postgres');

async function createWhoWeAreSections() {
  try {
    console.log('🚀 Creating individual sections for Who We Are page...\n');

    // Get the who-we-are page
    const pageResult = await sql`
      SELECT id FROM pages WHERE slug = 'who-we-are'
    `;

    if (pageResult.rows.length === 0) {
      console.log('❌ who-we-are page not found');
      return;
    }

    const pageId = pageResult.rows[0].id;
    console.log('✓ Found who-we-are page:', pageId);

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
        section_key: 'hero',
        section_type: 'hero',
        title: 'Hero Section',
        order_index: 0,
        content: {
          title: 'About Us',
          subtitle: 'Supporting the delivery of quality education to Ghanaians from basic to tertiary level',
          backgroundImage: '/images/hero/education-bg.jpg'
        }
      },
      {
        section_key: 'ghana_education_trust_fund',
        section_type: 'html',
        title: 'Ghana Education Trust Fund',
        order_index: 1,
        content: {
          heading: 'Ghana Education Trust Fund',
          subheading: 'Since its establishment in the year 2000,',
          body: '<p>The fund has remained committed to its mandate espoused in its governing legislation, Act 581. The object of the Fund is to provide funding to supplement government\'s effort for the provision of educational infrastructure and facilities at all levels.</p><p>GETFund has since its inception remained a significant player in Ghana\'s education sector not only by way of providing physical infrastructure, but also through the enhancement of our human capital, awarding scholarships to many deserving citizens.</p>',
          image: '/images/about/getfund-board.jpg',
          imageAlt: 'GETFund Board'
        }
      },
      {
        section_key: 'vision_mission_values',
        section_type: 'text',
        title: 'Vision, Mission & Values',
        order_index: 2,
        content: {
          vision: {
            title: 'Our Vision',
            description: 'To become a leading education trust fund in Africa, ensuring quality and accessible education for all Ghanaians',
            icon: 'eye'
          },
          mission: {
            title: 'Our Mission',
            description: 'To mobilize and manage financial resources for the provision and expansion of educational infrastructure at all levels of education in Ghana',
            icon: 'target'
          },
          values: {
            title: 'Our Values',
            description: 'Integrity, transparency, excellence, and commitment to transforming lives through education',
            icon: 'heart'
          }
        }
      },
      {
        section_key: 'educational_financing',
        section_type: 'html',
        title: 'The Issue of Educational Financing',
        order_index: 3,
        content: {
          heading: 'The Issue of Educational Financing',
          sections: [
            {
              title: 'The Cost Sharing Policy',
              body: 'Currently in Ghana, due to government\'s inability to solely sustain tertiary education efforts, the cost of self financing has been introduced through the adoption of the cost sharing policy.'
            },
            {
              title: 'Public Responsibility',
              body: 'Notwithstanding all cost sharing options available from the public, the policy will not only politicize educational access for Ghanaians but is not capable of reaching the full purpose of higher education promotion if the purpose of higher education funding is not adequately equalized by the government.'
            }
          ]
        }
      },
      {
        section_key: 'funding_formula',
        section_type: 'text',
        title: 'Funding Formula',
        order_index: 4,
        content: {
          heading: 'Funding Formula',
          introduction: 'The law establishing GETFund further emphasizes a distribution formula that must be approved by Parliament each year, requiring that some crucial factors related to education delivery and development are considered in the process of preparing the Formula. These relevant factors should include but not limited to:',
          factors: [
            'promotion of the study of Mathematics, Science and Technology',
            'advancement of female education',
            'reduction in the high level of illiteracy in historically disadvantaged areas',
            'promotion of Vocational, Technical Education and Training',
            'equitable allocation of funds to the Districts at the Pre-Tertiary level of education'
          ]
        }
      },
      {
        section_key: 'leadership_governance',
        section_type: 'html',
        title: 'Leadership & Governance',
        order_index: 5,
        content: {
          heading: 'Leadership & Governance',
          subtitle: 'Strong leadership and transparent governance for educational transformation',
          boardTitle: 'Committed Board of Directors',
          boardDescription: 'Our experienced board of directors includes leaders from all spheres of education, finance, and public administration to guide GETFund\'s strategic direction and ensure accountability in all our initiatives.',
          boardImage: '/images/about/getfund-board.jpg',
          commitments: [
            {
              title: 'Strategic Direction',
              description: 'Setting priorities and overseeing implementation'
            },
            {
              title: 'Performance Monitoring',
              description: 'Ensuring all projects achieve educational outcomes'
            },
            {
              title: 'Stakeholder Engagement',
              description: 'Building partnerships for educational success'
            }
          ]
        }
      },
      {
        section_key: 'footer_cta',
        section_type: 'cta',
        title: 'Supporting the Delivery of Quality Education',
        order_index: 6,
        content: {
          heading: 'Supporting the delivery of quality education.',
          buttonText: 'Learn More',
          buttonLink: '/what-we-do'
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
    console.log('\n📋 Who We Are page now has these editable sections:');
    sections.forEach((s, i) => {
      console.log(`   ${i + 1}. ${s.title} (${s.section_type})`);
    });

  } catch (error) {
    console.error('\n❌ Error:', error);
    throw error;
  }
}

createWhoWeAreSections()
  .then(() => {
    console.log('\n🎉 Complete! Refresh the CMS to see all sections.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Failed:', error);
    process.exit(1);
  });
