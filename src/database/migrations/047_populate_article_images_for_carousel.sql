-- Migration: 047_populate_article_images_for_carousel.sql
-- Populate meta_data.images array for all news articles
-- so the frontend carousel displays all images per article (not just featured image).
-- Images are matched to their corresponding articles by slug.

-- Deputy Administrator Visits Schools Affected by Fire (3 images)
UPDATE content SET meta_data = jsonb_set(COALESCE(meta_data, '{}'::jsonb), '{images}', '[
  "https://www.getfund.gov.gh/wp-content/uploads/2026/02/Dept-770x417.png",
  "https://www.getfund.gov.gh/wp-content/uploads/2026/02/Tolon-1-1024x761.png",
  "https://www.getfund.gov.gh/wp-content/uploads/2026/02/Tolon-2-1024x773.png"
]'::jsonb)
WHERE slug = 'getfund-deputy-administrator-visits-schools-affected-by-fire-northern-region';

-- Deputy Administrator Calls for Investigation (2 images)
UPDATE content SET meta_data = jsonb_set(COALESCE(meta_data, '{}'::jsonb), '{images}', '[
  "https://www.getfund.gov.gh/wp-content/uploads/2026/02/IMG_1149-770x417.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2026/02/Fire-1024x768.png"
]'::jsonb)
WHERE slug = 'getfund-deputy-administrator-calls-investigation-recurrent-fires-nobisco-tolon-shs';

-- Chief Justice Calls on GETFund (2 images)
UPDATE content SET meta_data = jsonb_set(COALESCE(meta_data, '{}'::jsonb), '{images}', '[
  "https://www.getfund.gov.gh/wp-content/uploads/2026/02/CJ-770x417.png",
  "https://www.getfund.gov.gh/wp-content/uploads/2026/02/Admin-and-CJ-1024x719.png"
]'::jsonb)
WHERE slug = 'chief-justice-calls-getfund-judicial-service-reforms';

-- CHASS Leadership Engages GETFund (1 image)
UPDATE content SET meta_data = jsonb_set(COALESCE(meta_data, '{}'::jsonb), '{images}', '[
  "https://www.getfund.gov.gh/wp-content/uploads/2026/01/WhatsApp-Image-2026-01-23-at-07.30.17-1-770x417.jpeg"
]'::jsonb)
WHERE slug = 'chass-leadership-engages-getfund-administrator-2026';

-- University of Virgin Islands (2 images)
UPDATE content SET meta_data = jsonb_set(COALESCE(meta_data, '{}'::jsonb), '{images}', '[
  "https://www.getfund.gov.gh/wp-content/uploads/2025/12/UVI-770x417.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2025/12/UVI2-1024x731.jpg"
]'::jsonb)
WHERE slug = 'getfund-receives-delegation-university-virgin-islands';

-- FuelTrade Supports GETFund (1 image)
UPDATE content SET meta_data = jsonb_set(COALESCE(meta_data, '{}'::jsonb), '{images}', '[
  "https://www.getfund.gov.gh/wp-content/uploads/2025/12/Fuel-Trade-770x417.jpg"
]'::jsonb)
WHERE slug = 'fueltrade-supports-getfund';

-- STEMBox Initiative (1 image)
UPDATE content SET meta_data = jsonb_set(COALESCE(meta_data, '{}'::jsonb), '{images}', '[
  "https://www.getfund.gov.gh/wp-content/uploads/2025/12/Admin@Stembox-770x417.png"
]'::jsonb)
WHERE slug = 'getfund-accelerates-practical-science-education-stembox-initiative';

-- Ghana National Research Fund (1 image)
UPDATE content SET meta_data = jsonb_set(COALESCE(meta_data, '{}'::jsonb), '{images}', '[
  "https://www.getfund.gov.gh/wp-content/uploads/2025/11/Research-2-770x417.png"
]'::jsonb)
WHERE slug = 'getfund-supports-ghana-national-research-fund-office-complex';

-- 2026 Budget Educational Infrastructure (1 image)
UPDATE content SET meta_data = jsonb_set(COALESCE(meta_data, '{}'::jsonb), '{images}', '[
  "https://www.getfund.gov.gh/wp-content/uploads/2025/11/Ato-Forson-770x417.jpg"
]'::jsonb)
WHERE slug = '2026-budget-getfund-drives-historic-expansion-educational-infrastructure';

