-- Migration 041: Update news article images to use local paths
-- The images were downloaded to public/images/news/ but the database still has external URLs

-- Update all news articles to use local image paths based on their slugs

-- 2026 Articles
UPDATE content SET featured_image_url = '/images/news/getfund-deputy-administrator-visits-schools-affected-by-fire-northern-region.jpg'
WHERE slug = 'getfund-deputy-administrator-visits-schools-affected-by-fire-northern-region' AND type = 'news';

UPDATE content SET featured_image_url = '/images/news/getfund-deputy-administrator-calls-investigation-recurrent-fires-nobisco-tolon-shs.jpg'
WHERE slug = 'getfund-deputy-administrator-calls-investigation-recurrent-fires-nobisco-tolon-shs' AND type = 'news';

UPDATE content SET featured_image_url = '/images/news/chief-justice-calls-getfund-judicial-service-reforms.jpg'
WHERE slug = 'chief-justice-calls-getfund-judicial-service-reforms' AND type = 'news';

UPDATE content SET featured_image_url = '/images/news/getfund-administrator-engages-chass-leadership.jpg'
WHERE slug = 'chass-leadership-engages-getfund-administrator-2026' AND type = 'news';

-- 2025 Articles
UPDATE content SET featured_image_url = '/images/news/getfund-receives-delegation-from-university-of-virgin-island.jpg'
WHERE slug = 'getfund-receives-delegation-university-virgin-islands' AND type = 'news';

UPDATE content SET featured_image_url = '/images/news/fueltrade-supports-getfund-81d8a552-07de-4243-86cb-e1e131f81bae.jpg'
WHERE slug = 'fueltrade-supports-getfund' AND type = 'news';

UPDATE content SET featured_image_url = '/images/news/getfund-accelerates-practical-science-education-wi-e9037f5d-caa2-43d1-ac14-d1b850e4e1ef.png'
WHERE slug = 'getfund-accelerates-practical-science-education-with-science-equipment-donation' AND type = 'news';

UPDATE content SET featured_image_url = '/images/news/getfund-supports-ghana-national-research-fund-with-236d3784-b3bc-491a-aa51-e9a1c255fbe5.png'
WHERE slug = 'getfund-supports-ghana-national-research-fund-with-strategic-mou' AND type = 'news';

UPDATE content SET featured_image_url = '/images/news/getfund-kicks-off-multi-project-construction-to-bo-7593a102-1a95-4aeb-92d3-650b5bee5457.png'
WHERE slug = 'getfund-kicks-off-multi-project-construction-to-boost-infrastructure-in-oti-region' AND type = 'news';

UPDATE content SET featured_image_url = '/images/news/2026-budget-getfund-drives-historic-expansion-in-e-9f0d945b-2680-410f-a824-af245f70c344.jpg'
WHERE slug = '2026-budget-getfund-drives-historic-expansion-in-education' AND type = 'news';

UPDATE content SET featured_image_url = '/images/news/getfund-to-commit-ghc-50-million-yearly-to-free-te-c8c3df0f-98a4-4243-8b78-f07c2b968d7e.png'
WHERE slug = 'getfund-to-commit-ghc-50-million-yearly-to-free-tertiary-textbooks' AND type = 'news';

UPDATE content SET featured_image_url = '/images/news/ceo-of-students-loan-trust-fund-visits-getfund-administrator.jpg'
WHERE slug = 'ceo-of-students-loan-trust-fund-visits-getfund-administrator' AND type = 'news';

UPDATE content SET featured_image_url = '/images/news/getfund-kicks-off-multi-project-construction-in-no-9c335f51-554f-4ec9-a8b3-853c33d62b1f.png'
WHERE slug = 'getfund-kicks-off-multi-project-construction-in-north-east-region' AND type = 'news';

UPDATE content SET featured_image_url = '/images/news/n-r-getfund-launches-major-infrastructure-expansion-at-ghana.png'
WHERE slug = 'n-r-getfund-launches-major-infrastructure-expansion-at-ghana-senior-high-technical-school-tamale' AND type = 'news';

UPDATE content SET featured_image_url = '/images/news/getfund-gives-greenlight-for-the-construction-of-ultra-moder.png'
WHERE slug = 'getfund-gives-greenlight-for-the-construction-of-ultra-modern-assembly-hall-at-st-annes-shs' AND type = 'news';

UPDATE content SET featured_image_url = '/images/news/n-r-getfund-commences-major-facility-upgrade-at-pishigu-shs.png'
WHERE slug = 'n-r-getfund-commences-major-facility-upgrade-at-pishigu-shs' AND type = 'news';

UPDATE content SET featured_image_url = '/images/news/getfund-commences-accelerated-infrastructure-progr-9686a8ad-af4d-404a-b97a-c894fe29883a.png'
WHERE slug = 'getfund-commences-accelerated-infrastructure-programme-in-savannah-region' AND type = 'news';

