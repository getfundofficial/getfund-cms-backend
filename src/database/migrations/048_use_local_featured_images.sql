-- Migration: 048_use_local_featured_images.sql
-- Switch all news article featured_image_url from external getfund.gov.gh URLs
-- to local image paths served from the frontend's public/images/news/ directory.
-- This fixes "Image not available" errors caused by intermittent getfund.gov.gh server issues.

-- 1. Deputy Administrator Visits Schools Affected by Fire
UPDATE content SET featured_image_url = '/images/news/getfund-deputy-administrator-visits-schools-affected-by-fire.png'
WHERE slug = 'getfund-deputy-administrator-visits-schools-affected-by-fire-northern-region' AND type = 'news';

-- 2. Deputy Administrator Calls for Investigation
UPDATE content SET featured_image_url = '/images/news/getfund-deputy-administrator-fires-investigation.jpg'
WHERE slug = 'getfund-deputy-administrator-calls-investigation-recurrent-fires-nobisco-tolon-shs' AND type = 'news';

-- 3. Chief Justice Calls on GETFund
UPDATE content SET featured_image_url = '/images/news/chief-justice-judicial-reforms.png'
WHERE slug = 'chief-justice-calls-getfund-judicial-service-reforms' AND type = 'news';

-- 4. CHASS Leadership Engages GETFund (2026)
UPDATE content SET featured_image_url = '/images/news/chass-leadership-engages-getfund-administrator-2026.jpeg'
WHERE slug = 'chass-leadership-engages-getfund-administrator-2026' AND type = 'news';

-- 5. University of Virgin Islands
UPDATE content SET featured_image_url = '/images/news/getfund-receives-delegation-university-virgin-islands.jpg'
WHERE slug = 'getfund-receives-delegation-university-virgin-islands' AND type = 'news';

-- 6. FuelTrade Supports GETFund
UPDATE content SET featured_image_url = '/images/news/fueltrade-supports-getfund.jpg'
WHERE slug = 'fueltrade-supports-getfund' AND type = 'news';

-- 7. STEMBox Initiative
UPDATE content SET featured_image_url = '/images/news/getfund-accelerates-practical-science-education-stembox-init.png'
WHERE slug = 'getfund-accelerates-practical-science-education-stembox-initiative' AND type = 'news';

-- 8. Ghana National Research Fund
UPDATE content SET featured_image_url = '/images/news/getfund-supports-ghana-national-research-fund-office-complex.png'
WHERE slug = 'getfund-supports-ghana-national-research-fund-office-complex' AND type = 'news';

-- 9. 2026 Budget Historic Expansion
UPDATE content SET featured_image_url = '/images/news/2026-budget-getfund-drives-historic-expansion-in-educational.jpg'
WHERE slug = '2026-budget-getfund-drives-historic-expansion-educational-infrastructure' AND type = 'news';

-- 10. GHC 50 Million for Persons with Disabilities
UPDATE content SET featured_image_url = '/images/news/getfund-to-commit-ghc-50-million-yearly-to-free-tertiary-edu.png'
WHERE slug = 'getfund-commit-ghc-50-million-yearly-free-tertiary-education-persons-disabilities' AND type = 'news';

-- 11. CEO Students Loan Trust Fund
UPDATE content SET featured_image_url = '/images/news/ceo-of-students-loan-trust-fund-visits-getfund-administrator.jpg'
WHERE slug = 'ceo-students-loan-trust-fund-visits-getfund-no-fee-stress-policy-pwds' AND type = 'news';

-- 12. Ambariya Schools Infrastructure
UPDATE content SET featured_image_url = '/images/news/getfund-commences-accelerated-infrastructure-program-ambariy.png'
WHERE slug = 'getfund-commences-accelerated-infrastructure-program-ambariya-schools' AND type = 'news';

-- 13. Multi-Project Construction Northern Region
UPDATE content SET featured_image_url = '/images/news/getfund-kicks-off-multi-project-construction-to-boost-educat.png'
WHERE slug = 'getfund-kicks-off-multi-project-construction-northern-region' AND type = 'news';

