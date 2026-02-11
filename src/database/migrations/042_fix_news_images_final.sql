-- Migration 042: Fix remaining news article images with correct filenames
-- Maps article slugs to actual image files in /images/news/

-- Articles with UUID-based filenames
UPDATE content SET featured_image_url = '/images/news/getfund-accelerates-practical-science-education-wi-e9037f5d-caa2-43d1-ac14-d1b850e4e1ef.png'
WHERE slug = 'getfund-accelerates-practical-science-education-stembox-initiative' AND type = 'news';

UPDATE content SET featured_image_url = '/images/news/getfund-supports-ghana-national-research-fund-with-236d3784-b3bc-491a-aa51-e9a1c255fbe5.png'
WHERE slug = 'getfund-supports-ghana-national-research-fund-office-complex' AND type = 'news';

UPDATE content SET featured_image_url = '/images/news/2026-budget-getfund-drives-historic-expansion-in-e-9f0d945b-2680-410f-a824-af245f70c344.jpg'
WHERE slug = '2026-budget-getfund-drives-historic-expansion-in-educational-infrastructure-and-learning-resources' AND type = 'news';

UPDATE content SET featured_image_url = '/images/news/getfund-to-commit-ghc-50-million-yearly-to-free-te-c8c3df0f-98a4-4243-8b78-f07c2b968d7e.png'
WHERE slug = 'getfund-to-commit-ghc-50-million-yearly-to-free-tertiary-education-for-persons-with-disabilities' AND type = 'news';

UPDATE content SET featured_image_url = '/images/news/getfund-to-commit-ghc-50-million-yearly-to-free-te-c8c3df0f-98a4-4243-8b78-f07c2b968d7e.png'
WHERE slug = 'getfund-commit-ghc-50-million-yearly-free-tertiary-education-persons-disabilities' AND type = 'news';

UPDATE content SET featured_image_url = '/images/news/ceo-of-students-loan-trust-fund-visits-getfund-adm-e5ed33ac-1899-4497-8bf1-191b465f1abd.jpg'
WHERE slug = 'ceo-of-students-loan-trust-fund-visits-getfund-administrator-ahead-of-no-fee-stress-policy-launch-for-persons-with-disabilities-pwds' AND type = 'news';

UPDATE content SET featured_image_url = '/images/news/ceo-of-students-loan-trust-fund-visits-getfund-adm-e5ed33ac-1899-4497-8bf1-191b465f1abd.jpg'
WHERE slug = 'ceo-students-loan-trust-fund-visits-getfund-no-fee-stress-policy-pwds' AND type = 'news';

UPDATE content SET featured_image_url = '/images/news/getfund-kicks-off-multi-project-construction-in-no-9c335f51-554f-4ec9-a8b3-853c33d62b1f.png'
WHERE slug = 'getfund-kicks-off-multi-project-construction-to-boost-education-in-the-northern-region' AND type = 'news';

UPDATE content SET featured_image_url = '/images/news/getfund-gives-greenlight-for-the-construction-of-u-a37da37c-5957-4198-b3de-fa55d120726e.png'
WHERE slug = 'getfund-gives-greenlight-for-the-construction-of-ultra-modern-infrastructure-facilities-at-karaga-shs' AND type = 'news';

UPDATE content SET featured_image_url = '/images/news/n-r-getfund-launches-major-infrastructure-expansio-3189c29f-1ea7-44a3-8033-638f63994d1f.png'
WHERE slug = 'nr-getfund-launches-major-infrastructure-expansion-at-ghana-shs' AND type = 'news';

UPDATE content SET featured_image_url = '/images/news/n-r-getfund-launches-major-infrastructure-expansio-3189c29f-1ea7-44a3-8033-638f63994d1f.png'
WHERE slug = 'getfund-launches-major-infrastructure-expansion-ghana-senior-high-school' AND type = 'news';

UPDATE content SET featured_image_url = '/images/news/getfund-commences-accelerated-infrastructure-progr-9686a8ad-af4d-404a-b97a-c894fe29883a.png'
WHERE slug = 'getfund-commences-accelerated-infrastructure-program-ambariya-schools' AND type = 'news';

UPDATE content SET featured_image_url = '/images/news/getfund-kicks-off-multi-project-construction-in-no-9c335f51-554f-4ec9-a8b3-853c33d62b1f.png'
WHERE slug = 'getfund-kicks-off-multi-project-construction-in-northern-region' AND type = 'news';

UPDATE content SET featured_image_url = '/images/news/getfund-gives-greenlight-for-the-construction-of-u-a37da37c-5957-4198-b3de-fa55d120726e.png'
WHERE slug = 'getfund-greenlight-construction-ultra-modern-infrastructure-karaga-shs' AND type = 'news';

UPDATE content SET featured_image_url = '/images/news/getfund-commences-accelerated-infrastructure-progr-9686a8ad-af4d-404a-b97a-c894fe29883a.png'
WHERE slug = 'getfund-commences-accelerated-infrastructure-program-at-ambariya-schools' AND type = 'news';

