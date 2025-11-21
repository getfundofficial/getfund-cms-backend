const { sql } = require('@vercel/postgres');

async function addWhoWeArePageContent() {
  try {
    // Get the who-we-are page
    const pageResult = await sql`
      SELECT page_id, slug FROM pages WHERE slug = 'who-we-are'
    `;

    if (pageResult.rows.length === 0) {
      console.log('❌ who-we-are page not found');
      return;
    }

    const pageId = pageResult.rows[0].page_id;
    console.log('✓ Found who-we-are page:', pageId);

    // Check if page_content section already exists
    const existingSection = await sql`
      SELECT section_id FROM sections 
      WHERE page_id = ${pageId} AND section_key = 'page_content'
    `;

    const content = {
      // Hero Section
      heroTitle: "About Us",
      heroSubtitle: "Supporting the delivery of quality education to Ghanaians from basic to tertiary level",
      
      // Main Content - Ghana Education Trust Fund
      mainImage: "/images/about/getfund-board.jpg",
      mainImageAlt: "GETFund Board",
      mainHeading: "Ghana Education Trust Fund",
      redHeading: "Since its establishment in the year 2000,",
      paragraph1: "The fund has remained committed to its mandate espoused in its governing legislation, Act 581. The object of the Fund is to provide funding to supplement government's effort for the provision of educational infrastructure and facilities at all levels.",
      paragraph2: "GETFund has since its inception remained a significant player in Ghana's education sector not only by way of providing physical infrastructure, but also through the enhancement of our human capital, awarding scholarships to many deserving citizens.",
      
      // Vision, Mission, Values
      vision: {
        title: "Our Vision",
        description: "To become a leading education trust fund in Africa, ensuring quality and accessible education for all Ghanaians"
      },
      mission: {
        title: "Our Mission",
        description: "To mobilize and manage financial resources for the provision and expansion of educational infrastructure at all levels of education in Ghana"
      },
      values: {
        title: "Our Values",
        description: "Integrity, transparency, excellence, and commitment to transforming lives through education"
      },
      
      // Educational Financing
      financingTitle: "The Issue of Educational Financing",
      costSharingPolicy: "Currently in Ghana, due to government's inability to solely sustain tertiary education efforts, the cost of self financing has been introduced through the adoption of the cost sharing policy.",
      publicResponsibility: "Notwithstanding all cost sharing options available from the public, the policy will not only politicize educational access for Ghanaians but is not capable of reaching the full purpose of higher education promotion if the purpose of higher education funding is not adequately equalized by the government.",
      
      // Funding Formula
      fundingFormulaTitle: "Funding Formula",
      fundingFormulaIntro: "The law establishing GETFund further emphasizes a distribution formula that must be approved by Parliament each year, requiring that some crucial factors related to education delivery and development are considered in the process of preparing the Formula. These relevant factors should include but not limited to:",
      relevantFactors: [
        "promotion of the study of Mathematics, Science and Technology",
        "advancement of female education",
        "reduction in the high level of illiteracy in historically disadvantaged areas",
        "promotion of Vocational, Technical Education and Training",
        "equitable allocation of funds to the Districts at the Pre-Tertiary level of education"
      ],
      
      // Leadership & Governance
      leadershipTitle: "Leadership & Governance",
      leadershipSubtitle: "Strong leadership and transparent governance for educational transformation",
      
      // Board of Directors
      boardImage: "/images/about/getfund-board.jpg",
      boardTitle: "Committed Board of Directors",
      boardDescription: "Our experienced board of directors includes leaders from all spheres of education, finance, and public administration to guide GETFund's strategic direction and ensure accountability in all our initiatives.",
      boardCommitments: [
        {
          title: "Strategic Direction",
          description: "Setting priorities and overseeing implementation",
          icon: "1"
        },
        {
          title: "Performance Monitoring",
          description: "Ensuring all projects achieve educational outcomes",
          icon: "2"
        },
        {
          title: "Stakeholder Engagement",
          description: "Building partnerships for educational success",
          icon: "3"
        }
      ],
      
      // Footer Message
      footerMessage: "Supporting the delivery of quality education."
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
        'Who We Are Page Content',
        ${JSON.stringify(content)}::jsonb,
        0,
        true,
        ${userId},
        ${userId}
      )
    `;

    console.log('✓ Created page_content section for who-we-are page');
    console.log('✓ Content includes:', Object.keys(content).join(', '));

  } catch (error) {
    console.error('❌ Error adding who-we-are page content:', error);
    throw error;
  }
}

// Run the function
addWhoWeArePageContent()
  .then(() => {
    console.log('✅ Who We Are page content setup complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  });
