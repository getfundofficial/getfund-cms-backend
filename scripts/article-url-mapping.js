/**
 * Precise article URL mapping
 * Maps article titles/slugs to their exact source URLs
 */

const urlMappings = {
  // 2026 articles
  'getfund-deputy-administrator-calls-for-investigation': 'https://www.getfund.gov.gh/2026/02/04/getfund-deputy-administrator-calls-for-investigation-intocauses-of-recurrent-fires-at-nobisco-and-tolon-shs/',
  'getfund-deputy-administrator-visits-schools-affected': 'https://www.getfund.gov.gh/2026/02/04/getfund-deputy-administrator-visits-schools-affected-by-fire-in-the-northern-region/',
  'his-lordship-the-chief-justice': 'https://www.getfund.gov.gh/2026/01/26/his-lordship-the-chief-justice-calls-on-getfund-for-judicial-service-reforms/',
  'chass-leadership-engages-getfund-administrator': 'https://www.getfund.gov.gh/2026/01/23/chass-leadership-engages-getfund-administrator/',

  // 2025 articles
  'getfund-receives-delegation-from-university': 'https://www.getfund.gov.gh/2025/12/18/getfund-receives-delegation-from-university-of-the-virgin-islands/',
  'fueltrade-supports-getfund': 'https://www.getfund.gov.gh/2025/12/17/fueltrade-supports-getfund/',
  'getfund-accelerates-practical-science-education': 'https://www.getfund.gov.gh/2025/12/06/getfund-accelerates-practical-science-education-with-strategic-funding-for-stembox-initiative/',
  'getfund-supports-ghana-national-research-fund': 'https://www.getfund.gov.gh/2025/11/29/getfund-supports-ghana-national-research-fund-with-office-complex/',
  '2026-budget-getfund-drives-historic-expansion': 'https://www.getfund.gov.gh/2025/11/17/getfund-drives-historic-expansion-in-educational-infrastructure-and-learning-resources-under-the-2026-budget-2/',
  'getfund-to-commit-ghc-50-million': 'https://www.getfund.gov.gh/2025/10/27/getfund-to-commit-ghc-50-million-yearly-to-free-tertiary-education-for-persons-with-disabilities/',
  'ceo-of-students-loan-trust-fund-visits': 'https://www.getfund.gov.gh/2025/10/23/ceo-of-students-loan-trust-fund-visits-getfund-administrator-ahead-of-no-fee-stress-policy-launch-for-persons-with-disabilities-pwds/',
  'getfund-kicks-off-multi-project-construction': 'https://www.getfund.gov.gh/2025/10/14/getfund-kicks-off-multi-project-construction-to-boost-education-in-the-northern-region/',
  'getfund-gives-greenlight-for-the-construction': 'https://www.getfund.gov.gh/2025/10/14/getfund-gives-greenlight-for-the-construction-of-ultra-modern-infrastructure-facilities-at-karaga-shs/',
  'n-r-getfund-launches-major-infrastructure-expansion': 'https://www.getfund.gov.gh/2025/10/14/n-r-getfund-launches-major-infrastructure-expansion-at-ghana-senior-high-school/',
  'getfund-commences-accelerated-infrastructure-program': 'https://www.getfund.gov.gh/2025/10/14/getfund-commences-accelerated-infrastructure-program-at-ambariya-schools-targets-18-month-completion/',
  'getfund-commences-major-facility-upgrade-at-pishigu': 'https://www.getfund.gov.gh/2025/10/10/n-r-getfund-commences-major-facility-upgrade-at-pishigu-shs/',
  'getfund-administrator-meets-with-staff': 'https://www.getfund.gov.gh/2025/08/11/getfund-administrator-meets-with-staff/',
  'director-general-of-prisons-engages-getfund': 'https://www.getfund.gov.gh/2025/08/06/director-general-of-prisons-engages-getfund-on-inmate-rehabilitation-partnership/',
  'getfund-engages-with-voorhees-university': 'https://www.getfund.gov.gh/2025/07/17/getfund-engages-with-voorhees-university-and-attraco-to-deepen-educational-collaboration/',
  'photo-gallery-getfund-tours-uk-universities': 'https://www.getfund.gov.gh/2025/07/03/photo-gallery-getfund-tours-uk-universities-to-engage-ghanaian-scholars/',
  'strengthening-educational-ties-getfund-monitors': 'https://www.getfund.gov.gh/2025/07/03/strengthening-educational-ties-getfund-monitors-scholars-in-uk/',
  'getfund-holds-orientation-workshop': 'https://www.getfund.gov.gh/2025/06/25/minister-of-education-inaugurates-7th-getfund-board-2/',
  'getfund-scholarship-unit-engages-with-university-of-cape-coast': 'https://www.getfund.gov.gh/2025/06/21/getfund-scholarship-unit-engages-with-university-of-cape-coast-students/',
  'gaf-cds-interacts-with-getfund-administrator': 'https://www.getfund.gov.gh/2025/05/16/gaf-cds-interacts-with-getfund-administrator/',
  'minister-of-education-inaugurates-7th-getfund-board': 'https://www.getfund.gov.gh/2025/04/11/minister-of-education-inaugurates-7th-getfund-board/',
  'getfund-administrator-engages-chass-leadership': 'https://www.getfund.gov.gh/2025/03/25/getfund-administrator-engages-chass-leadership/',
  'advocacy-for-private-sector-led-school-infrastructure': 'https://www.getfund.gov.gh/2025/02/21/advocacy-for-private-sector-led-school-infrastructure-development/',
  'mr-paul-adjei-assumes-office': 'https://www.getfund.gov.gh/2025/02/03/mr-paul-adjei-assumes-office-as-getfund-administrator/',

  // 2024 articles
  'getfund-administrator-receives-state-award': 'https://www.getfund.gov.gh/2024/12/30/getfund-administrator-receives-state-award-for-outstanding-public-service/',
  'state-award-for-outstanding-public-service': 'https://www.getfund.gov.gh/2024/12/30/getfund-administrator-receives-state-award-for-outstanding-public-service/',
  'getfund-inaugurates-a-four-storey-headquarters': 'https://www.getfund.gov.gh/2024/12/23/getfund-inaugurates-a-four-storey-headquarters-building/',
  '2024-trinity-theological-seminary': 'https://www.getfund.gov.gh/2024/11/09/2024-graduating-class-of-trinity-theological-seminary/',
  'getfund-grants-scholarships-to-gtp-finalists': 'https://www.getfund.gov.gh/2024/10/14/getfund-grants-scholarships-to-gtp-finalists/',
  'getfund-administrator-counsels-tertiary-institutions': 'https://www.getfund.gov.gh/2024/04/03/getfund-administrator-counsels-tertiary-institutions-on-financing-options/',
  'getfund-administrator-engages-media-in-kumasi': 'https://www.getfund.gov.gh/2024/01/15/getfund-administrator-engages-media-in-kumasi/',

  // 2023 articles
  'scholarship-processes-at-getfund-have-improved': 'https://www.getfund.gov.gh/2023/09/25/press-release/',
  'the-administrator-urges-universities-to-be-innovative': 'https://www.getfund.gov.gh/2023/09/11/the-administrator-urges-universities-to-be-innovative-in/',
  'government-grants-new-scholarships-to-4279': 'https://www.getfund.gov.gh/2023/08/08/government-grants-new-scholarships-to-4279-local-tertiary-students/',
  'getfund-has-not-used-its-receivables': 'https://www.getfund.gov.gh/2023/07/19/getfund-has-not-used-its-receivables-to-borrow-1-5-billion/',
  'voorhees-university-delegation-calls-on-getfund': 'https://www.getfund.gov.gh/2023/05/23/military-high-command-pays-courtesy-call-on-getfund-administrator-2-3/',
  'carleton-university-pays-courtesy-call': 'https://www.getfund.gov.gh/2023/02/23/military-high-command-pays-courtesy-call-on-getfund-administrator-2/',
  'military-high-command-pays-courtesy-call': 'https://www.getfund.gov.gh/2023/02/22/military-high-command-pays-courtesy-call-on-getfund-administrator/',
  'delegation-from-heslb-tanzania-visits': 'https://www.getfund.gov.gh/2023/02/21/military-high-command-pays-courtesy-call-on-getfund-administrator-2-2/',
  'getfund-administrator-interacts-with-nugs-leadership': 'https://www.getfund.gov.gh/2023/02/02/getfund-administrator-interacts-with-nugs-leadership/',

  // 2022 articles
  'getfund-2022-23-local-scholarship-application': 'https://www.getfund.gov.gh/2022/12/12/getfund-2022-23-local-scholarship-application/',
  'universities-fund-kenya-understudies-getfund': 'https://www.getfund.gov.gh/2022/12/08/universities-fund-kenya-understudies-getfund/',
  'getfund-accounts-to-the-public': 'https://www.getfund.gov.gh/2022/11/08/getfund-accounts-to-the-public/',
  'getfund-administrator-inspects-uds-project': 'https://www.getfund.gov.gh/2022/10/05/getfund-administrator-project-tour/',
  'getfund-administrator-pays-working-visit': 'https://www.getfund.gov.gh/2022/10/03/getfund-administrator-pays-working-visit/',
  'getfund-board-of-trustees-tours-projects': 'https://www.getfund.gov.gh/2022/09/06/getfund-board-of-trustees-project-tour-2/',
  'vice-president-hands-over-buses': 'https://www.getfund.gov.gh/2022/05/26/veep-busses-pickups-may-2022/',
  'daakye-trust-plc-holds-inaugural-agm': 'https://www.getfund.gov.gh/2022/05/25/competently-parallel-task-fully-researched-data-and/',
  'getfunds-bold-march-on-educational-infrastructure': 'https://www.getfund.gov.gh/2022/05/18/getfunds-bold-march-on-educational-infrastructural-development/',
  'press-update-infrastructure-projects': 'https://www.getfund.gov.gh/2022/05/17/press-update-infrastructure-projects/',
  'getfund-obtains-parliamentary-nod': 'https://www.getfund.gov.gh/2022/05/17/getfund-obtains-parliamentary-nod/',
  'getfund-completes-1st-quarter-project-monitoring': 'https://www.getfund.gov.gh/2022/03/25/q1-monitoring-volta-region/',

  // 2021 and earlier
  '2021-scholarship-monitoring-programme': 'https://www.getfund.gov.gh/2021/12/20/2021-scholarship-monitoring-programme/',
  'sona-2020-on-educational-infrastructure': 'https://www.getfund.gov.gh/2020/02/21/sona-2020/',
};

function findUrlForArticle(article) {
  const slug = article.slug.toLowerCase();
  const title = article.title.toLowerCase();

  // Try exact slug match first
  for (const [key, url] of Object.entries(urlMappings)) {
    if (slug.includes(key) || key.includes(slug.replace(/-\d+$/, ''))) {
      return url;
    }
  }

  // Try title-based matching
  const titleSlug = title
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 50);

  for (const [key, url] of Object.entries(urlMappings)) {
    if (titleSlug.includes(key.substring(0, 30)) || key.includes(titleSlug.substring(0, 30))) {
      return url;
    }
  }

  return null;
}

module.exports = { urlMappings, findUrlForArticle };
