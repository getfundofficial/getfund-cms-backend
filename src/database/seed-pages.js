require('dotenv').config();
const { Pool } = require('@neondatabase/serverless');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function seedPages() {
  console.log('🌱 Seeding website pages to match menu structure...\n');

  try {
    // Get admin user ID
    const adminResult = await pool.query(
      "SELECT id FROM users WHERE email = 'admin@getfund.gov.gh' LIMIT 1"
    );

    if (adminResult.rows.length === 0) {
      console.error('❌ Admin user not found. Please run seed.js first.');
      process.exit(1);
    }

    const adminId = adminResult.rows[0].id;

    // ========== WHO WE ARE PAGE ==========
    console.log('📄 Creating "Who We Are" page...');
    const whoWeArePage = await pool.query(`
      INSERT INTO pages (
        slug, title, meta_title, meta_description,
        layout_template, is_active, created_by, updated_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (slug) DO UPDATE SET
        title = EXCLUDED.title,
        meta_title = EXCLUDED.meta_title,
        meta_description = EXCLUDED.meta_description,
        updated_at = CURRENT_TIMESTAMP
      RETURNING id
    `, [
      'who-we-are',
      'Who We Are',
      'Who We Are - Ghana Education Trust Fund',
      'Learn about GETFund\'s mission, vision, and commitment to transforming education in Ghana.',
      'default',
      true,
      adminId,
      adminId
    ]);

    if (whoWeArePage.rows.length > 0) {
      const pageId = whoWeArePage.rows[0].id;

      await pool.query(`
        INSERT INTO page_sections (
          page_id, section_key, section_type, title, content,
          order_index, is_active, created_by, updated_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (page_id, section_key) DO UPDATE SET
          content = EXCLUDED.content,
          updated_at = CURRENT_TIMESTAMP
      `, [
        pageId, 'hero', 'hero', 'Hero Banner',
        JSON.stringify({
          title: 'Who We Are',
          subtitle: 'Our Story, Mission & Vision',
          backgroundImage: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200',
          ctaText: 'Our Mission',
          ctaLink: '#mission'
        }),
        0, true, adminId, adminId
      ]);

      await pool.query(`
        INSERT INTO page_sections (
          page_id, section_key, section_type, title, content,
          order_index, is_active, created_by, updated_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (page_id, section_key) DO UPDATE SET
          content = EXCLUDED.content,
          updated_at = CURRENT_TIMESTAMP
      `, [
        pageId, 'history', 'text', 'Our History',
        JSON.stringify({
          body: '<h2>Our History</h2><p>The Ghana Education Trust Fund (GETFund) was established by an Act of Parliament in 2000 (Act 581) to provide supplementary funding for the development of education at all levels in Ghana. The fund derives its resources from 2.5% of the VAT receipts collected by the Ghana Revenue Authority.</p><p>Since its establishment, GETFund has played a pivotal role in supporting educational infrastructure development across the country.</p>',
          alignment: 'left'
        }),
        1, true, adminId, adminId
      ]);

      console.log('✅ "Who We Are" page created with 2 sections\n');
    }

    // ========== WHAT WE DO PAGE ==========
    console.log('📄 Creating "What We Do" page...');
    const whatWeDoPage = await pool.query(`
      INSERT INTO pages (
        slug, title, meta_title, meta_description,
        layout_template, is_active, created_by, updated_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (slug) DO UPDATE SET
        title = EXCLUDED.title,
        meta_title = EXCLUDED.meta_title,
        meta_description = EXCLUDED.meta_description,
        updated_at = CURRENT_TIMESTAMP
      RETURNING id
    `, [
      'what-we-do',
      'What We Do',
      'What We Do - Programs & Initiatives',
      'Explore GETFund\'s various programs supporting education at all levels across Ghana.',
      'default',
      true,
      adminId,
      adminId
    ]);

    if (whatWeDoPage.rows.length > 0) {
      const pageId = whatWeDoPage.rows[0].id;

      await pool.query(`
        INSERT INTO page_sections (
          page_id, section_key, section_type, title, content,
          order_index, is_active, created_by, updated_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (page_id, section_key) DO UPDATE SET
          content = EXCLUDED.content,
          updated_at = CURRENT_TIMESTAMP
      `, [
        pageId, 'hero', 'hero', 'What We Do Hero',
        JSON.stringify({
          title: 'What We Do',
          subtitle: 'Empowering education through strategic initiatives',
          backgroundImage: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=1200',
          ctaText: 'Explore Programs',
          ctaLink: '#programs'
        }),
        0, true, adminId, adminId
      ]);

      await pool.query(`
        INSERT INTO page_sections (
          page_id, section_key, section_type, title, content,
          order_index, is_active, created_by, updated_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (page_id, section_key) DO UPDATE SET
          content = EXCLUDED.content,
          updated_at = CURRENT_TIMESTAMP
      `, [
        pageId, 'programs_overview', 'text', 'Programs Overview',
        JSON.stringify({
          body: '<h2>Supporting Education at Every Level</h2><p>GETFund implements comprehensive programs across Ghana\'s education sector:</p><h3>Infrastructure Development</h3><p>Construction and renovation of educational facilities including classrooms, libraries, laboratories, and administrative blocks.</p><h3>Equipment Provision</h3><p>Supplying schools with modern teaching and learning equipment, ICT resources, and scientific apparatus.</p><h3>Scholarship Programs</h3><p>Financial support for brilliant but needy students at tertiary, secondary, and basic education levels.</p>',
          alignment: 'left'
        }),
        1, true, adminId, adminId
      ]);

      console.log('✅ "What We Do" page created with 2 sections\n');
    }

    // ========== IMPACT PAGE ==========
    console.log('📄 Creating "Impact" page...');
    const impactPage = await pool.query(`
      INSERT INTO pages (
        slug, title, meta_title, meta_description,
        layout_template, is_active, created_by, updated_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (slug) DO UPDATE SET
        title = EXCLUDED.title,
        meta_title = EXCLUDED.meta_title,
        meta_description = EXCLUDED.meta_description,
        updated_at = CURRENT_TIMESTAMP
      RETURNING id
    `, [
      'impact',
      'Impact',
      'Our Impact - GETFund',
      'See how GETFund is transforming education and making a difference across Ghana.',
      'default',
      true,
      adminId,
      adminId
    ]);

    if (impactPage.rows.length > 0) {
      const pageId = impactPage.rows[0].id;

      await pool.query(`
        INSERT INTO page_sections (
          page_id, section_key, section_type, title, content,
          order_index, is_active, created_by, updated_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (page_id, section_key) DO UPDATE SET
          content = EXCLUDED.content,
          updated_at = CURRENT_TIMESTAMP
      `, [
        pageId, 'hero', 'hero', 'Impact Hero',
        JSON.stringify({
          title: 'Our Impact',
          subtitle: 'Transforming education across Ghana',
          backgroundImage: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1200',
          ctaText: 'See Our Impact',
          ctaLink: '#impact'
        }),
        0, true, adminId, adminId
      ]);

      await pool.query(`
        INSERT INTO page_sections (
          page_id, section_key, section_type, title, content,
          order_index, is_active, created_by, updated_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (page_id, section_key) DO UPDATE SET
          content = EXCLUDED.content,
          updated_at = CURRENT_TIMESTAMP
      `, [
        pageId, 'impact_stats', 'stats', 'Our Impact',
        JSON.stringify({
          stats: [
            { value: '5,000+', label: 'Schools Supported', icon: 'school' },
            { value: '2M+', label: 'Students Reached', icon: 'users' },
            { value: '50+', label: 'Infrastructure Projects', icon: 'building' },
            { value: '16', label: 'Regions Covered', icon: 'map' }
          ]
        }),
        1, true, adminId, adminId
      ]);

      console.log('✅ "Impact" page created with 2 sections\n');
    }

    // ========== RESOURCES PAGE ==========
    console.log('📄 Creating "Resources" page...');
    const resourcesPage = await pool.query(`
      INSERT INTO pages (
        slug, title, meta_title, meta_description,
        layout_template, is_active, created_by, updated_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (slug) DO UPDATE SET
        title = EXCLUDED.title,
        meta_title = EXCLUDED.meta_title,
        meta_description = EXCLUDED.meta_description,
        updated_at = CURRENT_TIMESTAMP
      RETURNING id
    `, [
      'resources',
      'Resources',
      'Resources & Documents - GETFund',
      'Access GETFund publications, reports, guidelines, and other useful resources.',
      'default',
      true,
      adminId,
      adminId
    ]);

    if (resourcesPage.rows.length > 0) {
      const pageId = resourcesPage.rows[0].id;

      await pool.query(`
        INSERT INTO page_sections (
          page_id, section_key, section_type, title, content,
          order_index, is_active, created_by, updated_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (page_id, section_key) DO UPDATE SET
          content = EXCLUDED.content,
          updated_at = CURRENT_TIMESTAMP
      `, [
        pageId, 'hero', 'hero', 'Resources Hero',
        JSON.stringify({
          title: 'Resources',
          subtitle: 'Publications, Reports & Guidelines',
          backgroundImage: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1200',
          ctaText: 'Browse Resources',
          ctaLink: '#resources'
        }),
        0, true, adminId, adminId
      ]);

      await pool.query(`
        INSERT INTO page_sections (
          page_id, section_key, section_type, title, content,
          order_index, is_active, created_by, updated_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (page_id, section_key) DO UPDATE SET
          content = EXCLUDED.content,
          updated_at = CURRENT_TIMESTAMP
      `, [
        pageId, 'resources_intro', 'text', 'Resources Introduction',
        JSON.stringify({
          body: '<h2>Access Our Resources</h2><p>Find important documents, publications, and guidelines related to GETFund operations and programs.</p><h3>Available Resources</h3><ul><li>Annual Reports</li><li>Application Guidelines</li><li>Project Reports</li><li>Financial Statements</li><li>Policy Documents</li><li>Research Publications</li></ul>',
          alignment: 'left'
        }),
        1, true, adminId, adminId
      ]);

      console.log('✅ "Resources" page created with 2 sections\n');
    }

    // ========== SUPPORT US PAGE ==========
    console.log('📄 Creating "Support Us" page...');
    const supportUsPage = await pool.query(`
      INSERT INTO pages (
        slug, title, meta_title, meta_description,
        layout_template, is_active, created_by, updated_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (slug) DO UPDATE SET
        title = EXCLUDED.title,
        meta_title = EXCLUDED.meta_title,
        meta_description = EXCLUDED.meta_description,
        updated_at = CURRENT_TIMESTAMP
      RETURNING id
    `, [
      'support-us',
      'Support Us',
      'Support Us - GETFund',
      'Learn how you can support GETFund in transforming education in Ghana.',
      'default',
      true,
      adminId,
      adminId
    ]);

    if (supportUsPage.rows.length > 0) {
      const pageId = supportUsPage.rows[0].id;

      await pool.query(`
        INSERT INTO page_sections (
          page_id, section_key, section_type, title, content,
          order_index, is_active, created_by, updated_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (page_id, section_key) DO UPDATE SET
          content = EXCLUDED.content,
          updated_at = CURRENT_TIMESTAMP
      `, [
        pageId, 'hero', 'hero', 'Support Us Hero',
        JSON.stringify({
          title: 'Support Us',
          subtitle: 'Join us in transforming education',
          backgroundImage: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200',
          ctaText: 'Get Involved',
          ctaLink: '#support'
        }),
        0, true, adminId, adminId
      ]);

      await pool.query(`
        INSERT INTO page_sections (
          page_id, section_key, section_type, title, content,
          order_index, is_active, created_by, updated_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (page_id, section_key) DO UPDATE SET
          content = EXCLUDED.content,
          updated_at = CURRENT_TIMESTAMP
      `, [
        pageId, 'support_info', 'text', 'How to Support',
        JSON.stringify({
          body: '<h2>Support Education in Ghana</h2><p>Your support can help us continue our mission of transforming education across Ghana. There are several ways you can contribute:</p><h3>Financial Contributions</h3><p>Make a donation to support our programs and initiatives.</p><h3>Partnership Opportunities</h3><p>Partner with us to implement educational projects.</p><h3>Volunteer</h3><p>Share your expertise and time to support our mission.</p>',
          alignment: 'left'
        }),
        1, true, adminId, adminId
      ]);

      console.log('✅ "Support Us" page created with 2 sections\n');
    }

    // ========== CONTACT US PAGE ==========
    console.log('📄 Creating "Contact Us" page...');
    const contactPage = await pool.query(`
      INSERT INTO pages (
        slug, title, meta_title, meta_description,
        layout_template, is_active, created_by, updated_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (slug) DO UPDATE SET
        title = EXCLUDED.title,
        meta_title = EXCLUDED.meta_title,
        meta_description = EXCLUDED.meta_description,
        updated_at = CURRENT_TIMESTAMP
      RETURNING id
    `, [
      'contact',
      'Contact Us',
      'Contact Us - GETFund',
      'Get in touch with GETFund. Find our contact information and office locations.',
      'default',
      true,
      adminId,
      adminId
    ]);

    if (contactPage.rows.length > 0) {
      const pageId = contactPage.rows[0].id;

      await pool.query(`
        INSERT INTO page_sections (
          page_id, section_key, section_type, title, content,
          order_index, is_active, created_by, updated_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (page_id, section_key) DO UPDATE SET
          content = EXCLUDED.content,
          updated_at = CURRENT_TIMESTAMP
      `, [
        pageId, 'hero', 'hero', 'Contact Hero',
        JSON.stringify({
          title: 'Contact Us',
          subtitle: 'We\'re here to help',
          backgroundImage: 'https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=1200',
          ctaText: 'Get in Touch',
          ctaLink: '#contact'
        }),
        0, true, adminId, adminId
      ]);

      await pool.query(`
        INSERT INTO page_sections (
          page_id, section_key, section_type, title, content,
          order_index, is_active, created_by, updated_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (page_id, section_key) DO UPDATE SET
          content = EXCLUDED.content,
          updated_at = CURRENT_TIMESTAMP
      `, [
        pageId, 'contact_info', 'text', 'Contact Information',
        JSON.stringify({
          body: '<h2>Get in Touch</h2><p><strong>Ghana Education Trust Fund (GETFund)</strong></p><p><strong>Head Office:</strong><br>Ministry of Education Building<br>Accra, Ghana</p><p><strong>Phone:</strong> +233 (0) 302 XXX XXX<br><strong>Email:</strong> info@getfund.gov.gh<br><strong>Website:</strong> www.getfund.gov.gh</p><p><strong>Office Hours:</strong><br>Monday - Friday: 8:00 AM - 5:00 PM<br>Saturday - Sunday: Closed</p>',
          alignment: 'left'
        }),
        1, true, adminId, adminId
      ]);

      console.log('✅ "Contact Us" page created with 2 sections\n');
    }

    console.log('🎉 All website pages seeded successfully!');
    console.log('\nCreated pages matching menu structure:');
    console.log('  • Who We Are (published) - /who-we-are - 2 sections');
    console.log('  • What We Do (published) - /what-we-do - 2 sections');
    console.log('  • Impact (published) - /impact - 2 sections');
    console.log('  • Resources (published) - /resources - 2 sections');
    console.log('  • Support Us (published) - /support-us - 2 sections');
    console.log('  • Contact Us (published) - /contact - 2 sections');
    console.log('\nNote: News & Updates uses the /news route and is managed through News Articles, not Pages.');

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    await pool.end();
    process.exit(1);
  }
}

seedPages();
