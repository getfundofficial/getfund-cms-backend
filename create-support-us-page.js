const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function createSupportUsPage() {
  try {
    console.log('🚀 Creating/Updating Support Us page...\n');

    // Get admin user ID
    const adminUser = await pool.query(`SELECT id FROM users WHERE email = 'admin@getfund.gov.gh' LIMIT 1`);
    if (adminUser.rows.length === 0) {
      console.error('❌ Admin user not found');
      return;
    }
    const adminId = adminUser.rows[0].id;

    // Create or update the Support Us page
    const pageResult = await pool.query(`
      INSERT INTO pages (
        slug, title, meta_title, meta_description,
        layout_template, is_active, created_by, updated_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (slug) DO UPDATE SET
        title = EXCLUDED.title,
        meta_title = EXCLUDED.meta_title,
        meta_description = EXCLUDED.meta_description,
        layout_template = EXCLUDED.layout_template,
        updated_at = CURRENT_TIMESTAMP
      RETURNING id
    `, [
      'support-us',
      'Support Us',
      'Support Us - GETFund',
      'Join us in transforming education in Ghana through scholarships, infrastructure, and educational development.',
      'support-us',
      true,
      adminId,
      adminId
    ]);

    const pageId = pageResult.rows[0].id;
    console.log('✅ Support Us page created/updated\n');

    // Create the page_content section
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
      'support_us_content',
      'page_content',
      'Support Us Content',
      JSON.stringify({
        // Hero Section
        heroTitle: "Support Ghana's Educational Future",
        heroSubtitle: "Join us in transforming lives through education. Every contribution helps build a brighter tomorrow for Ghanaian students.",
        heroCtaText: "Donate Now",
        heroCtaLink: "https://donate.getfund.gov.gh/",

        // Impact Stats
        impactTitle: "Our Impact by Numbers",
        impactSubtitle: "Since our establishment, GETFund has been at the forefront of educational development",
        stats: [
          {
            number: "500,000+",
            label: "Students Reached",
            icon: "users"
          },
          {
            number: "2,500+",
            label: "Schools Supported",
            icon: "building"
          },
          {
            number: "15,000+",
            label: "Scholarship Recipients",
            icon: "heart"
          }
        ],

        // GETFund Act Section
        actTitle: "The Ghana Education Trust Fund (GETFund) Act",
        actIntro: "Since our establishment, GETFund has been at the forefront of educational development in Ghana.",
        legalFoundationTitle: "Legal Foundation",
        legalFoundationText: "The GETFund Act, 2000 (Act 581 of 2000) was established by an act of parliament to be the replacement of Ghana Educational Trust Fund, created to support and enhance educational development in Ghana at all levels.",
        fundingMechanismTitle: "Funding Mechanism",
        fundingMechanismText: "The fund primarily finances through a dedicated funding mechanism included in the current 17.5% VAT charged, corporate social responsibility donations, royalties, and several various educational-specific funding channels; ultimately building a sustainable funding mechanism.",
        constitutionalMandate: "\"It support our nation's drive towards equity education for a worldwide education as it embodies the dual promise of special attention to all citizens of Ghana.\"",

        // Ways to Support
        waysToSupportTitle: "Ways to Support Our Mission",
        waysToSupportSubtitle: "Your support helps us continue our vital work to transform Ghana's educational landscape",
        supportOptions: [
          {
            title: "Direct Donations",
            description: "Make a direct financial contribution to support scholarship programs, infrastructure development, and educational initiatives.",
            ctaText: "Donate Now",
            ctaLink: "https://donate.getfund.gov.gh/",
            icon: "heart"
          },
          {
            title: "Corporate Partnerships",
            description: "Partner with us through corporate social responsibility programs to make lasting impact on Ghana's educational landscape.",
            ctaText: "Partner With Us",
            ctaLink: "/contact",
            icon: "building"
          },
          {
            title: "International Support",
            description: "Join international organizations and diaspora communities in supporting Ghana's educational development initiatives.",
            ctaText: "Learn More",
            ctaLink: "/contact",
            icon: "users"
          }
        ],

        // Scholarship Programs
        scholarshipTitle: "Support Scholarship Programs",
        scholarshipSubtitle: "Your contributions directly fund scholarships for brilliant but needy students, helping them achieve their dreams.",
        scholarshipTypes: [
          {
            title: "Undergraduate Programs",
            description: "Funding university degrees for academically excellent students"
          },
          {
            title: "Postgraduate Programs",
            description: "Supporting advanced degrees and research opportunities"
          },
          {
            title: "International Exchange",
            description: "Enabling students to study abroad and gain global perspectives"
          }
        ],
        scholarshipAmount: "GH₵ 5,000",
        scholarshipAmountText: "can fund a full scholarship for one student",
        scholarshipCtaText: "Invest in Brilliance",
        scholarshipCtaLink: "https://donate.getfund.gov.gh/",

        // Final CTA
        ctaTitle: "Ready to Make a Difference?",
        ctaDescription: "Join thousands of supporters who are helping to build a stronger, more educated Ghana. Your contribution can be a defining factor in a student's life, making a meaningful impact.",
        ctaButtonText: "Make a Donation",
        ctaButtonLink: "https://donate.getfund.gov.gh/",
        ctaSecondaryText: "Contact Our Team",
        ctaSecondaryLink: "/contact",
        contactEmail: "donations@getfund.gov.gh",
        contactPhone: "+233 302 681 681"
      }),
      1,
      true,
      adminId,
      adminId
    ]);

    console.log('✅ Support Us content section created\n');
    console.log('✨ Support Us page is ready! Visit http://localhost:5173/support-us\n');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

createSupportUsPage();
