require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function createScholarshipsPage() {
  console.log('🎓 Creating Scholarships page in CMS...\n');

  try {
    // Get admin user ID
    const adminRows = await sql("SELECT id FROM users WHERE email = 'admin@getfund.gov.gh' LIMIT 1");
    const adminId = adminRows.length > 0 ? adminRows[0].id : null;
    if (!adminId) console.log('⚠️  Admin user not found, creating page without user reference.');
    else console.log(`   Found admin user: ${adminId}`);

    // Step 1: Check if page already exists
    const existingRows = await sql("SELECT id FROM pages WHERE slug = 'scholarships'");
    let pageId;

    if (existingRows.length > 0) {
      console.log('📝 Page already exists, updating...');
      pageId = existingRows[0].id;

      await sql(`
        UPDATE pages SET
          title = 'Scholarships',
          meta_title = 'Scholarships | Ghana Education Trust Fund',
          meta_description = 'GETFund Scholarship Programme - Empowering Ghanaian students through postgraduate and undergraduate scholarships.',
          layout_template = 'scholarships',
          is_active = true,
          show_in_menu = true,
          menu_order = 3,
          menu_label = 'Scholarships',
          updated_at = NOW()
        WHERE id = $1
      `, [pageId]);

      console.log(`   ✓ Updated page: scholarships (ID: ${pageId})\n`);
    } else {
      console.log('📝 Creating new page...');

      const newPageRows = adminId
        ? await sql(`
            INSERT INTO pages (
              slug, title, meta_title, meta_description,
              layout_template, is_active, show_in_menu, menu_order, menu_label,
              created_by, updated_by
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING id
          `, [
            'scholarships', 'Scholarships',
            'Scholarships | Ghana Education Trust Fund',
            'GETFund Scholarship Programme - Empowering Ghanaian students through postgraduate and undergraduate scholarships.',
            'scholarships', true, true, 3, 'Scholarships', adminId, adminId,
          ])
        : await sql(`
            INSERT INTO pages (
              slug, title, meta_title, meta_description,
              layout_template, is_active, show_in_menu, menu_order, menu_label
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING id
          `, [
            'scholarships', 'Scholarships',
            'Scholarships | Ghana Education Trust Fund',
            'GETFund Scholarship Programme - Empowering Ghanaian students through postgraduate and undergraduate scholarships.',
            'scholarships', true, true, 3, 'Scholarships',
          ]);

      pageId = newPageRows[0].id;
      console.log(`   ✓ Created page: scholarships (ID: ${pageId})\n`);
    }

    // Step 2: Delete existing sections for clean insert
    await sql('DELETE FROM page_sections WHERE page_id = $1', [pageId]);
    console.log('   ✓ Cleared existing sections\n');

    // Step 3: Create the page_content section with full scholarship content
    console.log('📝 Creating page content section with all scholarship data...');

    const fullContent = {
      meta: { title: 'Scholarships | Ghana Education Trust Fund', description: 'GETFund Scholarship Programme - Empowering Ghanaian students through postgraduate and undergraduate scholarships. Learn about eligibility, application process, and our scholars.' },
      hero: { title: 'GETFund Scholarship Programme', subtitle: 'GETFund Scholarships: Meeting 21st Century Needs', heroImage: '/images/scholarship/GETFund-Scholarship-Programme.jpg' },
      programmeOverview: { heading: 'Programme Overview', paragraphs: [
        'Education is the bedrock upon which every nation\'s growth and development is anchored, particularly in our fast-evolving 21st century global society that requires a multiplicity of skill sets.',
        'Our human resource capital is our greatest asset, and we have a duty to capitalize on that for the ultimate benefit of our society.',
        'A nation that therefore fails or refuses to invest in the education of its citizens clearly sets itself up for failure. Brains, it is said, develop a nation, not its natural resources, as countries like Japan, Switzerland, Singapore and several other countries have proven over time.',
      ]},
      supportProvided: { heading: 'Support Provided', description: 'The Program provides financial, social, and academic support to Scholars. Financial support includes tuition fees, accommodation, and scholastic materials.' },
      coreBelief: 'We believe education is a catalyst for social and economic change.',
      priorityAreas: { heading: 'Priority Areas', items: [
        { title: 'STEM Programmes', description: 'High prevalence to Science, Technology, Engineering and Mathematics programmes' },
        { title: 'Female Education', description: 'Promoting access and equity in education for women and girls' },
      ]},
      programmeStats: { heading: 'Programme Statistics', stats: [
        { label: 'Undergraduate Scholars', value: '00' },
        { label: 'Executive Education Programmes', value: '00' },
        { label: 'Masters Scholars', value: '00' },
        { label: 'PhD Scholars', value: '00' },
      ]},
      scopeOfScholarship: { heading: 'Scope of Scholarship', description: 'The programme expands beyond the traditional "brilliant but needy" requirement to include:', items: [
        'Support for "brilliant but needy" applicants at undergraduate and postgraduate levels',
        'Capacity building in public institutions and agencies (e.g., forensic science, cyber security, fire-fighting domains)',
        'Faculty development through Ghana Tertiary Education Commission (GTEC) for university lecturers pursuing further education abroad',
        'Funding for short courses abroad by MPs, judges and others upon request',
        'Support for students competing in international educational competitive programmes',
      ]},
      callForApplication: { heading: '2024/25 Scholarship Call For Application', subheading: 'Postgraduate Foreign Scholarship Call for Application', description: 'The Ghana Education Trust Fund is accepting applications for Postgraduate (Masters Programmes) for the award of Foreign scholarships for the 2024/25 Academic Year.', openingDate: 'Friday 30th May 2025', closingDate: 'Sunday 15th June 2025' },
      applicationProcedure: { heading: 'Procedure For Applications', steps: [
        { title: 'Apply via Scholarship Portal', description: 'Applicants must visit the GETFund Website to access the scholarship Portal and complete an online application form.' },
        { title: 'Provide Required Documentation', description: 'Complete the online form with required information and upload documents for vetting and shortlisting.' },
        { title: 'Application Status Update', description: 'Communication occurs via email and SMS, with further actions continuing through the portal.' },
      ]},
      eligibilityRequirements: { heading: 'Eligibility Requirements', items: [
        'Applicant must be a Ghanaian',
        'Must have obtained admission to undertake a Masters or Undergraduate-Medicine Only (Eastern Europe & Asia)',
        'Must hold a first degree of at least second-class (for Master\'s applicants)',
        'Must be available to start academic studies by the start of the academic year for which sponsorship is sought',
        'Applicant must not be pursuing a PhD or Master\'s degree at the time of application',
        'Should not be a previous beneficiary of a GETFund Foreign Scholarship applying for the same scholarship category',
      ]},
      academicRequirements: { heading: 'Academic Requirements', items: [
        'Admission Letter from accredited University (Unconditional & Financial Condition letters only)',
        'Fee Schedule',
        'Previous academic certificates (Where Applicable)',
        'Previous transcript (Where Applicable)',
        'Project or Research proposal (not exceeding 5 pages) (Masters and PhD Applicants)',
      ]},
      supportingDocuments: { heading: 'Supporting Documents', items: [
        'Curriculum Vitae', 'Academic Referees', 'Letter of Recommendation (occupational)',
        'Support Document from employer for Academic Leave (Where applicable)',
        'Passport Bio Page', 'Ghana Card', 'National Service certificate (Where Applicable)',
      ]},
      specialDispensation: { heading: 'Special Dispensation', description: 'Priority consideration for applicants pursuing:', items: [
        'Science, Technology, Engineering, Mathematics (STEM)',
        'Technical and Vocational Education and Training (TVET)',
        'Special needs programmes', 'National Initiative Priority programmes',
        'Programmes at tuition-free Universities',
        'Lecturers of public Tertiary Institutions (Via GTEC)',
        'Persons with special needs',
      ]},
      applicationSteps: { heading: 'Application Steps', steps: [
        'Create Profile', 'Verify Account',
        'Fill Application Form and upload required documents',
        'Review Application Summary', 'Submit Application',
      ]},
      disqualifyingFactors: { heading: 'Disqualifying Factors', items: [
        'Poor Academic Performance',
        'Not providing required documentation (Admission letter & Financial Details)',
        'Uploading invisible or unclear documents',
        'Not completing application before deadline',
        'Providing false or misleading information',
        'Multiple applications by one applicant (instant disqualification)',
        'Previous GETFund Scholarship beneficiary applying for the same category',
      ]},
      fundingAndDuration: { heading: 'Funding and Duration', items: [
        { question: 'Local Scholarship Coverage', answer: 'Tuition Fees Only' },
        { question: 'Foreign Scholarship Coverage', answer: 'Typically covers tuition, accommodation, and sometimes stipend for living expenses. Specific details regarding partial or full scholarship will be provided upon award.' },
        { question: 'Deferment', answer: 'No, scholarships must be used for the academic year awarded.' },
        { question: 'Duration', answer: 'Valid for the postgraduate program duration as specified in the admission letter, subject to satisfactory academic performance.' },
      ]},
      faqs: { heading: 'Frequently Asked Questions', items: [
        { question: 'Who can apply?', answer: 'Every Ghanaian citizen who meets the prerequisite requirements.' },
        { question: 'Which Universities qualify?', answer: 'For Foreign Universities: Accredited and Globally Recognised Universities. For Local Universities: All Local Universities accredited by Ghana Tertiary Education Commission to run Post Graduate courses.' },
        { question: 'Can I apply before university acceptance?', answer: 'No. All applicants are required to have a valid Admission letter from a local university.' },
        { question: 'How do I know if I\'m eligible?', answer: 'The basic requirement is being a Ghanaian Citizen, followed by other requirements stated on the application portal.' },
        { question: 'How are applications submitted?', answer: 'All correspondences occur exclusively between GETFund and the applicant. All submissions are received through the scholarship web application portal only.' },
        { question: 'Can second-year and beyond students apply?', answer: 'For programmes with more than one year of academic activities, yes, but sponsorship takes effect from the year of application.' },
        { question: 'Can I apply to other government agencies?', answer: 'Yes, but applicants cannot hold two or more scholarships from Ghana Government Agencies simultaneously.' },
        { question: 'Where is the portal?', answer: 'Visit www.getfund.gov.gh/scholarship-apply' },
        { question: 'Can I save my progress?', answer: 'Yes, the portal allows saving progress to complete later before the deadline.' },
        { question: 'What if I have technical issues?', answer: 'Contact the support team via details provided on the portal.' },
        { question: 'Can I edit after submission?', answer: 'No, once submitted, changes cannot be made. Ensure accuracy before submitting.' },
        { question: 'What is the selection process?', answer: 'Applications are vetted and shortlisted based on eligibility and documentation completeness. Shortlisted applicants will be contacted for further processes.' },
        { question: 'When will I be notified?', answer: 'Shortlisted applicants receive notification after vetting completion. The specific timeline will be communicated via portal and email.' },
        { question: 'What if I am not shortlisted?', answer: 'Applicants receive email notification and may reapply in the following cycle if eligible.' },
      ]},
      scholars: { heading: 'GETFund Scholars', subheading: '14+ Years of Empowering Minds, Transforming Futures', totalRecords: '16,368', sampleData: [
        { name: 'Abdul Baasit Abdul Aziz', academicYear: '2010-2011', country: 'USA', institution: 'Harvard Law School', course: 'PhD Law' },
        { name: 'Amadu Abdul-Razak', academicYear: '2010-2011', country: 'USA', institution: 'Oregon State University', course: 'MSc Epidemiology' },
        { name: 'Ato Ekyea Kwame Ahwoi', academicYear: '2010-2011', country: 'USA', institution: 'New Jersey Institute of Technology', course: 'MSc Management' },
        { name: 'Belinda Glover', academicYear: '2010-2011', country: 'USA', institution: 'Ohio University', course: 'M.A Communication & Dev. Studies' },
        { name: 'Ben Sarpong Mensah', academicYear: '2010-2011', country: 'USA', institution: 'Benedictine University', course: 'PhD Organisation Development' },
        { name: 'Candice E Kudonoo', academicYear: '2010-2011', country: 'USA', institution: 'Benedictine University', course: 'PhD Organisation Devt.' },
        { name: 'Clement Addo', academicYear: '2010-2011', country: 'USA', institution: 'Brandeis University', course: 'M.A Sustainable International Dev.' },
        { name: 'Dekuwmini Mornah', academicYear: '2010-2011', country: 'USA', institution: 'University of Mississippi', course: 'PhD Economics' },
        { name: 'Dr. Alexis Bunaaim Bo-Ib', academicYear: '2010-2011', country: 'USA', institution: 'Makerere University, Uganda', course: 'MSc Orthopaedic Surgery' },
        { name: 'Ekua Asafoaba Appiah', academicYear: '2010-2011', country: 'USA', institution: 'Universitatae Ovidius, Romania', course: 'Medicine' },
        { name: 'Elorm Mawuli Tsegah', academicYear: '2010-2011', country: 'USA', institution: 'Cleveland State University', course: 'MSc Urban Studies' },
        { name: 'Francisca Kusi-Appiah', academicYear: '2010-2011', country: 'USA', institution: 'University of Houston', course: 'LLM Energy, Environ & Nat. Res.' },
        { name: 'Fred K. Apaloo (Jr)', academicYear: '2010-2011', country: 'USA', institution: 'Lynn University', course: 'Hospitality Management' },
        { name: 'Isaac Damptey', academicYear: '2010-2011', country: 'USA', institution: 'Eastern Mediterranean University, Cyprus', course: 'MSc Economics' },
        { name: 'Jerry Yakubu Yahaya', academicYear: '2010-2011', country: 'USA', institution: 'Brandeis University', course: 'MSc Int. Health & Management' },
        { name: 'Kwadwo A. Adjei-Barwuah', academicYear: '2010-2011', country: 'USA', institution: 'University of California', course: 'Master of Business Administration' },
        { name: 'Kwame Akuoko Sarpong', academicYear: '2010-2011', country: 'USA', institution: 'Phoenix East Aviation Int', course: 'Airline/Commercial/Prof. Pilot' },
        { name: 'Mawuyrami A. Akoto', academicYear: '2010-2011', country: 'USA', institution: 'Maryville University, St. Louis', course: 'Music Therapy' },
        { name: 'Mercy Ablakwa', academicYear: '2010-2011', country: 'USA', institution: 'University of Charleston', course: 'MSc Nursing' },
        { name: 'Rachel Ajasa', academicYear: '2010-2011', country: 'USA', institution: 'Tulane Law School', course: 'LLM Energy, Environment' },
      ]},
      contactInfo: { address: 'No. 42, 4th Close, Airport Res. Area, Accra', phone: '+233 544 323 020', email: 'info@getfund.gov.gh', website: 'www.getfund.gov.gh' },
      cta: { heading: 'Ready to Apply?', description: 'Ghana Education Trust Fund (GETFund) - Supporting the delivery of quality education in Ghana. By working in partnership, we create lasting change.', buttonText: 'Start Application', buttonUrl: 'https://scholarships.getfund.gov.gh/' },
    };

    const contentJson = JSON.stringify(fullContent);

    const sectionRows = adminId
      ? await sql(`
          INSERT INTO page_sections (
            page_id, section_key, section_type, title, content,
            order_index, is_active, created_by, updated_by
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          ON CONFLICT (page_id, section_key) DO UPDATE SET
            content = EXCLUDED.content, updated_at = CURRENT_TIMESTAMP
          RETURNING id
        `, [pageId, 'page_content', 'page_content', 'Scholarships Content', contentJson, 0, true, adminId, adminId])
      : await sql(`
          INSERT INTO page_sections (
            page_id, section_key, section_type, title, content,
            order_index, is_active
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)
          ON CONFLICT (page_id, section_key) DO UPDATE SET
            content = EXCLUDED.content, updated_at = CURRENT_TIMESTAMP
          RETURNING id
        `, [pageId, 'page_content', 'page_content', 'Scholarships Content', contentJson, 0, true]);

    console.log(`   ✓ Created page_content section (ID: ${sectionRows[0].id})\n`);

    console.log('🎉 Scholarships page created successfully!');
    console.log('\n  Page details:');
    console.log('  • Slug: scholarships');
    console.log('  • Template: scholarships');
    console.log('  • Show in menu: Yes (order: 3)');
    console.log('  • Sections: 1 (page_content with full scholarship data)');
    console.log('\n  Frontend route: /scholarships');
    console.log('  CMS editor: /admin/pages/scholarships');

    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to create scholarships page:', error);
    process.exit(1);
  }
}

createScholarshipsPage();
