/**
 * Scrape exact article content from getfund.gov.gh and update the database.
 * Maps each DB article slug to its getfund.gov.gh URL, fetches the page,
 * extracts the article body HTML, and updates the DB.
 */

require('dotenv').config();
const { Client } = require('pg');

// Map DB slugs to their getfund.gov.gh article URLs
const SLUG_TO_URL = {
  'getfund-deputy-administrator-visits-schools-affected-by-fire-northern-region': 'https://www.getfund.gov.gh/2026/02/04/getfund-deputy-administrator-visits-schools-affected-by-fire-in-the-northern-region/',
  'getfund-deputy-administrator-calls-investigation-recurrent-fires-nobisco-tolon-shs': 'https://www.getfund.gov.gh/2026/02/04/getfund-deputy-administrator-calls-for-investigation-intocauses-of-recurrent-fires-at-nobisco-and-tolon-shs/',
  'chief-justice-calls-getfund-judicial-service-reforms': 'https://www.getfund.gov.gh/2026/01/26/his-lordship-the-chief-justice-calls-on-getfund-for-judicial-service-reforms/',
  'chass-leadership-engages-getfund-administrator-2026': 'https://www.getfund.gov.gh/2026/01/23/chass-leadership-engages-getfund-administrator/',
  'getfund-receives-delegation-university-virgin-islands': 'https://www.getfund.gov.gh/2025/12/18/getfund-receives-delegation-from-university-of-the-virgin-islands/',
  'fueltrade-supports-getfund': 'https://www.getfund.gov.gh/2025/12/17/fueltrade-supports-getfund/',
  'getfund-accelerates-practical-science-education-stembox-initiative': 'https://www.getfund.gov.gh/2025/12/06/getfund-accelerates-practical-science-education-with-strategic-funding-for-stembox-initiative/',
  'getfund-supports-ghana-national-research-fund-office-complex': 'https://www.getfund.gov.gh/2025/11/29/getfund-supports-ghana-national-research-fund-with-office-complex/',
  '2026-budget-getfund-drives-historic-expansion-in-educational-infrastructure-and-learning-resources': 'https://www.getfund.gov.gh/2025/11/17/getfund-drives-historic-expansion-in-educational-infrastructure-and-learning-resources-under-the-2026-budget-2/',
  'getfund-commit-ghc-50-million-yearly-free-tertiary-education-persons-disabilities': 'https://www.getfund.gov.gh/2025/10/27/getfund-to-commit-ghc-50-million-yearly-to-free-tertiary-education-for-persons-with-disabilities/',
  'ceo-students-loan-trust-fund-visits-getfund-no-fee-stress-policy-pwds': 'https://www.getfund.gov.gh/2025/10/23/ceo-of-students-loan-trust-fund-visits-getfund-administrator-ahead-of-no-fee-stress-policy-launch-for-persons-with-disabilities-pwds/',
  'getfund-commences-accelerated-infrastructure-program-at-ambariya-schools': 'https://www.getfund.gov.gh/2025/10/14/getfund-commences-accelerated-infrastructure-program-at-ambariya-schools-targets-18-month-completion/',
  'getfund-kicks-off-multi-project-construction-to-boost-education-in-the-northern-region': 'https://www.getfund.gov.gh/2025/10/14/getfund-kicks-off-multi-project-construction-to-boost-education-in-the-northern-region/',
  'n-r-getfund-launches-major-infrastructure-expansion-at-ghana-senior-high-school': 'https://www.getfund.gov.gh/2025/10/14/n-r-getfund-launches-major-infrastructure-expansion-at-ghana-senior-high-school/',
  'getfund-gives-greenlight-for-the-construction-of-ultra-modern-infrastructure-at-karaga-shs': 'https://www.getfund.gov.gh/2025/10/14/getfund-gives-greenlight-for-the-construction-of-ultra-modern-infrastructure-facilities-at-karaga-shs/',
  'getfund-commences-major-facility-upgrade-pishigu-shs': 'https://www.getfund.gov.gh/2025/10/10/n-r-getfund-commences-major-facility-upgrade-at-pishigu-shs/',
  'getfund-administrator-meets-with-staff-2025': 'https://www.getfund.gov.gh/2025/08/11/getfund-administrator-meets-with-staff/',
  'director-general-prisons-engages-getfund-inmate-rehabilitation-partnership': 'https://www.getfund.gov.gh/2025/08/06/director-general-of-prisons-engages-getfund-on-inmate-rehabilitation-partnership/',
  'getfund-engages-voorhees-university-attraco-educational-collaboration': 'https://www.getfund.gov.gh/2025/07/17/getfund-engages-with-voorhees-university-and-attraco-to-deepen-educational-collaboration/',
  'photo-gallery-getfund-tours-uk-universities-to-engage-ghanaian-scholars': 'https://www.getfund.gov.gh/2025/07/03/photo-gallery-getfund-tours-uk-universities-to-engage-ghanaian-scholars/',
  'strengthening-educational-ties-getfund-monitors-scholars-uk': 'https://www.getfund.gov.gh/2025/07/03/strengthening-educational-ties-getfund-monitors-scholars-in-uk/',
  'getfund-holds-orientation-workshop-for-7th-board-of-trustees': 'https://www.getfund.gov.gh/2025/06/25/minister-of-education-inaugurates-7th-getfund-board-2/',
  'getfund-scholarship-unit-engages-university-cape-coast-students': 'https://www.getfund.gov.gh/2025/06/21/getfund-scholarship-unit-engages-with-university-of-cape-coast-students/',
  'gaf-cds-interacts-getfund-administrator': 'https://www.getfund.gov.gh/2025/05/16/gaf-cds-interacts-with-getfund-administrator/',
  'minister-education-inaugurates-7th-getfund-board': 'https://www.getfund.gov.gh/2025/04/11/minister-of-education-inaugurates-7th-getfund-board/',
  'getfund-administrator-engages-chass-leadership-2025': 'https://www.getfund.gov.gh/2025/03/25/getfund-administrator-engages-chass-leadership/',
  'advocacy-private-sector-led-school-infrastructure-development': 'https://www.getfund.gov.gh/2025/02/21/advocacy-for-private-sector-led-school-infrastructure-development/',
  'paul-adjei-assumes-office-getfund-administrator': 'https://www.getfund.gov.gh/2025/02/03/mr-paul-adjei-assumes-office-as-getfund-administrator/',
  'getfund-administrator-receives-state-award-outstanding-public-service': 'https://www.getfund.gov.gh/2024/12/30/getfund-administrator-receives-state-award-for-outstanding-public-service/',
  'getfund-inaugurates-a-four-storey-headquarters-building': 'https://www.getfund.gov.gh/2024/12/23/getfund-inaugurates-a-four-storey-headquarters-building/',
  '2024-trinity-theological-seminary-graduation': 'https://www.getfund.gov.gh/2024/11/09/2024-graduating-class-of-trinity-theological-seminary/',
  'getfund-grants-scholarships-gtp-finalists': 'https://www.getfund.gov.gh/2024/10/14/getfund-grants-scholarships-to-gtp-finalists/',
  'getfund-administrator-counsels-tertiary-institutions-financing-options': 'https://www.getfund.gov.gh/2024/04/03/getfund-administrator-counsels-tertiary-institutions-on-financing-options/',
  'getfund-administrator-engages-media-in-kumasi': 'https://www.getfund.gov.gh/2024/01/15/getfund-administrator-engages-media-in-kumasi/',
  'scholarship-processes-getfund-improved': 'https://www.getfund.gov.gh/2023/09/25/press-release/',
  'administrator-urges-universities-innovative-alternative-revenue-streams': 'https://www.getfund.gov.gh/2023/09/11/the-administrator-urges-universities-to-be-innovative-in/',
  'government-grants-new-scholarships-4279-local-tertiary-students': 'https://www.getfund.gov.gh/2023/08/08/government-grants-new-scholarships-to-4279-local-tertiary-students/',
  'getfund-has-not-used-receivables-borrow-1-5-billion': 'https://www.getfund.gov.gh/2023/07/19/getfund-has-not-used-its-receivables-to-borrow-1-5-billion/',
  'voorhees-university-delegation-calls-getfund': 'https://www.getfund.gov.gh/2023/05/23/military-high-command-pays-courtesy-call-on-getfund-administrator-2-3/',
  'carleton-university-pays-courtesy-call-getfund': 'https://www.getfund.gov.gh/2023/02/23/military-high-command-pays-courtesy-call-on-getfund-administrator-2/',
  'military-high-command-pays-courtesy-call-getfund-administrator': 'https://www.getfund.gov.gh/2023/02/22/military-high-command-pays-courtesy-call-on-getfund-administrator/',
  'delegation-heslb-tanzania-visits-getfund': 'https://www.getfund.gov.gh/2023/02/21/military-high-command-pays-courtesy-call-on-getfund-administrator-2-2/',
  'getfund-administrator-interacts-nugs-leadership': 'https://www.getfund.gov.gh/2023/02/02/getfund-administrator-interacts-with-nugs-leadership/',
  'getfund-2022-23-local-scholarship-application': 'https://www.getfund.gov.gh/2022/12/12/getfund-2022-23-local-scholarship-application/',
  'universities-fund-kenya-understudies-getfund': 'https://www.getfund.gov.gh/2022/12/08/universities-fund-kenya-understudies-getfund/',
  'getfund-accounts-to-public-stakeholder-forum': 'https://www.getfund.gov.gh/2022/11/08/getfund-accounts-to-the-public/',
  'getfund-administrator-inspects-uds-project': 'https://www.getfund.gov.gh/2022/10/05/getfund-administrator-project-tour/',
  'getfund-administrator-pays-working-visit-northern-sector-office': 'https://www.getfund.gov.gh/2022/10/03/getfund-administrator-pays-working-visit/',
  'getfund-board-trustees-tours-projects-eastern-region': 'https://www.getfund.gov.gh/2022/09/06/getfund-board-of-trustees-project-tour-2/',
  'vice-president-hands-over-buses-pickups-schools': 'https://www.getfund.gov.gh/2022/05/26/veep-busses-pickups-may-2022/',
  'daakye-trust-plc-holds-inaugural-agm-accra': 'https://www.getfund.gov.gh/2022/05/25/competently-parallel-task-fully-researched-data-and/',
  'getfund-bold-march-educational-infrastructure': 'https://www.getfund.gov.gh/2022/05/18/getfunds-bold-march-on-educational-infrastructural-development/',
  'press-update-infrastructure-projects': 'https://www.getfund.gov.gh/2022/05/17/press-update-infrastructure-projects/',
  'getfund-obtains-parliamentary-nod': 'https://www.getfund.gov.gh/2022/05/17/getfund-obtains-parliamentary-nod/',
  'getfund-completes-q1-project-monitoring-volta-region': 'https://www.getfund.gov.gh/2022/03/25/q1-monitoring-volta-region/',
  '2021-scholarship-monitoring-programme': 'https://www.getfund.gov.gh/2021/12/20/2021-scholarship-monitoring-programme/',
  'sona-2020-educational-infrastructure': 'https://www.getfund.gov.gh/2020/02/21/sona-2020/',
};