-- 14. Infrastructure Expansion Ghana Senior High School
UPDATE content SET featured_image_url = '/images/news/nr-getfund-launches-major-infrastructure-expansion-at-ghana-.png'
WHERE slug = 'getfund-launches-major-infrastructure-expansion-ghana-senior-high-school' AND type = 'news';

-- 15. Karaga SHS Infrastructure
UPDATE content SET featured_image_url = '/images/news/getfund-gives-greenlight-for-the-construction-of-ultra-moder.png'
WHERE slug = 'getfund-greenlight-construction-ultra-modern-infrastructure-karaga-shs' AND type = 'news';

-- 16. Pishigu SHS Facility Upgrade
UPDATE content SET featured_image_url = '/images/news/n-r-getfund-commences-major-facility-upgrade-at-pishigu-shs.png'
WHERE slug = 'getfund-commences-major-facility-upgrade-pishigu-shs' AND type = 'news';

-- 17. Administrator Meets with Staff
UPDATE content SET featured_image_url = '/images/news/getfund-administrator-meets-with-staff.jpg'
WHERE slug = 'getfund-administrator-meets-with-staff-2025' AND type = 'news';

-- 18. Director General of Prisons
UPDATE content SET featured_image_url = '/images/news/director-general-prisons-engages-getfund-inmate-rehabilitati.jpg'
WHERE slug = 'director-general-prisons-engages-getfund-inmate-rehabilitation-partnership' AND type = 'news';

-- 19. Voorhees University and ATTRACO
UPDATE content SET featured_image_url = '/images/news/getfund-engages-voorhees-university-attraco-educational-coll.jpg'
WHERE slug = 'getfund-engages-voorhees-university-attraco-educational-collaboration' AND type = 'news';

-- 20. Photo Gallery UK Universities
UPDATE content SET featured_image_url = '/images/news/photo-gallery-getfund-tours-uk-universities-to-engage-ghanai.jpg'
WHERE slug = 'photo-gallery-getfund-tours-uk-universities-engage-ghanaian-scholars' AND type = 'news';

-- 21. Strengthening Educational Ties UK
UPDATE content SET featured_image_url = '/images/news/strengthening-educational-ties-getfund-monitors-scholars-uk.jpg'
WHERE slug = 'strengthening-educational-ties-getfund-monitors-scholars-uk' AND type = 'news';

-- 22. Orientation Workshop 7th Board
UPDATE content SET featured_image_url = '/images/news/getfund-holds-orientation-workshop-for-7th-board-of-trustees.jpg'
WHERE slug = 'getfund-holds-orientation-workshop-7th-board-trustees' AND type = 'news';

-- 23. Scholarship Unit UCC Students
UPDATE content SET featured_image_url = '/images/news/getfund-scholarship-unit-engages-with-university-of-cape-coa.png'
WHERE slug = 'getfund-scholarship-unit-engages-university-cape-coast-students' AND type = 'news';

-- 24. GAF CDS Interacts with Administrator
UPDATE content SET featured_image_url = '/images/news/gaf-cds-interacts-getfund-administrator.png'
WHERE slug = 'gaf-cds-interacts-getfund-administrator' AND type = 'news';

-- 25. Minister Inaugurates 7th Board
UPDATE content SET featured_image_url = '/images/news/minister-of-education-inaugurates-7th-getfund-board.jpg'
WHERE slug = 'minister-education-inaugurates-7th-getfund-board' AND type = 'news';

-- 26. Administrator Engages CHASS Leadership (2025)
UPDATE content SET featured_image_url = '/images/news/getfund-administrator-engages-chass-leadership.jpg'
WHERE slug = 'getfund-administrator-engages-chass-leadership-2025' AND type = 'news';

-- 27. Advocacy for Private Sector Infrastructure
UPDATE content SET featured_image_url = '/images/news/advocacy-private-sector-led-school-infrastructure-developmen.jpg'
WHERE slug = 'advocacy-private-sector-led-school-infrastructure-development' AND type = 'news';

