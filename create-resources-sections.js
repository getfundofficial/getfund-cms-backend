require('dotenv').config();
const { sql } = require('@vercel/postgres');

async function createResourcesSections() {
  try {
    console.log('🚀 Creating individual sections for Resources page...\n');

    // Get the resources page
    const pageResult = await sql`
      SELECT id FROM pages WHERE slug = 'resources'
    `;

    if (pageResult.rows.length === 0) {
      console.log('❌ resources page not found');
      return;
    }

    const pageId = pageResult.rows[0].id;
    console.log('✓ Found resources page:', pageId);

    // Get admin user
    const userResult = await sql`
      SELECT id FROM users WHERE role = 'admin' LIMIT 1
    `;
    const userId = userResult.rows[0].id;

    // Delete all existing sections first
    await sql`DELETE FROM page_sections WHERE page_id = ${pageId}`;
    console.log('✓ Cleared existing sections\n');

    const sections = [
      {
        section_key: 'hero',
        section_type: 'hero',
        title: 'Hero Section',
        order_index: 0,
        content: {
          title: 'Resources & Publications',
          subtitle: 'Access our comprehensive collection of reports, policies, research studies, and strategic documents that showcase Ghana\'s educational development journey.',
          backgroundImage: '/images/hero/resources-bg.jpg'
        }
      },
      {
        section_key: 'stats',
        section_type: 'stats',
        title: 'Resource Statistics',
        order_index: 1,
        content: {
          stats: [
            { number: '50+', label: 'Documents Available' },
            { number: '15', label: 'Policy Documents' },
            { number: '25', label: 'Research Studies' },
            { number: '12', label: 'Annual Reports' }
          ]
        }
      },
      {
        section_key: 'annual_reports',
        section_type: 'gallery',
        title: 'Annual Reports',
        order_index: 2,
        content: {
          title: 'Annual Reports',
          description: 'Comprehensive yearly summaries of our activities, achievements, and financial performance',
          documents: [
            {
              id: '1',
              title: 'GETFund Annual Report 2023',
              description: 'Comprehensive review of activities, projects, and financial performance for 2023',
              category: 'Annual Report',
              fileSize: '2.4 MB',
              pages: 98,
              fileType: 'PDF',
              publishedDate: 'Jan 2024',
              downloadUrl: '/resources/pdfs/annual-report-2023.pdf'
            },
            {
              id: '2',
              title: 'GETFund Annual Report 2022',
              description: 'Full year report covering all educational initiatives and funding allocations',
              category: 'Annual Report',
              fileSize: '3.1 MB',
              pages: 102,
              fileType: 'PDF',
              publishedDate: 'Jan 2023',
              downloadUrl: '/resources/pdfs/annual-report-2022.pdf'
            },
            {
              id: '3',
              title: 'GETFund Annual Report 2021',
              description: 'Detailed account of programs, scholarships, and infrastructure projects',
              category: 'Annual Report',
              fileSize: '2.8 MB',
              pages: 94,
              fileType: 'PDF',
              publishedDate: 'Feb 2022',
              downloadUrl: '/resources/pdfs/annual-report-2021.pdf'
            }
          ]
        }
      },
      {
        section_key: 'policies_guidelines',
        section_type: 'gallery',
        title: 'Policies & Guidelines',
        order_index: 3,
        content: {
          title: 'Policies & Guidelines',
          description: 'Official policies, guidelines, and frameworks governing our operations and programs',
          documents: [
            {
              id: '4',
              title: 'Scholarship Guidelines 2024',
              description: 'Complete guidelines for scholarship applications, eligibility, and selection criteria',
              category: 'Policy Document',
              fileSize: '890 KB',
              pages: 24,
              fileType: 'PDF',
              publishedDate: 'Mar 2024',
              downloadUrl: '/resources/pdfs/scholarship-guidelines-2024.pdf'
            },
            {
              id: '5',
              title: 'Infrastructure Investment Policy',
              description: 'Framework for educational infrastructure project funding and implementation',
              category: 'Policy Document',
              fileSize: '1.2 MB',
              pages: 36,
              fileType: 'PDF',
              publishedDate: 'Feb 2024',
              downloadUrl: '/resources/pdfs/infrastructure-policy.pdf'
            },
            {
              id: '6',
              title: 'Financial Management Guidelines',
              description: 'Comprehensive financial management and accountability framework',
              category: 'Policy Document',
              fileSize: '1.1 MB',
              pages: 42,
              fileType: 'PDF',
              publishedDate: 'Jan 2024',
              downloadUrl: '/resources/pdfs/financial-guidelines.pdf'
            }
          ]
        }
      },
      {
        section_key: 'research_studies',
        section_type: 'gallery',
        title: 'Research & Studies',
        order_index: 4,
        content: {
          title: 'Research & Studies',
          description: 'In-depth research studies and impact assessments of our educational initiatives',
          documents: [
            {
              id: '7',
              title: 'Impact Assessment of Free SHS Program',
              description: 'Comprehensive study analyzing the impact and effectiveness of free education initiatives',
              category: 'Research Study',
              fileSize: '3.5 MB',
              pages: 128,
              fileType: 'PDF',
              publishedDate: 'Apr 2024',
              downloadUrl: '/resources/pdfs/free-shs-impact.pdf'
            },
            {
              id: '8',
              title: 'Educational Infrastructure Needs Analysis',
              description: 'Detailed assessment of infrastructure gaps and investment requirements',
              category: 'Research Study',
              fileSize: '2.9 MB',
              pages: 86,
              fileType: 'PDF',
              publishedDate: 'Mar 2024',
              downloadUrl: '/resources/pdfs/infrastructure-needs.pdf'
            },
            {
              id: '9',
              title: 'Scholarship Program Effectiveness Study',
              description: 'Analysis of scholarship outcomes and impact on beneficiaries',
              category: 'Research Study',
              fileSize: '2.2 MB',
              pages: 64,
              fileType: 'PDF',
              publishedDate: 'Feb 2024',
              downloadUrl: '/resources/pdfs/scholarship-effectiveness.pdf'
            }
          ]
        }
      },
      {
        section_key: 'strategic_publications',
        section_type: 'gallery',
        title: 'Strategic Publications',
        order_index: 5,
        content: {
          title: 'Strategic Publications',
          description: 'Strategic plans, frameworks, and roadmaps for Ghana\'s educational development',
          documents: [
            {
              id: '10',
              title: 'GETFund Strategic Plan 2024-2029',
              description: 'Five-year roadmap outlining vision, priorities, and implementation strategies',
              category: 'Strategic Plan',
              fileSize: '4.2 MB',
              pages: 156,
              fileType: 'PDF',
              publishedDate: 'Jan 2024',
              downloadUrl: '/resources/pdfs/strategic-plan-2024-2029.pdf'
            },
            {
              id: '11',
              title: 'Educational Quality Improvement Framework',
              description: 'Framework for advancing educational standards and learning outcomes',
              category: 'Strategic Plan',
              fileSize: '2.7 MB',
              pages: 78,
              fileType: 'PDF',
              publishedDate: 'Dec 2023',
              downloadUrl: '/resources/pdfs/quality-framework.pdf'
            }
          ]
        }
      },
      {
        section_key: 'newsletter_subscription',
        section_type: 'cta',
        title: 'Newsletter Subscription',
        order_index: 6,
        content: {
          title: 'Stay Updated with Our Latest Publications',
          subtitle: 'Subscribe to our newsletter to receive notifications about new reports, policies, and research studies as published.',
          placeholder: 'Enter your email address',
          buttonText: 'Subscribe',
          footerText: 'Need help finding a specific document?',
          contactEmail: 'info@getfund.gov.gh',
          contactPhone: '+233 (0)302 664 928-930'
        }
      }
    ];

    console.log('📝 Creating sections...\n');

    for (const section of sections) {
      await sql`
        INSERT INTO page_sections (
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
          ${section.section_key},
          ${section.section_type},
          ${section.title},
          ${JSON.stringify(section.content)}::jsonb,
          ${section.order_index},
          true,
          ${userId},
          ${userId}
        )
      `;
      console.log(`   ✓ Created: ${section.title}`);
    }

    console.log('\n✅ All sections created successfully!');
    console.log('\n📋 Resources page now has these editable sections:');
    sections.forEach((s, i) => {
      console.log(`   ${i + 1}. ${s.title} (${s.section_type})`);
    });

  } catch (error) {
    console.error('\n❌ Error:', error);
    throw error;
  }
}

createResourcesSections()
  .then(() => {
    console.log('\n🎉 Complete! Refresh the CMS to see all sections.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Failed:', error);
    process.exit(1);
  });
