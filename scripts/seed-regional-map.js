/**
 * Seed script to initialize the Impact page with page_content section
 * This enables the full ImpactEditor in the CMS including the Regional Impact tab
 *
 * Run with: node scripts/seed-regional-map.js
 */

require('dotenv').config({ path: '.env' });
const { neon } = require('@neondatabase/serverless');

const DATABASE_URL = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL or POSTGRES_URL environment variable is required');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

const DEFAULT_REGIONS = [
  { name: 'Ashanti', totalProjects: 748, basicEducation: 451, secondaryEducation: 281, tertiaryEducation: 12, modelSchools: 2, tvetCenters: 2 },
  { name: 'Eastern', totalProjects: 541, basicEducation: 301, secondaryEducation: 230, tertiaryEducation: 8, modelSchools: 1, tvetCenters: 1 },
  { name: 'Northern', totalProjects: 172, basicEducation: 101, secondaryEducation: 66, tertiaryEducation: 5, modelSchools: 0, tvetCenters: 0 },
  { name: 'Greater Accra', totalProjects: 77, basicEducation: 66, secondaryEducation: 1, tertiaryEducation: 0, modelSchools: 10, tvetCenters: 0 },
  { name: 'Upper East', totalProjects: 121, basicEducation: 68, secondaryEducation: 47, tertiaryEducation: 6, modelSchools: 0, tvetCenters: 0 },
  { name: 'Bono', totalProjects: 142, basicEducation: 73, secondaryEducation: 64, tertiaryEducation: 4, modelSchools: 1, tvetCenters: 0 },
  { name: 'Western', totalProjects: 110, basicEducation: 54, secondaryEducation: 55, tertiaryEducation: 1, modelSchools: 0, tvetCenters: 0 },
  { name: 'Ahafo', totalProjects: 102, basicEducation: 62, secondaryEducation: 34, tertiaryEducation: 5, modelSchools: 1, tvetCenters: 0 },
  { name: 'Central', totalProjects: 91, basicEducation: 91, secondaryEducation: 0, tertiaryEducation: 0, modelSchools: 0, tvetCenters: 0 },
  { name: 'Volta', totalProjects: 93, basicEducation: 47, secondaryEducation: 41, tertiaryEducation: 5, modelSchools: 0, tvetCenters: 0 },
  { name: 'Oti', totalProjects: 90, basicEducation: 47, secondaryEducation: 41, tertiaryEducation: 2, modelSchools: 0, tvetCenters: 0 },
  { name: 'Upper West', totalProjects: 86, basicEducation: 41, secondaryEducation: 41, tertiaryEducation: 4, modelSchools: 0, tvetCenters: 0 },
  { name: 'Bono East', totalProjects: 55, basicEducation: 23, secondaryEducation: 31, tertiaryEducation: 0, modelSchools: 1, tvetCenters: 0 },
  { name: 'Western North', totalProjects: 51, basicEducation: 24, secondaryEducation: 19, tertiaryEducation: 7, modelSchools: 1, tvetCenters: 0 },
  { name: 'North East', totalProjects: 50, basicEducation: 20, secondaryEducation: 27, tertiaryEducation: 2, modelSchools: 1, tvetCenters: 0 },
  { name: 'Savannah', totalProjects: 34, basicEducation: 13, secondaryEducation: 21, tertiaryEducation: 0, modelSchools: 0, tvetCenters: 0 },
];