-- 28. Paul Adjei Assumes Office
UPDATE content SET featured_image_url = '/images/news/mr-paul-adjei-assumes-office-as-getfund-administrator.jpg'
WHERE slug = 'paul-adjei-assumes-office-getfund-administrator' AND type = 'news';

-- 29. State Award Outstanding Public Service
UPDATE content SET featured_image_url = '/images/news/state-award-for-outstanding-public-service.jpg'
WHERE slug = 'getfund-administrator-receives-state-award-outstanding-public-service' AND type = 'news';

-- 30. Four-Storey Headquarters Building
UPDATE content SET featured_image_url = '/images/news/getfund-inaugurates-a-four-storey-headquarters-building.jpg'
WHERE slug = 'getfund-inaugurates-four-storey-headquarters-building' AND type = 'news';

-- 31. Trinity Theological Seminary Graduation
UPDATE content SET featured_image_url = '/images/news/2024-trinity-theological-seminary-graduation.jpg'
WHERE slug = '2024-trinity-theological-seminary-graduation' AND type = 'news';

-- 32. Scholarships to GTP Finalists
UPDATE content SET featured_image_url = '/images/news/getfund-grants-scholarships-to-gtp-finalists.jpg'
WHERE slug = 'getfund-grants-scholarships-gtp-finalists' AND type = 'news';

-- 33. Counsels Tertiary Institutions Financing
UPDATE content SET featured_image_url = '/images/news/getfund-administrator-counsels-tertiary-institutions-on-fina.jpg'
WHERE slug = 'getfund-administrator-counsels-tertiary-institutions-financing-options' AND type = 'news';

-- 34. Administrator Engages Media Kumasi
UPDATE content SET featured_image_url = '/images/news/getfund-administrator-engages-media-in-kumasi.jpg'
WHERE slug = 'getfund-administrator-engages-media-kumasi' AND type = 'news';

-- 35. Scholarship Processes Improved
UPDATE content SET featured_image_url = '/images/news/scholarship-processes-getfund-improved.jpg'
WHERE slug = 'scholarship-processes-getfund-improved' AND type = 'news';

-- 36. Universities Alternative Revenue Streams
UPDATE content SET featured_image_url = '/images/news/the-administrator-urges-universities-to-be-innovative.jpg'
WHERE slug = 'administrator-urges-universities-innovative-alternative-revenue-streams' AND type = 'news';

-- 37. Government Grants 4,279 Scholarships
UPDATE content SET featured_image_url = '/images/news/government-grants-new-scholarships-4279-local-tertiary-stude.jpeg'
WHERE slug = 'government-grants-new-scholarships-4279-local-tertiary-students' AND type = 'news';

-- 38. GETFund NOT Used Receivables to Borrow
UPDATE content SET featured_image_url = '/images/news/getfund-has-not-used-its-receivables-to-borrow-1-5-billion.jpg'
WHERE slug = 'getfund-has-not-used-receivables-borrow-1-5-billion' AND type = 'news';

-- 39. Voorhees University Delegation
UPDATE content SET featured_image_url = '/images/news/voorhees-university-delegation-calls-on-getfund.jpg'
WHERE slug = 'voorhees-university-delegation-calls-getfund' AND type = 'news';

-- 40. Carleton University Courtesy Call
UPDATE content SET featured_image_url = '/images/news/carleton-university-pays-courtesy-call-getfund.jpg'
WHERE slug = 'carleton-university-pays-courtesy-call-getfund' AND type = 'news';

-- 41. Military High Command Courtesy Call
UPDATE content SET featured_image_url = '/images/news/military-high-command-pays-courtesy-call-on-getfund-administ.jpg'
WHERE slug = 'military-high-command-pays-courtesy-call-getfund-administrator' AND type = 'news';

-- 42. HESLB Tanzania Delegation
UPDATE content SET featured_image_url = '/images/news/delegation-from-heslb-tanzania-visits-getfund.jpg'
WHERE slug = 'delegation-heslb-tanzania-visits-getfund' AND type = 'news';