-- GHC 50 Million for Disability Education (2 images)
UPDATE content SET meta_data = jsonb_set(COALESCE(meta_data, '{}'::jsonb), '{images}', '[
  "https://www.getfund.gov.gh/wp-content/uploads/2025/10/AdminPresident-770x417.png",
  "https://www.getfund.gov.gh/wp-content/uploads/2025/10/AdminHaruna-1024x679.png"
]'::jsonb)
WHERE slug = 'getfund-commit-ghc-50-million-yearly-free-tertiary-education-persons-disabilities';

-- Students Loan Trust Fund CEO Visits (2 images)
UPDATE content SET meta_data = jsonb_set(COALESCE(meta_data, '{}'::jsonb), '{images}', '[
  "https://www.getfund.gov.gh/wp-content/uploads/2025/10/Grp-Pix-770x417.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2025/10/Grp-Pix-1024x731.jpg"
]'::jsonb)
WHERE slug = 'ceo-students-loan-trust-fund-visits-getfund-no-fee-stress-policy-pwds';

-- Ambariya Schools Infrastructure (2 images)
UPDATE content SET meta_data = jsonb_set(COALESCE(meta_data, '{}'::jsonb), '{images}', '[
  "https://www.getfund.gov.gh/wp-content/uploads/2025/10/AMbariya-2-770x417.png",
  "https://www.getfund.gov.gh/wp-content/uploads/2025/10/AMbariya-2-1024x573.png"
]'::jsonb)
WHERE slug = 'getfund-commences-accelerated-infrastructure-program-ambariya-schools';

-- Multi-Project Construction Northern Region (1 image)
UPDATE content SET meta_data = jsonb_set(COALESCE(meta_data, '{}'::jsonb), '{images}', '[
  "https://www.getfund.gov.gh/wp-content/uploads/2025/10/Nobisco-1-770x417.png"
]'::jsonb)
WHERE slug = 'getfund-kicks-off-multi-project-construction-northern-region';

-- Ghana Senior High School Infrastructure (1 image)
UPDATE content SET meta_data = jsonb_set(COALESCE(meta_data, '{}'::jsonb), '{images}', '[
  "https://www.getfund.gov.gh/wp-content/uploads/2025/10/GHANASCO-770x417.png"
]'::jsonb)
WHERE slug = 'getfund-launches-major-infrastructure-expansion-ghana-senior-high-school';

-- Karaga SHS (1 image)
UPDATE content SET meta_data = jsonb_set(COALESCE(meta_data, '{}'::jsonb), '{images}', '[
  "https://www.getfund.gov.gh/wp-content/uploads/2025/10/Karaga-blk-770x417.png"
]'::jsonb)
WHERE slug = 'getfund-greenlight-construction-ultra-modern-infrastructure-karaga-shs';

-- Pishigu SHS (1 image)
UPDATE content SET meta_data = jsonb_set(COALESCE(meta_data, '{}'::jsonb), '{images}', '[
  "https://www.getfund.gov.gh/wp-content/uploads/2025/10/1-770x417.png"
]'::jsonb)
WHERE slug = 'getfund-commences-major-facility-upgrade-pishigu-shs';

-- Administrator Meets with Staff (4 images)
UPDATE content SET meta_data = jsonb_set(COALESCE(meta_data, '{}'::jsonb), '{images}', '[
  "https://www.getfund.gov.gh/wp-content/uploads/2025/10/SD1-770x417.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2025/10/SD4-1024x683.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2025/08/SD4-1024x683.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2025/10/SD2-1024x683.jpg"
]'::jsonb)
WHERE slug = 'getfund-administrator-meets-with-staff-2025';

-- Prisons Director General (2 images)
UPDATE content SET meta_data = jsonb_set(COALESCE(meta_data, '{}'::jsonb), '{images}', '[
  "https://www.getfund.gov.gh/wp-content/uploads/2025/10/GETPrison-770x417.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2025/10/GETPrison-1024x564.jpg"
]'::jsonb)
WHERE slug = 'director-general-prisons-engages-getfund-inmate-rehabilitation-partnership';