function extractArticleContent(html) {
  // Find the news-details__content section and extract text after </ul> (meta section)
  const contentStart = html.indexOf('news-details__content');
  if (contentStart === -1) {
    // Fallback: try entry-content
    return extractFallbackContent(html);
  }

  // Find the end of the meta <ul> section
  const afterContentStart = html.slice(contentStart);
  const metaEnd = afterContentStart.indexOf('</ul>');
  if (metaEnd === -1) return extractFallbackContent(html);

  // Content starts after </ul>
  let content = afterContentStart.slice(metaEnd + 5);

  // Find the end marker: </div> followed by news-details__bottom or end of the div
  const endIdx = content.indexOf('news-details__bottom');
  if (endIdx > 0) {
    // Go back to find the </div> before news-details__bottom
    const beforeEnd = content.slice(0, endIdx);
    const lastDivClose = beforeEnd.lastIndexOf('</div>');
    if (lastDivClose > 0) {
      content = beforeEnd.slice(0, lastDivClose);
    }
  }

  content = cleanContent(content);
  return content.length > 50 ? content : extractFallbackContent(html);
}

function extractFallbackContent(html) {
  // Fallback: extract content from entry-content div
  const match = html.match(/<div[^>]*class="[^"]*entry-content[^"]*"[^>]*>([\s\S]*?)(?:<div[^>]*class="[^"]*(?:sharedaddy|post-navigation|comments|news-details__bottom))/i);
  if (match) {
    const content = cleanContent(match[1]);
    if (content.length > 50) return content;
  }
  return null;
}

