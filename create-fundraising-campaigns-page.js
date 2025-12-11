require('dotenv').config();
const { sql } = require('@vercel/postgres');

async function createFundraisingCampaignsPage() {
  try {
    console.log('🚀 Creating Fundraising Campaigns page...\n');

    // Step 1: Check if page already exists
    const existingPage = await sql`
      SELECT id, slug, title, layout_template
      FROM pages
      WHERE slug = 'fundraising-campaigns'
    `;

    let pageId;

    if (existingPage.rows.length > 0) {
      console.log('📝 Page already exists, updating...');
      pageId = existingPage.rows[0].id;

      // Update the existing page
      await sql`
        UPDATE pages
        SET
          title = 'Fundraising Campaigns',
          meta_title = 'Fundraising Campaigns - Support Education in Ghana',
          meta_description = 'Support our fundraising campaigns and enter the GETfund Scholarship Lottery. Every contribution helps build a better educational future for Ghana.',
          layout_template = 'fundraising-campaigns',
          is_active = true,
          updated_at = NOW()
        WHERE id = ${pageId}
      `;

      console.log(`   ✓ Updated page: fundraising-campaigns (ID: ${pageId})\n`);
    } else {
      console.log('📝 Creating new page...');

      // Create the page
      const newPage = await sql`
        INSERT INTO pages (
          slug,
          title,
          meta_title,
          meta_description,
          layout_template,
          is_active,
          show_in_menu,
          menu_order
        ) VALUES (
          'fundraising-campaigns',
          'Fundraising Campaigns',
          'Fundraising Campaigns - Support Education in Ghana',
          'Support our fundraising campaigns and enter the GETfund Scholarship Lottery. Every contribution helps build a better educational future for Ghana.',
          'fundraising-campaigns',
          true,
          false,
          999
        )
        RETURNING id, slug, title
      `;

      pageId = newPage.rows[0].id;
      console.log(`   ✓ Created page: ${newPage.rows[0].slug} (ID: ${pageId})\n`);
    }

    // Step 2: Delete existing sections (if any)
    await sql`
      DELETE FROM page_sections
      WHERE page_id = ${pageId}
    `;

    // Step 3: Create the page_content section with all required fields
    console.log('📝 Creating page content section...');

    const sectionResult = await sql`
      INSERT INTO page_sections (
        page_id,
        section_key,
        section_type,
        title,
        content,
        order_index,
        is_active
      ) VALUES (
        ${pageId},
        'fundraising_campaigns_content',
        'page_content',
        'Fundraising Campaigns Page Content',
        ${JSON.stringify({
          heroTitle: 'Fundraising Campaigns',
          heroSubtitle: 'Join thousands of Ghanaians making a difference through our targeted fundraising campaigns. Every contribution counts towards building a better educational future.',
          featuredCampaignsTitle: 'Featured Fundraising Campaigns',
          lotteryTitle: 'GETfund Scholarship Lottery',
          lotterySubtitle: 'Every contribution to our campaigns automatically enters you into our monthly scholarship lottery. Win full scholarships for yourself or your loved ones while supporting education in Ghana.'
        })},
        0,
        true
      )
      RETURNING id, section_key, title
    `;

    console.log(`   ✓ Created section: ${sectionResult.rows[0].title}\n`);

    // Step 4: Verify the setup
    console.log('✅ Verification:\n');

    const verification = await sql`
      SELECT
        p.id,
        p.slug,
        p.title,
        p.layout_template,
        p.is_active,
        (SELECT COUNT(*) FROM page_sections ps WHERE ps.page_id = p.id) as section_count
      FROM pages p
      WHERE p.slug = 'fundraising-campaigns'
    `;

    const page = verification.rows[0];
    console.log(`Page Details:`);
    console.log(`  - ID: ${page.id}`);
    console.log(`  - Slug: ${page.slug}`);
    console.log(`  - Title: ${page.title}`);
    console.log(`  - Layout Template: ${page.layout_template}`);
    console.log(`  - Is Active: ${page.is_active}`);
    console.log(`  - Sections: ${page.section_count}`);

    console.log('\n✅ Fundraising Campaigns page setup complete!');
    console.log('\n📋 Next steps:');
    console.log('   1. Make sure the backend server is running (npm run dev in getfund-cms-backend)');
    console.log('   2. Make sure these API endpoints are working:');
    console.log('      - GET /api/campaigns?featured=true');
    console.log('      - GET /api/lottery/config');
    console.log('   3. Access the page at: http://localhost:3000/fundraising-campaigns');
    console.log('   4. Or add it to a menu/navigation as needed');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createFundraisingCampaignsPage()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('💥 Failed:', error);
    process.exit(1);
  });