UPDATE content SET featured_image_url = '/images/news/n-r-getfund-launches-major-infrastructure-expansio-3189c29f-1ea7-44a3-8033-638f63994d1f.png'
WHERE slug = 'n-r-getfund-launches-major-infrastructure-expansion-at-ghana-senior-high-school' AND type = 'news';

UPDATE content SET featured_image_url = '/images/news/getfund-gives-greenlight-for-the-construction-of-u-a37da37c-5957-4198-b3de-fa55d120726e.png'
WHERE slug = 'getfund-gives-greenlight-for-the-construction-of-ultra-modern-infrastructure-at-karaga-shs' AND type = 'news';

UPDATE content SET featured_image_url = '/images/news/getfund-kicks-off-multi-project-construction-in-no-9c335f51-554f-4ec9-a8b3-853c33d62b1f.png'
WHERE slug = 'getfund-kicks-off-multi-project-construction-northern-region' AND type = 'news';

UPDATE content SET featured_image_url = '/images/news/n-r-getfund-commences-major-facility-upgrade-at-pishigu-shs.png'
WHERE slug = 'getfund-commences-major-facility-upgrade-pishigu-shs' AND type = 'news';

UPDATE content SET featured_image_url = '/images/news/getfund-administrator-meets-with-staff.jpg'
WHERE slug = 'getfund-administrator-meets-with-staff-2025' AND type = 'news';

UPDATE content SET featured_image_url = '/images/news/director-general-of-prisons-engages-getfund-on-inmate-rehabi.jpg'
WHERE slug = 'director-general-prisons-engages-getfund-inmate-rehabilitation-partnership' AND type = 'news';

UPDATE content SET featured_image_url = '/images/news/director-general-of-prisons-engages-getfund-on-inmate-rehabi.jpg'
WHERE slug = 'director-general-of-prisons-engages-getfund-on-inmate-rehabilitation-partnership' AND type = 'news';

UPDATE content SET featured_image_url = '/images/news/getfund-engages-with-voorhees-university-and-attraco-to-deep.jpg'
WHERE slug = 'getfund-engages-voorhees-university-attraco-educational-collaboration' AND type = 'news';

UPDATE content SET featured_image_url = '/images/news/getfund-engages-with-voorhees-university-and-attraco-to-deep.jpg'
WHERE slug = 'getfund-engages-with-voorhees-university-and-attraco-to-deepen-educational-collaboration' AND type = 'news';

UPDATE content SET featured_image_url = '/images/news/strengthening-educational-ties-getfund-monitors-scholars-in-.jpg'
WHERE slug = 'strengthening-educational-ties-getfund-monitors-scholars-uk' AND type = 'news';

UPDATE content SET featured_image_url = '/images/news/strengthening-educational-ties-getfund-monitors-scholars-in-.jpg'
WHERE slug = 'strengthening-educational-ties-getfund-monitors-scholars-in-uk' AND type = 'news';

UPDATE content SET featured_image_url = '/images/news/getfund-scholarship-unit-engages-with-university-of-cape-coa.png'
WHERE slug = 'getfund-scholarship-unit-engages-with-university-of-cape-coast-students' AND type = 'news';

UPDATE content SET featured_image_url = '/images/news/getfund-scholarship-unit-engages-with-university-of-cape-coa.png'
WHERE slug = 'getfund-scholarship-unit-engages-university-cape-coast-students' AND type = 'news';

UPDATE content SET featured_image_url = '/images/news/gaf-cds-interacts-with-getfund-administrator.png'
WHERE slug = 'gaf-cds-interacts-getfund-administrator' AND type = 'news';

UPDATE content SET featured_image_url = '/images/news/minister-of-education-inaugurates-7th-getfund-board.jpg'
WHERE slug = 'minister-education-inaugurates-7th-getfund-board' AND type = 'news';

UPDATE content SET featured_image_url = '/images/news/getfund-administrator-engages-chass-leadership.jpg'
WHERE slug = 'getfund-administrator-engages-chass-leadership-2025' AND type = 'news';

UPDATE content SET featured_image_url = '/images/news/advocacy-for-private-sector-led-school-infrastructure-develo.jpg'
WHERE slug = 'advocacy-for-private-sector-led-school-infrastructure-dev' AND type = 'news';

UPDATE content SET featured_image_url = '/images/news/advocacy-for-private-sector-led-school-infrastructure-develo.jpg'
WHERE slug = 'advocacy-private-sector-led-school-infrastructure-development' AND type = 'news';

UPDATE content SET featured_image_url = '/images/news/mr-paul-adjei-assumes-office-as-getfund-administrator.jpg'
WHERE slug = 'paul-adjei-assumes-office-getfund-administrator' AND type = 'news';

UPDATE content SET featured_image_url = '/images/news/state-award-for-outstanding-public-service.jpg'
WHERE slug = 'getfund-administrator-receives-state-award-outstanding-public-service' AND type = 'news';

UPDATE content SET featured_image_url = '/images/news/getfund-grants-scholarships-to-gtp-finalists.jpg'
WHERE slug = 'getfund-grants-scholarships-gtp-finalists' AND type = 'news';

