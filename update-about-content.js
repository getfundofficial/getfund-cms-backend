const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function updateAboutGETFundContent() {
  try {
    console.log('🔄 Updating About GETFund content...\n');

    // Get the home page ID
    const pageResult = await pool.query(`SELECT id FROM pages WHERE slug = 'home'`);
    if (pageResult.rows.length === 0) {
      console.error('❌ Home page not found');
      return;
    }
    const pageId = pageResult.rows[0].id;

    // Update the about_getfund section with the proper content structure
    await pool.query(`
      UPDATE page_sections
      SET content = $1
      WHERE page_id = $2 AND section_key = 'about_getfund'
    `, [
      JSON.stringify({
        aboutTitle: "Empowering Ghana Through Education",
        aboutSubtitle: "Building Brighter Futures",
        aboutDescription: "Since its establishment in 2000, the Ghana Education Trust Fund (GETFund) has been transforming Ghana's educational landscape. We supplement Government efforts in providing educational infrastructure and facilities at all levels of education.",
        aboutGETFundHeading: "About GETFund",
        aboutGETFundContent: [
          "Since its establishment in the year 2000, the fund has remained committed to its mandate espoused in its governing legislation, Act 581. The object of the Fund is to provide funding to supplement government's effort for the provision of educational infrastructure and facilities at all levels.",
          "GETFund has since its inception remained a significant player in Ghana's education sector not only by way of providing physical infrastructure, but also through the enhancement of our human capital, awarding scholarships to many deserving citizens.",
          "The law establishing GETFund further emphasizes a distribution formula that must be approved by Parliament each year, requiring that some crucial factors related to education delivery and development are considered in the process of preparing the Formula."
        ],
        relevantFactors: [
          "Promotion of the study of Mathematics, Science and Technology",
          "Advancement of female education",
          "Reduction in the high level of illiteracy in historically disadvantaged areas",
          "Promotion of Vocational, Technical Education and Training",
          "Equitable allocation of funds to the Districts at the Pre-Tertiary level of education"
        ],
        aboutStats: [
          {
            number: "24 Years",
            label: "Of Excellence",
            description: "Serving Ghana since 2000"
          },
          {
            number: "5,000+",
            label: "Institutions",
            description: "Schools and facilities supported"
          },
          {
            number: "GH₵8B+",
            label: "Total Investment",
            description: "In education infrastructure"
          },
          {
            number: "150,000+",
            label: "Beneficiaries",
            description: "Students supported through scholarships"
          }
        ],
        aboutImage: "/images/about/getfund-building.jpg",
        aboutImageAlt: "GETFund educational infrastructure",
        ctaText: "Learn More About Us",
        ctaLink: "/who-we-are"
      }),
      pageId
    ]);

    console.log('✅ About GETFund content updated successfully!\n');
    console.log('📝 Content now includes:');
    console.log('   - 3 detailed paragraphs');
    console.log('   - 5 relevant factors');
    console.log('   - 4 statistics');
    console.log('\n✨ Visit http://localhost:5173 to see the updated homepage\n');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

updateAboutGETFundContent();