-- Voorhees University and ATTRACO (2 images)
UPDATE content SET meta_data = jsonb_set(COALESCE(meta_data, '{}'::jsonb), '{images}', '[
  "https://www.getfund.gov.gh/wp-content/uploads/2025/10/1v-770x417.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2025/10/1v-1024x683.jpg"
]'::jsonb)
WHERE slug = 'getfund-engages-voorhees-university-attraco-educational-collaboration';

-- Photo Gallery: UK Universities Tour (17 images)
UPDATE content SET meta_data = jsonb_set(COALESCE(meta_data, '{}'::jsonb), '{images}', '[
  "https://www.getfund.gov.gh/wp-content/uploads/2025/10/WhatsApp-Image-2025-10-17-at-12.06.03_7eee427d-770x417.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2025/10/WhatsApp-Image-2025-10-17-at-12.06.30_f0e58da9-2-1024x768.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2025/10/WhatsApp-Image-2025-10-17-at-12.06.28_3a4c56ff-1024x768.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2025/10/WhatsApp-Image-2025-10-17-at-12.06.25_3d5c7550-1-1024x768.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2025/10/WhatsApp-Image-2025-10-17-at-12.06.19_6b3b30ea-1024x768.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2025/10/WhatsApp-Image-2025-10-17-at-12.06.17_b3c30b08-1024x768.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2025/10/WhatsApp-Image-2025-10-17-at-12.06.16_a71b9793-1024x768.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2025/10/WhatsApp-Image-2025-10-17-at-12.06.14_c80190aa-1-1024x768.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2025/10/WhatsApp-Image-2025-10-17-at-12.06.12_03e452de-1024x768.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2025/10/WhatsApp-Image-2025-10-17-at-12.06.08_1bfa4236-1024x768.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2025/10/WhatsApp-Image-2025-10-17-at-12.06.10_67592713-1024x768.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2025/10/WhatsApp-Image-2025-10-17-at-12.06.08_d1b6753b-1024x768.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2025/10/WhatsApp-Image-2025-10-17-at-12.06.07_2d207dd3-1024x768.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2025/10/WhatsApp-Image-2025-10-17-at-12.06.07_8e6a5c7f-1024x768.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2025/10/WhatsApp-Image-2025-10-17-at-12.06.06_66ebb557-1024x768.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2025/10/WhatsApp-Image-2025-10-17-at-12.06.04_8e6cf7fa-1024x768.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2025/10/WhatsApp-Image-2025-10-17-at-12.06.03_7eee427d-1024x768.jpg"
]'::jsonb)
WHERE slug = 'photo-gallery-getfund-tours-uk-universities-engage-ghanaian-scholars';

-- Strengthening Educational Ties: Monitors Scholars in UK (3 images)
UPDATE content SET meta_data = jsonb_set(COALESCE(meta_data, '{}'::jsonb), '{images}', '[
  "https://www.getfund.gov.gh/wp-content/uploads/2025/10/WhatsApp-Image-2025-10-17-at-12.06.14_c80190aa-770x417.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2025/10/WhatsApp-Image-2025-10-17-at-12.06.30_f0e58da9-1024x768.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2025/10/WhatsApp-Image-2025-10-17-at-12.06.25_3d5c7550-1024x768.jpg"
]'::jsonb)
WHERE slug = 'strengthening-educational-ties-getfund-monitors-scholars-uk';

-- Orientation Workshop 7th Board (9 images)
UPDATE content SET meta_data = jsonb_set(COALESCE(meta_data, '{}'::jsonb), '{images}', '[
  "https://www.getfund.gov.gh/wp-content/uploads/2025/06/S8509226-770x417.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2025/06/IMG_9086.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2025/06/IMG_9094.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2025/06/S8509243.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2025/06/S8509284.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2025/06/S8509289.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2025/06/IMG_9106.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2025/06/IMG_9105-1024x683.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2025/06/IMG_9104-1024x683.jpg"
]'::jsonb)
WHERE slug = 'getfund-holds-orientation-workshop-7th-board-trustees';

