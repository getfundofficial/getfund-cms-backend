require('dotenv').config();
const { sql } = require('@vercel/postgres');

async function updateImpactData2024() {
  try {
    console.log('🚀 Updating Impact page with May 2024 fact sheet data...\n');

    // Get the impact page
    const pageResult = await sql`
      SELECT id FROM pages WHERE slug = 'impact'
    `;

    if (pageResult.rows.length === 0) {
      console.log('❌ impact page not found');
      return;
    }

    const pageId = pageResult.rows[0].id;
    console.log('✓ Found impact page:', pageId);

    // Get admin user
    const userResult = await sql`
      SELECT id FROM users WHERE role = 'admin' LIMIT 1
    `;
    const userId = userResult.rows[0].id;

    // Delete existing sections
    await sql`DELETE FROM page_sections WHERE page_id = ${pageId}`;
    console.log('✓ Cleared existing sections\n');

    const sections = [
      {
        section_key: 'hero',
        section_type: 'hero',
        title: 'Hero Section',
        order_index: 0,
        content: {
          title: 'Our Impact',
          subtitle: 'Transforming lives and communities through quality education across Ghana',
          backgroundImage: '/images/scholarship/OME1079.jpg'
        }
      },
      {
        section_key: 'impact_statistics',
        section_type: 'stats',
        title: 'Impact Statistics',
        order_index: 1,
        content: {
          title: 'Our Impact in Numbers',
          subtitle: 'Measurable results that showcase our commitment to educational excellence',
          stats: [
            { number: '11,248', label: 'Total Projects', description: 'Since inception', icon: 'building' },
            { number: '16,000+', label: 'Scholars Supported', description: 'Local and foreign institutions', icon: 'graduation-cap' },
            { number: '2,749+', label: 'Recent Projects', description: 'Since 2017', icon: 'trending-up' },
            { number: '16', label: 'Regions Covered', description: 'Nationwide impact', icon: 'award' },
            { number: '5,026', label: 'Scholarships (2023/24)', description: 'Academic year', icon: 'graduation-cap' },
            { number: '677,470', label: 'Furniture Items', description: 'Distributed (2019-2021)', icon: 'building' }
          ]
        }
      },
      {
        section_key: 'project_portfolio',
        section_type: 'stats',
        title: 'Project Portfolio',
        order_index: 2,
        content: {
          title: 'Project Portfolio',
          subtitle: 'Our comprehensive investment across all levels of education',
          projectCategories: [
            { category: 'Basic Education', count: 6272, description: 'Primary and elementary schools', image: '/images/impact/infrastructure-1.jpg' },
            { category: 'Secondary Education', count: 3863, description: 'Secondary and high schools', image: '/images/impact/infrastructure-2.jpg' },
            { category: 'Tertiary Education', count: 999, description: 'Universities and colleges', image: '/images/impact/infrastructure-3.jpg' },
            { category: 'TVET Centers', count: 4, description: 'Technical and vocational training', image: '/images/impact/infrastructure-4.jpg' }
          ]
        }
      },
      {
        section_key: 'resources_distributed',
        section_type: 'stats',
        title: 'Resources Distributed',
        order_index: 3,
        content: {
          title: 'Resources Distributed',
          subtitle: 'Supporting education with essential equipment and resources',
          resources: [
            { type: 'Vehicles', count: 2718, period: '2019-2021', image: '/images/impact/vehicles-1.jpg' },
            { type: 'Furniture Items', count: 677470, period: '2019-2021', image: '/images/impact/furniture-1.jpg' }
          ]
        }
      },
      {
        section_key: 'impact_stories',
        section_type: 'gallery',
        title: 'Stories of Impact',
        order_index: 4,
        content: {
          title: 'Stories of Impact',
          subtitle: 'Real people, real transformations, real futures',
          stories: [
            {
              id: '1',
              name: 'Akosua Mensah',
              story: 'GETFund scholarship enabled me to pursue medical studies abroad. Now I\'m back serving my community as a doctor.',
              image: '/images/impact/student-1.jpg',
              category: 'Scholarship Beneficiary'
            },
            {
              id: '2',
              name: 'Kofi Asante',
              story: 'The new science laboratory at our school has transformed how we teach and learn. Students are now excelling in STEM subjects.',
              image: '/images/impact/teacher-1.jpg',
              category: 'Teacher'
            },
            {
              id: '3',
              name: 'Ama Owusu',
              story: 'Thanks to GETFund\'s infrastructure support, our school now has modern classrooms and a library. Enrollment has doubled!',
              image: '/images/impact/principal-1.jpg',
              category: 'School Principal'
            }
          ]
        }
      },
      {
        section_key: 'scholarship_program',
        section_type: 'text',
        title: 'Scholarship Program',
        order_index: 5,
        content: {
          title: 'Scholarship Program',
          subtitle: 'Transforming lives through educational opportunities',
          totalScholars: '16,000+',
          scholarshipGrowth: {
            from: { year: '2019/20', count: 1680 },
            to: { year: '2023/24', count: 5026 }
          },
          percentToPublicUniversities: '74%',
          scholarshipCategories: [
            { title: 'General Scholarships', description: 'Applications from general population for Tertiary education' },
            { title: 'Faculty Development Programmes', description: 'PhD scholarships through GTEC applications' },
            { title: 'Professional Enhancement & Capacity Building', description: 'For government organizations - Police, Prison, Fire, Judicial, Parliamentary Services' },
            { title: 'Educational Programme & Activity Sponsorship', description: 'NSMQ, Robotics Competitions, STEM Programmes' }
          ],
          reforms: [
            'Streamlined eligibility criteria',
            'Digitized application process',
            'Emphasis on STEM subjects',
            'Increased support for Girl-child Education',
            'Overhauled payment bottlenecks for foreign scholars',
            'Scholarship Programme Monitoring'
          ],
          universityLogos: [
            '/images/impact/universities/ug-logo.png',
            '/images/impact/universities/ucc-logo.png',
            '/images/impact/universities/knust-logo.png',
            '/images/impact/universities/gimpa-logo.png',
            '/images/impact/universities/upsa-logo.png'
          ],
          scholarshipImages: [
            '/images/impact/scholarship-1.jpg',
            '/images/impact/scholarship-2.jpg'
          ]
        }
      },
      {
        section_key: 'achievements',
        section_type: 'text',
        title: 'Key Achievements Timeline',
        order_index: 6,
        content: {
          title: 'Key Achievements',
          subtitle: 'Milestones in our journey to transform education in Ghana',
          achievements: [
            { year: '2000', title: 'GETFund Established', description: 'Ghana Education Trust Fund established by Act of Parliament (Act 581) to provide supplementary funding for education.' },
            { year: '2005', title: '1,000 Schools Supported', description: 'Reached milestone of supporting infrastructure development in 1,000 schools across Ghana.' },
            { year: '2010', title: 'International Scholarship Program', description: 'Launched comprehensive international scholarship program for postgraduate studies.' },
            { year: '2015', title: 'STEM Initiative', description: 'Major investment in Science, Technology, Engineering, and Mathematics education infrastructure.' },
            { year: '2019/20', title: '1,680 Local Scholarships Awarded', description: 'Significant expansion of local scholarship program to support students in Ghanaian tertiary institutions.' },
            { year: '2020', title: 'Digital Learning Infrastructure', description: 'Implemented digital learning infrastructure to support education during pandemic and beyond.' },
            { year: '2023/24', title: '5,026 Scholarships - 199% Growth', description: 'Achieved remarkable 199% growth in local scholarships, with majority (74%) going to public universities.' },
            { year: '2024', title: '11,248 Total Projects', description: 'Celebrated reaching 11,248 total educational projects since inception across all 16 regions of Ghana.' }
          ]
        }
      },
      {
        section_key: 'regional_impact',
        section_type: 'stats',
        title: 'Regional Impact',
        order_index: 7,
        content: {
          title: 'Regional Impact',
          subtitle: 'Ensuring equitable distribution of educational resources across all regions',
          description: 'GETFund operates in all 16 regions of Ghana, ensuring that educational opportunities reach every corner of the nation.',
          regionalMap: '/images/impact/ghana-regional-map.png',
          regions: [
            { name: 'Ashanti', totalProjects: 748, basicEducation: 451, secondaryEducation: 281, tertiaryEducation: 12, modelSchools: 2, tvetCenters: 2 },
            { name: 'Eastern', totalProjects: 541, basicEducation: 301, secondaryEducation: 230, tertiaryEducation: 8, modelSchools: 1, tvetCenters: 1 },
            { name: 'Northern', totalProjects: 172, basicEducation: 101, secondaryEducation: 66, tertiaryEducation: 5 },
            { name: 'Greater Accra', totalProjects: 77, basicEducation: 66, secondaryEducation: 1, modelSchools: 10 },
            { name: 'Upper East', totalProjects: 121, basicEducation: 68, secondaryEducation: 47, tertiaryEducation: 6 },
            { name: 'Bono', totalProjects: 142, basicEducation: 73, secondaryEducation: 64, tertiaryEducation: 4, modelSchools: 1 },
            { name: 'Western', totalProjects: 110, basicEducation: 54, secondaryEducation: 55, tertiaryEducation: 1 },
            { name: 'Ahafo', totalProjects: 102, basicEducation: 62, secondaryEducation: 34, tertiaryEducation: 5, modelSchools: 1 },
            { name: 'Central', totalProjects: 91, basicEducation: 91 },
            { name: 'Volta', totalProjects: 93, basicEducation: 47, secondaryEducation: 41, tertiaryEducation: 5 },
            { name: 'Oti', totalProjects: 90, basicEducation: 47, secondaryEducation: 41, tertiaryEducation: 2 },
            { name: 'Upper West', totalProjects: 86, basicEducation: 41, secondaryEducation: 41, tertiaryEducation: 4 },
            { name: 'Bono East', totalProjects: 55, basicEducation: 23, secondaryEducation: 31, modelSchools: 1 },
            { name: 'Western North', totalProjects: 51, basicEducation: 24, secondaryEducation: 19, tertiaryEducation: 7, modelSchools: 1 },
            { name: 'North East', totalProjects: 50, basicEducation: 20, secondaryEducation: 27, tertiaryEducation: 2, modelSchools: 1 },
            { name: 'Savannah', totalProjects: 34, basicEducation: 13, secondaryEducation: 21 }
          ]
        }
      },
      {
        section_key: 'cta',
        section_type: 'cta',
        title: 'Call to Action',
        order_index: 8,
        content: {
          title: 'Be Part of Our Impact Story',
          description: 'Join us in transforming education and creating opportunities for future generations',
          buttonText: 'Support Our Mission',
          buttonLink: '/fundraising/ways-to-donate'
        }
      }
    ];

    console.log('📝 Creating sections with May 2024 data...\n');

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

    console.log('\n✅ All sections updated successfully with May 2024 data!');
    console.log('\n📋 Impact page now contains:');
    sections.forEach((s, i) => {
      console.log(`   ${i + 1}. ${s.title} (${s.section_type})`);
    });

    console.log('\n📊 Data Source: GETFund General Fact Sheet Volume 2 (May 2024)');

  } catch (error) {
    console.error('\n❌ Error:', error);
    throw error;
  }
}

updateImpactData2024()
  .then(() => {
    console.log('\n🎉 Complete! The Impact page has been updated with the latest fact sheet data.');
    console.log('💡 Remember to extract and upload images from the PDF to the /public/images/impact/ directory');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Failed:', error);
    process.exit(1);
  });
