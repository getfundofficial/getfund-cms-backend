const { Pool } = require('pg');
require('dotenv').config();

// Create database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://neondb_owner:npg_PS1tijL0ZpfA@ep-royal-hall-ad0djgcp-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require"
});

async function query(text, params) {
  const result = await pool.query(text, params);
  return result;
}

/**
 * Migration Script: Transfer Fundraising Page Content to CMS
 *
 * This script migrates hardcoded text content from the 5 fundraising pages
 * into the CMS database as page_content sections.
 */

async function migrateWhyFundraising() {
  console.log('\n1. Migrating Why Fundraising page...');

  const content = {
    meta: {
      title: "Why Fundraising? | GETFund",
      description: "Your support helps us expand access to quality education through infrastructure, scholarships, and partnerships that change lives."
    },
    hero: {
      title: "Why Fundraising?",
      subtitle: "Your support helps us expand access to quality education through infrastructure, scholarships, and partnerships that change lives.",
      ctaButtonText: "Make a Donation"
    },
    mainContent: {
      paragraph: "At the Ghana Education Trust Fund (GETFund), fundraising is a strategic pillar of our commitment to expanding access to quality education for all. While statutory allocations remain essential, the growing needs of schools, communities, and learners across the country call for broader partnerships, innovative financing models, and shared responsibility. Through purposeful resource mobilization from individuals, corporate partners, development agencies, and philanthropic organizations, GETFund strengthens and diversifies support for educational infrastructure, scholarships, teaching and learning resources, and other vital interventions. In this work, we are guided by a long-term ambition to drive sustainable education financing and foster impactful partnerships that advance equity, improve learning outcomes, and build a stronger future for Ghana."
    },
    whyDonate: {
      heading: "Why Donate to Us - Give with Confidence",
      paragraph1: "Imagine a brilliant young student in Ghana, eager to learn and full of potential. Now, imagine their classroom is the shade of a tree, or a room so crowded they can barely move. Imagine they have no textbook to read and no electricity to study by at night. For countless children, this is not imagination; it is their reality. Their dreams are put on hold simply because their families cannot afford the cost of education.",
      paragraph2: "The Ghana Education Trust Fund (GETFund) was created to rewrite this story. Your gift can become the four walls of a safe classroom, the desk a child can call their own, or the scholarship that turns a dream into a degree. Together, we can provide the tools and opportunities that allow these bright minds to grow and thrive.",
      paragraph3: "Your trust is our priority. GETFund is committed to the highest standards of accountability, with transparent financial systems and audited reports under government supervision. The impact of your generosity is clear to see in the schools, ICT labs, and libraries we have built, and in the success of the students we have sponsored. Help us empower the next generation, transforming education brick by brick, one child at a time."
    },
    getInvolved: {
      heading: "Get Involved",
      description: "Every contribution, irrespective of the amount, brings us closer to ensuring that no child in Ghana is left behind because of inadequate facilities or financial barriers.",
      donationHeading: "Make Your Donation"
    }
  };

  const result = await query(`
    INSERT INTO page_sections (page_id, section_key, section_type, title, content, order_index, is_active)
    SELECT id, 'page_content', 'page_content', 'Page Content', $1::jsonb, 1, true
    FROM pages WHERE slug = 'why-fundraising'
    ON CONFLICT (page_id, section_key) DO UPDATE
    SET content = $1::jsonb, updated_at = NOW()
    RETURNING id
  `, [JSON.stringify(content)]);

  console.log('   ✓ Why Fundraising content migrated');
  return result.rows[0];
}