UPDATE content SET featured_image_url = '/images/news/getfund-administrator-meets-with-staff.jpg'
WHERE slug = 'getfund-administrator-meets-with-staff' AND type = 'news';

UPDATE content SET featured_image_url = '/images/news/director-general-of-prisons-engages-getfund-on-inmate-rehabi.jpg'
WHERE slug = 'director-general-of-prisons-engages-getfund-on-inmate-rehabilitation' AND type = 'news';

UPDATE content SET featured_image_url = '/images/news/getfund-engages-with-voorhees-university-and-attraco-to-deep.jpg'
WHERE slug = 'getfund-engages-with-voorhees-university-and-attraco-to-deepen-scholarship-partnership' AND type = 'news';

UPDATE content SET featured_image_url = '/images/news/photo-gallery-getfund-tours-uk-universities-to-engage-ghanai.jpg'
WHERE slug = 'photo-gallery-getfund-tours-uk-universities-to-engage-ghanaian-scholars' AND type = 'news';

UPDATE content SET featured_image_url = '/images/news/strengthening-educational-ties-getfund-monitors-scholars-in-.jpg'
WHERE slug = 'strengthening-educational-ties-getfund-monitors-scholars-in-the-uk' AND type = 'news';

UPDATE content SET featured_image_url = '/images/news/getfund-holds-orientation-workshop-for-7th-board-of-trustees.jpg'
WHERE slug = 'getfund-holds-orientation-workshop-for-7th-board-of-trustees' AND type = 'news';

UPDATE content SET featured_image_url = '/images/news/getfund-scholarship-unit-engages-with-university-of-cape-coa.png'
WHERE slug = 'getfund-scholarship-unit-engages-with-university-of-cape-coast-management' AND type = 'news';

UPDATE content SET featured_image_url = '/images/news/gaf-cds-interacts-with-getfund-administrator.png'
WHERE slug = 'gaf-cds-interacts-with-getfund-administrator' AND type = 'news';

UPDATE content SET featured_image_url = '/images/news/minister-of-education-inaugurates-7th-getfund-board.jpg'
WHERE slug = 'minister-of-education-inaugurates-7th-getfund-board' AND type = 'news';

UPDATE content SET featured_image_url = '/images/news/getfund-administrator-engages-chass-leadership.jpg'
WHERE slug = 'getfund-administrator-engages-chass-leadership' AND type = 'news';

UPDATE content SET featured_image_url = '/images/news/advocacy-for-private-sector-led-school-infrastructure-develo.jpg'
WHERE slug = 'advocacy-for-private-sector-led-school-infrastructure-development' AND type = 'news';

UPDATE content SET featured_image_url = '/images/news/mr-paul-adjei-assumes-office-as-getfund-administrator.jpg'
WHERE slug = 'mr-paul-adjei-assumes-office-as-getfund-administrator' AND type = 'news';

UPDATE content SET featured_image_url = '/images/news/state-award-for-outstanding-public-service.jpg'
WHERE slug = 'state-award-for-outstanding-public-service' AND type = 'news';

UPDATE content SET featured_image_url = '/images/news/getfund-inaugurates-a-four-storey-headquarters-building.jpg'
WHERE slug = 'getfund-inaugurates-a-four-storey-headquarters-building' AND type = 'news';

UPDATE content SET featured_image_url = '/images/news/2024-trinity-theological-seminary-graduation.jpg'
WHERE slug = '2024-trinity-theological-seminary-graduation' AND type = 'news';

UPDATE content SET featured_image_url = '/images/news/getfund-grants-scholarships-to-gtp-finalists.jpg'
WHERE slug = 'getfund-grants-scholarships-to-gtp-finalists' AND type = 'news';

UPDATE content SET featured_image_url = '/images/news/getfund-administrator-counsels-tertiary-institutions-on-fina.jpg'
WHERE slug = 'getfund-administrator-counsels-tertiary-institutions-on-financial-prudence' AND type = 'news';

UPDATE content SET featured_image_url = '/images/news/getfund-administrator-engages-media-in-kumasi.jpg'
WHERE slug = 'getfund-administrator-engages-media-in-kumasi' AND type = 'news';

UPDATE content SET featured_image_url = '/images/news/scholarship-processes-at-getfund-have-improved.jpg'
WHERE slug = 'scholarship-processes-at-getfund-have-improved' AND type = 'news';

UPDATE content SET featured_image_url = '/images/news/the-administrator-urges-universities-to-be-innovative.jpg'
WHERE slug = 'the-administrator-urges-universities-to-be-innovative' AND type = 'news';