-- Scholarship Unit Engages UCC Students (1 image)
UPDATE content SET meta_data = jsonb_set(COALESCE(meta_data, '{}'::jsonb), '{images}', '[
  "https://www.getfund.gov.gh/wp-content/uploads/2025/10/Scholars.png"
]'::jsonb)
WHERE slug = 'getfund-scholarship-unit-engages-university-cape-coast-students';

-- GAF CDS Interacts (1 image)
UPDATE content SET meta_data = jsonb_set(COALESCE(meta_data, '{}'::jsonb), '{images}', '[
  "https://www.getfund.gov.gh/wp-content/uploads/2025/05/CDS-565x417.png"
]'::jsonb)
WHERE slug = 'gaf-cds-interacts-getfund-administrator';

-- Minister Inaugurates 7th Board (12 images)
UPDATE content SET meta_data = jsonb_set(COALESCE(meta_data, '{}'::jsonb), '{images}', '[
  "https://www.getfund.gov.gh/wp-content/uploads/2025/04/S8507439-770x417.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2025/04/S8507434.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2025/04/S8507456.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2025/04/S8507459.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2025/04/S8507361.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2025/04/S8507362.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2025/04/S8507358.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2025/04/S8507356.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2025/04/S8507353.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2025/04/S8507310.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2025/04/S8507352.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2025/04/S8507423.jpg"
]'::jsonb)
WHERE slug = 'minister-education-inaugurates-7th-getfund-board';

-- Administrator Engages CHASS Leadership (5 images)
UPDATE content SET meta_data = jsonb_set(COALESCE(meta_data, '{}'::jsonb), '{images}', '[
  "https://www.getfund.gov.gh/wp-content/uploads/2025/03/ST856505-770x417.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2025/03/ST856508-1024x731.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2025/03/ST856476.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2025/03/ST856490.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2025/03/ST856472.jpg"
]'::jsonb)
WHERE slug = 'getfund-administrator-engages-chass-leadership-2025';

-- Advocacy Private Sector-Led Infrastructure (13 images)
UPDATE content SET meta_data = jsonb_set(COALESCE(meta_data, '{}'::jsonb), '{images}', '[
  "https://www.getfund.gov.gh/wp-content/uploads/2025/02/S8502069-770x417.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2025/02/ST859929-1024x683.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2025/02/ST859955-1024x683.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2025/02/ST859918-1024x683.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2025/02/ST859944-1024x683.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2025/02/S8502064-1024x683.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2025/02/ST859978-1024x683.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2025/02/S8502102-1024x683.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2025/02/ST859910-1024x731.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2025/02/ST859893-1024x683.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2025/02/S8502048-1024x683.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2025/02/ST859949-1024x683.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2025/02/S8502069-1024x683.jpg"
]'::jsonb)
WHERE slug = 'advocacy-private-sector-led-school-infrastructure-development';

-- Paul Adjei Assumes Office (5 images)
UPDATE content SET meta_data = jsonb_set(COALESCE(meta_data, '{}'::jsonb), '{images}', '[
  "https://www.getfund.gov.gh/wp-content/uploads/2025/02/ST852075-770x417.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2025/02/ST852067-1.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2025/02/ST852063.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2025/02/ST852046-1.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2025/02/ST852082-1.jpg"
]'::jsonb)
WHERE slug = 'paul-adjei-assumes-office-getfund-administrator';

-- State Award for Outstanding Public Service (5 images)
UPDATE content SET meta_data = jsonb_set(COALESCE(meta_data, '{}'::jsonb), '{images}', '[
  "https://www.getfund.gov.gh/wp-content/uploads/2024/12/ST850255-714x417.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2024/12/ST850251.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2024/12/ST850230.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2024/12/ST850300.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2024/12/ST850317.jpg"
]'::jsonb)
WHERE slug = 'getfund-administrator-receives-state-award-outstanding-public-service';