UPDATE content SET featured_image_url = '/images/news/getfund-administrator-counsels-tertiary-institutions-on-fina.jpg'
WHERE slug = 'getfund-administrator-counsels-tertiary-institutions-financing-options' AND type = 'news';

UPDATE content SET featured_image_url = '/images/news/scholarship-processes-at-getfund-have-improved.jpg'
WHERE slug = 'scholarship-processes-getfund-improved' AND type = 'news';

UPDATE content SET featured_image_url = '/images/news/the-administrator-urges-universities-to-be-innovat-33bfd95d-8cec-40ed-9b15-b6afa7ec77ad.jpg'
WHERE slug = 'the-administrator-urges-universities-to-be-innovative-in' AND type = 'news';

UPDATE content SET featured_image_url = '/images/news/getfund-administrator-counsels-tertiary-institutions-on-fina.jpg'
WHERE slug = 'getfund-administrator-counsels-tertiary-institutions' AND type = 'news';

UPDATE content SET featured_image_url = '/images/news/the-administrator-urges-universities-to-be-innovat-33bfd95d-8cec-40ed-9b15-b6afa7ec77ad.jpg'
WHERE slug = 'administrator-urges-universities-innovative-alternative-revenue-streams' AND type = 'news';

UPDATE content SET featured_image_url = '/images/news/government-grants-new-scholarships-to-4-279-local-tertiary-s.jpeg'
WHERE slug = 'government-grants-new-scholarships-4279-local-tertiary-students' AND type = 'news';

UPDATE content SET featured_image_url = '/images/news/getfund-has-not-used-its-receivables-to-borrow-1-5-billion.jpg'
WHERE slug = 'getfund-has-not-used-receivables-borrow-1-5-billion' AND type = 'news';

UPDATE content SET featured_image_url = '/images/news/voorhees-university-delegation-calls-on-getfund.jpg'
WHERE slug = 'voorhees-university-delegation-calls-getfund' AND type = 'news';

UPDATE content SET featured_image_url = '/images/news/carleton-university-pays-courtesy-call-on-getfund.jpg'
WHERE slug = 'carleton-university-pays-courtesy-call-getfund' AND type = 'news';

UPDATE content SET featured_image_url = '/images/news/military-high-command-pays-courtesy-call-on-getfund-administ.jpg'
WHERE slug = 'military-high-command-pays-courtesy-call-getfund-administrator' AND type = 'news';

UPDATE content SET featured_image_url = '/images/news/delegation-from-heslb-tanzania-visits-getfund.jpg'
WHERE slug = 'delegation-heslb-tanzania-visits-getfund' AND type = 'news';

UPDATE content SET featured_image_url = '/images/news/getfund-administrator-interacts-with-nugs-leadership.jpg'
WHERE slug = 'getfund-administrator-interacts-nugs-leadership' AND type = 'news';

UPDATE content SET featured_image_url = '/images/news/getfund-accounts-to-the-public-stakeholder-forum.jpg'
WHERE slug = 'getfund-accounts-to-public-stakeholder-forum' AND type = 'news';

UPDATE content SET featured_image_url = '/images/news/getfund-administrator-pays-working-visit.jpg'
WHERE slug = 'getfund-administrator-pays-working-visit-northern-sector-office' AND type = 'news';

UPDATE content SET featured_image_url = '/images/news/getfund-board-of-trustees-tour-project.jpg'
WHERE slug = 'getfund-board-trustees-tours-projects-eastern-region' AND type = 'news';

UPDATE content SET featured_image_url = '/images/news/vice-president-hands-over-buses-and-pickups.jpg'
WHERE slug = 'vice-president-hands-over-buses-pickups-schools' AND type = 'news';

UPDATE content SET featured_image_url = '/images/news/daakye-trust-plc-holds-inaugural-agm-in-accra.jpg'
WHERE slug = 'daakye-trust-plc-holds-inaugural-agm-accra' AND type = 'news';

UPDATE content SET featured_image_url = '/images/news/getfund-s-bold-march-on-educational-infrastructure.jpg'
WHERE slug = 'getfund-bold-march-educational-infrastructure' AND type = 'news';

UPDATE content SET featured_image_url = '/images/news/getfund-completes-1st-quarter-project-monitoring-in-volta-re.jpg'
WHERE slug = 'getfund-completes-q1-project-monitoring-volta-region' AND type = 'news';

UPDATE content SET featured_image_url = '/images/news/sona-2020-on-educational-infrastructure.jpg'
WHERE slug = 'sona-2020-educational-infrastructure' AND type = 'news';

-- For remaining articles that don't have matching images, set placeholder
UPDATE content
SET featured_image_url = '/images/news/news-placeholder.svg'
WHERE type = 'news'
  AND status = 'published'
  AND (
    featured_image_url IS NULL
    OR featured_image_url NOT LIKE '/images/news/%'
    OR (
      featured_image_url LIKE '/images/news/getfund-deputy-%'
      AND slug LIKE 'getfund-deputy-%'
    )
    OR (
      featured_image_url LIKE '/images/news/chief-justice-%'
      AND slug LIKE 'chief-justice-%'
    )
  );
