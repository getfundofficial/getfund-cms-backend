-- Migration 046: Revert news article images to original external URLs
-- This ROLLBACK migration undoes migrations 041-045 which changed featured_image_url
-- from working external getfund.gov.gh URLs to broken local /images/news/ paths.
-- Original URLs sourced from migration 037 (initial insert) and 038 (content updates).

-- === 2026 Articles ===

UPDATE content SET featured_image_url = 'https://www.getfund.gov.gh/wp-content/uploads/2026/02/Dept-770x417.png'
WHERE slug = 'getfund-deputy-administrator-visits-schools-affected-by-fire-northern-region' AND type = 'news';

UPDATE content SET featured_image_url = 'https://www.getfund.gov.gh/wp-content/uploads/2026/02/IMG_1149-770x417.jpg'
WHERE slug = 'getfund-deputy-administrator-calls-investigation-recurrent-fires-nobisco-tolon-shs' AND type = 'news';

UPDATE content SET featured_image_url = 'https://www.getfund.gov.gh/wp-content/uploads/2026/01/CJ-770x417.png'
WHERE slug = 'chief-justice-calls-getfund-judicial-service-reforms' AND type = 'news';

UPDATE content SET featured_image_url = 'https://www.getfund.gov.gh/wp-content/uploads/2026/01/WhatsApp-Image-2026-01-23-at-07.30.17-1-770x417.jpeg'
WHERE slug = 'chass-leadership-engages-getfund-administrator-2026' AND type = 'news';

-- === 2025 Articles ===

UPDATE content SET featured_image_url = 'https://www.getfund.gov.gh/wp-content/uploads/2025/12/UVI-770x417.jpg'
WHERE slug = 'getfund-receives-delegation-university-virgin-islands' AND type = 'news';

UPDATE content SET featured_image_url = 'https://www.getfund.gov.gh/wp-content/uploads/2025/12/Fuel-Trade-770x417.jpg'
WHERE slug = 'fueltrade-supports-getfund' AND type = 'news';

UPDATE content SET featured_image_url = 'https://www.getfund.gov.gh/wp-content/uploads/2025/12/Admin@Stembox-770x417.png'
WHERE slug IN (
  'getfund-accelerates-practical-science-education-stembox-initiative',
  'getfund-accelerates-practical-science-education-with-science-equipment-donation'
) AND type = 'news';

UPDATE content SET featured_image_url = 'https://www.getfund.gov.gh/wp-content/uploads/2025/11/Research-2-770x417.png'
WHERE slug IN (
  'getfund-supports-ghana-national-research-fund-office-complex',
  'getfund-supports-ghana-national-research-fund-with-strategic-mou'
) AND type = 'news';

UPDATE content SET featured_image_url = 'https://www.getfund.gov.gh/wp-content/uploads/2025/10/Nobisco-1-770x417.png'
WHERE slug IN (
  'getfund-kicks-off-multi-project-construction-northern-region',
  'getfund-kicks-off-multi-project-construction-to-boost-education-in-the-northern-region',
  'getfund-kicks-off-multi-project-construction-to-boost-infrastructure-in-oti-region'
) AND type = 'news';

UPDATE content SET featured_image_url = 'https://www.getfund.gov.gh/wp-content/uploads/2025/11/Ato-Forson-770x417.jpg'
WHERE slug IN (
  '2026-budget-getfund-drives-historic-expansion-educational-infrastructure',
  '2026-budget-getfund-drives-historic-expansion-in-educational-infrastructure-and-learning-resources',
  '2026-budget-getfund-drives-historic-expansion-in-education'
) AND type = 'news';

UPDATE content SET featured_image_url = 'https://www.getfund.gov.gh/wp-content/uploads/2025/10/AdminPresident-770x417.png'
WHERE slug IN (
  'getfund-commit-ghc-50-million-yearly-free-tertiary-education-persons-disabilities',
  'getfund-to-commit-ghc-50-million-yearly-to-free-tertiary-education-for-persons-with-disabilities',
  'getfund-to-commit-ghc-50-million-yearly-to-free-tertiary-textbooks'
) AND type = 'news';

