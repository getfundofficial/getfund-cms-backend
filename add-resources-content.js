const { sql } = require('@vercel/postgres');

async function addResourcesPageContent() {
  try {
    // Get the resources page
    const pageResult = await sql`
      SELECT page_id, slug FROM pages WHERE slug = 'resources'
    `;

    if (pageResult.rows.length === 0) {
      console.log('❌ resources page not found');
      return;
    }

    const pageId = pageResult.rows[0].page_id;
    console.log('✓ Found resources page:', pageId);

    // Check if page_content section already exists
    const existingSection = await sql`
      SELECT section_id FROM sections 
      WHERE page_id = ${pageId} AND section_key = 'page_content'
    `;

    const content = {
      // Hero Section
      heroTitle: "Resources & Publications",
      heroSubtitle: "Access our comprehensive collection of reports, policies, research studies, and strategic documents that showcase Ghana's educational development journey.",
      
      // Stats
      stats: {
        documentsAvailable: 50,
        policyDocuments: 15,
        researchStudies: 25,
        annualReports: 12
      },
      
      // Annual Reports
      annualReports: {
        title: "Annual Reports",
        description: "Comprehensive yearly summaries of our activities, achievements, and financial performance",
        documents: [
          {
            id: "1",
            title: "GETFund Annual Report 2023",
            description: "Comprehensive review of activities, projects, and financial performance for 2023",
            category: "Annual Report",
            fileSize: "2.4 MB",
            pages: 98,
            fileType: "PDF",
            publishedDate: "Jan 2024",
            downloadUrl: "/resources/pdfs/annual-report-2023.pdf"
          },
          {
            id: "2",
            title: "GETFund Annual Report 2022",
            description: "Full year report covering all educational initiatives and funding allocations",
            category: "Annual Report",
            fileSize: "3.1 MB",
            pages: 102,
            fileType: "PDF",
            publishedDate: "Jan 2023",
            downloadUrl: "/resources/pdfs/annual-report-2022.pdf"
          },
          {
            id: "3",
            title: "GETFund Annual Report 2021",
            description: "Detailed account of programs, scholarships, and infrastructure projects",
            category: "Annual Report",
            fileSize: "2.8 MB",
            pages: 94,
            fileType: "PDF",
            publishedDate: "Feb 2022",
            downloadUrl: "/resources/pdfs/annual-report-2021.pdf"
          }
        ]
      },
      
      // Policies & Guidelines
      policiesGuidelines: {
        title: "Policies & Guidelines",
        description: "Official policies, guidelines, and frameworks governing our operations and programs",
        documents: [
          {
            id: "4",
            title: "Scholarship Guidelines 2024",
            description: "Complete guidelines for scholarship applications, eligibility, and selection criteria",
            category: "Policy Document",
            fileSize: "890 KB",
            pages: 24,
            fileType: "PDF",
            publishedDate: "Mar 2024",
            downloadUrl: "/resources/pdfs/scholarship-guidelines-2024.pdf"
          },
          {
            id: "5",
            title: "Infrastructure Investment Policy",
            description: "Framework for educational infrastructure project funding and implementation",
            category: "Policy Document",
            fileSize: "1.2 MB",
            pages: 36,
            fileType: "PDF",
            publishedDate: "Feb 2024",
            downloadUrl: "/resources/pdfs/infrastructure-policy.pdf"
          },
          {
            id: "6",
            title: "Financial Management Guidelines",
            description: "Comprehensive financial management and accountability framework",
            category: "Policy Document",
            fileSize: "1.1 MB",
            pages: 42,
            fileType: "PDF",
            publishedDate: "Jan 2024",
            downloadUrl: "/resources/pdfs/financial-guidelines.pdf"
          }
        ]
      },
      
      // Research & Studies
      researchStudies: {
        title: "Research & Studies",
        description: "In-depth research studies and impact assessments of our educational initiatives",
        documents: [
          {
            id: "7",
            title: "Impact Assessment of Free SHS Program",
            description: "Comprehensive study analyzing the impact and effectiveness of free education initiatives",
            category: "Research Study",
            fileSize: "3.5 MB",
            pages: 128,
            fileType: "PDF",
            publishedDate: "Apr 2024",
            downloadUrl: "/resources/pdfs/free-shs-impact.pdf"
          },
          {
            id: "8",
            title: "Educational Infrastructure Needs Analysis",
            description: "Detailed assessment of infrastructure gaps and investment requirements",
            category: "Research Study",
            fileSize: "2.9 MB",
            pages: 86,
            fileType: "PDF",
            publishedDate: "Mar 2024",
            downloadUrl: "/resources/pdfs/infrastructure-needs.pdf"
          },
          {
            id: "9",
            title: "Scholarship Program Effectiveness Study",
            description: "Analysis of scholarship outcomes and impact on beneficiaries",
            category: "Research Study",
            fileSize: "2.2 MB",
            pages: 64,
            fileType: "PDF",
            publishedDate: "Feb 2024",
            downloadUrl: "/resources/pdfs/scholarship-effectiveness.pdf"
          }
        ]
      },
      
      // Strategic Publications
      strategicPublications: {
        title: "Strategic Publications",
        description: "Strategic plans, frameworks, and roadmaps for Ghana's educational development",
        documents: [
          {
            id: "10",
            title: "GETFund Strategic Plan 2024-2029",
            description: "Five-year roadmap outlining vision, priorities, and implementation strategies",
            category: "Strategic Plan",
            fileSize: "4.2 MB",
            pages: 156,
            fileType: "PDF",
            publishedDate: "Jan 2024",
            downloadUrl: "/resources/pdfs/strategic-plan-2024-2029.pdf"
          },
          {
            id: "11",
            title: "Educational Quality Improvement Framework",
            description: "Framework for advancing educational standards and learning outcomes",
            category: "Strategic Plan",
            fileSize: "2.7 MB",
            pages: 78,
            fileType: "PDF",
            publishedDate: "Dec 2023",
            downloadUrl: "/resources/pdfs/quality-framework.pdf"
          }
        ]
      },
      
      // Newsletter Section
      newsletterTitle: "Stay Updated with Our Latest Publications",
      newsletterSubtitle: "Subscribe to our newsletter to receive notifications about new reports, policies, and research studies as published.",
      newsletterPlaceholder: "Enter your email address",
      newsletterButtonText: "Subscribe",
      newsletterFooterText: "Need help finding a specific document?",
      newsletterContactEmail: "info@getfund.gov.gh",
      newsletterContactPhone: "+233 (0)302 664 928-930"
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
        'Resources Page Content',
        ${JSON.stringify(content)}::jsonb,
        0,
        true,
        ${userId},
        ${userId}
      )
    `;

    console.log('✓ Created page_content section for resources page');
    console.log('✓ Content includes:', Object.keys(content).join(', '));

  } catch (error) {
    console.error('❌ Error adding resources page content:', error);
    throw error;
  }
}

// Run the function
addResourcesPageContent()
  .then(() => {
    console.log('✅ Resources page content setup complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  });
