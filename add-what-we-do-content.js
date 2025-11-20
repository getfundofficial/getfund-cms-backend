const { sql } = require('@vercel/postgres');

async function addWhatWeDoPageContent() {
  try {
    // Get the what-we-do page
    const pageResult = await sql`
      SELECT page_id, slug FROM pages WHERE slug = 'what-we-do'
    `;

    if (pageResult.rows.length === 0) {
      console.log('❌ what-we-do page not found');
      return;
    }

    const pageId = pageResult.rows[0].page_id;
    console.log('✓ Found what-we-do page:', pageId);

    // Check if page_content section already exists
    const existingSection = await sql`
      SELECT section_id FROM sections 
      WHERE page_id = ${pageId} AND section_key = 'page_content'
    `;

    if (existingSection.rows.length > 0) {
      console.log('ℹ️  page_content section already exists, updating...');
      
      const content = {
        servicesTitle: "What We Do",
        servicesSubtitle: "GETFund is committed to transforming education in Ghana through strategic investments and key initiatives.",
        services: [
          {
            title: "Scholarship Programme",
            description: "Financial support for talented Ghanaians to pursue higher education at local and international institutions",
            link: "/service/scholarship-programme"
          },
          {
            title: "Infrastructure Projects",
            description: "Building and renovating educational facilities including classrooms, science labs, and libraries across Ghana",
            link: "/service/infrastructure-projects"
          },
          {
            title: "Education Sector Support",
            description: "Comprehensive support for educational development through equipment provision and capacity building",
            link: "/service/education-sector-support"
          }
        ],
        impactStats: [
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
        ]
      };

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
    const content = {
      servicesTitle: "What We Do",
      servicesSubtitle: "GETFund is committed to transforming education in Ghana through strategic investments and key initiatives.",
      services: [
        {
          title: "Scholarship Programme",
          description: "Financial support for talented Ghanaians to pursue higher education at local and international institutions",
          link: "/service/scholarship-programme"
        },
        {
          title: "Infrastructure Projects",
          description: "Building and renovating educational facilities including classrooms, science labs, and libraries across Ghana",
          link: "/service/infrastructure-projects"
        },
        {
          title: "Education Sector Support",
          description: "Comprehensive support for educational development through equipment provision and capacity building",
          link: "/service/education-sector-support"
        }
      ],
      impactStats: [
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
      ]
    };

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
        'What We Do Page Content',
        ${JSON.stringify(content)}::jsonb,
        0,
        true,
        ${userId},
        ${userId}
      )
    `;

    console.log('✓ Created page_content section for what-we-do page');
    console.log('✓ Content includes:', Object.keys(content).join(', '));

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

addWhatWeDoPageContent();