UPDATE content SET featured_image_url = 'https://www.getfund.gov.gh/wp-content/uploads/2025/10/Grp-Pix-770x417.jpg'
WHERE slug IN (
  'ceo-students-loan-trust-fund-visits-getfund-no-fee-stress-policy-pwds',
  'ceo-of-students-loan-trust-fund-visits-getfund-administrator-ahead-of-no-fee-stress-policy-launch-for-persons-with-disabilities-pwds',
  'ceo-of-students-loan-trust-fund-visits-getfund-administrator'
) AND type = 'news';

UPDATE content SET featured_image_url = 'https://www.getfund.gov.gh/wp-content/uploads/2025/10/Nobisco-1-770x417.png'
WHERE slug IN (
  'getfund-kicks-off-multi-project-construction-in-north-east-region',
  'getfund-kicks-off-multi-project-construction-in-northern-region',
  'getfund-kicks-off-multi-project-construction-northern-region'
) AND type = 'news';

UPDATE content SET featured_image_url = 'https://www.getfund.gov.gh/wp-content/uploads/2025/10/GHANASCO-770x417.png'
WHERE slug IN (
  'getfund-launches-major-infrastructure-expansion-ghana-senior-high-school',
  'n-r-getfund-launches-major-infrastructure-expansion-at-ghana-senior-high-technical-school-tamale',
  'nr-getfund-launches-major-infrastructure-expansion-at-ghana-shs',
  'n-r-getfund-launches-major-infrastructure-expansion-at-ghana-senior-high-school'
) AND type = 'news';

UPDATE content SET featured_image_url = 'https://www.getfund.gov.gh/wp-content/uploads/2025/10/Karaga-blk-770x417.png'
WHERE slug IN (
  'getfund-greenlight-construction-ultra-modern-infrastructure-karaga-shs',
  'getfund-gives-greenlight-for-the-construction-of-ultra-modern-infrastructure-facilities-at-karaga-shs',
  'getfund-gives-greenlight-for-the-construction-of-ultra-modern-infrastructure-at-karaga-shs'
) AND type = 'news';

UPDATE content SET featured_image_url = 'https://www.getfund.gov.gh/wp-content/uploads/2025/10/Karaga-blk-770x417.png'
WHERE slug = 'getfund-gives-greenlight-for-the-construction-of-ultra-modern-assembly-hall-at-st-annes-shs' AND type = 'news';

UPDATE content SET featured_image_url = 'https://www.getfund.gov.gh/wp-content/uploads/2025/10/1-770x417.png'
WHERE slug IN (
  'getfund-commences-major-facility-upgrade-pishigu-shs',
  'n-r-getfund-commences-major-facility-upgrade-at-pishigu-shs'
) AND type = 'news';

UPDATE content SET featured_image_url = 'https://www.getfund.gov.gh/wp-content/uploads/2025/10/AMbariya-2-770x417.png'
WHERE slug IN (
  'getfund-commences-accelerated-infrastructure-program-ambariya-schools',
  'getfund-commences-accelerated-infrastructure-programme-in-savannah-region',
  'getfund-commences-accelerated-infrastructure-program-at-ambariya-schools'
) AND type = 'news';

UPDATE content SET featured_image_url = 'https://www.getfund.gov.gh/wp-content/uploads/2025/10/SD1-770x417.jpg'
WHERE slug IN (
  'getfund-administrator-meets-with-staff-2025',
  'getfund-administrator-meets-with-staff'
) AND type = 'news';

UPDATE content SET featured_image_url = 'https://www.getfund.gov.gh/wp-content/uploads/2025/10/GETPrison-770x417.jpg'
WHERE slug IN (
  'director-general-prisons-engages-getfund-inmate-rehabilitation-partnership',
  'director-general-of-prisons-engages-getfund-on-inmate-rehabilitation',
  'director-general-of-prisons-engages-getfund-on-inmate-rehabilitation-partnership'
) AND type = 'news';

UPDATE content SET featured_image_url = 'https://www.getfund.gov.gh/wp-content/uploads/2025/10/1v-770x417.jpg'
WHERE slug IN (
  'getfund-engages-voorhees-university-attraco-educational-collaboration',
  'getfund-engages-with-voorhees-university-and-attraco-to-deepen-scholarship-partnership',
  'getfund-engages-with-voorhees-university-and-attraco-to-deepen-educational-collaboration'
) AND type = 'news';

