#!/usr/bin/env node

/**
 * Fix article dates to match the source website URLs
 * The URL format is: /YYYY/MM/DD/slug/
 */

require('dotenv').config({ path: '.env' });
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);

// Article date mappings based on source URLs
const articleDates = {
  // 2026
  'getfund-deputy-administrator-calls-for-investigation': '2026-02-04',
  'getfund-deputy-administrator-visits-schools-affected': '2026-02-04',
  'his-lordship-the-chief-justice': '2026-01-26',
  'chass-leadership-engages-getfund-administrator': '2026-01-23',

  // 2025 December
  'getfund-receives-delegation-from-university': '2025-12-18',
  'fueltrade-supports-getfund': '2025-12-17',
  'getfund-accelerates-practical-science-education': '2025-12-06',

  // 2025 November
  'getfund-supports-ghana-national-research-fund': '2025-11-29',
  '2026-budget-getfund-drives-historic-expansion': '2025-11-17',
  'getfund-drives-historic-expansion': '2025-11-15',

  // 2025 October
  'getfund-to-commit-ghc-50-million': '2025-10-27',
  'ceo-of-students-loan-trust-fund-visits': '2025-10-23',
  'getfund-kicks-off-multi-project-construction': '2025-10-14',
  'getfund-gives-greenlight-for-the-construction': '2025-10-14',
  'n-r-getfund-launches-major-infrastructure-expansion': '2025-10-14',
  'getfund-launches-major-infrastructure-expansion': '2025-10-14',
  'getfund-commences-accelerated-infrastructure-program': '2025-10-14',
  'getfund-commences-major-facility-upgrade-at-pishigu': '2025-10-10',
  'n-r-getfund-commences-major-facility-upgrade': '2025-10-10',

  // 2025 August
  'getfund-administrator-meets-with-staff': '2025-08-11',
  'director-general-of-prisons-engages-getfund': '2025-08-06',

  // 2025 July
  'getfund-engages-with-voorhees-university': '2025-07-17',
  'photo-gallery-getfund-tours-uk-universities': '2025-07-03',
  'strengthening-educational-ties-getfund-monitors': '2025-07-03',

  // 2025 June
  'getfund-holds-orientation-workshop': '2025-06-25',
  'minister-of-education-inaugurates-7th-getfund-board-2': '2025-06-25',
  'getfund-scholarship-unit-engages-with-university-of-cape-coast': '2025-06-21',

  // 2025 May
  'gaf-cds-interacts-with-getfund-administrator': '2025-05-16',

  // 2025 April
  'minister-of-education-inaugurates-7th-getfund-board': '2025-04-11',

  // 2025 March
  'getfund-administrator-engages-chass-leadership': '2025-03-25',

  // 2025 February
  'advocacy-for-private-sector-led-school-infrastructure': '2025-02-21',
  'mr-paul-adjei-assumes-office': '2025-02-03',

  // 2024
  'getfund-administrator-receives-state-award': '2024-12-30',
  'state-award-for-outstanding-public-service': '2024-12-30',
  'getfund-inaugurates-a-four-storey-headquarters': '2024-12-23',
  '2024-trinity-theological-seminary': '2024-11-09',
  'getfund-grants-scholarships-to-gtp-finalists': '2024-10-14',
  'getfund-administrator-counsels-tertiary-institutions': '2024-04-03',
  'getfund-administrator-engages-media-in-kumasi': '2024-01-15',

  // 2023
  'scholarship-processes-at-getfund-have-improved': '2023-09-25',
  'press-release': '2023-09-25',
  'the-administrator-urges-universities-to-be-innovative': '2023-09-11',
  'government-grants-new-scholarships-to-4279': '2023-08-08',
  'getfund-has-not-used-its-receivables': '2023-07-19',
  'voorhees-university-delegation-calls-on-getfund': '2023-05-23',
  'carleton-university-pays-courtesy-call': '2023-02-23',
  'military-high-command-pays-courtesy-call': '2023-02-22',
  'delegation-from-heslb-tanzania-visits': '2023-02-21',
  'getfund-administrator-interacts-with-nugs-leadership': '2023-02-02',

  // 2022
  'getfund-2022-23-local-scholarship-application': '2022-12-12',
  'universities-fund-kenya-understudies-getfund': '2022-12-08',
  'getfund-accounts-to-the-public': '2022-11-08',
  'getfund-administrator-inspects-uds-project': '2022-10-05',
  'getfund-administrator-project-tour': '2022-10-05',
  'getfund-administrator-pays-working-visit': '2022-10-03',
  'getfund-board-of-trustees-tours-projects': '2022-09-06',
  'getfund-board-of-trustees-project-tour': '2022-09-06',
  'vice-president-hands-over-buses': '2022-05-26',
  'veep-busses-pickups': '2022-05-26',
  'daakye-trust-plc-holds-inaugural-agm': '2022-05-25',
  'getfunds-bold-march-on-educational-infrastructure': '2022-05-18',
  'press-update-infrastructure-projects': '2022-05-17',
  'getfund-obtains-parliamentary-nod': '2022-05-17',
  'getfund-completes-1st-quarter-project-monitoring': '2022-03-25',
  'q1-monitoring-volta-region': '2022-03-25',

  // 2021 and earlier
  '2021-scholarship-monitoring-programme': '2021-12-20',
  'sona-2020-on-educational-infrastructure': '2020-02-21',
  'sona-2020': '2020-02-21',
};

