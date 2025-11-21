require('dotenv').config();
const { sql } = require('@vercel/postgres');

async function addAllPageContent() {
  console.log('🚀 Adding page_content sections to all pages...\n');

  try {
    // 1. HOME PAGE
    console.log('1️⃣  Processing Home page...');
    const homeResult = await sql`
      SELECT id, slug FROM pages WHERE slug IN ('home', 'homepage', '')
      ORDER BY id LIMIT 1
    `;
    
    if (homeResult.rows.length > 0) {
      const pageId = homeResult.rows[0].id;
      const existingHome = await sql`
        SELECT id FROM page_sections 
        WHERE page_id = ${pageId} AND section_key = 'page_content'
      `;

      const homeContent = {
        aboutTitle: "Empowering Ghana Through Education",
        aboutSubtitle: "Building Brighter Futures",
        aboutDescription: "Since our establishment in 2000, the Ghana Education Trust Fund (GETFund) has been at the forefront of transforming Ghana's educational landscape. We provide critical funding for educational infrastructure, scholarships, and support programs that ensure quality education is accessible to all Ghanaians, from basic to tertiary levels.",
        aboutStats: [
          { number: "5,000+", label: "Schools Supported", description: "Educational institutions nationwide" },
          { number: "2M+", label: "Students Reached", description: "Beneficiaries of our programs" },
          { number: "50+", label: "Infrastructure Projects", description: "Completed and ongoing" },
          { number: "16", label: "Regions Covered", description: "Nationwide impact" }
        ],
        aboutImage: "/images/about/getfund-students.jpg",
        aboutImageAlt: "Students benefiting from GETFund programs",
        ctaText: "Learn More About Us",
        ctaLink: "/who-we-are"
      };

      if (existingHome.rows.length > 0) {
        await sql`UPDATE page_sections SET content = ${JSON.stringify(homeContent)}::jsonb, updated_at = NOW() WHERE id = ${existingHome.rows[0].id}`;
        console.log('   ✓ Updated Home page_content');
      } else {
        const userResult = await sql`SELECT id FROM users WHERE role = 'admin' LIMIT 1`;
        const userId = userResult.rows[0].id;
        await sql`INSERT INTO page_sections (page_id, section_key, section_type, title, content, order_index, is_active, created_by, updated_by) 
                  VALUES (${pageId}, 'page_content', 'page_content', 'Home Page Content', ${JSON.stringify(homeContent)}::jsonb, 0, true, ${userId}, ${userId})`;
        console.log('   ✓ Created Home page_content');
      }
    } else {
      console.log('   ⚠️  Home page not found');
    }

    // 2. WHAT WE DO PAGE
    console.log('\n2️⃣  Processing What We Do page...');
    const whatWeDoResult = await sql`SELECT id FROM pages WHERE slug = 'what-we-do'`;
    
    if (whatWeDoResult.rows.length > 0) {
      const pageId = whatWeDoResult.rows[0].id;
      const existingWhatWeDo = await sql`SELECT id FROM page_sections WHERE page_id = ${pageId} AND section_key = 'page_content'`;

      const whatWeDoContent = {
        servicesTitle: "What We Do",
        servicesSubtitle: "GETFund is committed to transforming education in Ghana through strategic investments and key initiatives.",
        services: [
          { title: "Scholarship Programme", description: "Financial support for talented Ghanaians to pursue higher education at local and international institutions", link: "/service/scholarship-programme" },
          { title: "Infrastructure Projects", description: "Building and renovating educational facilities including classrooms, science labs, and libraries across Ghana", link: "/service/infrastructure-projects" },
          { title: "Education Sector Support", description: "Comprehensive support for educational development through equipment provision and capacity building", link: "/service/education-sector-support" }
        ],
        impactStats: [
          { number: "5,000+", label: "Schools Supported", description: "Educational institutions nationwide" },
          { number: "2M+", label: "Students Reached", description: "Beneficiaries of our programs" },
          { number: "50+", label: "Infrastructure Projects", description: "Completed and ongoing" },
          { number: "16", label: "Regions Covered", description: "Nationwide impact" }
        ]
      };

      if (existingWhatWeDo.rows.length > 0) {
        await sql`UPDATE page_sections SET content = ${JSON.stringify(whatWeDoContent)}::jsonb, updated_at = NOW() WHERE id = ${existingWhatWeDo.rows[0].id}`;
        console.log('   ✓ Updated What We Do page_content');
      } else {
        const userResult = await sql`SELECT id FROM users WHERE role = 'admin' LIMIT 1`;
        const userId = userResult.rows[0].id;
        await sql`INSERT INTO page_sections (page_id, section_key, section_type, title, content, order_index, is_active, created_by, updated_by) 
                  VALUES (${pageId}, 'page_content', 'page_content', 'What We Do Page Content', ${JSON.stringify(whatWeDoContent)}::jsonb, 0, true, ${userId}, ${userId})`;
        console.log('   ✓ Created What We Do page_content');
      }
    } else {
      console.log('   ⚠️  What We Do page not found');
    }

    // 3. WHO WE ARE PAGE
    console.log('\n3️⃣  Processing Who We Are page...');
    const whoWeAreResult = await sql`SELECT id FROM pages WHERE slug = 'who-we-are'`;
    
    if (whoWeAreResult.rows.length > 0) {
      const pageId = whoWeAreResult.rows[0].id;
      const existingWhoWeAre = await sql`SELECT id FROM page_sections WHERE page_id = ${pageId} AND section_key = 'page_content'`;

      const whoWeAreContent = {
        heroTitle: "About Us",
        heroSubtitle: "Supporting the delivery of quality education to Ghanaians from basic to tertiary level",
        mainImage: "/images/about/getfund-board.jpg",
        mainImageAlt: "GETFund Board",
        mainHeading: "Ghana Education Trust Fund",
        redHeading: "Since its establishment in the year 2000,",
        paragraph1: "The fund has remained committed to its mandate espoused in its governing legislation, Act 581. The object of the Fund is to provide funding to supplement government's effort for the provision of educational infrastructure and facilities at all levels.",
        paragraph2: "GETFund has since its inception remained a significant player in Ghana's education sector not only by way of providing physical infrastructure, but also through the enhancement of our human capital, awarding scholarships to many deserving citizens.",
        vision: { title: "Our Vision", description: "To become a leading education trust fund in Africa, ensuring quality and accessible education for all Ghanaians" },
        mission: { title: "Our Mission", description: "To mobilize and manage financial resources for the provision and expansion of educational infrastructure at all levels of education in Ghana" },
        values: { title: "Our Values", description: "Integrity, transparency, excellence, and commitment to transforming lives through education" },
        financingTitle: "The Issue of Educational Financing",
        costSharingPolicy: "Currently in Ghana, due to government's inability to solely sustain tertiary education efforts, the cost of self financing has been introduced through the adoption of the cost sharing policy.",
        publicResponsibility: "Notwithstanding all cost sharing options available from the public, the policy will not only politicize educational access for Ghanaians but is not capable of reaching the full purpose of higher education promotion if the purpose of higher education funding is not adequately equalized by the government.",
        fundingFormulaTitle: "Funding Formula",
        fundingFormulaIntro: "The law establishing GETFund further emphasizes a distribution formula that must be approved by Parliament each year, requiring that some crucial factors related to education delivery and development are considered in the process of preparing the Formula. These relevant factors should include but not limited to:",
        relevantFactors: ["promotion of the study of Mathematics, Science and Technology", "advancement of female education", "reduction in the high level of illiteracy in historically disadvantaged areas", "promotion of Vocational, Technical Education and Training", "equitable allocation of funds to the Districts at the Pre-Tertiary level of education"],
        leadershipTitle: "Leadership & Governance",
        leadershipSubtitle: "Strong leadership and transparent governance for educational transformation",
        boardImage: "/images/about/getfund-board.jpg",
        boardTitle: "Committed Board of Directors",
        boardDescription: "Our experienced board of directors includes leaders from all spheres of education, finance, and public administration to guide GETFund's strategic direction and ensure accountability in all our initiatives.",
        boardCommitments: [
          { title: "Strategic Direction", description: "Setting priorities and overseeing implementation", icon: "1" },
          { title: "Performance Monitoring", description: "Ensuring all projects achieve educational outcomes", icon: "2" },
          { title: "Stakeholder Engagement", description: "Building partnerships for educational success", icon: "3" }
        ],
        footerMessage: "Supporting the delivery of quality education."
      };

      if (existingWhoWeAre.rows.length > 0) {
        await sql`UPDATE page_sections SET content = ${JSON.stringify(whoWeAreContent)}::jsonb, updated_at = NOW() WHERE id = ${existingWhoWeAre.rows[0].id}`;
        console.log('   ✓ Updated Who We Are page_content');
      } else {
        const userResult = await sql`SELECT id FROM users WHERE role = 'admin' LIMIT 1`;
        const userId = userResult.rows[0].id;
        await sql`INSERT INTO page_sections (page_id, section_key, section_type, title, content, order_index, is_active, created_by, updated_by) 
                  VALUES (${pageId}, 'page_content', 'page_content', 'Who We Are Page Content', ${JSON.stringify(whoWeAreContent)}::jsonb, 0, true, ${userId}, ${userId})`;
        console.log('   ✓ Created Who We Are page_content');
      }
    } else {
      console.log('   ⚠️  Who We Are page not found');
    }

    // 4. RESOURCES PAGE
    console.log('\n4️⃣  Processing Resources page...');
    const resourcesResult = await sql`SELECT id FROM pages WHERE slug = 'resources'`;
    
    if (resourcesResult.rows.length > 0) {
      const pageId = resourcesResult.rows[0].id;
      const existingResources = await sql`SELECT id FROM page_sections WHERE page_id = ${pageId} AND section_key = 'page_content'`;

      const resourcesContent = {
        heroTitle: "Resources & Publications",
        heroSubtitle: "Access our comprehensive collection of reports, policies, research studies, and strategic documents that showcase Ghana's educational development journey.",
        stats: { documentsAvailable: 50, policyDocuments: 15, researchStudies: 25, annualReports: 12 },
        annualReports: {
          title: "Annual Reports",
          description: "Comprehensive yearly summaries of our activities, achievements, and financial performance",
          documents: [
            { id: "1", title: "GETFund Annual Report 2023", description: "Comprehensive review of activities, projects, and financial performance for 2023", category: "Annual Report", fileSize: "2.4 MB", pages: 98, fileType: "PDF", publishedDate: "Jan 2024", downloadUrl: "/resources/pdfs/annual-report-2023.pdf" },
            { id: "2", title: "GETFund Annual Report 2022", description: "Full year report covering all educational initiatives and funding allocations", category: "Annual Report", fileSize: "3.1 MB", pages: 102, fileType: "PDF", publishedDate: "Jan 2023", downloadUrl: "/resources/pdfs/annual-report-2022.pdf" },
            { id: "3", title: "GETFund Annual Report 2021", description: "Detailed account of programs, scholarships, and infrastructure projects", category: "Annual Report", fileSize: "2.8 MB", pages: 94, fileType: "PDF", publishedDate: "Feb 2022", downloadUrl: "/resources/pdfs/annual-report-2021.pdf" }
          ]
        },
        policiesGuidelines: {
          title: "Policies & Guidelines",
          description: "Official policies, guidelines, and frameworks governing our operations and programs",
          documents: [
            { id: "4", title: "Scholarship Guidelines 2024", description: "Complete guidelines for scholarship applications, eligibility, and selection criteria", category: "Policy Document", fileSize: "890 KB", pages: 24, fileType: "PDF", publishedDate: "Mar 2024", downloadUrl: "/resources/pdfs/scholarship-guidelines-2024.pdf" },
            { id: "5", title: "Infrastructure Investment Policy", description: "Framework for educational infrastructure project funding and implementation", category: "Policy Document", fileSize: "1.2 MB", pages: 36, fileType: "PDF", publishedDate: "Feb 2024", downloadUrl: "/resources/pdfs/infrastructure-policy.pdf" },
            { id: "6", title: "Financial Management Guidelines", description: "Comprehensive financial management and accountability framework", category: "Policy Document", fileSize: "1.1 MB", pages: 42, fileType: "PDF", publishedDate: "Jan 2024", downloadUrl: "/resources/pdfs/financial-guidelines.pdf" }
          ]
        },
        researchStudies: {
          title: "Research & Studies",
          description: "In-depth research studies and impact assessments of our educational initiatives",
          documents: [
            { id: "7", title: "Impact Assessment of Free SHS Program", description: "Comprehensive study analyzing the impact and effectiveness of free education initiatives", category: "Research Study", fileSize: "3.5 MB", pages: 128, fileType: "PDF", publishedDate: "Apr 2024", downloadUrl: "/resources/pdfs/free-shs-impact.pdf" },
            { id: "8", title: "Educational Infrastructure Needs Analysis", description: "Detailed assessment of infrastructure gaps and investment requirements", category: "Research Study", fileSize: "2.9 MB", pages: 86, fileType: "PDF", publishedDate: "Mar 2024", downloadUrl: "/resources/pdfs/infrastructure-needs.pdf" },
            { id: "9", title: "Scholarship Program Effectiveness Study", description: "Analysis of scholarship outcomes and impact on beneficiaries", category: "Research Study", fileSize: "2.2 MB", pages: 64, fileType: "PDF", publishedDate: "Feb 2024", downloadUrl: "/resources/pdfs/scholarship-effectiveness.pdf" }
          ]
        },
        strategicPublications: {
          title: "Strategic Publications",
          description: "Strategic plans, frameworks, and roadmaps for Ghana's educational development",
          documents: [
            { id: "10", title: "GETFund Strategic Plan 2024-2029", description: "Five-year roadmap outlining vision, priorities, and implementation strategies", category: "Strategic Plan", fileSize: "4.2 MB", pages: 156, fileType: "PDF", publishedDate: "Jan 2024", downloadUrl: "/resources/pdfs/strategic-plan-2024-2029.pdf" },
            { id: "11", title: "Educational Quality Improvement Framework", description: "Framework for advancing educational standards and learning outcomes", category: "Strategic Plan", fileSize: "2.7 MB", pages: 78, fileType: "PDF", publishedDate: "Dec 2023", downloadUrl: "/resources/pdfs/quality-framework.pdf" }
          ]
        },
        newsletterTitle: "Stay Updated with Our Latest Publications",
        newsletterSubtitle: "Subscribe to our newsletter to receive notifications about new reports, policies, and research studies as published.",
        newsletterPlaceholder: "Enter your email address",
        newsletterButtonText: "Subscribe",
        newsletterFooterText: "Need help finding a specific document?",
        newsletterContactEmail: "info@getfund.gov.gh",
        newsletterContactPhone: "+233 (0)302 664 928-930"
      };

      if (existingResources.rows.length > 0) {
        await sql`UPDATE page_sections SET content = ${JSON.stringify(resourcesContent)}::jsonb, updated_at = NOW() WHERE id = ${existingResources.rows[0].id}`;
        console.log('   ✓ Updated Resources page_content');
      } else {
        const userResult = await sql`SELECT id FROM users WHERE role = 'admin' LIMIT 1`;
        const userId = userResult.rows[0].id;
        await sql`INSERT INTO page_sections (page_id, section_key, section_type, title, content, order_index, is_active, created_by, updated_by) 
                  VALUES (${pageId}, 'page_content', 'page_content', 'Resources Page Content', ${JSON.stringify(resourcesContent)}::jsonb, 0, true, ${userId}, ${userId})`;
        console.log('   ✓ Created Resources page_content');
      }
    } else {
      console.log('   ⚠️  Resources page not found');
    }

    console.log('\n✅ All page_content sections have been added/updated successfully!');
    console.log('\n📝 Summary:');
    console.log('   - Home: About section with stats');
    console.log('   - What We Do: Services and impact stats');
    console.log('   - Who We Are: Complete about page with vision, mission, values, financing, funding formula, leadership');
    console.log('   - Resources: Document library with annual reports, policies, research, strategic plans');
    console.log('\n💡 You can now edit all content through the CMS dashboard!');

  } catch (error) {
    console.error('\n❌ Error adding page content:', error);
    throw error;
  }
}

// Run the function
addAllPageContent()
  .then(() => {
    console.log('\n🎉 Setup complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Setup failed:', error);
    process.exit(1);
  });