function cleanContent(html) {
  // Remove script and style tags
  html = html.replace(/<script[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<style[\s\S]*?<\/style>/gi, '');
  // Remove WordPress-specific elements
  html = html.replace(/<div[^>]*class="[^"]*sharedaddy[^"]*"[\s\S]*?<\/div>/gi, '');
  html = html.replace(/<div[^>]*class="[^"]*jp-relatedposts[^"]*"[\s\S]*?<\/div>/gi, '');
  // Clean figure tags - simplify to just img
  html = html.replace(/<figure[^>]*>([\s\S]*?)<\/figure>/gi, (match, inner) => {
    const imgMatch = inner.match(/<img[^>]*src="([^"]*)"[^>]*>/i);
    if (imgMatch) {
      return `<img src="${imgMatch[1]}" alt="" />`;
    }
    // Elementor gallery pattern: <a href="image.jpg"> with no <img>
    const aMatch = inner.match(/<a[^>]*href="([^"]*\.(?:jpg|jpeg|png|gif|webp))"[^>]*>/i);
    if (aMatch) {
      return `<img src="${aMatch[1]}" alt="" />`;
    }
    return '';
  });
  // Remove srcset, sizes, class attributes from remaining img tags
  html = html.replace(/<img([^>]*)>/gi, (match, attrs) => {
    const srcMatch = attrs.match(/src="([^"]*)"/);
    const altMatch = attrs.match(/alt="([^"]*)"/);
    if (srcMatch) {
      return `<img src="${srcMatch[1]}" alt="${altMatch ? altMatch[1] : ''}" />`;
    }
    return '';
  });
  // Remove empty paragraphs
  html = html.replace(/<p>\s*&nbsp;\s*<\/p>/gi, '');
  html = html.replace(/<p>\s*<\/p>/gi, '');
  // Remove zero-width characters
  html = html.replace(/\u200B/g, '');
  html = html.replace(/​/g, '');
  // Clean up excessive whitespace
  html = html.replace(/\n\s*\n/g, '\n');
  html = html.trim();
  return html;
}