UPDATE content SET featured_image_url = 'https://www.getfund.gov.gh/wp-content/uploads/2025/10/WhatsApp-Image-2025-10-17-at-12.06.03_7eee427d-770x417.jpg'
WHERE slug IN (
  'photo-gallery-getfund-tours-uk-universities-engage-ghanaian-scholars',
  'photo-gallery-getfund-tours-uk-universities-to-engage-ghanaian-scholars'
) AND type = 'news';

UPDATE content SET featured_image_url = 'https://www.getfund.gov.gh/wp-content/uploads/2025/10/WhatsApp-Image-2025-10-17-at-12.06.14_c80190aa-770x417.jpg'
WHERE slug IN (
  'strengthening-educational-ties-getfund-monitors-scholars-uk',
  'strengthening-educational-ties-getfund-monitors-scholars-in-the-uk',
  'strengthening-educational-ties-getfund-monitors-scholars-in-uk'
) AND type = 'news';

UPDATE content SET featured_image_url = 'https://www.getfund.gov.gh/wp-content/uploads/2025/06/S8509226-770x417.jpg'
WHERE slug IN (
  'getfund-holds-orientation-workshop-7th-board-trustees',
  'getfund-holds-orientation-workshop-for-7th-board-of-trustees'
) AND type = 'news';

UPDATE content SET featured_image_url = 'https://www.getfund.gov.gh/wp-content/uploads/2025/10/Scholars.png'
WHERE slug IN (
  'getfund-scholarship-unit-engages-university-cape-coast-students',
  'getfund-scholarship-unit-engages-with-university-of-cape-coast-management',
  'getfund-scholarship-unit-engages-with-university-of-cape-coast-students'
) AND type = 'news';

UPDATE content SET featured_image_url = 'https://www.getfund.gov.gh/wp-content/uploads/2025/05/CDS-565x417.png'
WHERE slug IN (
  'gaf-cds-interacts-getfund-administrator',
  'gaf-cds-interacts-with-getfund-administrator'
) AND type = 'news';

UPDATE content SET featured_image_url = 'https://www.getfund.gov.gh/wp-content/uploads/2025/04/S8507439-770x417.jpg'
WHERE slug IN (
  'minister-education-inaugurates-7th-getfund-board',
  'minister-of-education-inaugurates-7th-getfund-board'
) AND type = 'news';

UPDATE content SET featured_image_url = 'https://www.getfund.gov.gh/wp-content/uploads/2025/03/ST856505-770x417.jpg'
WHERE slug IN (
  'getfund-administrator-engages-chass-leadership-2025',
  'getfund-administrator-engages-chass-leadership'
) AND type = 'news';

UPDATE content SET featured_image_url = 'https://www.getfund.gov.gh/wp-content/uploads/2025/02/S8502069-770x417.jpg'
WHERE slug IN (
  'advocacy-private-sector-led-school-infrastructure-development',
  'advocacy-for-private-sector-led-school-infrastructure-development',
  'advocacy-for-private-sector-led-school-infrastructure-dev'
) AND type = 'news';

UPDATE content SET featured_image_url = 'https://www.getfund.gov.gh/wp-content/uploads/2025/02/ST852075-770x417.jpg'
WHERE slug IN (
  'paul-adjei-assumes-office-getfund-administrator',
  'mr-paul-adjei-assumes-office-as-getfund-administrator'
) AND type = 'news';

-- === 2024 Articles ===

UPDATE content SET featured_image_url = 'https://www.getfund.gov.gh/wp-content/uploads/2024/12/ST850255-714x417.jpg'
WHERE slug IN (
  'getfund-administrator-receives-state-award-outstanding-public-service',
  'state-award-for-outstanding-public-service'
) AND type = 'news';

UPDATE content SET featured_image_url = 'https://www.getfund.gov.gh/wp-content/uploads/2025/01/IMGG_9999_244-770x417.jpg'
WHERE slug IN (
  'getfund-inaugurates-four-storey-headquarters-building',
  'getfund-inaugurates-a-four-storey-headquarters-building'
) AND type = 'news';

UPDATE content SET featured_image_url = 'https://www.getfund.gov.gh/wp-content/uploads/2024/11/1Z0A7382-770x417.jpg'
WHERE slug = '2024-trinity-theological-seminary-graduation' AND type = 'news';

UPDATE content SET featured_image_url = 'https://www.getfund.gov.gh/wp-content/uploads/2024/10/86B6195-770x417.jpg'
WHERE slug IN (
  'getfund-grants-scholarships-gtp-finalists',
  'getfund-grants-scholarships-to-gtp-finalists'
) AND type = 'news';

