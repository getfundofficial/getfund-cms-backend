const { sql } = require('@vercel/postgres');

async function addHomePageContent() {
  try {
    // Get the home page (slug might be 'home' or empty for homepage)
    const pageResult = await sql`
      SELECT page_id, slug FROM pages WHERE slug IN ('home', 'homepage', '')
      ORDER BY page_id LIMIT 1
    `;

    if (pageResult.rows.length === 0) {
      console.log('❌ home page not found');
      return;
    }

    const pageId = pageResult.rows[0].page_id;
    console.log('✓ Found home page:', pageId);

    // Check if page_content section already exists
    const existingSection = await sql`
      SELECT section_id FROM sections 
      WHERE page_id = ${pageId} AND section_key = 'page_content'
    `;

    const content = {
      // About Section
      aboutTitle: "Empowering Ghana Through Education",
      aboutSubtitle: "Building Brighter Futures",
      aboutDescription: "Since our establishment in 2000, the Ghana Education Trust Fund (GETFund) has been at the forefront of transforming Ghana's educational landscape. We provide critical funding for educational infrastructure, scholarships, and support programs that ensure quality education is accessible to all Ghanaians, from basic to tertiary levels.",
      aboutStats: [
        {
          number: "5,000+",
          label: "Schools Supported",
          description: "Educational institutions nationwide"
        },
        {
          number: "2M+",
          label: "Students Reached",
          description: "Beneficiaries of our programs"
        },
        {
          number: "50+",
          label: "Infrastructure Projects",
          description: "Completed and ongoing"
        },
        {
          number: "16",
          label: "Regions Covered",
          description: "Nationwide impact"
        }
      ],
      aboutImage: "/images/about/getfund-students.jpg",
      aboutImageAlt: "Students benefiting from GETFund programs",
      
      // Call to Action
      ctaText: "Learn More About Us",
      ctaLink: "/who-we-are"
    };

    if (existingSection.rows.length > 0) {
      console.log('ℹ️  page_content section already exists, updating...');
      
      await sql`
        UPDATE sections
        SET content = ${JSON.stringify(content)}::jsonb,
            updated_at = NOW()
        WHERE section_id = ${existingSection.rows[0].section_id}
      `;
      
      console.log('✓ Updated page_content section');
      return;
    }

    // Get admin user
    const userResult = await sql`
      SELECT id FROM users WHERE role = 'admin' LIMIT 1
    `;
    const userId = userResult.rows[0].id;

    // Insert new page_content section
    await sql`
      INSERT INTO sections (
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
        'page_content',
        'page_content',
        'Home Page Content',
        ${JSON.stringify(content)}::jsonb,
        0,
        true,
        ${userId},
        ${userId}
      )
    `;

    console.log('✓ Created page_content section for home page');
    console.log('✓ Content includes:', Object.keys(content).join(', '));

  } catch (error) {
    console.error('❌ Error adding home page content:', error);
    throw error;
  }
}

// Run the function
addHomePageContent()
  .then(() => {
    console.log('✅ Home page content setup complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  });
