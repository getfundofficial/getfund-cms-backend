/**
 * Script to fix news article dates and images from the official GETFund website
 * Run with: node scripts/fix-news-dates.js
 */

require('dotenv').config({ path: '.env' });
const { neon } = require('@neondatabase/serverless');

const DATABASE_URL = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL or POSTGRES_URL environment variable is required');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

// News data scraped from the official GETFund website (https://www.getfund.gov.gh/getfund-news/)
const OFFICIAL_NEWS_DATA = [
  // Page 1 - Latest news (December 2025)
  {
    title: 'GETFund Receives Delegation from University of Virgin Islands',
    slug: 'getfund-receives-delegation-from-university-of-the-virgin-islands',
    date: '2025-12-18',
    excerpt: 'The Ghana Education Trust Fund (GETFund) warmly hosted a delegation from the University of the Virgin Islands (UVI) on 17th December, 2025 as part of efforts to explore partnership opportunities for Ghanaian students.',
    image: 'https://www.getfund.gov.gh/wp-content/uploads/2025/12/UVI-770x417.jpg',
    category: 'NEWS'
  },
  {
    title: 'FuelTrade Supports GETFund',
    slug: 'fueltrade-supports-getfund',
    date: '2025-12-17',
    excerpt: 'GETFund received a One Million Ghana Cedis donation from FuelTrade Ghana Limited, a proudly Ghanaian-owned Bulk Distribution Company (BDC) and one of the nation\'s leading players in the downstream petroleum sector.',
    image: 'https://www.getfund.gov.gh/wp-content/uploads/2025/12/Fuel-Trade-770x417.jpg',
    category: 'NEWS'
  },
  {
    title: 'GETFund Accelerates Practical Science Education with Strategic Funding for STEMBox Initiative',
    slug: 'getfund-accelerates-practical-science-education-with-strategic-funding-for-stembox-initiative',
    date: '2025-12-06',
    excerpt: 'GETFund funded a nationwide rollout of the Dext STEMBox initiative for basic schools to advance equitable access to modern, practical education.',
    image: 'https://www.getfund.gov.gh/wp-content/uploads/2025/12/Admin@Stembox-150x150.png',
    category: 'NEWS'
  },
  {
    title: 'GETFund Supports Ghana National Research Fund with Office Complex',
    slug: 'getfund-supports-ghana-national-research-fund-with-office-complex',
    date: '2025-11-29',
    excerpt: 'GETFund provided the Ghana National Research Fund with a fully furnished office complex to promote national development through research and education in East Legon, Accra.',
    image: 'https://www.getfund.gov.gh/wp-content/uploads/2025/11/Research-2-770x417.png',
    category: 'NEWS'
  },
  {
    title: '2026 Budget: GETFund Drives Historic Expansion in Educational Infrastructure',
    slug: '2026-budget-getfund-drives-historic-expansion-in-educational-infrastructure',
    date: '2025-11-17',
    excerpt: 'GETFund announced one of the most ambitious education infrastructure programmes in Ghana\'s history following the government\'s 2026 Budget announcement, targeting foundational education transformation nationwide.',
    image: 'https://www.getfund.gov.gh/wp-content/uploads/2025/11/Ato-Forson-770x417.jpg',
    category: 'NEWS'
  },
  {
    title: 'GETFund to Commit GHC 50 Million Yearly to Free Tertiary Education for Persons with Disabilities',
    slug: 'getfund-to-commit-ghc-50-million-yearly-to-free-tertiary-education-for-persons-with-disabilities',
    date: '2025-10-27',
    excerpt: 'The Education Minister announced GETFund will commit GHC 50 million each year to support disability and inclusive education across the country.',
    image: 'https://www.getfund.gov.gh/wp-content/uploads/2025/10/AdminPresident-770x417.png',
    category: 'NEWS'
  },
  {
    title: 'CEO of Students Loan Trust Fund Visits GETFund Administrator',
    slug: 'ceo-of-students-loan-trust-fund-visits-getfund-administrator',
    date: '2025-10-23',
    excerpt: 'The Students Loan Trust Fund CEO visited ahead of the official launch of the "No-Fee Stress" Policy for Persons With Disabilities.',
    image: 'https://www.getfund.gov.gh/wp-content/uploads/2025/10/Grp-Pix-770x417.jpg',
    category: 'NEWS'
  },
  {
    title: 'GETFund Commences Accelerated Infrastructure Program at Ambariya Schools',
    slug: 'getfund-commences-accelerated-infrastructure-program-at-ambariya-schools',
    date: '2025-10-14',
    excerpt: 'GETFund launched major infrastructure projects at Ambariya Senior High School and Ambariya Community Primary School with an 18-month completion target.',
    image: 'https://www.getfund.gov.gh/wp-content/uploads/2025/10/AMbariya-2-770x417.png',
    category: 'NEWS'
  },
  {
    title: 'GETFund Kicks Off Multi-Project Construction in Northern Region',
    slug: 'getfund-kicks-off-multi-project-construction-in-northern-region',
    date: '2025-10-14',
    excerpt: 'GETFund commenced a significant push to bridge the infrastructure gap in the Northern Region\'s education sector with multiple construction projects.',
    image: 'https://www.getfund.gov.gh/wp-content/uploads/2025/10/Nobisco-1-770x417.png',
    category: 'NEWS'
  },
  // Page 2
  {
    title: 'N/R: GETFund Launches Major Infrastructure Expansion at Ghana Senior High School',
    slug: 'n-r-getfund-launches-major-infrastructure-expansion-at-ghana-senior-high-school',
    date: '2025-10-14',
    excerpt: 'GETFund has launched a major infrastructural expansion at Ghana Senior High School (GHANASCO) including a 2-storey, 12-unit classroom block.',
    image: 'https://www.getfund.gov.gh/wp-content/uploads/2025/10/GHANASCO-770x417.png',
    category: 'NEWS'
  },
  {
    title: 'GETFund Gives Greenlight for the Construction of Ultra-Modern Infrastructure Facilities at Karaga SHS',
    slug: 'getfund-gives-greenlight-for-the-construction-of-ultra-modern-infrastructure-facilities-at-karaga-shs',
    date: '2025-10-14',
    excerpt: 'GETFund activated significant infrastructure upgrades at Karaga Senior High School under the New Targeted Emergency Projects.',
    image: 'https://www.getfund.gov.gh/wp-content/uploads/2025/10/Karaga-770x417.png',
    category: 'NEWS'
  },
  {
    title: 'N/R: GETFund Commences Major Facility Upgrade at Pishigu SHS',
    slug: 'n-r-getfund-commences-major-facility-upgrade-at-pishigu-shs',
    date: '2025-10-10',
    excerpt: 'GETFund commenced comprehensive infrastructural expansion at Pishigu Senior High School in Karaga District.',
    image: 'https://www.getfund.gov.gh/wp-content/uploads/2025/10/Pishigu-770x417.png',
    category: 'NEWS'
  },
  {
    title: 'GETFUND ADMINISTRATOR MEETS WITH STAFF',
    slug: 'getfund-administrator-meets-with-staff',
    date: '2025-08-11',
    excerpt: 'The Administrator convened a staff durbar setting an agenda for strategic innovation and institutional growth at GETFund headquarters in Accra.',
    image: 'https://www.getfund.gov.gh/wp-content/uploads/2025/08/Staff-Durbar-770x417.jpg',
    category: 'NEWS'
  },
  {
    title: 'Director General of Prisons Engages GETFund on Inmate Rehabilitation Partnership',
    slug: 'director-general-of-prisons-engages-getfund-on-inmate-rehabilitation-partnership',
    date: '2025-08-06',
    excerpt: 'The Director General engaged GETFund to explore collaborative interventions in inmate education and vocational development.',
    image: 'https://www.getfund.gov.gh/wp-content/uploads/2025/08/Prisons-770x417.jpg',
    category: 'NEWS'
  },
  {
    title: 'GETFUND ENGAGES WITH VOORHEES UNIVERSITY AND ATTRACO TO DEEPEN EDUCATIONAL COLLABORATION',
    slug: 'getfund-engages-with-voorhees-university-and-attraco-to-deepen-educational-collaboration',
    date: '2025-07-17',
    excerpt: 'GETFund hosted a Voorhees University delegation from South Carolina during their working tour in Ghana.',
    image: 'https://www.getfund.gov.gh/wp-content/uploads/2025/07/Voorhees-770x417.jpg',
    category: 'NEWS'
  },
  {
    title: 'Photo Gallery: GETFund Tours UK Universities to Engage Ghanaian Scholars',
    slug: 'photo-gallery-getfund-tours-uk-universities-to-engage-ghanaian-scholars',
    date: '2025-07-03',
    excerpt: 'GETFund embarked on a week-long UK visit where leadership met with Ghanaian students across nine universities.',
    image: 'https://www.getfund.gov.gh/wp-content/uploads/2025/07/UK-Tour-770x417.jpg',
    category: 'NEWS'
  },
  {
    title: 'Strengthening Educational Ties: GETFund Monitors Scholars in UK',
    slug: 'strengthening-educational-ties-getfund-monitors-scholars-in-uk',
    date: '2025-07-03',
    excerpt: 'A four-member GETFund delegation led by Deputy Administrator completed a seven-day mission to the United Kingdom from 21-30 June 2025.',
    image: 'https://www.getfund.gov.gh/wp-content/uploads/2025/07/UK-Scholars-770x417.jpg',
    category: 'NEWS'
  },
  {
    title: 'GETFund Holds Orientation Workshop for 7th Board of Trustees',
    slug: 'getfund-holds-orientation-workshop-for-7th-board-of-trustees',
    date: '2025-06-25',
    excerpt: 'GETFund conducted a 3-day orientation workshop for seventeen board members at Peduase, Aburi in the Eastern Region.',
    image: 'https://www.getfund.gov.gh/wp-content/uploads/2025/06/Board-Orientation-770x417.jpg',
    category: 'NEWS'
  },
  {
    title: 'GETFUND SCHOLARSHIP UNIT ENGAGES WITH UNIVERSITY OF CAPE COAST STUDENTS',
    slug: 'getfund-scholarship-unit-engages-with-university-of-cape-coast-students',
    date: '2025-06-21',
    excerpt: 'The Scholarship Unit participated in the EDUAID Scholarship Summit & Study Abroad Fair at the University of Cape Coast on 20 June 2025.',
    image: 'https://www.getfund.gov.gh/wp-content/uploads/2025/06/UCC-770x417.jpg',
    category: 'NEWS'
  },
  // Page 3
  {
    title: 'GAF CDS interacts with GETFund Administrator',
    slug: 'gaf-cds-interacts-with-getfund-administrator',
    date: '2025-05-16',
    excerpt: 'Chief of Defence Staff Lt. Gen William Agyapong engaged with GETFund Administrator Paul Adjei.',
    image: 'https://www.getfund.gov.gh/wp-content/uploads/2025/05/CDS-770x417.jpg',
    category: 'NEWS'
  },
  {
    title: 'Minister of Education Inaugurates 7th GETFund Board',
    slug: 'minister-of-education-inaugurates-7th-getfund-board',
    date: '2025-04-11',
    excerpt: 'Education Minister Hon. Haruna Iddrisu officially inaugurated the board of trustees.',
    image: 'https://www.getfund.gov.gh/wp-content/uploads/2025/04/Board-Inauguration-770x417.jpg',
    category: 'NEWS'
  },
  {
    title: 'GETFund Administrator Engages CHASS Leadership',
    slug: 'getfund-administrator-engages-chass-leadership',
    date: '2025-03-25',
    excerpt: 'Administrator Paul Adjei met with Conference of Heads of Assisted Secondary Schools leadership.',
    image: 'https://www.getfund.gov.gh/wp-content/uploads/2025/03/CHASS-770x417.jpg',
    category: 'NEWS'
  },
  {
    title: 'Advocacy For Private Sector-Led School Infrastructure Development',
    slug: 'advocacy-for-private-sector-led-school-infrastructure-dev',
    date: '2025-02-21',
    excerpt: 'GETFund Administrator advocated for diversified funding sources for school infrastructure.',
    image: 'https://www.getfund.gov.gh/wp-content/uploads/2025/02/Private-Sector-770x417.jpg',
    category: 'NEWS'
  },
  {
    title: 'Mr. Paul Adjei assumes office as GETFund Administrator',
    slug: 'mr-paul-adjei-assumes-office-as-getfund-administrator',
    date: '2025-02-03',
    excerpt: 'Paul Adjei officially began his tenure as GETFund Administrator.',
    image: 'https://www.getfund.gov.gh/wp-content/uploads/2025/02/Paul-Adjei-770x417.jpg',
    category: 'NEWS'
  },
  // Page 4 - Older news (2023-2024)
  {
    title: 'GETFund Administrator Engages Media in Kumasi',
    slug: 'getfund-administrator-engages-media-in-kumasi',
    date: '2024-01-15',
    excerpt: 'GETFund Administrator engaged with media representatives in Kumasi to discuss infrastructure development.',
    image: 'https://www.getfund.gov.gh/wp-content/uploads/2024/01/Media-Kumasi-770x417.jpg',
    category: 'NEWS'
  },
  {
    title: 'Scholarship Processes at GETFund have improved',
    slug: 'scholarship-processes-at-getfund-have-improved',
    date: '2023-09-25',
    excerpt: 'GETFund announced improvements to scholarship application and processing procedures.',
    image: 'https://www.getfund.gov.gh/wp-content/uploads/2023/09/Scholarship-770x417.jpg',
    category: 'PRESS_RELEASE'
  },
  {
    title: 'GETFund Administrator counsels Tertiary Institutions',
    slug: 'getfund-administrator-counsels-tertiary-institutions',
    date: '2023-09-11',
    excerpt: 'The Administrator urges universities to be innovative in generating revenue and resource management.',
    image: 'https://www.getfund.gov.gh/wp-content/uploads/2023/09/Tertiary-770x417.jpg',
    category: 'NEWS'
  },
  {
    title: 'GETFund grants scholarships to GTP finalists',
    slug: 'getfund-grants-scholarships-to-gtp-finalists',
    date: '2023-08-08',
    excerpt: 'Government Grants New Scholarships to 4,279 Local Tertiary Students through GETFund.',
    image: 'https://www.getfund.gov.gh/wp-content/uploads/2023/08/GTP-770x417.jpg',
    category: 'NEWS'
  },
  {
    title: 'State Award for Outstanding Public Service',
    slug: 'state-award-for-outstanding-public-service',
    date: '2023-07-19',
    excerpt: 'GETFund recognized for outstanding public service contribution to education in Ghana.',
    image: 'https://www.getfund.gov.gh/wp-content/uploads/2023/07/Award-770x417.jpg',
    category: 'NEWS'
  },
  {
    title: 'GETFund Inaugurates a Four-Storey Headquarters Building',
    slug: 'getfund-inaugurates-a-four-storey-headquarters-building',
    date: '2023-05-23',
    excerpt: 'GETFund inaugurated its new four-storey headquarters building in Accra.',
    image: 'https://www.getfund.gov.gh/wp-content/uploads/2023/05/HQ-770x417.jpg',
    category: 'NEWS'
  }
];