UPDATE content SET featured_image_url = 'https://www.getfund.gov.gh/wp-content/uploads/2024/04/ST857443-770x417.jpg'
WHERE slug IN (
  'getfund-administrator-counsels-tertiary-institutions-financing-options',
  'getfund-administrator-counsels-tertiary-institutions-on-financial-prudence',
  'getfund-administrator-counsels-tertiary-institutions'
) AND type = 'news';

UPDATE content SET featured_image_url = 'https://www.getfund.gov.gh/wp-content/uploads/2024/04/9CCC830E-CBF2-4AFA-B485-AAE9B0B623D4-770x417.jpg'
WHERE slug IN (
  'getfund-administrator-engages-media-kumasi',
  'getfund-administrator-engages-media-in-kumasi'
) AND type = 'news';

-- === 2023 Articles ===

UPDATE content SET featured_image_url = 'https://www.getfund.gov.gh/wp-content/uploads/2023/09/GETFund-Press-Release-Cover-770x417.jpg'
WHERE slug IN (
  'scholarship-processes-getfund-improved',
  'scholarship-processes-at-getfund-have-improved'
) AND type = 'news';

UPDATE content SET featured_image_url = 'https://www.getfund.gov.gh/wp-content/uploads/2023/09/S8503168-770x417.jpg'
WHERE slug IN (
  'administrator-urges-universities-innovative-alternative-revenue-streams',
  'the-administrator-urges-universities-to-be-innovative',
  'the-administrator-urges-universities-to-be-innovative-in'
) AND type = 'news';

UPDATE content SET featured_image_url = 'https://www.getfund.gov.gh/wp-content/uploads/2023/08/Unknown-1-770x417.jpeg'
WHERE slug IN (
  'government-grants-new-scholarships-4279-local-tertiary-students',
  'government-grants-new-scholarships-to-4279-local-tertiary-students'
) AND type = 'news';

UPDATE content SET featured_image_url = 'https://www.getfund.gov.gh/wp-content/uploads/2023/07/S8500045-1-770x417.jpg'
WHERE slug IN (
  'getfund-has-not-used-receivables-borrow-1-5-billion',
  'getfund-has-not-used-its-receivables-to-borrow-1-5-billion'
) AND type = 'news';

UPDATE content SET featured_image_url = 'https://www.getfund.gov.gh/wp-content/uploads/2023/04/DSC_03245-770x417.jpg'
WHERE slug IN (
  'voorhees-university-delegation-calls-getfund',
  'voorhees-university-delegation-calls-on-getfund'
) AND type = 'news';

UPDATE content SET featured_image_url = 'https://www.getfund.gov.gh/wp-content/uploads/2023/03/5H8A3236-770x417.jpg'
WHERE slug IN (
  'carleton-university-pays-courtesy-call-getfund',
  'carleton-university-pays-courtesy-call-on-getfund'
) AND type = 'news';

UPDATE content SET featured_image_url = 'https://www.getfund.gov.gh/wp-content/uploads/2023/02/1Z0A9913-770x417.jpg'
WHERE slug IN (
  'military-high-command-pays-courtesy-call-getfund-administrator',
  'military-high-command-pays-courtesy-call-on-getfund-administrator'
) AND type = 'news';

UPDATE content SET featured_image_url = 'https://www.getfund.gov.gh/wp-content/uploads/2023/03/1Z0A0148-770x417.jpg'
WHERE slug IN (
  'delegation-heslb-tanzania-visits-getfund',
  'delegation-from-heslb-tanzania-visits-getfund'
) AND type = 'news';

UPDATE content SET featured_image_url = 'https://www.getfund.gov.gh/wp-content/uploads/2023/02/S8509378-770x417.jpg'
WHERE slug IN (
  'getfund-administrator-interacts-nugs-leadership',
  'getfund-administrator-interacts-with-nugs-leadership'
) AND type = 'news';

-- === 2022 Articles ===

UPDATE content SET featured_image_url = 'https://www.getfund.gov.gh/wp-content/uploads/2022/12/Home-background-with-Dark-Cover-copywrite-770x417.jpg'
WHERE slug = 'getfund-2022-23-local-scholarship-application' AND type = 'news';

