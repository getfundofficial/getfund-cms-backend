require('dotenv').config();
const { sql } = require('@vercel/postgres');

async function createImpactSections() {
  try {
    console.log('🚀 Creating individual sections for Impact page...\n');

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
          title: 'Our Impact',
          subtitle: 'Transforming lives and communities through quality education across Ghana',
          backgroundImage: '/images/hero/impact-bg.jpg'
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
            { number: '5,000+', label: 'Schools Supported', description: 'Educational institutions nationwide', icon: 'building' },
            { number: '2M+', label: 'Students Reached', description: 'Beneficiaries of our programs', icon: 'users' },
            { number: '50+', label: 'Infrastructure Projects', description: 'Completed and ongoing', icon: 'trending-up' },
            { number: '16', label: 'Regions Covered', description: 'Nationwide impact', icon: 'award' },
            { number: '15,000+', label: 'Scholarships Awarded', description: 'Supporting academic excellence', icon: 'graduation-cap' },
            { number: 'GHS 5B+', label: 'Total Investment', description: 'Since establishment', icon: 'trending-up' }
          ]
        }
      },
      {
        section_key: 'impact_stories',
        section_type: 'gallery',
        title: 'Stories of Impact',
        order_index: 2,
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
        section_key: 'achievements',
        section_type: 'text',
        title: 'Key Achievements Timeline',
        order_index: 3,
        content: {
          title: 'Key Achievements',
          subtitle: 'Milestones in our journey to transform education in Ghana',
          achievements: [
            { year: '2000', title: 'GETFund Established', description: 'Ghana Education Trust Fund established by Act of Parliament (Act 581) to provide supplementary funding for education.' },
            { year: '2005', title: '1,000 Schools Supported', description: 'Reached milestone of supporting infrastructure development in 1,000 schools across Ghana.' },
            { year: '2010', title: 'International Scholarship Program', description: 'Launched comprehensive international scholarship program for postgraduate studies.' },
            { year: '2015', title: 'STEM Initiative', description: 'Major investment in Science, Technology, Engineering, and Mathematics education infrastructure.' },
            { year: '2020', title: 'Digital Learning', description: 'Implemented digital learning infrastructure to support education during pandemic and beyond.' },
            { year: '2024', title: '5,000+ Schools Milestone', description: 'Celebrated supporting over 5,000 educational institutions nationwide with 2M+ student beneficiaries.' }
          ]
        }
      },
      {
        section_key: 'regional_impact',
        section_type: 'stats',
        title: 'Regional Impact',
        order_index: 4,
        content: {
          title: 'Regional Impact',
          subtitle: 'Ensuring equitable distribution of educational resources across all regions',
          description: 'GETFund operates in all 16 regions of Ghana, ensuring that educational opportunities reach every corner of the nation.',
          regions: [
            { name: 'Greater Accra', schools: 850, students: 425000, projects: 12 },
            { name: 'Ashanti Region', schools: 920, students: 460000, projects: 15 },
            { name: 'Northern Region', schools: 680, students: 340000, projects: 10 },
            { name: 'Western Region', schools: 520, students: 260000, projects: 8 },
            { name: 'Eastern Region', schools: 450, students: 225000, projects: 7 },
            { name: 'Central Region', schools: 410, students: 205000, projects: 6 },
            { name: 'Volta Region', schools: 390, students: 195000, projects: 5 },
            { name: 'Upper East', schools: 320, students: 160000, projects: 4 }
          ]
        }
      },
      {
        section_key: 'cta',
        section_type: 'cta',
        title: 'Call to Action',
        order_index: 5,
        content: {
          title: 'Be Part of Our Impact Story',
          description: 'Join us in transforming education and creating opportunities for future generations',
          buttonText: 'Support Our Mission',
          buttonLink: '/support-us'
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
    console.log('\n📋 Impact page now has these editable sections:');
    sections.forEach((s, i) => {
      console.log(`   ${i + 1}. ${s.title} (${s.section_type})`);
    });

  } catch (error) {
    console.error('\n❌ Error:', error);
    throw error;
  }
}

createImpactSections()
  .then(() => {
    console.log('\n🎉 Complete! Refresh the CMS to see all sections.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Failed:', error);
    process.exit(1);
  });