async function fixNewsDates() {
  console.log('Starting news date fix...\n');

  let updated = 0;
  let added = 0;
  let errors = 0;

  for (const article of OFFICIAL_NEWS_DATA) {
    try {
      // First, try to find existing article by matching title (fuzzy match)
      const existing = await sql`
        SELECT id, title, slug FROM content
        WHERE type = 'news'
        AND (
          LOWER(title) LIKE LOWER(${'%' + article.title.substring(0, 30) + '%'})
          OR slug = ${article.slug}
        )
        LIMIT 1
      `;

      if (existing.length > 0) {
        // Update existing article with correct date and image
        await sql`
          UPDATE content
          SET
            published_at = ${article.date + 'T10:00:00Z'},
            featured_image_url = ${article.image},
            excerpt = COALESCE(NULLIF(excerpt, ''), ${article.excerpt}),
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ${existing[0].id}
        `;
        console.log(`✅ Updated: "${existing[0].title}" → ${article.date}`);
        updated++;
      } else {
        // Article doesn't exist, add it
        await sql`
          INSERT INTO content (
            type, title, slug, excerpt, body, category,
            featured_image_url, status, published_at, created_at, updated_at
          ) VALUES (
            'news',
            ${article.title},
            ${article.slug},
            ${article.excerpt},
            ${article.excerpt},
            ${article.category},
            ${article.image},
            'published',
            ${article.date + 'T10:00:00Z'},
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
          )
        `;
        console.log(`➕ Added: "${article.title}" (${article.date})`);
        added++;
      }
    } catch (error) {
      console.error(`❌ Error processing "${article.title}":`, error.message);
      errors++;
    }
  }

  // Also fix any articles that have incorrect dates (all showing same date pattern)
  console.log('\n--- Checking for remaining incorrect dates ---\n');

  const wrongDates = await sql`
    SELECT id, title, slug, to_char(published_at, 'YYYY-MM-DD') as pub_date
    FROM content
    WHERE type = 'news'
    AND published_at >= '2025-11-28'
    AND published_at <= '2025-12-06'
    AND id NOT IN (
      SELECT id FROM content WHERE slug IN (${sql(OFFICIAL_NEWS_DATA.map(a => a.slug))})
    )
  `;

  if (wrongDates.length > 0) {
    console.log(`Found ${wrongDates.length} articles with potentially incorrect dates:`);
    wrongDates.forEach(a => console.log(`  - "${a.title}" (${a.pub_date})`));
  }

  console.log('\n========================================');
  console.log(`Summary:`);
  console.log(`  Updated: ${updated} articles`);
  console.log(`  Added: ${added} new articles`);
  console.log(`  Errors: ${errors}`);
  console.log('========================================\n');
}

fixNewsDates().catch(console.error);
