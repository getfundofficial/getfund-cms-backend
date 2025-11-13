const bcrypt = require('bcrypt');
const { pool } = require('../config/database');

async function seedDatabase() {
  console.log('🌱 Seeding database...\n');

  try {
    // Default password for all users
    const defaultPassword = 'getfund2025';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    console.log('📝 Default password for all users: getfund2025');
    console.log('⚠️  IMPORTANT: Change these passwords after first login!\n');

    // Insert users
    const users = [
      {
        email: 'admin@getfund.gov.gh',
        full_name: 'Admin User',
        role: 'admin'
      },
      {
        email: 'creator1@getfund.gov.gh',
        full_name: 'Jane Smith',
        role: 'creator'
      },
      {
        email: 'creator2@getfund.gov.gh',
        full_name: 'John Doe',
        role: 'creator'
      },
      {
        email: 'reviewer@getfund.gov.gh',
        full_name: 'Mike Reviewer',
        role: 'reviewer'
      },
      {
        email: 'approver@getfund.gov.gh',
        full_name: 'Sarah Approver',
        role: 'approver'
      }
    ];

    console.log('👥 Creating users...');
    const createdUsers = {};

    for (const user of users) {
      const result = await pool.query(
        `INSERT INTO users (email, password_hash, full_name, role)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (email) DO UPDATE SET
           full_name = EXCLUDED.full_name,
           role = EXCLUDED.role
         RETURNING id, email, full_name, role`,
        [user.email, hashedPassword, user.full_name, user.role]
      );

      createdUsers[user.role] = result.rows[0];
      console.log(`✅ Created/Updated: ${user.email} (${user.role})`);
    }

    // Get admin user ID for creating content
    const adminId = createdUsers.admin.id;

    console.log('\n📰 Migrating existing news articles...');

    // Existing news articles from your website
    const newsArticles = [
      {
        title: 'GETFund Commences Accelerated Infrastructure Program at Ambariya Schools',
        slug: 'getfund-commences-accelerated-infrastructure-program-at-ambariya-schools',
        excerpt: 'GETFund has launched a comprehensive infrastructure development initiative targeting educational facilities in the Ambariya region, marking a significant investment in Ghana\'s educational infrastructure.',
        body: `<h2>Major Infrastructure Development Initiative Launched</h2>
<p>The Ghana Education Trust Fund (GETFund) has officially commenced an accelerated infrastructure development program at Ambariya Schools, marking a significant milestone in the government's commitment to improving educational facilities across the country.</p>

<h3>Project Overview</h3>
<p>The comprehensive program includes:</p>
<ul>
<li>Construction of modern classroom blocks</li>
<li>Renovation of existing facilities</li>
<li>Installation of ICT laboratories</li>
<li>Development of sports facilities</li>
<li>Improvement of sanitation infrastructure</li>
</ul>

<h3>Impact on Local Education</h3>
<p>This initiative is expected to benefit over 2,000 students and provide a conducive learning environment that meets modern educational standards. The project is part of GETFund's broader strategy to bridge the infrastructure gap in Ghana's education sector.</p>

<h3>Timeline and Completion</h3>
<p>The construction work is scheduled to be completed within 18 months, with phased handovers to ensure minimal disruption to academic activities.</p>`,
        featured_image_url: '/images/recent-projects/ambariya.png',
        author: 'Isaac Asiedu Odei',
        category: 'Infrastructure',
        type: 'news',
        status: 'published',
        created_by: adminId,
        published_by: adminId,
        published_at: '2025-10-14T00:00:00Z'
      },
      {
        title: 'GETFund Kicks Off Multi-Project Construction in Northern Region',
        slug: 'getfund-kicks-off-multi-project-construction-in-northern-region',
        excerpt: 'A groundbreaking ceremony marks the beginning of multiple educational infrastructure projects across the Northern Region, demonstrating GETFund\'s commitment to regional development.',
        body: `<h2>Comprehensive Development Initiative in Northern Region</h2>
<p>GETFund has launched an ambitious multi-project construction initiative across the Northern Region, targeting 15 educational institutions with various infrastructure needs.</p>

<h3>Project Scope</h3>
<p>The multi-project initiative encompasses:</p>
<ul>
<li>Construction of 8 new classroom blocks</li>
<li>Rehabilitation of 12 existing structures</li>
<li>Development of 5 science laboratories</li>
<li>Construction of 6 assembly halls</li>
<li>Installation of solar power systems</li>
</ul>

<h3>Regional Impact</h3>
<p>This development is set to transform the educational landscape in the Northern Region, providing quality learning spaces for thousands of students. The initiative aligns with the government's policy of ensuring equitable distribution of educational resources across all regions.</p>

<h3>Budget Allocation</h3>
<p>The total budget for these projects amounts to GHS 85 million, making it one of the largest single-region infrastructure investments by GETFund.</p>

<h3>Community Involvement</h3>
<p>Local communities have been actively involved in the planning process, ensuring that the projects meet specific local needs and priorities.</p>`,
        author: 'Isaac Asiedu Odei',
        category: 'Infrastructure',
        type: 'news',
        status: 'published',
        created_by: adminId,
        published_by: adminId,
        published_at: '2025-10-14T00:00:00Z'
      },
      {
        title: 'N/R: GETFund Launches Major Infrastructure Expansion at Ghana SHS',
        slug: 'nr-getfund-launches-major-infrastructure-expansion-at-ghana-shs',
        excerpt: 'Ghana Senior High School receives a comprehensive infrastructure upgrade as part of GETFund\'s nationwide school improvement program.',
        body: `<h2>Transforming Ghana SHS Infrastructure</h2>
<p>The Ghana Education Trust Fund has initiated a major infrastructure expansion project at Ghana Senior High School in the Northern Region, aimed at addressing the growing student population and modernizing facilities.</p>

<h3>Project Components</h3>
<p>The expansion project includes:</p>
<ul>
<li>Construction of a 12-unit classroom block</li>
<li>Modern science and computer laboratories</li>
<li>500-capacity assembly hall</li>
<li>Dormitory facilities for 400 students</li>
<li>Sports complex with standard tracks</li>
<li>Upgraded water and sanitation facilities</li>
</ul>

<h3>Addressing Capacity Challenges</h3>
<p>The school currently operates beyond its intended capacity, with over 1,800 students in facilities designed for 1,200. This expansion will alleviate overcrowding and improve the overall learning environment.</p>

<h3>Modern Educational Standards</h3>
<p>All new structures are being built to meet modern educational standards, incorporating energy-efficient designs and accessibility features for students with disabilities.</p>

<h3>Expected Completion</h3>
<p>The project is expected to be completed by December 2026, with progressive handovers beginning from June 2026.</p>`,
        author: 'Isaac Asiedu Odei',
        category: 'Infrastructure',
        type: 'news',
        status: 'published',
        created_by: adminId,
        published_by: adminId,
        published_at: '2025-10-14T00:00:00Z'
      }
    ];

    for (const article of newsArticles) {
      const result = await pool.query(
        `INSERT INTO content (type, title, slug, excerpt, body, author, category,
                             featured_image_url, status, created_by, published_by, published_at, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
         ON CONFLICT (slug) DO UPDATE SET
           title = EXCLUDED.title,
           excerpt = EXCLUDED.excerpt,
           body = EXCLUDED.body,
           featured_image_url = EXCLUDED.featured_image_url
         RETURNING id, title`,
        [
          article.type,
          article.title,
          article.slug,
          article.excerpt,
          article.body,
          article.author,
          article.category,
          article.featured_image_url,
          article.status,
          article.created_by,
          article.published_by,
          article.published_at
        ]
      );

      console.log(`✅ Migrated: ${result.rows[0].title}`);
    }

    console.log('\n🎉 Database seeded successfully!\n');
    console.log('📊 Summary:');
    console.log(`   - Users created: ${users.length}`);
    console.log(`   - News articles migrated: ${newsArticles.length}`);
    console.log('\n🔐 Login Credentials:');
    console.log('   Email: admin@getfund.gov.gh');
    console.log('   Password: getfund2025\n');
    console.log('⚠️  Remember to change all passwords after first login!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seedDatabase();