async function migrateWaysToDonate() {
  console.log('\n2. Migrating Ways to Donate page...');

  const content = {
    meta: {
      title: "Ways to Donate | GETFund",
      description: "Investing in Education. Building Ghana's Tomorrow."
    },
    hero: {
      title: "Investing in Education. Building Ghana's Tomorrow.",
      subtitle: "The Ghana Education Trust Fund (GETFund) is committed to advancing education through sustainable investment in infrastructure and human capital. From modern school infrastructure to life-changing scholarships, your generosity strengthens the foundation of learning for generations to come. With every gift, you help transform potential into progress - and ensure every child has a place to learn and a chance to thrive."
    },
    donationOptions: [
      {
        title: "Classroom construction support",
        description: "Imagine children clustered under a leaking roof, or found under trees, rain soaking their notebooks. Your gift builds a bright, safe classroom where dreams can finally take root.",
        buttonText: "Build a Classroom"
      },
      {
        title: "Student Scholarship (Local)",
        description: "She's brilliant, but poverty whispers \"quit\" every day. Your support silences that voice and hands her the key to a university degree.",
        buttonText: "Sponsor a Student"
      },
      {
        title: "Student Scholarship (International)",
        description: "He dreams of studying abroad, yet the cost feels like a locked door; your kindness swings it wide open for a life-changing opportunity.",
        buttonText: "Sponsor a Student"
      },
      {
        title: "School Meals",
        description: "An empty stomach steals focus and hope. Your meal fills a hungry child with energy, joy, and the promise of a brighter tomorrow.",
        buttonText: "Provide a School Meal"
      },
      {
        title: "Classroom Furniture",
        description: "Picture kids sitting on bare floors with aching backs. Your desks and chairs give them comfort, dignity, and the simple joy of learning with pride.",
        buttonText: "Buy a desk"
      },
      {
        title: "Learning Materials",
        description: "Without books, a teacher's voice fades into silence. Your textbooks ignite curiosity and turn \"I can't\" into \"I will!\".",
        buttonText: "Give Learning Materials"
      },
      {
        title: "ICT & Digital Learning Tools",
        description: "In a world racing ahead, these children risk being left behind. Your computers and tablets connect them to endless possibilities.",
        buttonText: "Support ICT Learning"
      },
      {
        title: "School Sanitation & Water Access",
        description: "No clean water, no safe toilet, girls miss school, dignity crumbles. Your gift brings flowing water and hope that keeps every child in class.",
        buttonText: "Provide Clean Water"
      }
    ],
    otherWays: {
      heading: "Other ways of donating",
      cheque: {
        title: "Send a Cheque",
        description: "(mailing instructions to be included)"
      },
      mobileMoney: {
        title: "Donate with Mobile Money",
        description: "(shortcode, networks, etc)"
      }
    },
    giveWithConfidence: {
      heading: "Give with Confidence",
      description: "Your trust is our priority. GETFund is committed to the highest standards of accountability, with transparent financial systems and audited reports under government supervision. The impact of your generosity is evident in the schools, ICT labs, and libraries we have built, as well as in the success of the students we have sponsored. Help us empower the next generation, transforming education brick by brick, one child at a time."
    }
  };

  const result = await query(`
    INSERT INTO page_sections (page_id, section_key, section_type, title, content, order_index, is_active)
    SELECT id, 'page_content', 'page_content', 'Page Content', $1::jsonb, 1, true
    FROM pages WHERE slug = 'ways-to-donate'
    ON CONFLICT (page_id, section_key) DO UPDATE
    SET content = $1::jsonb, updated_at = NOW()
    RETURNING id
  `, [JSON.stringify(content)]);

  console.log('   ✓ Ways to Donate content migrated');
  return result.rows[0];
}

async function migratePartnerships() {
  console.log('\n3. Migrating Partnerships page...');

  const content = {
    meta: {
      title: "Partnerships | GETFund",
      description: "Partner with GETFund to transform education in Ghana"
    },
    hero: {
      title: "Partnerships with GETFund"
    },
    intro: {
      paragraph: "Partnering with the Ghana Education Trust Fund (GETFund), whether as a local business, international organization, or individual donor, you become part of a national effort to transform education in Ghana. Your support helps us build quality infrastructure, fund scholarships for underserved students, and equip schools and technical institutions with the tools they need to deliver world-class learning experiences. Together, we are bridging gaps in access, improving educational quality, and ensuring that every student, regardless of their background, can thrive."
    },
    waysToPartner: {
      heading: "Ways to partner",
      ways: [
        "Infrastructure sponsorship",
        "Scholarships",
        "In-kind contributions",
        "Uniforms",
        "Stationary & books",
        "Laptops",
        "Furniture",
        "Feeding"
      ]
    },
    whySupport: {
      heading: "Why support us?",
      benefits: [
        {
          title: "Tax and Financial Incentives:",
          description: "The Ghana Revenue Authority (GRA) has, in a written communication to GETFund, agreed that companies that invest in projects proposed by us through their Corporate Social Responsibility (CSR) budgets shall be entitled to claim a tax deduction equivalent to the amount of the contribution or donation made."
        },
        {
          title: "Enhanced Corporate Social Responsibility (CSR) Profile:",
          description: "One's contribution will position them to be a champion of education and community development in Ghana, strengthening your brand reputation locally and globally."
        },
        {
          title: "Community Goodwill and Brand Visibility:",
          description: "Partners' logo and name will be prominently featured on project sites, promotional materials, websites, and media campaigns, reaching thousands of stakeholders, including government officials, educators, and community members."
        },
        {
          title: "Positive Impact on Future Workforce:",
          description: "By supporting education, you invest in creating a skilled, educated workforce that can contribute to Ghana's economic growth, potentially benefiting your industry."
        },
        {
          title: "Long-term Partnership Opportunities:",
          description: "Opens doors for future engagements with GETFund and other governmental and non-governmental organizations in Ghana."
        }
      ]
    },
    ourPartners: {
      heading: "Our Partners",
      description: "(display logos of partners. Click-through functionality takes you to articles on the partnership)"
    }
  };

  const result = await query(`
    INSERT INTO page_sections (page_id, section_key, section_type, title, content, order_index, is_active)
    SELECT id, 'page_content', 'page_content', 'Page Content', $1::jsonb, 1, true
    FROM pages WHERE slug = 'partnerships'
    ON CONFLICT (page_id, section_key) DO UPDATE
    SET content = $1::jsonb, updated_at = NOW()
    RETURNING id
  `, [JSON.stringify(content)]);

  console.log('   ✓ Partnerships content migrated');
  return result.rows[0];
}