UPDATE content SET featured_image_url = 'https://www.getfund.gov.gh/wp-content/uploads/2022/10/S8507486-770x417.jpg'
WHERE slug = 'universities-fund-kenya-understudies-getfund' AND type = 'news';

UPDATE content SET featured_image_url = 'https://www.getfund.gov.gh/wp-content/uploads/2022/11/5H8A0438-770x417.jpg'
WHERE slug IN (
  'getfund-accounts-to-public-stakeholder-forum',
  'getfund-accounts-to-the-public-stakeholder-forum'
) AND type = 'news';

UPDATE content SET featured_image_url = 'https://www.getfund.gov.gh/wp-content/uploads/2022/09/IMG_6526-770x417.jpg'
WHERE slug = 'getfund-administrator-inspects-uds-project' AND type = 'news';

UPDATE content SET featured_image_url = 'https://www.getfund.gov.gh/wp-content/uploads/2022/05/IMG_6421-770x417.jpg'
WHERE slug IN (
  'getfund-administrator-pays-working-visit-northern-sector-office',
  'getfund-administrator-pays-working-visit'
) AND type = 'news';

UPDATE content SET featured_image_url = 'https://www.getfund.gov.gh/wp-content/uploads/2022/09/MG_9824-770x417.jpg'
WHERE slug IN (
  'getfund-board-trustees-tours-projects-eastern-region',
  'getfund-board-of-trustees-tour-project'
) AND type = 'news';

UPDATE content SET featured_image_url = 'https://www.getfund.gov.gh/wp-content/uploads/2022/06/blog-1-1-770x417-1.jpg'
WHERE slug IN (
  'vice-president-hands-over-buses-pickups-schools',
  'vice-president-hands-over-buses-and-pickups'
) AND type = 'news';

UPDATE content SET featured_image_url = 'https://www.getfund.gov.gh/wp-content/uploads/2022/05/blog-1-1-770x417-1.jpg'
WHERE slug IN (
  'daakye-trust-plc-holds-inaugural-agm-accra',
  'daakye-trust-plc-holds-inaugural-agm-in-accra'
) AND type = 'news';

UPDATE content SET featured_image_url = 'https://www.getfund.gov.gh/wp-content/uploads/2022/01/GETFund-News-2-2-1024x683-1-770x417.jpg'
WHERE slug IN (
  'getfund-bold-march-educational-infrastructure',
  'getfund-s-bold-march-on-educational-infrastructure'
) AND type = 'news';

UPDATE content SET featured_image_url = 'https://www.getfund.gov.gh/wp-content/uploads/2022/05/Screenshot-2022-06-24-at-11.14.12-PM-770x417.png'
WHERE slug = 'press-update-infrastructure-projects' AND type = 'news';

UPDATE content SET featured_image_url = 'https://www.getfund.gov.gh/wp-content/uploads/2021/12/GETFund-News-1-1-1024x683-1-770x417.jpg'
WHERE slug = 'getfund-obtains-parliamentary-nod' AND type = 'news';

UPDATE content SET featured_image_url = 'https://www.getfund.gov.gh/wp-content/uploads/2022/03/Volt-Monitoring-1-770x417-1.jpg'
WHERE slug IN (
  'getfund-completes-q1-project-monitoring-volta-region',
  'getfund-completes-1st-quarter-project-monitoring-in-volta-region'
) AND type = 'news';

-- === 2021 Articles ===

UPDATE content SET featured_image_url = 'https://www.getfund.gov.gh/wp-content/uploads/2022/01/GETFund-News-3-3-1024x683-1-770x417.jpg'
WHERE slug = '2021-scholarship-monitoring-programme' AND type = 'news';

-- === 2020 Articles ===

UPDATE content SET featured_image_url = 'https://www.getfund.gov.gh/wp-content/uploads/2022/01/SONA-GETFund-1-770x417-1.jpg'
WHERE slug IN (
  'sona-2020-educational-infrastructure',
  'sona-2020-on-educational-infrastructure'
) AND type = 'news';

-- === Catch-all: Revert any remaining articles set to placeholder back to NULL ===
-- Articles that were set to /images/news/news-placeholder.svg by migration 041
-- are restored to NULL so the frontend can handle them with its own fallback
UPDATE content SET featured_image_url = NULL
WHERE type = 'news'
  AND featured_image_url = '/images/news/news-placeholder.svg';