// Full page content for the ImpactEditor
const FULL_PAGE_CONTENT = {
  // Hero Section
  heroTitle: 'Our Impact',
  heroSubtitle: 'Transforming lives and communities through quality education across Ghana',

  // Regional Impact (THE MAP DATA)
  regionalTitle: 'Regional Impact',
  regionalSubtitle: 'Ensuring equitable distribution of educational resources across all regions',
  regionalDescription: 'GETFund has invested in educational infrastructure across all 16 regions of Ghana, ensuring every student has access to quality learning facilities.',
  regions: DEFAULT_REGIONS,

  // Impact Statistics
  statsTitle: 'Our Impact in Numbers',
  statsSubtitle: 'Measurable results that showcase our commitment to educational excellence',
  stats: [
    { number: '11,248', label: 'Total Projects', description: 'Since inception', icon: 'building' },
    { number: '16,000+', label: 'Scholars Supported', description: 'Local and foreign', icon: 'graduation-cap' },
    { number: '2,749+', label: 'Recent Projects', description: 'Since 2017', icon: 'trending-up' },
    { number: '16', label: 'Regions Covered', description: 'Nationwide', icon: 'award' },
    { number: '5,026', label: 'Scholarships', description: '2023/24', icon: 'graduation-cap' },
    { number: '677,470', label: 'Furniture Items', description: '2019-2021', icon: 'building' }
  ],

  // Project Portfolio
  portfolioTitle: 'Project Portfolio',
  portfolioSubtitle: 'Our comprehensive investment across all levels of education',
  projectCategories: [
    { category: 'Basic Education', count: 6272, description: 'Primary schools', image: '/images/impact/infrastructure-1.jpg' },
    { category: 'Secondary Education', count: 3863, description: 'High schools', image: '/images/impact/infrastructure-2.jpg' },
    { category: 'Tertiary Education', count: 999, description: 'Universities', image: '/images/impact/infrastructure-3.jpg' },
    { category: 'TVET Centers', count: 4, description: 'Vocational training', image: '/images/impact/infrastructure-4.jpg' }
  ],

  // Resources Distributed
  resourcesTitle: 'Resources Distributed',
  resourcesSubtitle: 'Supporting education with essential equipment and resources',
  resources: [
    { type: 'Vehicles', count: 2718, period: '2019-2021', image: '/images/impact/vehicles-1.jpg' },
    { type: 'Furniture Items', count: 677470, period: '2019-2021', image: '/images/impact/furniture-1.jpg' }
  ],

  // Impact Stories
  storiesTitle: 'Stories of Impact',
  storiesSubtitle: 'Real people, real transformations, real futures',
  stories: [
    {
      id: '1',
      name: 'Akosua Mensah',
      story: "GETFund scholarship enabled me to pursue medical studies abroad. Now I'm back serving my community as a doctor.",
      image: '/images/impact/student-1.jpg',
      category: 'Scholarship Beneficiary'
    },
    {
      id: '2',
      name: 'Kofi Asante',
      story: 'The new science laboratory at our school has transformed how we teach and learn. Students are now excelling in STEM.',
      image: '/images/impact/teacher-1.jpg',
      category: 'Teacher'
    },
    {
      id: '3',
      name: 'Ama Owusu',
      story: "Thanks to GETFund's infrastructure support, our school now has modern classrooms and a library.",
      image: '/images/impact/principal-1.jpg',
      category: 'School Principal'
    }
  ],

  // Scholarship Program
  scholarshipTitle: 'Scholarship Program',
  scholarshipSubtitle: 'Transforming lives through educational opportunities',
  totalScholars: '16,000+',
  scholarshipGrowth: {
    from: { year: '2019/20', count: 1680 },
    to: { year: '2023/24', count: 5026 }
  },
  percentToPublicUniversities: '74%',
  scholarshipCategories: [
    { title: 'General Scholarships', description: 'Applications for Tertiary education' },
    { title: 'Faculty Development', description: 'PhD scholarships through GTEC' },
    { title: 'Professional Enhancement', description: 'Government organizations support' },
    { title: 'Educational Sponsorship', description: 'NSMQ, Robotics, STEM Programmes' }
  ],
  reforms: [
    'Streamlined eligibility',
    'Digitized applications',
    'STEM emphasis',
    'Girl-child Education',
    'Payment optimization',
    'Programme Monitoring'
  ],

  // Achievements Timeline
  achievementsTitle: 'Key Achievements',
  achievementsSubtitle: 'Milestones in our journey to transform education in Ghana',
  achievements: [
    { year: '2000', title: 'GETFund Established', description: 'Founded by Act of Parliament' },
    { year: '2010', title: 'International Scholarships', description: 'Postgraduate program launched' },
    { year: '2020', title: 'Digital Infrastructure', description: 'E-learning support deployed' },
    { year: '2024', title: '11,248 Projects', description: 'Across all 16 regions' }
  ],

  // Call to Action
  ctaTitle: 'Be Part of Our Impact Story',
  ctaDescription: 'Join us in transforming education and creating opportunities for future generations',
  ctaButtonText: 'Support Our Mission',
  ctaButtonLink: '/support-us'
};