-- Inaugurates Four-Storey Headquarters (11 images)
UPDATE content SET meta_data = jsonb_set(COALESCE(meta_data, '{}'::jsonb), '{images}', '[
  "https://www.getfund.gov.gh/wp-content/uploads/2025/01/IMGG_9999_244-770x417.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2025/01/IMGG_9999_276-1024x683.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2025/01/IMGG_9999_288.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2025/01/IMGG_9999_270.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2025/01/IMGG_9999_275.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2025/01/IMGG_9999_265.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2025/01/IMGG_9999_256.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2025/01/IMGG_9999_317.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2025/01/IMGG_9999_298.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2025/01/IMGG_9999_302.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2024/12/IMGG_9999_159.jpg"
]'::jsonb)
WHERE slug = 'getfund-inaugurates-four-storey-headquarters-building';

-- Trinity Theological Seminary Graduation (13 images)
UPDATE content SET meta_data = jsonb_set(COALESCE(meta_data, '{}'::jsonb), '{images}', '[
  "https://www.getfund.gov.gh/wp-content/uploads/2024/11/1Z0A7382.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2024/11/1Z0A7377.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2024/11/1Z0A7430.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2024/11/1Z0A7437.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2024/11/1Z0A7438.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2024/11/1Z0A7439.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2024/11/1Z0A7451.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2024/11/1Z0A7474.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2024/11/1Z0A7486.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2024/11/1Z0A7499.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2024/11/1Z0A7535.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2024/11/1Z0A7553.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2024/11/1Z0A7583.jpg"
]'::jsonb)
WHERE slug = '2024-trinity-theological-seminary-graduation';

-- GTP Finalists Scholarships (7 images)
UPDATE content SET meta_data = jsonb_set(COALESCE(meta_data, '{}'::jsonb), '{images}', '[
  "https://www.getfund.gov.gh/wp-content/uploads/2024/10/86B6195-770x417.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2024/10/86B5852-1024x683.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2024/10/86B6141-1024x683.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2024/10/86B6033-1024x683.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2024/10/86B5844_1-1024x683.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2024/10/86B5869-1024x683.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2024/10/86B6116-1024x683.jpg"
]'::jsonb)
WHERE slug = 'getfund-grants-scholarships-gtp-finalists';

-- Administrator Counsels Tertiary Institutions (13 images)
UPDATE content SET meta_data = jsonb_set(COALESCE(meta_data, '{}'::jsonb), '{images}', '[
  "https://www.getfund.gov.gh/wp-content/uploads/2024/04/DSC06344-1024x683.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2024/04/ST857507-1024x683.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2024/04/ST857443-1024x683.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2024/04/DSC06314-370x256.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2024/04/ST857461-370x256.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2024/04/ST857480-370x256.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2024/04/ST857528-370x256.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2024/04/ST857529-370x256.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2024/04/ST857516-370x256.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2024/04/DSC06319.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2024/04/DSC06332.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2024/04/DSC06315.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2024/04/DSC06333.jpg"
]'::jsonb)
WHERE slug = 'getfund-administrator-counsels-tertiary-institutions-financing-options';

-- Administrator Engages Media in Kumasi (1 image)
UPDATE content SET meta_data = jsonb_set(COALESCE(meta_data, '{}'::jsonb), '{images}', '[
  "https://www.getfund.gov.gh/wp-content/uploads/2024/04/9CCC830E-CBF2-4AFA-B485-AAE9B0B623D4-770x417.jpg"
]'::jsonb)
WHERE slug = 'getfund-administrator-engages-media-kumasi';

-- Scholarship Processes Improved (1 image)
UPDATE content SET meta_data = jsonb_set(COALESCE(meta_data, '{}'::jsonb), '{images}', '[
  "https://www.getfund.gov.gh/wp-content/uploads/2023/09/GETFund-Press-Release-Cover-770x417.jpg"
]'::jsonb)
WHERE slug = 'scholarship-processes-getfund-improved';

-- Administrator Urges Universities (1 image)
UPDATE content SET meta_data = jsonb_set(COALESCE(meta_data, '{}'::jsonb), '{images}', '[
  "https://www.getfund.gov.gh/wp-content/uploads/2023/09/S8503168-770x417.jpg"
]'::jsonb)
WHERE slug = 'administrator-urges-universities-innovative-alternative-revenue-streams';

