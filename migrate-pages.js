/**
 * Migration Script: Add Main Pages to CMS
 * Run this to populate the CMS with the main website pages
 */

const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

const pages = [
  {
    title: 'Who We Are',
    slug: 'who-we-are',
    content: {
      hero: {
        title: 'About Us',
        subtitle: 'Supporting the delivery of quality education to Ghanaians from basic to tertiary level',
      },
      sections: [
        {
          type: 'text-image',
          title: 'Ghana Education Trust Fund',
          subtitle: 'Since its establishment in the year 2000,',
          content: `The fund has remained committed to its mandate espouse in its governing legislation, the GETFund Act (Act 581), to provide funding to supplement government effort for the provision of educational infrastructure and facilities with the public sector.\n\nGETFund has played a significant role in this country's education sector not only by way of physical infrastructure, but also through the enhancement of our human capital by way of scholarships.`,
          image: '/images/about/getfund-7th-board-inauguration.jpg',
        },
        {
          type: 'vision-mission',
          items: [
            {
              icon: 'eye',
              title: 'Our Vision',
              content: 'To become a trusted public sector educational financing agency that sustainably manages assigned government resources',
            },
            {
              icon: 'target',
              title: 'Our Mission',
              content: 'To support the delivery of quality education to Ghanaians from the basic to tertiary level through dynamic funding policies aimed at ensuring equitable provision of essential resources for all levels of education',
            },
            {
              icon: 'heart',
              title: 'Our Values',
              content: 'Integrity, transparency, excellence, and commitment to transforming lives through education',
            },
          ],
        },
      ],
    },
    meta_description: 'Learn about GETFund - Ghana Education Trust Fund. Supporting quality education from basic to tertiary level since 2000.',
    status: 'published',
  },
  {
    title: 'What We Do',
    slug: 'what-we-do',
    content: {
      hero: {
        title: 'What We Do',
        subtitle: 'Transforming education through strategic investments in infrastructure, scholarships, and innovative programs',
      },
      sections: [
        {
          type: 'intro',
          content: 'GETFund provides comprehensive support to Ghana\'s education sector through multiple strategic programs and initiatives.',
        },
      ],
    },
    meta_description: 'Discover GETFund programs: infrastructure development, scholarship schemes, and educational support initiatives.',
    status: 'published',
  },
  {
    title: 'Impact',
    slug: 'impact',
    content: {
      hero: {
        title: 'Our Impact',
        subtitle: 'Measuring the difference we make in Ghana\'s education sector',
      },
      sections: [
        {
          type: 'intro',
          content: 'Through strategic investments and partnerships, GETFund has transformed thousands of lives and educational institutions across Ghana.',
        },
      ],
    },
    meta_description: 'See the impact of GETFund\'s work in transforming Ghana\'s education sector through infrastructure and scholarships.',
    status: 'published',
  },
  {
    title: 'Resources',
    slug: 'resources',
    content: {
      hero: {
        title: 'Resources',
        subtitle: 'Access reports, publications, and important documents',
      },
      sections: [
        {
          type: 'intro',
          content: 'Find essential resources including annual reports, policy documents, and educational materials.',
        },
      ],
    },
    meta_description: 'Access GETFund resources: annual reports, publications, policies, and educational documents.',
    status: 'published',
  },
  {
    title: 'Support Us',
    slug: 'support-us',
    content: {
      hero: {
        title: 'Support Us',
        subtitle: 'Partner with us to transform Ghana\'s education sector',
      },
      sections: [
        {
          type: 'intro',
          content: 'Learn how you can contribute to improving education in Ghana through partnerships and support.',
        },
      ],
    },
    meta_description: 'Support GETFund\'s mission to transform education in Ghana. Learn about partnership opportunities.',
    status: 'published',
  },
  {
    title: 'Contact',
    slug: 'contact',
    content: {
      hero: {
        title: 'Contact Us',
        subtitle: 'Get in touch with GETFund',
      },
      sections: [
        {
          type: 'contact-info',
          phone: '+233 (544) 323-020',
          email: 'info@getfund.gov.gh',
          address: 'No. 42, 4th Close, Airport Residential Area, Accra',
          hours: {
            weekdays: 'Monday - Friday: 8:00 AM - 5:00 PM',
            weekend: 'Saturday - Sunday: Closed',
          },
        },
      ],
    },
    meta_description: 'Contact GETFund - Get in touch with us for inquiries about our programs and services.',
    status: 'published',
  },
];

async function migratePages() {
  console.log('🚀 Starting page migration...\n');

  try {
    // Get first user for created_by
    const users = await sql`SELECT id FROM users LIMIT 1`;
    if (users.length === 0) {
      console.error('❌ No users found in database. Please create a user first.');
      process.exit(1);
    }
    const userId = users[0].id;

    for (const page of pages) {
      console.log(`📄 Migrating: ${page.title}`);

      // Check if page already exists
      const existing = await sql`
        SELECT id FROM content 
        WHERE type = 'page' AND slug = ${page.slug}
      `;

      if (existing.length > 0) {
        console.log(`   ⚠️  Page "${page.slug}" already exists, skipping...`);
        continue;
      }

      // Insert new page
      await sql`
        INSERT INTO content (
          type,
          title,
          slug,
          body,
          excerpt,
          meta_data,
          status,
          created_by,
          created_at,
          updated_at,
          published_at
        ) VALUES (
          'page',
          ${page.title},
          ${page.slug},
          ${JSON.stringify(page.content)},
          ${page.meta_description},
          ${JSON.stringify({ page_type: 'main' })},
          ${page.status},
          ${userId},
          NOW(),
          NOW(),
          NOW()
        )
      `;

      console.log(`   ✅ Successfully migrated "${page.slug}"\n`);
    }

    console.log('✨ Migration complete!\n');
    console.log('📊 Summary:');
    console.log(`   Total pages processed: ${pages.length}`);
    
    // Show all pages in database
    const allPages = await sql`
      SELECT id, title, slug, status, published_at
      FROM content
      WHERE type = 'page'
      ORDER BY created_at DESC
    `;
    
    console.log(`   Pages in database: ${allPages.length}\n`);
    console.log('📋 Current Pages:');
    allPages.forEach(p => {
      console.log(`   - ${p.title} (/${p.slug}) - ${p.status}`);
    });

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migratePages();
