-- Insert news articles scraped from getfund.gov.gh
-- Migration: 037_insert_news_articles.sql

-- 2026 Articles
INSERT INTO content (type, title, slug, excerpt, body, author, category, featured_image_url, status, published_at, created_at)
VALUES
(
  'news',
  'GETFund Deputy Administrator Visits Schools Affected by Fire in the Northern Region',
  'getfund-deputy-administrator-visits-schools-affected-by-fire-northern-region',
  'The Deputy Administrator paid an emergency working visit to the Northern Business Senior High School (NOBISCO) and Tolon SHS following devastating fire outbreaks that displaced over 1,000 female students.',
  '<p>The Ghana Education Trust Fund''s Deputy Administrator Hon. Sualihu Dandaawa visited Northern Business Senior High School (NOBISCO) and Tolon SHS following devastating fires that displaced over 1,000 female students.</p><p>The fires occurred on January 28 at NOBISCO and February 2 at Tolon SHS, displacing 900 and 173 students respectively. Beyond structural damage, affected students lost personal belongings, causing trauma and urgent need for support.</p><p>During his visit on behalf of GETFund Administrator Paul Adjei, Hon. Dandaawa expressed sympathy to both institutions'' management, staff, and students. He emphasized GETFund''s commitment to ensuring "the educational journey of these young ladies is not derailed by such tragedy."</p><p>The Deputy Administrator directed the Northern Zone Head to expedite a comprehensive technical damage assessment. He stated: "Our priority is to restore normalcy. We are working around the clock to ensure repairs begin at the earliest possible time."</p><p>GETFund committed to fast-tracking repairs to provide safe dormitories and restore conducive learning environments for affected students, mitigating disruption from the fire outbreaks.</p>',
  'Corporate Affairs',
  'Education Sector Support',
  'https://www.getfund.gov.gh/wp-content/uploads/2026/02/Dept-770x417.png',
  'published',
  '2026-02-04',
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO content (type, title, slug, excerpt, body, author, category, featured_image_url, status, published_at, created_at)
VALUES
(
  'news',
  'GETFund Deputy Administrator Calls for Investigation into Causes of Recurrent Fires at NOBISCO and Tolon SHS',
  'getfund-deputy-administrator-calls-investigation-recurrent-fires-nobisco-tolon-shs',
  'The Deputy Administrator calls for thorough investigation into the causes of recurrent fire incidents at Northern Region schools.',
  '<p>GETFund Deputy Administrator Hon. Alhassan Sualihu Dandaawa has called for a thorough investigation into the causes of recurrent fire outbreaks at Northern Business Senior High School (NOBISCO) and Tolon SHS.</p><p>The call comes after devastating fires displaced hundreds of students at both institutions in quick succession. The Deputy Administrator emphasized the need to identify the root causes to prevent future occurrences.</p><p>GETFund has committed to supporting the affected schools with infrastructure repairs and ensuring the safety of students.</p>',
  'Corporate Affairs',
  'Education Sector Support',
  'https://www.getfund.gov.gh/wp-content/uploads/2026/02/IMG_1149-770x417.jpg',
  'published',
  '2026-02-04',
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO content (type, title, slug, excerpt, body, author, category, featured_image_url, status, published_at, created_at)
VALUES
(
  'news',
  'His Lordship The Chief Justice Calls on GETFund for Judicial Service Reforms',
  'chief-justice-calls-getfund-judicial-service-reforms',
  'Chief Justice Paul Baffoe Bonnie visited GETFund Administrator Paul Adjei to request support for judicial infrastructure and legal education modernization.',
  '<p>Chief Justice Paul Baffoe Bonnie recently visited Ghana Education Trust Fund (GETFund) Administrator Paul Adjei to request support for judicial infrastructure and legal education modernization.</p><p>The Chief Justice explained that planned reforms will restructure legal education delivery through accredited law faculties offering professional practice training after the LLB degree. He noted that "students sit for unified bar examination computerized testing centers, similar to international models in New York and Singapore."</p><p>He emphasized that the General Legal Council Bill, currently in Parliament, will establish new accreditation standards, an inspectorate system, and an appeal tribunal to ensure consistency in legal education across Ghana.</p><p>The Chief Justice highlighted that current facilities were designed to accommodate approximately 80 students but now serve thousands, making infrastructure upgrades essential.</p><p>In response, Administrator Adjei outlined GETFund''s strategic support initiatives. The organization will introduce dedicated budget lines for judicial infrastructure and leverage partnerships with institutions like Temple University and Johns Hopkins to offer scholarships for Ghanaian law students pursuing advanced studies abroad.</p><p>Adjei announced that GETFund established a fundraising department to mobilize corporate and philanthropic resources. A key innovation involves an agreement with Ghana Revenue Authority allowing companies to claim GETFund contributions as tax deductions.</p>',
  'Corporate Affairs',
  'Courtesy Call',
  'https://www.getfund.gov.gh/wp-content/uploads/2026/01/CJ-770x417.png',
  'published',
  '2026-01-26',
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO content (type, title, slug, excerpt, body, author, category, featured_image_url, status, published_at, created_at)
VALUES
(
  'news',
  'CHASS Leadership Engages GETFund Administrator',
  'chass-leadership-engages-getfund-administrator-2026',
  'The Conference of Heads of Assisted Secondary Schools (CHASS) leadership met with GETFund Administrator to discuss educational infrastructure and support.',
  '<p>The leadership of the Conference of Heads of Assisted Secondary Schools (CHASS) engaged with GETFund Administrator Paul Adjei to discuss critical issues affecting secondary education in Ghana.</p><p>The meeting focused on infrastructure development, facility maintenance, and support programs for assisted secondary schools across the country.</p><p>GETFund reaffirmed its commitment to supporting secondary education through continued infrastructure investments and capacity building programs.</p>',
  'Corporate Affairs',
  'Education',
  'https://www.getfund.gov.gh/wp-content/uploads/2026/01/WhatsApp-Image-2026-01-23-at-07.30.17-1-770x417.jpeg',
  'published',
  '2026-01-23',
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

-- 2025 Articles
INSERT INTO content (type, title, slug, excerpt, body, author, category, featured_image_url, status, published_at, created_at)
VALUES
(
  'news',
  'GETFund Receives Delegation from University of Virgin Islands',
  'getfund-receives-delegation-university-virgin-islands',
  'GETFund hosted a University of the Virgin Islands delegation to explore partnership opportunities benefiting Ghanaian students.',
  '<p>The Ghana Education Trust Fund (GETFund) hosted a University of the Virgin Islands (UVI) delegation on December 17, 2025, to explore partnership opportunities benefiting Ghanaian students.</p><p>The visiting team comprised Dr. Nathan Austin (Director of Hospitality & Tourism, School of Business), Dr. Kendra Harris (Dean of the School of Business), and Dr. Abdulkarim Hatsu (University of Ghana Governing Council member).</p><p>During discussions with GETFund Administrator Paul Adjei, the delegation highlighted UVI''s recruitment efforts in Cape Coast and other regions. They emphasized institutional strengths including "its warm climate, vibrant Caribbean community, Ghanaian faculty presence, and welcoming student environment."</p><p>Mr. Adjei acknowledged GETFund''s current support focuses on postgraduate and doctoral studies abroad. He noted that "tuition discounts and application fee waivers would help GETFund extend its support" to sponsor additional students.</p><p>Both parties committed to continued dialogue and agreed to pursue a formal Memorandum of Understanding to solidify their collaborative framework supporting Ghanaian students.</p>',
  'Corporate Affairs',
  'Scholarship',
  'https://www.getfund.gov.gh/wp-content/uploads/2025/12/UVI-770x417.jpg',
  'published',
  '2025-12-18',
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO content (type, title, slug, excerpt, body, author, category, featured_image_url, status, published_at, created_at)
VALUES
(
  'news',
  'FuelTrade Supports GETFund',
  'fueltrade-supports-getfund',
  'GETFund received a transformative donation of One Million Ghana Cedis (GHS 1,000,000) from FuelTrade Ghana Limited.',
  '<p>The Ghana Education Trust Fund (GETFund) received a transformative donation of One Million Ghana Cedis (GHS 1,000,000) from FuelTrade Ghana Limited.</p><p>The donation demonstrates the private sector''s commitment to supporting education in Ghana and aligns with GETFund''s mission to mobilize resources for educational development.</p><p>GETFund Administrator Paul Adjei expressed gratitude for the generous contribution and called on other corporate entities to follow suit in supporting Ghana''s educational infrastructure.</p>',
  'Corporate Affairs',
  'Donation',
  'https://www.getfund.gov.gh/wp-content/uploads/2025/12/Fuel-Trade-770x417.jpg',
  'published',
  '2025-12-17',
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO content (type, title, slug, excerpt, body, author, category, featured_image_url, status, published_at, created_at)
VALUES
(
  'news',
  'GETFund Accelerates Practical Science Education with Strategic Funding for STEMBox Initiative',
  'getfund-accelerates-practical-science-education-stembox-initiative',
  'GETFund provides strategic funding to accelerate practical science education through the innovative STEMBox initiative.',
  '<p>The Ghana Education Trust Fund (GETFund) has announced strategic funding for the STEMBox Initiative, aimed at accelerating practical science education across Ghanaian schools.</p><p>The STEMBox program provides hands-on science kits and resources to schools, enabling students to engage in practical experiments and develop critical thinking skills in science, technology, engineering, and mathematics.</p><p>This initiative aligns with GETFund''s commitment to enhancing the quality of education through innovative programs and practical learning experiences.</p>',
  'Corporate Affairs',
  'Education',
  'https://www.getfund.gov.gh/wp-content/uploads/2025/12/Admin@Stembox-770x417.png',
  'published',
  '2025-12-06',
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO content (type, title, slug, excerpt, body, author, category, featured_image_url, status, published_at, created_at)
VALUES
(
  'news',
  'GETFund Supports Ghana National Research Fund with Office Complex',
  'getfund-supports-ghana-national-research-fund-office-complex',
  'GETFund provides support to the Ghana National Research Fund through the provision of an office complex to enhance research activities.',
  '<p>The Ghana Education Trust Fund (GETFund) has provided support to the Ghana National Research Fund (GNRF) through the provision of a modern office complex.</p><p>This support underscores GETFund''s commitment to promoting research and development in Ghana''s educational sector.</p><p>The new facility will enable GNRF to better coordinate research activities and support academic research across the country.</p>',
  'Corporate Affairs',
  'Infrastructure',
  'https://www.getfund.gov.gh/wp-content/uploads/2025/11/Research-2-770x417.png',
  'published',
  '2025-11-29',
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO content (type, title, slug, excerpt, body, author, category, featured_image_url, status, published_at, created_at)
VALUES
(
  'news',
  '2026 Budget: GETFund Drives Historic Expansion in Educational Infrastructure and Learning Resources',
  '2026-budget-getfund-drives-historic-expansion-educational-infrastructure',
  'GETFund drives historic expansion in educational infrastructure and learning resources under the 2026 national budget.',
  '<p>Under the 2026 national budget, GETFund is set to drive a historic expansion in educational infrastructure and learning resources across Ghana.</p><p>The budget allocation will support the construction and renovation of educational facilities at all levels, from basic schools to tertiary institutions.</p><p>This expansion reflects the government''s commitment to providing quality education for all Ghanaians through strategic investments in educational infrastructure.</p>',
  'Corporate Affairs',
  'Budget',
  'https://www.getfund.gov.gh/wp-content/uploads/2025/11/Ato-Forson-770x417.jpg',
  'published',
  '2025-11-17',
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO content (type, title, slug, excerpt, body, author, category, featured_image_url, status, published_at, created_at)
VALUES
(
  'news',
  'GETFund to Commit GHC 50 Million Yearly to Free Tertiary Education for Persons with Disabilities',
  'getfund-commit-ghc-50-million-yearly-free-tertiary-education-persons-disabilities',
  'The Minister for Education announced that GETFund will commit GHC 50 million each year to support disability and inclusive education across the country.',
  '<p>The Minister for Education has announced that GETFund will commit GHC 50 million each year to support disability and inclusive education across the country.</p><p>This initiative aims to remove financial barriers for persons with disabilities pursuing tertiary education in Ghana.</p><p>The funding will cover tuition, accommodation, and other educational expenses for qualified students with disabilities at tertiary institutions.</p>',
  'Corporate Affairs',
  'Scholarship',
  'https://www.getfund.gov.gh/wp-content/uploads/2025/10/AdminPresident-770x417.png',
  'published',
  '2025-10-27',
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO content (type, title, slug, excerpt, body, author, category, featured_image_url, status, published_at, created_at)
VALUES
(
  'news',
  'CEO of Students Loan Trust Fund Visits GETFund Administrator Ahead of No-Fee Stress Policy Launch for PWDs',
  'ceo-students-loan-trust-fund-visits-getfund-no-fee-stress-policy-pwds',
  'The CEO of Students Loan Trust Fund paid a courtesy call on GETFund Administrator before launching an initiative benefiting persons with disabilities.',
  '<p>The CEO of Students Loan Trust Fund paid a courtesy call on GETFund''s Administrator ahead of the launch of the "No-Fee Stress" policy for Persons with Disabilities (PWDs).</p><p>The meeting focused on collaboration between the two institutions to support students with disabilities in accessing tertiary education.</p><p>The "No-Fee Stress" policy aims to eliminate financial barriers for PWDs pursuing higher education in Ghana.</p>',
  'Corporate Affairs',
  'Courtesy Call',
  'https://www.getfund.gov.gh/wp-content/uploads/2025/10/Grp-Pix-770x417.jpg',
  'published',
  '2025-10-23',
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO content (type, title, slug, excerpt, body, author, category, featured_image_url, status, published_at, created_at)
VALUES
(
  'news',
  'GETFund Commences Accelerated Infrastructure Program at Ambariya Schools; Targets 18-Month Completion',
  'getfund-commences-accelerated-infrastructure-program-ambariya-schools',
  'GETFund has initiated major infrastructure projects at two Ambariya schools in Tamale with an 18-month completion timeline.',
  '<p>GETFund has initiated major infrastructure projects at two Ambariya schools in Tamale with an 18-month completion timeline.</p><p>The accelerated infrastructure program aims to provide modern educational facilities for students in the Northern Region.</p><p>The projects include construction of classroom blocks, dormitories, and other essential facilities to enhance learning conditions.</p>',
  'Corporate Affairs',
  'Infrastructure',
  'https://www.getfund.gov.gh/wp-content/uploads/2025/10/AMbariya-2-770x417.png',
  'published',
  '2025-10-14',
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO content (type, title, slug, excerpt, body, author, category, featured_image_url, status, published_at, created_at)
VALUES
(
  'news',
  'GETFund Kicks Off Multi-Project Construction to Boost Education in the Northern Region',
  'getfund-kicks-off-multi-project-construction-northern-region',
  'GETFund launched a significant initiative to address infrastructure gaps in Northern Region''s education sector.',
  '<p>GETFund launched a significant initiative to address infrastructure gaps in Northern Region''s education sector.</p><p>The multi-project construction program will provide new educational facilities across multiple schools in the region.</p><p>This initiative demonstrates GETFund''s commitment to ensuring equitable access to quality educational infrastructure across all regions of Ghana.</p>',
  'Corporate Affairs',
  'Infrastructure',
  'https://www.getfund.gov.gh/wp-content/uploads/2025/10/Nobisco-1-770x417.png',
  'published',
  '2025-10-14',
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO content (type, title, slug, excerpt, body, author, category, featured_image_url, status, published_at, created_at)
VALUES
(
  'news',
  'GETFund Launches Major Infrastructure Expansion at Ghana Senior High School',
  'getfund-launches-major-infrastructure-expansion-ghana-senior-high-school',
  'GETFund launched infrastructure expansion at Ghana Senior High School with projects scheduled for 18-month completion.',
  '<p>GETFund launched infrastructure expansion at Ghana Senior High School with projects scheduled for 18-month completion.</p><p>The expansion includes new classroom blocks, laboratories, and dormitory facilities to accommodate the growing student population.</p><p>This project is part of GETFund''s broader initiative to improve educational infrastructure across the country.</p>',
  'Corporate Affairs',
  'Infrastructure',
  'https://www.getfund.gov.gh/wp-content/uploads/2025/10/GHANASCO-770x417.png',
  'published',
  '2025-10-14',
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO content (type, title, slug, excerpt, body, author, category, featured_image_url, status, published_at, created_at)
VALUES
(
  'news',
  'GETFund Gives Greenlight for Construction of Ultra-Modern Infrastructure Facilities at Karaga SHS',
  'getfund-greenlight-construction-ultra-modern-infrastructure-karaga-shs',
  'GETFund activated infrastructure project upgrade at Karaga Senior High School with financing secured and 18-month completion target.',
  '<p>GETFund activated infrastructure project upgrade at Karaga Senior High School with financing secured and 18-month completion target.</p><p>The ultra-modern facilities will include state-of-the-art classrooms, science laboratories, and student accommodation.</p><p>This investment underscores GETFund''s commitment to providing quality educational infrastructure in underserved areas.</p>',
  'Corporate Affairs',
  'Infrastructure',
  'https://www.getfund.gov.gh/wp-content/uploads/2025/10/Karaga-blk-770x417.png',
  'published',
  '2025-10-14',
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO content (type, title, slug, excerpt, body, author, category, featured_image_url, status, published_at, created_at)
VALUES
(
  'news',
  'GETFund Commences Major Facility Upgrade at Pishigu SHS',
  'getfund-commences-major-facility-upgrade-pishigu-shs',
  'GETFund officially began comprehensive infrastructural expansion at Pishigu Senior High School in Karaga District, Northern Region.',
  '<p>GETFund officially began comprehensive infrastructural expansion at Pishigu Senior High School in Karaga District, Northern Region.</p><p>The facility upgrade includes construction of new classroom blocks, dormitories, and essential amenities for students and staff.</p><p>This project is part of GETFund''s strategic initiative to improve educational facilities in the Northern Region.</p>',
  'Corporate Affairs',
  'Infrastructure',
  'https://www.getfund.gov.gh/wp-content/uploads/2025/10/1-770x417.png',
  'published',
  '2025-10-10',
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO content (type, title, slug, excerpt, body, author, category, featured_image_url, status, published_at, created_at)
VALUES
(
  'news',
  'GETFund Administrator Meets with Staff',
  'getfund-administrator-meets-with-staff-2025',
  'GETFund Administrator convened a staff durbar to set strategic goals for institutional innovation and growth.',
  '<p>GETFund''s Administrator convened a staff durbar to set strategic goals for institutional innovation and growth.</p><p>The meeting provided an opportunity for staff engagement and discussion of the organization''s strategic direction.</p><p>Key topics included operational efficiency, stakeholder engagement, and enhancing GETFund''s impact on education in Ghana.</p>',
  'Corporate Affairs',
  'Staff Engagement',
  'https://www.getfund.gov.gh/wp-content/uploads/2025/10/SD1-770x417.jpg',
  'published',
  '2025-08-11',
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO content (type, title, slug, excerpt, body, author, category, featured_image_url, status, published_at, created_at)
VALUES
(
  'news',
  'Director General of Prisons Engages GETFund on Inmate Rehabilitation Partnership',
  'director-general-prisons-engages-getfund-inmate-rehabilitation-partnership',
  'The Prisons Director General engaged GETFund to explore collaborative educational and vocational development programs for inmates.',
  '<p>The Director General of Prisons engaged GETFund to explore collaborative educational and vocational development programs for inmates.</p><p>The discussions focused on providing educational opportunities and skills training for prison inmates as part of their rehabilitation.</p><p>This partnership aims to equip inmates with skills that will enable them to reintegrate into society upon release.</p>',
  'Corporate Affairs',
  'Partnership',
  'https://www.getfund.gov.gh/wp-content/uploads/2025/10/GETPrison-770x417.jpg',
  'published',
  '2025-08-06',
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO content (type, title, slug, excerpt, body, author, category, featured_image_url, status, published_at, created_at)
VALUES
(
  'news',
  'GETFund Engages with Voorhees University and ATTRACO to Deepen Educational Collaboration',
  'getfund-engages-voorhees-university-attraco-educational-collaboration',
  'GETFund hosted a delegation from Voorhees University during their Ghana working tour following an earlier memorandum of understanding.',
  '<p>GETFund hosted a delegation from Voorhees University during their Ghana working tour following an earlier memorandum of understanding.</p><p>The engagement focused on deepening educational collaboration and exploring scholarship opportunities for Ghanaian students.</p><p>Both institutions committed to strengthening their partnership for mutual benefit.</p>',
  'Corporate Affairs',
  'Partnership',
  'https://www.getfund.gov.gh/wp-content/uploads/2025/10/1v-770x417.jpg',
  'published',
  '2025-07-17',
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO content (type, title, slug, excerpt, body, author, category, featured_image_url, status, published_at, created_at)
VALUES
(
  'news',
  'Photo Gallery: GETFund Tours UK Universities to Engage Ghanaian Scholars',
  'photo-gallery-getfund-tours-uk-universities-engage-ghanaian-scholars',
  'GETFund embarked on a week-long working visit to the United Kingdom, meeting with Ghanaian students across nine universities.',
  '<p>GETFund embarked on a week-long working visit to the United Kingdom, where a delegation led by Deputy Administrator Hon. Alhassan Sualihu Dandaawa met with Ghanaian students across nine universities.</p><p>The visit provided an opportunity to engage with GETFund scholarship beneficiaries and assess their academic progress.</p><p>The delegation also explored opportunities for expanded collaboration with UK institutions.</p>',
  'Corporate Affairs',
  'Scholarship',
  'https://www.getfund.gov.gh/wp-content/uploads/2025/10/WhatsApp-Image-2025-10-17-at-12.06.03_7eee427d-770x417.jpg',
  'published',
  '2025-07-03',
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO content (type, title, slug, excerpt, body, author, category, featured_image_url, status, published_at, created_at)
VALUES
(
  'news',
  'Strengthening Educational Ties: GETFund Monitors Scholars in UK',
  'strengthening-educational-ties-getfund-monitors-scholars-uk',
  'A four-member GETFund delegation visited the UK from June 21-30, 2025, led by the Deputy Administrator to monitor scholarship beneficiaries.',
  '<p>A four-member GETFund delegation visited the UK from June 21-30, 2025, led by the Deputy Administrator.</p><p>The visit aimed to monitor the progress of GETFund scholarship beneficiaries studying at various UK universities.</p><p>The delegation engaged with students and university officials to assess academic performance and support needs.</p>',
  'Corporate Affairs',
  'Scholarship',
  'https://www.getfund.gov.gh/wp-content/uploads/2025/10/WhatsApp-Image-2025-10-17-at-12.06.14_c80190aa-770x417.jpg',
  'published',
  '2025-07-03',
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO content (type, title, slug, excerpt, body, author, category, featured_image_url, status, published_at, created_at)
VALUES
(
  'news',
  'GETFund Holds Orientation Workshop for 7th Board of Trustees',
  'getfund-holds-orientation-workshop-7th-board-trustees',
  'A 3-day orientation workshop was held for seventeen board members at Peduase, Aburi.',
  '<p>A 3-day orientation workshop was held for seventeen board members of the 7th GETFund Board of Trustees at Peduase, Aburi.</p><p>The workshop provided board members with comprehensive knowledge of GETFund''s mandate, operations, and strategic priorities.</p><p>This orientation aims to equip board members with the information needed to effectively guide the organization.</p>',
  'Corporate Affairs',
  'Governance',
  'https://www.getfund.gov.gh/wp-content/uploads/2025/06/S8509226-770x417.jpg',
  'published',
  '2025-06-25',
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO content (type, title, slug, excerpt, body, author, category, featured_image_url, status, published_at, created_at)
VALUES
(
  'news',
  'GETFund Scholarship Unit Engages with University of Cape Coast Students',
  'getfund-scholarship-unit-engages-university-cape-coast-students',
  'Head of Scholarship unit Mrs. Phillida Lamptey engaged students at the EDUAID Scholarship Summit & Study Abroad Fair.',
  '<p>Head of GETFund''s Scholarship unit Mrs. Phillida Lamptey engaged students at the "EDUAID Scholarship Summit & Study Abroad Fair" at the University of Cape Coast.</p><p>The engagement provided students with information about GETFund scholarship opportunities and application procedures.</p><p>Students received guidance on pursuing both local and international educational opportunities.</p>',
  'Corporate Affairs',
  'Scholarship',
  'https://www.getfund.gov.gh/wp-content/uploads/2025/10/Scholars.png',
  'published',
  '2025-06-21',
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO content (type, title, slug, excerpt, body, author, category, featured_image_url, status, published_at, created_at)
VALUES
(
  'news',
  'GAF CDS Interacts with GETFund Administrator',
  'gaf-cds-interacts-getfund-administrator',
  'Ghana Armed Forces Chief of Defence Staff Lt. Gen William Agyapong met with GETFund Administrator Paul Adjei.',
  '<p>Ghana Armed Forces Chief of Defence Staff Lt. Gen William Agyapong met with GETFund Administrator Paul Adjei.</p><p>The meeting explored potential areas of collaboration between GETFund and the Ghana Armed Forces in educational development.</p><p>Discussions focused on supporting military educational institutions and personnel development programs.</p>',
  'Corporate Affairs',
  'Courtesy Call',
  'https://www.getfund.gov.gh/wp-content/uploads/2025/05/CDS-565x417.png',
  'published',
  '2025-05-16',
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO content (type, title, slug, excerpt, body, author, category, featured_image_url, status, published_at, created_at)
VALUES
(
  'news',
  'Minister of Education Inaugurates 7th GETFund Board',
  'minister-education-inaugurates-7th-getfund-board',
  'Education Minister Hon. Haruna Iddrisu inaugurated the 7th GETFund Board of Trustees on April 11, 2025.',
  '<p>Education Minister Hon. Haruna Iddrisu inaugurated the 7th GETFund Board of Trustees on April 11, 2025.</p><p>The new board comprises seventeen distinguished Ghanaians with expertise in education, finance, and public administration.</p><p>The Minister charged the board to ensure efficient use of GETFund resources for maximum impact on Ghana''s educational sector.</p>',
  'Corporate Affairs',
  'Governance',
  'https://www.getfund.gov.gh/wp-content/uploads/2025/04/S8507439-770x417.jpg',
  'published',
  '2025-04-11',
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO content (type, title, slug, excerpt, body, author, category, featured_image_url, status, published_at, created_at)
VALUES
(
  'news',
  'GETFund Administrator Engages CHASS Leadership',
  'getfund-administrator-engages-chass-leadership-2025',
  'Administrator Paul Adjei met with Conference of Heads of Assisted Secondary Schools leadership in Kumasi.',
  '<p>Administrator Paul Adjei met with the leadership of the Conference of Heads of Assisted Secondary Schools (CHASS) in Kumasi.</p><p>The engagement focused on addressing infrastructure needs and operational challenges facing assisted secondary schools.</p><p>GETFund reaffirmed its commitment to supporting secondary education through continued investments.</p>',
  'Corporate Affairs',
  'Education',
  'https://www.getfund.gov.gh/wp-content/uploads/2025/03/ST856505-770x417.jpg',
  'published',
  '2025-03-25',
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO content (type, title, slug, excerpt, body, author, category, featured_image_url, status, published_at, created_at)
VALUES
(
  'news',
  'Advocacy For Private Sector-Led School Infrastructure Development',
  'advocacy-private-sector-led-school-infrastructure-development',
  'GETFund Administrator advocated for innovative and diversified funding sources for school infrastructure development.',
  '<p>GETFund Administrator advocated for "innovative and diversified funding sources" for school infrastructure development.</p><p>The call for private sector participation aims to complement government funding and accelerate infrastructure development.</p><p>This approach seeks to address the growing demand for educational facilities across Ghana.</p>',
  'Corporate Affairs',
  'Infrastructure',
  'https://www.getfund.gov.gh/wp-content/uploads/2025/02/S8502069-770x417.jpg',
  'published',
  '2025-02-21',
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO content (type, title, slug, excerpt, body, author, category, featured_image_url, status, published_at, created_at)
VALUES
(
  'news',
  'Mr. Paul Adjei Assumes Office as GETFund Administrator',
  'paul-adjei-assumes-office-getfund-administrator',
  'Paul Adjei officially began his tenure as GETFund Administrator and held his first management meeting.',
  '<p>Mr. Paul Adjei officially began his tenure as GETFund Administrator and held his first management meeting.</p><p>In his opening remarks, the new Administrator outlined his vision for the organization and priorities for his tenure.</p><p>He emphasized commitment to transparency, efficiency, and maximizing the impact of GETFund resources on education.</p>',
  'Corporate Affairs',
  'Administration',
  'https://www.getfund.gov.gh/wp-content/uploads/2025/02/ST852075-770x417.jpg',
  'published',
  '2025-02-03',
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

-- 2024 Articles
INSERT INTO content (type, title, slug, excerpt, body, author, category, featured_image_url, status, published_at, created_at)
VALUES
(
  'news',
  'State Award for Outstanding Public Service',
  'getfund-administrator-receives-state-award-outstanding-public-service',
  'Former Administrator Dr. Richard Ampofo Boadu received a presidential state award from President Akufo-Addo.',
  '<p>Former GETFund Administrator Dr. Richard Ampofo Boadu received a presidential state award for outstanding public service from President Nana Addo Dankwa Akufo-Addo.</p><p>The award recognizes Dr. Boadu''s distinguished service and contributions to Ghana''s educational sector during his tenure.</p><p>The ceremony highlighted the importance of dedicated public service in national development.</p>',
  'Corporate Affairs',
  'Award',
  'https://www.getfund.gov.gh/wp-content/uploads/2024/12/ST850255-714x417.jpg',
  'published',
  '2024-12-30',
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO content (type, title, slug, excerpt, body, author, category, featured_image_url, status, published_at, created_at)
VALUES
(
  'news',
  'GETFund Inaugurates a Four-Storey Headquarters Building',
  'getfund-inaugurates-four-storey-headquarters-building',
  'The Board of Trustees of GETFund inaugurated a modern four-storey headquarters building on Monday, 23rd December 2024.',
  '<p>The Board of Trustees of the Ghana Education Trust Fund (GETFund) inaugurated a modern four-storey headquarters building on Monday, 23rd December 2024.</p><p>The new headquarters provides modern office facilities for GETFund staff and enhances operational efficiency.</p><p>The building represents GETFund''s commitment to institutional development and improved service delivery.</p>',
  'Corporate Affairs',
  'Infrastructure',
  'https://www.getfund.gov.gh/wp-content/uploads/2025/01/IMGG_9999_244-770x417.jpg',
  'published',
  '2024-12-23',
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO content (type, title, slug, excerpt, body, author, category, featured_image_url, status, published_at, created_at)
VALUES
(
  'news',
  '2024 Trinity Theological Seminary Graduation',
  '2024-trinity-theological-seminary-graduation',
  'Your success is not just personal but also a sacred trust - GETFund Administrator tells new pastors at graduation.',
  '<p>"Your success is not just personal but also a sacred trust" - GETFund Administrator told new pastors at the 2024 Trinity Theological Seminary graduation ceremony.</p><p>The Administrator encouraged graduates to use their education for the benefit of society and national development.</p><p>GETFund has supported numerous students at the seminary through its scholarship programs.</p>',
  'Corporate Affairs',
  'Education',
  'https://www.getfund.gov.gh/wp-content/uploads/2024/11/1Z0A7382-770x417.jpg',
  'published',
  '2024-11-09',
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO content (type, title, slug, excerpt, body, author, category, featured_image_url, status, published_at, created_at)
VALUES
(
  'news',
  'GETFund Grants Scholarships to GTP Finalists',
  'getfund-grants-scholarships-gtp-finalists',
  'GETFund provides scholarship grants to Ghana Teacher Prize recipients and finalists through its Administrator.',
  '<p>GETFund provides scholarship grants to Ghana Teacher Prize recipients and finalists through its Administrator.</p><p>The scholarships recognize outstanding teachers and support their continued professional development.</p><p>This initiative demonstrates GETFund''s commitment to supporting educators in Ghana.</p>',
  'Corporate Affairs',
  'Scholarship',
  'https://www.getfund.gov.gh/wp-content/uploads/2024/10/86B6195-770x417.jpg',
  'published',
  '2024-10-14',
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO content (type, title, slug, excerpt, body, author, category, featured_image_url, status, published_at, created_at)
VALUES
(
  'news',
  'GETFund Administrator Counsels Tertiary Institutions on Financing Options',
  'getfund-administrator-counsels-tertiary-institutions-financing-options',
  'GETFund Administrator provides guidance to tertiary institutions on diverse financing options for educational development.',
  '<p>GETFund Administrator provided guidance to tertiary institutions on diverse financing options for educational development.</p><p>The engagement aimed to help institutions explore sustainable funding mechanisms beyond government support.</p><p>Discussions covered partnerships, endowment funds, and other innovative financing approaches.</p>',
  'Corporate Affairs',
  'Education',
  'https://www.getfund.gov.gh/wp-content/uploads/2024/04/ST857443-770x417.jpg',
  'published',
  '2024-04-03',
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO content (type, title, slug, excerpt, body, author, category, featured_image_url, status, published_at, created_at)
VALUES
(
  'news',
  'GETFund Administrator Engages Media in Kumasi',
  'getfund-administrator-engages-media-kumasi',
  'GETFund Administrator engages media practitioners in Kumasi to discuss the organization''s activities and achievements.',
  '<p>GETFund Administrator engaged media practitioners in Kumasi to discuss the organization''s activities and achievements.</p><p>The engagement provided an opportunity to share updates on GETFund projects and respond to media inquiries.</p><p>The Administrator emphasized the importance of media partnership in communicating GETFund''s impact.</p>',
  'Corporate Affairs',
  'Media Engagement',
  'https://www.getfund.gov.gh/wp-content/uploads/2024/04/9CCC830E-CBF2-4AFA-B485-AAE9B0B623D4-770x417.jpg',
  'published',
  '2024-01-15',
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

-- 2023 Articles
INSERT INTO content (type, title, slug, excerpt, body, author, category, featured_image_url, status, published_at, created_at)
VALUES
(
  'news',
  'Scholarship Processes at GETFund have Improved',
  'scholarship-processes-getfund-improved',
  'GETFund announces improvements to scholarship application and processing procedures.',
  '<p>GETFund announces improvements to scholarship application and processing procedures.</p><p>The enhancements aim to make the scholarship process more transparent, efficient, and accessible to all qualified applicants.</p><p>These improvements reflect GETFund''s commitment to supporting more Ghanaian students in their educational pursuits.</p>',
  'Corporate Affairs',
  'Scholarship',
  'https://www.getfund.gov.gh/wp-content/uploads/2023/09/GETFund-Press-Release-Cover-770x417.jpg',
  'published',
  '2023-09-25',
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO content (type, title, slug, excerpt, body, author, category, featured_image_url, status, published_at, created_at)
VALUES
(
  'news',
  'The Administrator Urges Universities to be Innovative in Alternative Revenue Streams',
  'administrator-urges-universities-innovative-alternative-revenue-streams',
  'GETFund Administrator encourages universities to explore innovative approaches to generating alternative revenue.',
  '<p>GETFund Administrator encourages universities to explore innovative approaches to generating alternative revenue.</p><p>The call emphasizes the need for tertiary institutions to diversify funding sources beyond government allocations.</p><p>Suggested approaches include industry partnerships, consultancy services, and endowment funds.</p>',
  'Corporate Affairs',
  'Education',
  'https://www.getfund.gov.gh/wp-content/uploads/2023/09/S8503168-770x417.jpg',
  'published',
  '2023-09-11',
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO content (type, title, slug, excerpt, body, author, category, featured_image_url, status, published_at, created_at)
VALUES
(
  'news',
  'Government Grants New Scholarships to 4,279 Local Tertiary Students',
  'government-grants-new-scholarships-4279-local-tertiary-students',
  'Government through GETFund awards new scholarships to 4,279 students at local tertiary institutions.',
  '<p>Government through GETFund awards new scholarships to 4,279 students at local tertiary institutions.</p><p>The scholarships cover tuition and other educational expenses for qualified students across various fields of study.</p><p>This initiative reflects continued commitment to making tertiary education accessible to all Ghanaians.</p>',
  'Corporate Affairs',
  'Scholarship',
  'https://www.getfund.gov.gh/wp-content/uploads/2023/08/Unknown-1-770x417.jpeg',
  'published',
  '2023-08-08',
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO content (type, title, slug, excerpt, body, author, category, featured_image_url, status, published_at, created_at)
VALUES
(
  'news',
  'GETFund has NOT Used Its Receivables to Borrow $1.5 Billion',
  'getfund-has-not-used-receivables-borrow-1-5-billion',
  'GETFund clarifies that it has not used its receivables to borrow $1.5 billion, addressing media reports.',
  '<p>GETFund clarifies that it has not used its receivables to borrow $1.5 billion, addressing media reports.</p><p>The statement aims to correct misinformation and provide accurate information about GETFund''s financial operations.</p><p>GETFund remains committed to transparency in all its financial dealings.</p>',
  'Corporate Affairs',
  'Press Release',
  'https://www.getfund.gov.gh/wp-content/uploads/2023/07/S8500045-1-770x417.jpg',
  'published',
  '2023-07-19',
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO content (type, title, slug, excerpt, body, author, category, featured_image_url, status, published_at, created_at)
VALUES
(
  'news',
  'Voorhees University Delegation Calls on GETFund',
  'voorhees-university-delegation-calls-getfund',
  'A delegation from Voorhees University visited GETFund to explore partnership opportunities.',
  '<p>A delegation from Voorhees University visited GETFund to explore partnership opportunities.</p><p>The visit focused on scholarship programs and educational exchange opportunities for Ghanaian students.</p><p>Both institutions expressed commitment to fostering educational collaboration.</p>',
  'Corporate Affairs',
  'Courtesy Call',
  'https://www.getfund.gov.gh/wp-content/uploads/2023/04/DSC_03245-770x417.jpg',
  'published',
  '2023-05-23',
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO content (type, title, slug, excerpt, body, author, category, featured_image_url, status, published_at, created_at)
VALUES
(
  'news',
  'Carleton University Pays Courtesy Call on GETFund',
  'carleton-university-pays-courtesy-call-getfund',
  'A delegation from Carleton University in Ottawa, Canada visited to discuss partnership with regards to scholarship opportunities.',
  '<p>A delegation from Carleton University in Ottawa, Canada visited GETFund to discuss "partnership with regards to scholarship opportunities for GETFund future awardees."</p><p>The meeting explored potential collaboration in supporting Ghanaian students pursuing education in Canada.</p><p>Both parties expressed interest in formalizing the partnership through an MOU.</p>',
  'Corporate Affairs',
  'Courtesy Call',
  'https://www.getfund.gov.gh/wp-content/uploads/2023/03/5H8A3236-770x417.jpg',
  'published',
  '2023-02-23',
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO content (type, title, slug, excerpt, body, author, category, featured_image_url, status, published_at, created_at)
VALUES
(
  'news',
  'Military High Command Pays Courtesy Call on GETFund Administrator',
  'military-high-command-pays-courtesy-call-getfund-administrator',
  'A high-powered delegation from the Ghana Armed Forces, led by the Chief of Defense Staff, visited GETFund.',
  '<p>A high-powered delegation from the Ghana Armed Forces, led by the Chief of Defense Staff (CDS), Vice Admiral Seth Amoama visited GETFund on 21 February 2023.</p><p>The courtesy call explored areas of collaboration between GETFund and the military in educational development.</p><p>Discussions included support for military educational institutions and training programs.</p>',
  'Corporate Affairs',
  'Courtesy Call',
  'https://www.getfund.gov.gh/wp-content/uploads/2023/02/1Z0A9913-770x417.jpg',
  'published',
  '2023-02-22',
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO content (type, title, slug, excerpt, body, author, category, featured_image_url, status, published_at, created_at)
VALUES
(
  'news',
  'Delegation from HESLB Tanzania Visits GETFund',
  'delegation-heslb-tanzania-visits-getfund',
  'A four-member delegation from Tanzania''s Higher Education Students Loans Board visited GETFund.',
  '<p>A four-member delegation from Tanzania''s Higher Education Students Loans Board (HESLB) visited GETFund.</p><p>The visit provided an opportunity for knowledge exchange on educational financing mechanisms.</p><p>Both organizations discussed best practices in student support and scholarship administration.</p>',
  'Corporate Affairs',
  'Courtesy Call',
  'https://www.getfund.gov.gh/wp-content/uploads/2023/03/1Z0A0148-770x417.jpg',
  'published',
  '2023-02-21',
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO content (type, title, slug, excerpt, body, author, category, featured_image_url, status, published_at, created_at)
VALUES
(
  'news',
  'GETFund Administrator Interacts with NUGS Leadership',
  'getfund-administrator-interacts-nugs-leadership',
  'Administrator Dr. Richard Ampofo Boadu counseled the National Union of Ghana Students leadership.',
  '<p>Administrator Dr. Richard Ampofo Boadu counseled the National Union of Ghana Students (NUGS) leadership.</p><p>The engagement provided a platform for student leaders to share concerns and receive guidance on educational matters.</p><p>The Administrator encouraged students to take advantage of GETFund scholarship opportunities.</p>',
  'Corporate Affairs',
  'Student Engagement',
  'https://www.getfund.gov.gh/wp-content/uploads/2023/02/S8509378-770x417.jpg',
  'published',
  '2023-02-02',
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

-- 2022 Articles
INSERT INTO content (type, title, slug, excerpt, body, author, category, featured_image_url, status, published_at, created_at)
VALUES
(
  'news',
  'GETFund 2022/23 Local Scholarship Application',
  'getfund-2022-23-local-scholarship-application',
  'GETFund announces local scholarship application period from Monday, 12th December 2022 through Tuesday, 31st January 2023.',
  '<p>GETFund announces local scholarship application period from Monday, 12th December 2022 through Tuesday, 31st January 2023 for postgraduate programs.</p><p>Eligible students are encouraged to apply through the official GETFund portal.</p><p>The scholarships cover various postgraduate programs at accredited institutions.</p>',
  'Corporate Affairs',
  'Scholarship',
  'https://www.getfund.gov.gh/wp-content/uploads/2022/12/Home-background-with-Dark-Cover-copywrite-770x417.jpg',
  'published',
  '2022-12-12',
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO content (type, title, slug, excerpt, body, author, category, featured_image_url, status, published_at, created_at)
VALUES
(
  'news',
  'Universities Fund Kenya Understudies GETFund',
  'universities-fund-kenya-understudies-getfund',
  'A Kenyan delegation from the Universities Fund visited GETFund to learn about its operations and mandate.',
  '<p>A Kenyan delegation from the Universities Fund visited GETFund to learn about its operations and mandate.</p><p>The visit provided an opportunity for knowledge sharing on educational funding mechanisms.</p><p>Both organizations explored potential areas of collaboration.</p>',
  'Corporate Affairs',
  'Courtesy Call',
  'https://www.getfund.gov.gh/wp-content/uploads/2022/10/S8507486-770x417.jpg',
  'published',
  '2022-12-08',
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO content (type, title, slug, excerpt, body, author, category, featured_image_url, status, published_at, created_at)
VALUES
(
  'news',
  'GETFund Accounts To The Public - Stakeholder Forum',
  'getfund-accounts-to-public-stakeholder-forum',
  'Board and management held a stakeholder engagement forum at the Academy of Arts and Sciences in Accra.',
  '<p>GETFund Board and management held a stakeholder engagement forum at the Academy of Arts and Sciences in Accra.</p><p>The forum provided an opportunity to account to the public on GETFund''s activities and achievements.</p><p>Stakeholders were briefed on ongoing projects and future plans.</p>',
  'Corporate Affairs',
  'Stakeholder Engagement',
  'https://www.getfund.gov.gh/wp-content/uploads/2022/11/5H8A0438-770x417.jpg',
  'published',
  '2022-11-08',
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO content (type, title, slug, excerpt, body, author, category, featured_image_url, status, published_at, created_at)
VALUES
(
  'news',
  'GETFund Administrator Inspects UDS Project',
  'getfund-administrator-inspects-uds-project',
  'Administrator inspected a lecture hall and office complex project at University for Development Studies.',
  '<p>GETFund Administrator inspected a lecture hall and office complex project at the University for Development Studies (UDS).</p><p>The inspection assessed progress on the GETFund-funded infrastructure project.</p><p>The Administrator expressed satisfaction with the pace of work and encouraged timely completion.</p>',
  'Corporate Affairs',
  'Infrastructure',
  'https://www.getfund.gov.gh/wp-content/uploads/2022/09/IMG_6526-770x417.jpg',
  'published',
  '2022-10-05',
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO content (type, title, slug, excerpt, body, author, category, featured_image_url, status, published_at, created_at)
VALUES
(
  'news',
  'GETFund Administrator Pays Working Visit to Northern Sector Office',
  'getfund-administrator-pays-working-visit-northern-sector-office',
  'Administrator visited the Northern Sector office in Tamale on 3 October 2022.',
  '<p>GETFund Administrator visited the Northern Sector office in Tamale on 3 October 2022.</p><p>The working visit provided an opportunity to engage with staff and assess operations in the northern zone.</p><p>The Administrator discussed strategies for accelerating project delivery in the region.</p>',
  'Corporate Affairs',
  'Administration',
  'https://www.getfund.gov.gh/wp-content/uploads/2022/05/IMG_6421-770x417.jpg',
  'published',
  '2022-10-03',
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO content (type, title, slug, excerpt, body, author, category, featured_image_url, status, published_at, created_at)
VALUES
(
  'news',
  'GETFund Board of Trustees Tours Projects in Eastern Region',
  'getfund-board-trustees-tours-projects-eastern-region',
  'Board subcommittee led by Chair Ms. Aretha A.A Duku monitored twenty selected ongoing project sites in the Eastern Region.',
  '<p>GETFund Board subcommittee led by Chair Ms. Aretha A.A Duku monitored "twenty (20) selected ongoing project sites in the Eastern Region."</p><p>The tour assessed project progress and quality of infrastructure development.</p><p>The Board expressed commitment to ensuring timely completion of all projects.</p>',
  'Corporate Affairs',
  'Project Monitoring',
  'https://www.getfund.gov.gh/wp-content/uploads/2022/09/MG_9824-770x417.jpg',
  'published',
  '2022-09-06',
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO content (type, title, slug, excerpt, body, author, category, featured_image_url, status, published_at, created_at)
VALUES
(
  'news',
  'Vice President Hands Over Buses and Pickups to Schools',
  'vice-president-hands-over-buses-pickups-schools',
  'On 26 May 2022, the Vice President handed over 75 buses and 5 Pickup trucks to some heads of Senior High Schools across Ghana.',
  '<p>On 26 May 2022, the Vice President handed over "75 buses and 5 Pickup trucks to some heads of Senior High Schools across Ghana."</p><p>The vehicles will support student transportation and school operations.</p><p>This donation demonstrates the government''s commitment to supporting Free SHS implementation.</p>',
  'Corporate Affairs',
  'Donation',
  'https://www.getfund.gov.gh/wp-content/uploads/2022/06/blog-1-1-770x417-1.jpg',
  'published',
  '2022-05-26',
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO content (type, title, slug, excerpt, body, author, category, featured_image_url, status, published_at, created_at)
VALUES
(
  'news',
  'Daakye Trust PLC Holds Inaugural AGM in Accra',
  'daakye-trust-plc-holds-inaugural-agm-accra',
  'Daakye Trust PLC held the first Annual General Meeting focusing on financial matters.',
  '<p>Daakye Trust PLC held "the first Annual General Meeting (AGM) of the Daakye Trust PLC" with focus on financial matters.</p><p>The meeting reviewed the organization''s performance and set strategic direction for the coming year.</p><p>Shareholders received updates on investments and financial position.</p>',
  'Corporate Affairs',
  'Corporate',
  'https://www.getfund.gov.gh/wp-content/uploads/2022/05/blog-1-1-770x417-1.jpg',
  'published',
  '2022-05-25',
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO content (type, title, slug, excerpt, body, author, category, featured_image_url, status, published_at, created_at)
VALUES
(
  'news',
  'GETFund''s Bold March on Educational Infrastructure',
  'getfund-bold-march-educational-infrastructure',
  'GETFund details educational sector development priorities under current administration.',
  '<p>GETFund details educational sector development priorities under current administration.</p><p>The organization outlines its strategic approach to accelerating educational infrastructure development across Ghana.</p><p>Key focus areas include classroom construction, laboratory facilities, and dormitory projects.</p>',
  'Corporate Affairs',
  'Infrastructure',
  'https://www.getfund.gov.gh/wp-content/uploads/2022/01/GETFund-News-2-2-1024x683-1-770x417.jpg',
  'published',
  '2022-05-18',
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO content (type, title, slug, excerpt, body, author, category, featured_image_url, status, published_at, created_at)
VALUES
(
  'news',
  'Press Update: Infrastructure Projects',
  'press-update-infrastructure-projects',
  'Government is committed to the completion of Educational Sector Infrastructure projects.',
  '<p>"Government is committed to the completion of Educational Sector Infrastructure projects."</p><p>GETFund provides updates on ongoing infrastructure projects and completion timelines.</p><p>The update addresses stakeholder concerns and reaffirms commitment to project delivery.</p>',
  'Corporate Affairs',
  'Press Release',
  'https://www.getfund.gov.gh/wp-content/uploads/2022/05/Screenshot-2022-06-24-at-11.14.12-PM-770x417.png',
  'published',
  '2022-05-17',
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO content (type, title, slug, excerpt, body, author, category, featured_image_url, status, published_at, created_at)
VALUES
(
  'news',
  'GETFund Obtains Parliamentary Nod',
  'getfund-obtains-parliamentary-nod',
  'GETFund receives Parliamentary approval for project completion.',
  '<p>GETFund received Parliamentary approval for project completion.</p><p>The approval enables the organization to proceed with financing for key educational infrastructure projects.</p><p>This milestone demonstrates Parliamentary confidence in GETFund''s mandate.</p>',
  'Corporate Affairs',
  'Governance',
  'https://www.getfund.gov.gh/wp-content/uploads/2021/12/GETFund-News-1-1-1024x683-1-770x417.jpg',
  'published',
  '2022-05-17',
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO content (type, title, slug, excerpt, body, author, category, featured_image_url, status, published_at, created_at)
VALUES
(
  'news',
  'GETFund Completes 1st Quarter Project Monitoring in Volta Region',
  'getfund-completes-q1-project-monitoring-volta-region',
  '453 GETFund sponsored projects have been initiated in the Volta Region.',
  '<p>"453 GETFund sponsored projects have been initiated in the Volta Region."</p><p>The first quarter project monitoring exercise assessed progress and quality of work on ongoing projects.</p><p>The monitoring team engaged with contractors and beneficiary institutions.</p>',
  'Corporate Affairs',
  'Project Monitoring',
  'https://www.getfund.gov.gh/wp-content/uploads/2022/03/Volt-Monitoring-1-770x417-1.jpg',
  'published',
  '2022-03-25',
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

-- 2021 and 2020 Articles
INSERT INTO content (type, title, slug, excerpt, body, author, category, featured_image_url, status, published_at, created_at)
VALUES
(
  'news',
  '2021 Scholarship Monitoring Programme',
  '2021-scholarship-monitoring-programme',
  'GETFund conducted a scholarship monitoring visit to the United Kingdom.',
  '<p>GETFund conducted a scholarship monitoring visit to the United Kingdom.</p><p>The visit assessed the progress and welfare of GETFund scholarship beneficiaries studying in the UK.</p><p>The monitoring team engaged with students and university officials.</p>',
  'Corporate Affairs',
  'Scholarship',
  'https://www.getfund.gov.gh/wp-content/uploads/2022/01/GETFund-News-3-3-1024x683-1-770x417.jpg',
  'published',
  '2021-12-20',
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO content (type, title, slug, excerpt, body, author, category, featured_image_url, status, published_at, created_at)
VALUES
(
  'news',
  'SONA 2020 on Educational Infrastructure',
  'sona-2020-educational-infrastructure',
  'Discussion of Free Senior High School policy achievements and educational infrastructure development.',
  '<p>The State of the Nation Address (SONA) 2020 highlighted achievements in educational infrastructure development.</p><p>Key focus areas included the Free Senior High School policy and its impact on access to education.</p><p>GETFund''s contributions to infrastructure development were acknowledged.</p>',
  'Corporate Affairs',
  'Policy',
  'https://www.getfund.gov.gh/wp-content/uploads/2022/01/SONA-GETFund-1-770x417-1.jpg',
  'published',
  '2020-02-21',
  NOW()
)
ON CONFLICT (slug) DO NOTHING;