-- Government Grants 4279 Scholarships (1 image)
UPDATE content SET meta_data = jsonb_set(COALESCE(meta_data, '{}'::jsonb), '{images}', '[
  "https://www.getfund.gov.gh/wp-content/uploads/2023/08/Unknown-1-770x417.jpeg"
]'::jsonb)
WHERE slug = 'government-grants-new-scholarships-4279-local-tertiary-students';

-- GETFund Has NOT Used Receivables (13 images)
UPDATE content SET meta_data = jsonb_set(COALESCE(meta_data, '{}'::jsonb), '{images}', '[
  "https://www.getfund.gov.gh/wp-content/uploads/2023/07/S8500045-1-770x417.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2023/07/8P8A0027-copy.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2023/07/8P8A0101.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2023/07/8P8A0042-copy.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2023/07/S8500042.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2023/07/8P8A0123.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2023/07/8P8A0065-copy.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2023/07/S8500023.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2023/07/8P8A0047-copy.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2023/07/8P8A0056-copy.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2023/07/8P8A0064-copy.jpg"
]'::jsonb)
WHERE slug = 'getfund-has-not-used-receivables-borrow-1-5-billion';

-- Voorhees University Delegation (1 image)
UPDATE content SET meta_data = jsonb_set(COALESCE(meta_data, '{}'::jsonb), '{images}', '[
  "https://www.getfund.gov.gh/wp-content/uploads/2023/04/DSC_03245-770x417.jpg"
]'::jsonb)
WHERE slug = 'voorhees-university-delegation-calls-getfund';

-- Carleton University Courtesy Call (9 images)
UPDATE content SET meta_data = jsonb_set(COALESCE(meta_data, '{}'::jsonb), '{images}', '[
  "https://www.getfund.gov.gh/wp-content/uploads/2023/03/5H8A3236-770x417.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2023/03/5H8A3226.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2023/03/5H8A3235.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2023/03/5H8A3233.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2023/03/5H8A3242.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2023/03/5H8A3245.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2023/03/5H8A3244.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2023/03/5H8A3241.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2023/03/5H8A3240.jpg"
]'::jsonb)
WHERE slug = 'carleton-university-pays-courtesy-call-getfund';

-- Military High Command Courtesy Call (14 images)
UPDATE content SET meta_data = jsonb_set(COALESCE(meta_data, '{}'::jsonb), '{images}', '[
  "https://www.getfund.gov.gh/wp-content/uploads/2023/02/1Z0A9943-1024x683.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2023/02/1Z0A9840.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2023/02/1Z0A9877.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2023/02/1Z0A9862.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2023/02/1Z0A9868.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2023/02/1Z0A9893.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2023/02/1Z0A9883.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2023/02/1Z0A9900.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2023/02/1Z0A9906.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2023/02/1Z0A9903.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2023/02/1Z0A9895.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2023/02/1Z0A9936-1024x683.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2023/02/1Z0A9914-1024x683.jpg"
]'::jsonb)
WHERE slug = 'military-high-command-pays-courtesy-call-getfund-administrator';

-- Administrator Interacts with NUGS (12 images)
UPDATE content SET meta_data = jsonb_set(COALESCE(meta_data, '{}'::jsonb), '{images}', '[
  "https://www.getfund.gov.gh/wp-content/uploads/2023/02/S8509378-770x417.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2023/02/S8509391.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2023/02/S8509395.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2023/02/S8509399.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2023/02/S8509406.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2023/02/S8509407.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2023/02/S8509427.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2023/02/S8509430.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2023/02/S8509437.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2023/02/S8509439.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2023/02/S8509442.jpg",
  "https://www.getfund.gov.gh/wp-content/uploads/2023/02/S8509483.jpg"
]'::jsonb)
WHERE slug = 'getfund-administrator-interacts-nugs-leadership';

-- Also fix the CJ featured image URL (was 404ing from wrong path)
UPDATE content SET featured_image_url = 'https://www.getfund.gov.gh/wp-content/uploads/2026/02/CJ-770x417.png'
WHERE slug = 'chief-justice-calls-getfund-judicial-service-reforms'
  AND featured_image_url = 'https://www.getfund.gov.gh/wp-content/uploads/2026/01/CJ-770x417.png';