function extractTitle(html) {
  // Try multiple title patterns
  const patterns = [
    /<h1[^>]*class="[^"]*entry-title[^"]*"[^>]*>([\s\S]*?)<\/h1>/i,
    /<h2[^>]*class="[^"]*entry-title[^"]*"[^>]*>([\s\S]*?)<\/h2>/i,
    /<h1[^>]*class="[^"]*news-details__title[^"]*"[^>]*>([\s\S]*?)<\/h1>/i,
    /<h2[^>]*class="[^"]*news-details__title[^"]*"[^>]*>([\s\S]*?)<\/h2>/i,
    /<title>([\s\S]*?)(?:\s*[-–|]|\s*<\/title>)/i,
    /<h1[^>]*>([\s\S]*?)<\/h1>/i,
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) {
      const title = match[1].replace(/<[^>]+>/g, '').trim();
      if (title.length > 5 && !title.includes('getfund.gov.gh')) return title;
    }
  }
  // Try og:title
  const ogMatch = html.match(/<meta[^>]*property="og:title"[^>]*content="([^"]*)"/i);
  if (ogMatch) return ogMatch[1].trim();
  return null;
}

async function fetchWithRetry(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.text();
    } catch (err) {
      if (i === retries - 1) throw err;
      console.log(`  Retry ${i + 1} for ${url}`);
      await new Promise(r => setTimeout(r, 2000));
    }
  }
}

async function main() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();
  console.log('Connected to database\n');

  const slugs = Object.keys(SLUG_TO_URL);
  console.log(`Processing ${slugs.length} articles...\n`);

  let updated = 0;
  let failed = 0;
  const errors = [];

  // Process in batches of 5 to avoid overwhelming the server
  for (let i = 0; i < slugs.length; i += 5) {
    const batch = slugs.slice(i, i + 5);
    const promises = batch.map(async (slug) => {
      const url = SLUG_TO_URL[slug];
      try {
        console.log(`[${i + batch.indexOf(slug) + 1}/${slugs.length}] Fetching: ${slug}`);
        const html = await fetchWithRetry(url);

        const content = extractArticleContent(html);
        const title = extractTitle(html);

        if (!content) {
          console.log(`  WARNING: Could not extract content for ${slug}`);
          errors.push({ slug, error: 'No content extracted' });
          failed++;
          return;
        }

        // Update the database
        const updateFields = ['body = $1'];
        const params = [content];
        let paramIdx = 2;

        if (title) {
          updateFields.push(`title = $${paramIdx}`);
          params.push(title);
          paramIdx++;
        }

        params.push(slug);
        await client.query(
          `UPDATE content SET ${updateFields.join(', ')} WHERE slug = $${paramIdx} AND type = 'news'`,
          params
        );

        console.log(`  Updated: ${slug} (${content.length} chars, title: ${title?.slice(0, 50)})`);
        updated++;
      } catch (err) {
        console.log(`  ERROR: ${slug} - ${err.message}`);
        errors.push({ slug, error: err.message });
        failed++;
      }
    });

    await Promise.all(promises);

    // Small delay between batches
    if (i + 5 < slugs.length) {
      await new Promise(r => setTimeout(r, 1000));
    }
  }

  console.log(`\n--- Summary ---`);
  console.log(`Updated: ${updated}`);
  console.log(`Failed: ${failed}`);
  if (errors.length > 0) {
    console.log('\nErrors:');
    errors.forEach(e => console.log(`  ${e.slug}: ${e.error}`));
  }

  await client.end();
}

// Export SLUG_TO_URL and content extraction functions for use by other scripts
module.exports = { SLUG_TO_URL, extractArticleContent, cleanContent };

// Only run main() when executed directly
if (require.main === module) {
  main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}