function findDateForArticle(article) {
  const slug = article.slug.toLowerCase();
  const title = article.title.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-');

  // Try slug match
  for (const [key, date] of Object.entries(articleDates)) {
    if (slug.includes(key) || key.includes(slug.substring(0, 30))) {
      return date;
    }
  }

  // Try title match
  for (const [key, date] of Object.entries(articleDates)) {
    if (title.includes(key) || key.includes(title.substring(0, 30))) {
      return date;
    }
  }

  // Try to extract from meta_data sourceUrl
  if (article.meta_data && article.meta_data.sourceUrl) {
    const urlMatch = article.meta_data.sourceUrl.match(/\/(\d{4})\/(\d{2})\/(\d{2})\//);
    if (urlMatch) {
      return `${urlMatch[1]}-${urlMatch[2]}-${urlMatch[3]}`;
    }
  }

  return null;
}

async function main() {
  console.log('Fixing article dates...\n');

  const articles = await sql`
    SELECT id, title, slug, published_at, meta_data
    FROM content
    WHERE type = 'news' AND deleted_at IS NULL
    ORDER BY published_at DESC NULLS LAST
  `;

  console.log(`Processing ${articles.length} articles...\n`);

  let fixed = 0;
  let unchanged = 0;
  let noDate = 0;

  for (const article of articles) {
    const correctDate = findDateForArticle(article);

    if (correctDate) {
      const currentDate = article.published_at ?
        new Date(article.published_at).toISOString().split('T')[0] : null;

      if (currentDate !== correctDate) {
        console.log(`[FIX] ${article.title.substring(0, 45)}...`);
        console.log(`      ${currentDate || 'NULL'} -> ${correctDate}`);

        await sql`
          UPDATE content
          SET published_at = ${correctDate + 'T12:00:00Z'}::timestamp
          WHERE id = ${article.id}
        `;
        fixed++;
      } else {
        unchanged++;
      }
    } else {
      console.log(`[???] ${article.title.substring(0, 45)}... - No date found`);
      noDate++;
    }
  }

  console.log('\n=== SUMMARY ===');
  console.log(`Fixed: ${fixed}`);
  console.log(`Already correct: ${unchanged}`);
  console.log(`No date found: ${noDate}`);

  // Show final list
  console.log('\n=== FINAL ARTICLE LIST ===\n');
  const updated = await sql`
    SELECT title, published_at
    FROM content
    WHERE type = 'news' AND deleted_at IS NULL
    ORDER BY published_at DESC NULLS LAST
  `;

  for (let i = 0; i < updated.length; i++) {
    const a = updated[i];
    const date = a.published_at ? new Date(a.published_at).toISOString().split('T')[0] : 'NO DATE';
    console.log(`${(i+1).toString().padStart(2)}. [${date}] ${a.title.substring(0, 55)}`);
  }
}

main();