UPDATE content SET featured_image_url = '/images/news/government-grants-new-scholarships-to-4-279-local-tertiary-s.jpeg'
WHERE slug = 'government-grants-new-scholarships-to-4279-local-tertiary-students' AND type = 'news';

UPDATE content SET featured_image_url = '/images/news/getfund-has-not-used-its-receivables-to-borrow-1-5-billion.jpg'
WHERE slug = 'getfund-has-not-used-its-receivables-to-borrow-1-5-billion' AND type = 'news';

UPDATE content SET featured_image_url = '/images/news/voorhees-university-delegation-calls-on-getfund.jpg'
WHERE slug = 'voorhees-university-delegation-calls-on-getfund' AND type = 'news';

UPDATE content SET featured_image_url = '/images/news/carleton-university-pays-courtesy-call-on-getfund.jpg'
WHERE slug = 'carleton-university-pays-courtesy-call-on-getfund' AND type = 'news';

UPDATE content SET featured_image_url = '/images/news/military-high-command-pays-courtesy-call-on-getfund-administ.jpg'
WHERE slug = 'military-high-command-pays-courtesy-call-on-getfund-administrator' AND type = 'news';

UPDATE content SET featured_image_url = '/images/news/delegation-from-heslb-tanzania-visits-getfund.jpg'
WHERE slug = 'delegation-from-heslb-tanzania-visits-getfund' AND type = 'news';

UPDATE content SET featured_image_url = '/images/news/getfund-administrator-interacts-with-nugs-leadership.jpg'
WHERE slug = 'getfund-administrator-interacts-with-nugs-leadership' AND type = 'news';

UPDATE content SET featured_image_url = '/images/news/getfund-2022-23-local-scholarship-application.jpg'
WHERE slug = 'getfund-2022-23-local-scholarship-application' AND type = 'news';

UPDATE content SET featured_image_url = '/images/news/universities-fund-kenya-understudies-getfund.jpg'
WHERE slug = 'universities-fund-kenya-understudies-getfund' AND type = 'news';

UPDATE content SET featured_image_url = '/images/news/getfund-accounts-to-the-public-stakeholder-forum.jpg'
WHERE slug = 'getfund-accounts-to-the-public-stakeholder-forum' AND type = 'news';

UPDATE content SET featured_image_url = '/images/news/getfund-administrator-inspects-uds-project.jpg'
WHERE slug = 'getfund-administrator-inspects-uds-project' AND type = 'news';

UPDATE content SET featured_image_url = '/images/news/getfund-administrator-pays-working-visit.jpg'
WHERE slug = 'getfund-administrator-pays-working-visit' AND type = 'news';

UPDATE content SET featured_image_url = '/images/news/getfund-board-of-trustees-tour-project.jpg'
WHERE slug = 'getfund-board-of-trustees-tour-project' AND type = 'news';

UPDATE content SET featured_image_url = '/images/news/vice-president-hands-over-buses-and-pickups.jpg'
WHERE slug = 'vice-president-hands-over-buses-and-pickups' AND type = 'news';

UPDATE content SET featured_image_url = '/images/news/daakye-trust-plc-holds-inaugural-agm-in-accra.jpg'
WHERE slug = 'daakye-trust-plc-holds-inaugural-agm-in-accra' AND type = 'news';

UPDATE content SET featured_image_url = '/images/news/getfund-s-bold-march-on-educational-infrastructure.jpg'
WHERE slug = 'getfund-s-bold-march-on-educational-infrastructure' AND type = 'news';

UPDATE content SET featured_image_url = '/images/news/press-update-infrastructure-projects.png'
WHERE slug = 'press-update-infrastructure-projects' AND type = 'news';

UPDATE content SET featured_image_url = '/images/news/getfund-obtains-parliamentary-nod.jpg'
WHERE slug = 'getfund-obtains-parliamentary-nod' AND type = 'news';

UPDATE content SET featured_image_url = '/images/news/getfund-completes-1st-quarter-project-monitoring-in-volta-re.jpg'
WHERE slug = 'getfund-completes-1st-quarter-project-monitoring-in-volta-region' AND type = 'news';

UPDATE content SET featured_image_url = '/images/news/2021-scholarship-monitoring-programme.jpg'
WHERE slug = '2021-scholarship-monitoring-programme' AND type = 'news';

UPDATE content SET featured_image_url = '/images/news/sona-2020-on-educational-infrastructure.jpg'
WHERE slug = 'sona-2020-on-educational-infrastructure' AND type = 'news';

-- For any remaining articles without local images, set to placeholder
UPDATE content
SET featured_image_url = '/images/news/news-placeholder.svg'
WHERE type = 'news'
  AND status = 'published'
  AND (
    featured_image_url IS NULL
    OR featured_image_url LIKE 'https://www.getfund.gov.gh%'
    OR featured_image_url LIKE 'http://%'
  );