async function migrateBeneficiariesGiveBack() {
  console.log('\n4. Migrating Beneficiaries Give Back page...');

  const content = {
    meta: {
      title: "GETFund Beneficiaries - Give Back | GETFund",
      description: "To All GETFund Beneficiaries – Give Back, Build Forward"
    },
    hero: {
      title: "GETFund Beneficiaries"
    },
    mainContent: {
      heading: "To All GETFund Beneficiaries – Give Back, Build Forward",
      paragraph1: "If GETFund played a part in your educational journey, you are part of a powerful story of opportunity and impact. Today, you have the chance to extend that same opportunity to others. By giving back, you help us continue building classrooms, funding scholarships, and supporting students whose dreams depend on access to quality education.",
      paragraph2: "Your contribution, no matter the amount, ensures that the support you once received continues to transform lives across Ghana. Together, we can keep the cycle of empowerment alive and invest in the future of the next generation.",
      ctaButtonText: "Make a Donation"
    }
  };

  const result = await query(`
    INSERT INTO page_sections (page_id, section_key, section_type, title, content, order_index, is_active)
    SELECT id, 'page_content', 'page_content', 'Page Content', $1::jsonb, 1, true
    FROM pages WHERE slug = 'beneficiaries-give-back'
    ON CONFLICT (page_id, section_key) DO UPDATE
    SET content = $1::jsonb, updated_at = NOW()
    RETURNING id
  `, [JSON.stringify(content)]);

  console.log('   ✓ Beneficiaries Give Back content migrated');
  return result.rows[0];
}

async function migrateEvents() {
  console.log('\n5. Migrating Events page...');

  const content = {
    meta: {
      title: "Events | GETFund",
      description: "Upcoming GETFund events and fundraising activities"
    },
    hero: {
      title: "Events"
    },
    upcomingEvents: {
      heading: "Upcoming events",
      events: [
        {
          id: 1,
          title: "Event 1",
          date: "TBD",
          description: "Event details coming soon"
        },
        {
          id: 2,
          title: "Event 2",
          date: "TBD",
          description: "Event details coming soon"
        },
        {
          id: 3,
          title: "Event 3",
          date: "TBD",
          description: "Event details coming soon"
        }
      ],
      emptyStateTitle: "No upcoming events at the moment.",
      emptyStateSubtitle: "Check back soon for updates!"
    }
  };

  const result = await query(`
    INSERT INTO page_sections (page_id, section_key, section_type, title, content, order_index, is_active)
    SELECT id, 'page_content', 'page_content', 'Page Content', $1::jsonb, 1, true
    FROM pages WHERE slug = 'events'
    ON CONFLICT (page_id, section_key) DO UPDATE
    SET content = $1::jsonb, updated_at = NOW()
    RETURNING id
  `, [JSON.stringify(content)]);

  console.log('   ✓ Events content migrated');
  return result.rows[0];
}

async function verifyMigration() {
  console.log('\n6. Verifying migration...');

  const result = await query(`
    SELECT
      p.slug,
      p.title,
      ps.section_key,
      ps.section_type,
      jsonb_typeof(ps.content) as content_type,
      (ps.content->>'meta') IS NOT NULL as has_meta
    FROM pages p
    INNER JOIN page_sections ps ON p.id = ps.page_id
    WHERE p.slug IN ('why-fundraising', 'ways-to-donate', 'partnerships', 'beneficiaries-give-back', 'events')
      AND ps.section_type = 'page_content'
    ORDER BY p.slug
  `);

  console.log('\n   Migration verification:');
  result.rows.forEach(row => {
    console.log(`   ✓ ${row.slug}: ${row.section_key} (${row.content_type}, has_meta: ${row.has_meta})`);
  });

  return result.rows;
}

async function main() {
  console.log('='.repeat(60));
  console.log('FUNDRAISING PAGES CONTENT MIGRATION');
  console.log('='.repeat(60));
  console.log('\nThis script will migrate hardcoded text from 5 fundraising pages');
  console.log('into the CMS database as page_content sections.\n');

  try {
    // Migrate all pages
    await migrateWhyFundraising();
    await migrateWaysToDonate();
    await migratePartnerships();
    await migrateBeneficiariesGiveBack();
    await migrateEvents();

    // Verify
    const verification = await verifyMigration();

    console.log('\n' + '='.repeat(60));
    console.log('MIGRATION COMPLETED SUCCESSFULLY');
    console.log('='.repeat(60));
    console.log(`\n✓ ${verification.length} fundraising pages migrated`);
    console.log('\nNext steps:');
    console.log('1. Test CMS admin editors at http://localhost:5174/admin/pages');
    console.log('2. Update frontend page components to fetch from CMS');
    console.log('3. Test frontend pages display CMS content correctly');
    console.log('\n');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('\nStack trace:', error.stack);
    process.exit(1);
  }

  process.exit(0);
}

// Run migration
main();