-- 43. Administrator Interacts with NUGS
UPDATE content SET featured_image_url = '/images/news/getfund-administrator-interacts-with-nugs-leadership.jpg'
WHERE slug = 'getfund-administrator-interacts-nugs-leadership' AND type = 'news';

-- 44. 2022/23 Local Scholarship Application
UPDATE content SET featured_image_url = '/images/news/getfund-2022-23-local-scholarship-application.jpg'
WHERE slug = 'getfund-2022-23-local-scholarship-application' AND type = 'news';

-- 45. Universities Fund Kenya
UPDATE content SET featured_image_url = '/images/news/universities-fund-kenya-understudies-getfund.jpg'
WHERE slug = 'universities-fund-kenya-understudies-getfund' AND type = 'news';

-- 46. Stakeholder Forum
UPDATE content SET featured_image_url = '/images/news/getfund-accounts-to-public-stakeholder-forum.jpg'
WHERE slug = 'getfund-accounts-to-public-stakeholder-forum' AND type = 'news';

-- 47. Administrator Inspects UDS Project
UPDATE content SET featured_image_url = '/images/news/getfund-administrator-inspects-uds-project.jpg'
WHERE slug = 'getfund-administrator-inspects-uds-project' AND type = 'news';

-- 48. Working Visit Northern Sector Office
UPDATE content SET featured_image_url = '/images/news/getfund-administrator-pays-working-visit.jpg'
WHERE slug = 'getfund-administrator-pays-working-visit-northern-sector-office' AND type = 'news';

-- 49. Board Tours Projects Eastern Region
UPDATE content SET featured_image_url = '/images/news/getfund-board-of-trustees-tour-project.jpg'
WHERE slug = 'getfund-board-trustees-tours-projects-eastern-region' AND type = 'news';

-- 50. Vice President Hands Over Buses
UPDATE content SET featured_image_url = '/images/news/vice-president-hands-over-buses-and-pickups.jpg'
WHERE slug = 'vice-president-hands-over-buses-pickups-schools' AND type = 'news';

-- 51. Daakye Trust PLC AGM
UPDATE content SET featured_image_url = '/images/news/daakye-trust-plc-holds-inaugural-agm-in-accra.jpg'
WHERE slug = 'daakye-trust-plc-holds-inaugural-agm-accra' AND type = 'news';

-- 52. Bold March on Educational Infrastructure
UPDATE content SET featured_image_url = '/images/news/getfund-s-bold-march-on-educational-infrastructure.jpg'
WHERE slug = 'getfund-bold-march-educational-infrastructure' AND type = 'news';

-- 53. Press Update Infrastructure Projects
UPDATE content SET featured_image_url = '/images/news/press-update-infrastructure-projects.png'
WHERE slug = 'press-update-infrastructure-projects' AND type = 'news';

-- 54. Parliamentary Nod
UPDATE content SET featured_image_url = '/images/news/getfund-obtains-parliamentary-nod.jpg'
WHERE slug = 'getfund-obtains-parliamentary-nod' AND type = 'news';

-- 55. Q1 Project Monitoring Volta Region
UPDATE content SET featured_image_url = '/images/news/getfund-completes-q1-project-monitoring-volta-region.jpg'
WHERE slug = 'getfund-completes-q1-project-monitoring-volta-region' AND type = 'news';

-- 56. 2021 Scholarship Monitoring Programme
UPDATE content SET featured_image_url = '/images/news/2021-scholarship-monitoring-programme.jpg'
WHERE slug = '2021-scholarship-monitoring-programme' AND type = 'news';

-- 57. SONA 2020 Educational Infrastructure
UPDATE content SET featured_image_url = '/images/news/sona-2020-educational-infrastructure.jpg'
WHERE slug = 'sona-2020-educational-infrastructure' AND type = 'news';

-- Also update the first image in meta_data.images arrays to use local paths
-- (the featured image is always the first image in the carousel)
UPDATE content SET meta_data = jsonb_set(meta_data, '{images,0}', to_jsonb(featured_image_url))
WHERE type = 'news' AND meta_data IS NOT NULL AND meta_data->'images' IS NOT NULL
AND jsonb_array_length(meta_data->'images') > 0;