async function seedImpactPage() {
  console.log('Starting Impact page seed...');

  try {
    // Check if impact page exists
    let pageResult = await sql`
      SELECT id FROM pages WHERE slug = 'impact'
    `;

    let pageId;

    if (pageResult.length === 0) {
      console.log('Creating impact page...');
      const createResult = await sql`
        INSERT INTO pages (slug, title, meta_title, meta_description, is_active, layout_template)
        VALUES ('impact', 'Our Impact', 'Our Impact - GETFund', 'See the impact of GETFund across Ghana', true, 'impact')
        RETURNING id
      `;
      pageId = createResult[0].id;
      console.log('Impact page created with ID:', pageId);
    } else {
      pageId = pageResult[0].id;
      console.log('Impact page found with ID:', pageId);
    }

    // Check if page_content section exists (this is the key section type for the ImpactEditor)
    const sectionResult = await sql`
      SELECT id FROM page_sections
      WHERE page_id = ${pageId} AND section_key = 'page_content'
    `;

    if (sectionResult.length === 0) {
      console.log('Creating page_content section with full Impact data...');
      await sql`
        INSERT INTO page_sections (
          page_id, section_key, section_type, title, content, order_index, is_active
        ) VALUES (
          ${pageId},
          'page_content',
          'page_content',
          'Impact Page Content',
          ${JSON.stringify(FULL_PAGE_CONTENT)},
          0,
          true
        )
      `;
      console.log('Page content section created successfully!');
    } else {
      console.log('Updating existing page_content section...');
      // Merge with existing content to preserve any customizations
      const existingContent = await sql`
        SELECT content FROM page_sections
        WHERE page_id = ${pageId} AND section_key = 'page_content'
      `;

      let mergedContent = FULL_PAGE_CONTENT;
      if (existingContent.length > 0 && existingContent[0].content) {
        const existing = typeof existingContent[0].content === 'string'
          ? JSON.parse(existingContent[0].content)
          : existingContent[0].content;
        // Only update regions if they don't exist in the current content
        if (!existing.regions || existing.regions.length === 0) {
          mergedContent = { ...existing, regions: DEFAULT_REGIONS };
        } else {
          mergedContent = existing;
        }
      }

      await sql`
        UPDATE page_sections
        SET content = ${JSON.stringify(mergedContent)}, updated_at = CURRENT_TIMESTAMP
        WHERE page_id = ${pageId} AND section_key = 'page_content'
      `;
      console.log('Page content section updated successfully!');
    }

    console.log('\n✅ Impact page seeded successfully!');
    console.log('\n📝 TO EDIT THE REGIONAL MAP:');
    console.log('   1. Go to CMS Admin Panel');
    console.log('   2. Navigate to Pages → Impact');
    console.log('   3. Click "Edit" on the "page_content" section');
    console.log('   4. Click the "Regional Impact" tab');
    console.log('   5. Edit regions and save!');
    console.log('\n🔧 Alternative: Use the API directly:');
    console.log('   GET  /api/regional-map');
    console.log('   PUT  /api/regional-map');

  } catch (error) {
    console.error('Error seeding Impact page:', error);
    process.exit(1);
  }
}

seedImpactPage();
