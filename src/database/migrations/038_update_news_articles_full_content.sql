-- Update existing news articles with full content
-- Migration: 038_update_news_articles_full_content.sql
-- This migration updates articles that may have missing excerpt, body, or other fields

-- 2026 Articles
UPDATE content SET
  excerpt = 'The Deputy Administrator paid an emergency working visit to the Northern Business Senior High School (NOBISCO) and Tolon SHS following devastating fire outbreaks that displaced over 1,000 female students.',
  body = '<p>The Ghana Education Trust Fund''s Deputy Administrator Hon. Sualihu Dandaawa visited Northern Business Senior High School (NOBISCO) and Tolon SHS following devastating fires that displaced over 1,000 female students.</p><p>The fires occurred on January 28 at NOBISCO and February 2 at Tolon SHS, displacing 900 and 173 students respectively. Beyond structural damage, affected students lost personal belongings, causing trauma and urgent need for support.</p><p>During his visit on behalf of GETFund Administrator Paul Adjei, Hon. Dandaawa expressed sympathy to both institutions'' management, staff, and students. He emphasized GETFund''s commitment to ensuring "the educational journey of these young ladies is not derailed by such tragedy."</p><p>The Deputy Administrator directed the Northern Zone Head to expedite a comprehensive technical damage assessment. He stated: "Our priority is to restore normalcy. We are working around the clock to ensure repairs begin at the earliest possible time."</p><p>GETFund committed to fast-tracking repairs to provide safe dormitories and restore conducive learning environments for affected students, mitigating disruption from the fire outbreaks.</p>',
  author = COALESCE(author, 'Corporate Affairs'),
  category = COALESCE(category, 'Education Sector Support'),
  featured_image_url = COALESCE(featured_image_url, 'https://www.getfund.gov.gh/wp-content/uploads/2026/02/Dept-770x417.png')
WHERE slug = 'getfund-deputy-administrator-visits-schools-affected-by-fire-northern-region'
  AND (excerpt IS NULL OR excerpt = '' OR body IS NULL OR body = '');

UPDATE content SET
  excerpt = 'The Deputy Administrator calls for thorough investigation into the causes of recurrent fire incidents at Northern Region schools.',
  body = '<p>GETFund Deputy Administrator Hon. Alhassan Sualihu Dandaawa has called for a thorough investigation into the causes of recurrent fire outbreaks at Northern Business Senior High School (NOBISCO) and Tolon SHS.</p><p>The call comes after devastating fires displaced hundreds of students at both institutions in quick succession. The Deputy Administrator emphasized the need to identify the root causes to prevent future occurrences.</p><p>GETFund has committed to supporting the affected schools with infrastructure repairs and ensuring the safety of students.</p>',
  author = COALESCE(author, 'Corporate Affairs'),
  category = COALESCE(category, 'Education Sector Support'),
  featured_image_url = COALESCE(featured_image_url, 'https://www.getfund.gov.gh/wp-content/uploads/2026/02/IMG_1149-770x417.jpg')
WHERE slug = 'getfund-deputy-administrator-calls-investigation-recurrent-fires-nobisco-tolon-shs'
  AND (excerpt IS NULL OR excerpt = '' OR body IS NULL OR body = '');

UPDATE content SET
  excerpt = 'Chief Justice Paul Baffoe Bonnie visited GETFund Administrator Paul Adjei to request support for judicial infrastructure and legal education modernization.',
  body = '<p>Chief Justice Paul Baffoe Bonnie recently visited Ghana Education Trust Fund (GETFund) Administrator Paul Adjei to request support for judicial infrastructure and legal education modernization.</p><p>The Chief Justice explained that planned reforms will restructure legal education delivery through accredited law faculties offering professional practice training after the LLB degree. He noted that "students sit for unified bar examination computerized testing centers, similar to international models in New York and Singapore."</p><p>He emphasized that the General Legal Council Bill, currently in Parliament, will establish new accreditation standards, an inspectorate system, and an appeal tribunal to ensure consistency in legal education across Ghana.</p><p>The Chief Justice highlighted that current facilities were designed to accommodate approximately 80 students but now serve thousands, making infrastructure upgrades essential.</p><p>In response, Administrator Adjei outlined GETFund''s strategic support initiatives. The organization will introduce dedicated budget lines for judicial infrastructure and leverage partnerships with institutions like Temple University and Johns Hopkins to offer scholarships for Ghanaian law students pursuing advanced studies abroad.</p><p>Adjei announced that GETFund established a fundraising department to mobilize corporate and philanthropic resources. A key innovation involves an agreement with Ghana Revenue Authority allowing companies to claim GETFund contributions as tax deductions.</p>',
  author = COALESCE(author, 'Corporate Affairs'),
  category = COALESCE(category, 'Courtesy Call'),
  featured_image_url = COALESCE(featured_image_url, 'https://www.getfund.gov.gh/wp-content/uploads/2026/01/CJ-770x417.png')
WHERE slug = 'chief-justice-calls-getfund-judicial-service-reforms'
  AND (excerpt IS NULL OR excerpt = '' OR body IS NULL OR body = '');

UPDATE content SET
  excerpt = 'The Conference of Heads of Assisted Secondary Schools (CHASS) leadership met with GETFund Administrator to discuss educational infrastructure and support.',
  body = '<p>The leadership of the Conference of Heads of Assisted Secondary Schools (CHASS) engaged with GETFund Administrator Paul Adjei to discuss critical issues affecting secondary education in Ghana.</p><p>The meeting focused on infrastructure development, facility maintenance, and support programs for assisted secondary schools across the country.</p><p>GETFund reaffirmed its commitment to supporting secondary education through continued infrastructure investments and capacity building programs.</p>',
  author = COALESCE(author, 'Corporate Affairs'),
  category = COALESCE(category, 'Education'),
  featured_image_url = COALESCE(featured_image_url, 'https://www.getfund.gov.gh/wp-content/uploads/2026/01/WhatsApp-Image-2026-01-23-at-07.30.17-1-770x417.jpeg')
WHERE slug LIKE '%chass-leadership-engages-getfund-administrator%'
  AND (excerpt IS NULL OR excerpt = '' OR body IS NULL OR body = '');

-- 2025 Articles
UPDATE content SET
  excerpt = 'GETFund hosted a University of the Virgin Islands delegation to explore partnership opportunities benefiting Ghanaian students.',
  body = '<p>The Ghana Education Trust Fund (GETFund) hosted a University of the Virgin Islands (UVI) delegation on December 17, 2025, to explore partnership opportunities benefiting Ghanaian students.</p><p>The visiting team comprised Dr. Nathan Austin (Director of Hospitality & Tourism, School of Business), Dr. Kendra Harris (Dean of the School of Business), and Dr. Abdulkarim Hatsu (University of Ghana Governing Council member).</p><p>During discussions with GETFund Administrator Paul Adjei, the delegation highlighted UVI''s recruitment efforts in Cape Coast and other regions. They emphasized institutional strengths including "its warm climate, vibrant Caribbean community, Ghanaian faculty presence, and welcoming student environment."</p><p>Mr. Adjei acknowledged GETFund''s current support focuses on postgraduate and doctoral studies abroad. He noted that "tuition discounts and application fee waivers would help GETFund extend its support" to sponsor additional students.</p><p>Both parties committed to continued dialogue and agreed to pursue a formal Memorandum of Understanding to solidify their collaborative framework supporting Ghanaian students.</p>',
  author = COALESCE(author, 'Corporate Affairs'),
  category = COALESCE(category, 'Scholarship'),
  featured_image_url = COALESCE(featured_image_url, 'https://www.getfund.gov.gh/wp-content/uploads/2025/12/UVI-770x417.jpg')
WHERE slug = 'getfund-receives-delegation-university-virgin-islands'
  AND (excerpt IS NULL OR excerpt = '' OR body IS NULL OR body = '');

UPDATE content SET
  excerpt = 'GETFund received a transformative donation of One Million Ghana Cedis (GHS 1,000,000) from FuelTrade Ghana Limited.',
  body = '<p>The Ghana Education Trust Fund (GETFund) received a transformative donation of One Million Ghana Cedis (GHS 1,000,000) from FuelTrade Ghana Limited.</p><p>The donation demonstrates the private sector''s commitment to supporting education in Ghana and aligns with GETFund''s mission to mobilize resources for educational development.</p><p>GETFund Administrator Paul Adjei expressed gratitude for the generous contribution and called on other corporate entities to follow suit in supporting Ghana''s educational infrastructure.</p>',
  author = COALESCE(author, 'Corporate Affairs'),
  category = COALESCE(category, 'Donation'),
  featured_image_url = COALESCE(featured_image_url, 'https://www.getfund.gov.gh/wp-content/uploads/2025/12/Fuel-Trade-770x417.jpg')
WHERE slug = 'fueltrade-supports-getfund'
  AND (excerpt IS NULL OR excerpt = '' OR body IS NULL OR body = '');

UPDATE content SET
  excerpt = 'GETFund provides strategic funding to accelerate practical science education through the innovative STEMBox initiative.',
  body = '<p>The Ghana Education Trust Fund (GETFund) has announced strategic funding for the STEMBox Initiative, aimed at accelerating practical science education across Ghanaian schools.</p><p>The STEMBox program provides hands-on science kits and resources to schools, enabling students to engage in practical experiments and develop critical thinking skills in science, technology, engineering, and mathematics.</p><p>This initiative aligns with GETFund''s commitment to enhancing the quality of education through innovative programs and practical learning experiences.</p>',
  author = COALESCE(author, 'Corporate Affairs'),
  category = COALESCE(category, 'Education'),
  featured_image_url = COALESCE(featured_image_url, 'https://www.getfund.gov.gh/wp-content/uploads/2025/12/Admin@Stembox-770x417.png')
WHERE slug = 'getfund-accelerates-practical-science-education-stembox-initiative'
  AND (excerpt IS NULL OR excerpt = '' OR body IS NULL OR body = '');

UPDATE content SET
  excerpt = 'GETFund provides support to the Ghana National Research Fund through the provision of an office complex to enhance research activities.',
  body = '<p>The Ghana Education Trust Fund (GETFund) has provided support to the Ghana National Research Fund (GNRF) through the provision of a modern office complex.</p><p>This support underscores GETFund''s commitment to promoting research and development in Ghana''s educational sector.</p><p>The new facility will enable GNRF to better coordinate research activities and support academic research across the country.</p>',
  author = COALESCE(author, 'Corporate Affairs'),
  category = COALESCE(category, 'Infrastructure'),
  featured_image_url = COALESCE(featured_image_url, 'https://www.getfund.gov.gh/wp-content/uploads/2025/11/Research-2-770x417.png')
WHERE slug = 'getfund-supports-ghana-national-research-fund-office-complex'
  AND (excerpt IS NULL OR excerpt = '' OR body IS NULL OR body = '');

UPDATE content SET
  excerpt = 'GETFund drives historic expansion in educational infrastructure and learning resources under the 2026 national budget.',
  body = '<p>Under the 2026 national budget, GETFund is set to drive a historic expansion in educational infrastructure and learning resources across Ghana.</p><p>The budget allocation will support the construction and renovation of educational facilities at all levels, from basic schools to tertiary institutions.</p><p>This expansion reflects the government''s commitment to providing quality education for all Ghanaians through strategic investments in educational infrastructure.</p>',
  author = COALESCE(author, 'Corporate Affairs'),
  category = COALESCE(category, 'Budget'),
  featured_image_url = COALESCE(featured_image_url, 'https://www.getfund.gov.gh/wp-content/uploads/2025/11/Ato-Forson-770x417.jpg')
WHERE slug = '2026-budget-getfund-drives-historic-expansion-educational-infrastructure'
  AND (excerpt IS NULL OR excerpt = '' OR body IS NULL OR body = '');

UPDATE content SET
  excerpt = 'The Minister for Education announced that GETFund will commit GHC 50 million each year to support disability and inclusive education across the country.',
  body = '<p>The Minister for Education has announced that GETFund will commit GHC 50 million each year to support disability and inclusive education across the country.</p><p>This initiative aims to remove financial barriers for persons with disabilities pursuing tertiary education in Ghana.</p><p>The funding will cover tuition, accommodation, and other educational expenses for qualified students with disabilities at tertiary institutions.</p>',
  author = COALESCE(author, 'Corporate Affairs'),
  category = COALESCE(category, 'Scholarship'),
  featured_image_url = COALESCE(featured_image_url, 'https://www.getfund.gov.gh/wp-content/uploads/2025/10/AdminPresident-770x417.png')
WHERE slug = 'getfund-commit-ghc-50-million-yearly-free-tertiary-education-persons-disabilities'
  AND (excerpt IS NULL OR excerpt = '' OR body IS NULL OR body = '');

UPDATE content SET
  excerpt = 'The CEO of Students Loan Trust Fund paid a courtesy call on GETFund Administrator before launching an initiative benefiting persons with disabilities.',
  body = '<p>The CEO of Students Loan Trust Fund paid a courtesy call on GETFund''s Administrator ahead of the launch of the "No-Fee Stress" policy for Persons with Disabilities (PWDs).</p><p>The meeting focused on collaboration between the two institutions to support students with disabilities in accessing tertiary education.</p><p>The "No-Fee Stress" policy aims to eliminate financial barriers for PWDs pursuing higher education in Ghana.</p>',
  author = COALESCE(author, 'Corporate Affairs'),
  category = COALESCE(category, 'Courtesy Call'),
  featured_image_url = COALESCE(featured_image_url, 'https://www.getfund.gov.gh/wp-content/uploads/2025/10/Grp-Pix-770x417.jpg')
WHERE slug = 'ceo-students-loan-trust-fund-visits-getfund-no-fee-stress-policy-pwds'
  AND (excerpt IS NULL OR excerpt = '' OR body IS NULL OR body = '');

UPDATE content SET
  excerpt = 'GETFund has initiated major infrastructure projects at two Ambariya schools in Tamale with an 18-month completion timeline.',
  body = '<p>GETFund has initiated major infrastructure projects at two Ambariya schools in Tamale with an 18-month completion timeline.</p><p>The accelerated infrastructure program aims to provide modern educational facilities for students in the Northern Region.</p><p>The projects include construction of classroom blocks, dormitories, and other essential facilities to enhance learning conditions.</p>',
  author = COALESCE(author, 'Corporate Affairs'),
  category = COALESCE(category, 'Infrastructure'),
  featured_image_url = COALESCE(featured_image_url, 'https://www.getfund.gov.gh/wp-content/uploads/2025/10/AMbariya-2-770x417.png')
WHERE slug = 'getfund-commences-accelerated-infrastructure-program-ambariya-schools'
  AND (excerpt IS NULL OR excerpt = '' OR body IS NULL OR body = '');

UPDATE content SET
  excerpt = 'GETFund launched a significant initiative to address infrastructure gaps in Northern Region''s education sector.',
  body = '<p>GETFund launched a significant initiative to address infrastructure gaps in Northern Region''s education sector.</p><p>The multi-project construction program will provide new educational facilities across multiple schools in the region.</p><p>This initiative demonstrates GETFund''s commitment to ensuring equitable access to quality educational infrastructure across all regions of Ghana.</p>',
  author = COALESCE(author, 'Corporate Affairs'),
  category = COALESCE(category, 'Infrastructure'),
  featured_image_url = COALESCE(featured_image_url, 'https://www.getfund.gov.gh/wp-content/uploads/2025/10/Nobisco-1-770x417.png')
WHERE slug = 'getfund-kicks-off-multi-project-construction-northern-region'
  AND (excerpt IS NULL OR excerpt = '' OR body IS NULL OR body = '');

UPDATE content SET
  excerpt = 'GETFund launched infrastructure expansion at Ghana Senior High School with projects scheduled for 18-month completion.',
  body = '<p>GETFund launched infrastructure expansion at Ghana Senior High School with projects scheduled for 18-month completion.</p><p>The expansion includes new classroom blocks, laboratories, and dormitory facilities to accommodate the growing student population.</p><p>This project is part of GETFund''s broader initiative to improve educational infrastructure across the country.</p>',
  author = COALESCE(author, 'Corporate Affairs'),
  category = COALESCE(category, 'Infrastructure'),
  featured_image_url = COALESCE(featured_image_url, 'https://www.getfund.gov.gh/wp-content/uploads/2025/10/GHANASCO-770x417.png')
WHERE slug = 'getfund-launches-major-infrastructure-expansion-ghana-senior-high-school'
  AND (excerpt IS NULL OR excerpt = '' OR body IS NULL OR body = '');

UPDATE content SET
  excerpt = 'GETFund activated infrastructure project upgrade at Karaga Senior High School with financing secured and 18-month completion target.',
  body = '<p>GETFund activated infrastructure project upgrade at Karaga Senior High School with financing secured and 18-month completion target.</p><p>The ultra-modern facilities will include state-of-the-art classrooms, science laboratories, and student accommodation.</p><p>This investment underscores GETFund''s commitment to providing quality educational infrastructure in underserved areas.</p>',
  author = COALESCE(author, 'Corporate Affairs'),
  category = COALESCE(category, 'Infrastructure'),
  featured_image_url = COALESCE(featured_image_url, 'https://www.getfund.gov.gh/wp-content/uploads/2025/10/Karaga-blk-770x417.png')
WHERE slug = 'getfund-greenlight-construction-ultra-modern-infrastructure-karaga-shs'
  AND (excerpt IS NULL OR excerpt = '' OR body IS NULL OR body = '');

UPDATE content SET
  excerpt = 'GETFund officially began comprehensive infrastructural expansion at Pishigu Senior High School in Karaga District, Northern Region.',
  body = '<p>GETFund officially began comprehensive infrastructural expansion at Pishigu Senior High School in Karaga District, Northern Region.</p><p>The facility upgrade includes construction of new classroom blocks, dormitories, and essential amenities for students and staff.</p><p>This project is part of GETFund''s strategic initiative to improve educational facilities in the Northern Region.</p>',
  author = COALESCE(author, 'Corporate Affairs'),
  category = COALESCE(category, 'Infrastructure'),
  featured_image_url = COALESCE(featured_image_url, 'https://www.getfund.gov.gh/wp-content/uploads/2025/10/1-770x417.png')
WHERE slug = 'getfund-commences-major-facility-upgrade-pishigu-shs'
  AND (excerpt IS NULL OR excerpt = '' OR body IS NULL OR body = '');

UPDATE content SET
  excerpt = 'GETFund Administrator convened a staff durbar to set strategic goals for institutional innovation and growth.',
  body = '<p>GETFund''s Administrator convened a staff durbar to set strategic goals for institutional innovation and growth.</p><p>The meeting provided an opportunity for staff engagement and discussion of the organization''s strategic direction.</p><p>Key topics included operational efficiency, stakeholder engagement, and enhancing GETFund''s impact on education in Ghana.</p>',
  author = COALESCE(author, 'Corporate Affairs'),
  category = COALESCE(category, 'Staff Engagement'),
  featured_image_url = COALESCE(featured_image_url, 'https://www.getfund.gov.gh/wp-content/uploads/2025/10/SD1-770x417.jpg')
WHERE slug LIKE '%getfund-administrator-meets-with-staff%'
  AND (excerpt IS NULL OR excerpt = '' OR body IS NULL OR body = '');

UPDATE content SET
  excerpt = 'The Prisons Director General engaged GETFund to explore collaborative educational and vocational development programs for inmates.',
  body = '<p>The Director General of Prisons engaged GETFund to explore collaborative educational and vocational development programs for inmates.</p><p>The discussions focused on providing educational opportunities and skills training for prison inmates as part of their rehabilitation.</p><p>This partnership aims to equip inmates with skills that will enable them to reintegrate into society upon release.</p>',
  author = COALESCE(author, 'Corporate Affairs'),
  category = COALESCE(category, 'Partnership'),
  featured_image_url = COALESCE(featured_image_url, 'https://www.getfund.gov.gh/wp-content/uploads/2025/10/GETPrison-770x417.jpg')
WHERE slug = 'director-general-prisons-engages-getfund-inmate-rehabilitation-partnership'
  AND (excerpt IS NULL OR excerpt = '' OR body IS NULL OR body = '');

UPDATE content SET
  excerpt = 'GETFund hosted a delegation from Voorhees University during their Ghana working tour following an earlier memorandum of understanding.',
  body = '<p>GETFund hosted a delegation from Voorhees University during their Ghana working tour following an earlier memorandum of understanding.</p><p>The engagement focused on deepening educational collaboration and exploring scholarship opportunities for Ghanaian students.</p><p>Both institutions committed to strengthening their partnership for mutual benefit.</p>',
  author = COALESCE(author, 'Corporate Affairs'),
  category = COALESCE(category, 'Partnership'),
  featured_image_url = COALESCE(featured_image_url, 'https://www.getfund.gov.gh/wp-content/uploads/2025/10/1v-770x417.jpg')
WHERE slug = 'getfund-engages-voorhees-university-attraco-educational-collaboration'
  AND (excerpt IS NULL OR excerpt = '' OR body IS NULL OR body = '');

UPDATE content SET
  excerpt = 'GETFund embarked on a week-long working visit to the United Kingdom, meeting with Ghanaian students across nine universities.',
  body = '<p>GETFund embarked on a week-long working visit to the United Kingdom, where a delegation led by Deputy Administrator Hon. Alhassan Sualihu Dandaawa met with Ghanaian students across nine universities.</p><p>The visit provided an opportunity to engage with GETFund scholarship beneficiaries and assess their academic progress.</p><p>The delegation also explored opportunities for expanded collaboration with UK institutions.</p>',
  author = COALESCE(author, 'Corporate Affairs'),
  category = COALESCE(category, 'Scholarship'),
  featured_image_url = COALESCE(featured_image_url, 'https://www.getfund.gov.gh/wp-content/uploads/2025/10/WhatsApp-Image-2025-10-17-at-12.06.03_7eee427d-770x417.jpg')
WHERE slug = 'photo-gallery-getfund-tours-uk-universities-engage-ghanaian-scholars'
  AND (excerpt IS NULL OR excerpt = '' OR body IS NULL OR body = '');

UPDATE content SET
  excerpt = 'A four-member GETFund delegation visited the UK from June 21-30, 2025, led by the Deputy Administrator to monitor scholarship beneficiaries.',
  body = '<p>A four-member GETFund delegation visited the UK from June 21-30, 2025, led by the Deputy Administrator.</p><p>The visit aimed to monitor the progress of GETFund scholarship beneficiaries studying at various UK universities.</p><p>The delegation engaged with students and university officials to assess academic performance and support needs.</p>',
  author = COALESCE(author, 'Corporate Affairs'),
  category = COALESCE(category, 'Scholarship'),
  featured_image_url = COALESCE(featured_image_url, 'https://www.getfund.gov.gh/wp-content/uploads/2025/10/WhatsApp-Image-2025-10-17-at-12.06.14_c80190aa-770x417.jpg')
WHERE slug = 'strengthening-educational-ties-getfund-monitors-scholars-uk'
  AND (excerpt IS NULL OR excerpt = '' OR body IS NULL OR body = '');

UPDATE content SET
  excerpt = 'A 3-day orientation workshop was held for seventeen board members at Peduase, Aburi.',
  body = '<p>A 3-day orientation workshop was held for seventeen board members of the 7th GETFund Board of Trustees at Peduase, Aburi.</p><p>The workshop provided board members with comprehensive knowledge of GETFund''s mandate, operations, and strategic priorities.</p><p>This orientation aims to equip board members with the information needed to effectively guide the organization.</p>',
  author = COALESCE(author, 'Corporate Affairs'),
  category = COALESCE(category, 'Governance'),
  featured_image_url = COALESCE(featured_image_url, 'https://www.getfund.gov.gh/wp-content/uploads/2025/06/S8509226-770x417.jpg')
WHERE slug = 'getfund-holds-orientation-workshop-7th-board-trustees'
  AND (excerpt IS NULL OR excerpt = '' OR body IS NULL OR body = '');

UPDATE content SET
  excerpt = 'Head of Scholarship unit Mrs. Phillida Lamptey engaged students at the EDUAID Scholarship Summit & Study Abroad Fair.',
  body = '<p>Head of GETFund''s Scholarship unit Mrs. Phillida Lamptey engaged students at the "EDUAID Scholarship Summit & Study Abroad Fair" at the University of Cape Coast.</p><p>The engagement provided students with information about GETFund scholarship opportunities and application procedures.</p><p>Students received guidance on pursuing both local and international educational opportunities.</p>',
  author = COALESCE(author, 'Corporate Affairs'),
  category = COALESCE(category, 'Scholarship'),
  featured_image_url = COALESCE(featured_image_url, 'https://www.getfund.gov.gh/wp-content/uploads/2025/10/Scholars.png')
WHERE slug = 'getfund-scholarship-unit-engages-university-cape-coast-students'
  AND (excerpt IS NULL OR excerpt = '' OR body IS NULL OR body = '');

UPDATE content SET
  excerpt = 'Ghana Armed Forces Chief of Defence Staff Lt. Gen William Agyapong met with GETFund Administrator Paul Adjei.',
  body = '<p>Ghana Armed Forces Chief of Defence Staff Lt. Gen William Agyapong met with GETFund Administrator Paul Adjei.</p><p>The meeting explored potential areas of collaboration between GETFund and the Ghana Armed Forces in educational development.</p><p>Discussions focused on supporting military educational institutions and personnel development programs.</p>',
  author = COALESCE(author, 'Corporate Affairs'),
  category = COALESCE(category, 'Courtesy Call'),
  featured_image_url = COALESCE(featured_image_url, 'https://www.getfund.gov.gh/wp-content/uploads/2025/05/CDS-565x417.png')
WHERE slug = 'gaf-cds-interacts-getfund-administrator'
  AND (excerpt IS NULL OR excerpt = '' OR body IS NULL OR body = '');

UPDATE content SET
  excerpt = 'Education Minister Hon. Haruna Iddrisu inaugurated the 7th GETFund Board of Trustees on April 11, 2025.',
  body = '<p>Education Minister Hon. Haruna Iddrisu inaugurated the 7th GETFund Board of Trustees on April 11, 2025.</p><p>The new board comprises seventeen distinguished Ghanaians with expertise in education, finance, and public administration.</p><p>The Minister charged the board to ensure efficient use of GETFund resources for maximum impact on Ghana''s educational sector.</p>',
  author = COALESCE(author, 'Corporate Affairs'),
  category = COALESCE(category, 'Governance'),
  featured_image_url = COALESCE(featured_image_url, 'https://www.getfund.gov.gh/wp-content/uploads/2025/04/S8507439-770x417.jpg')
WHERE slug = 'minister-education-inaugurates-7th-getfund-board'
  AND (excerpt IS NULL OR excerpt = '' OR body IS NULL OR body = '');

UPDATE content SET
  excerpt = 'Administrator Paul Adjei met with Conference of Heads of Assisted Secondary Schools leadership in Kumasi.',
  body = '<p>Administrator Paul Adjei met with the leadership of the Conference of Heads of Assisted Secondary Schools (CHASS) in Kumasi.</p><p>The engagement focused on addressing infrastructure needs and operational challenges facing assisted secondary schools.</p><p>GETFund reaffirmed its commitment to supporting secondary education through continued investments.</p>',
  author = COALESCE(author, 'Corporate Affairs'),
  category = COALESCE(category, 'Education'),
  featured_image_url = COALESCE(featured_image_url, 'https://www.getfund.gov.gh/wp-content/uploads/2025/03/ST856505-770x417.jpg')
WHERE slug LIKE '%getfund-administrator-engages-chass-leadership%'
  AND (excerpt IS NULL OR excerpt = '' OR body IS NULL OR body = '');

UPDATE content SET
  excerpt = 'GETFund Administrator advocated for innovative and diversified funding sources for school infrastructure development.',
  body = '<p>GETFund Administrator advocated for "innovative and diversified funding sources" for school infrastructure development.</p><p>The call for private sector participation aims to complement government funding and accelerate infrastructure development.</p><p>This approach seeks to address the growing demand for educational facilities across Ghana.</p>',
  author = COALESCE(author, 'Corporate Affairs'),
  category = COALESCE(category, 'Infrastructure'),
  featured_image_url = COALESCE(featured_image_url, 'https://www.getfund.gov.gh/wp-content/uploads/2025/02/S8502069-770x417.jpg')
WHERE slug = 'advocacy-private-sector-led-school-infrastructure-development'
  AND (excerpt IS NULL OR excerpt = '' OR body IS NULL OR body = '');

UPDATE content SET
  excerpt = 'Paul Adjei officially began his tenure as GETFund Administrator and held his first management meeting.',
  body = '<p>Mr. Paul Adjei officially began his tenure as GETFund Administrator and held his first management meeting.</p><p>In his opening remarks, the new Administrator outlined his vision for the organization and priorities for his tenure.</p><p>He emphasized commitment to transparency, efficiency, and maximizing the impact of GETFund resources on education.</p>',
  author = COALESCE(author, 'Corporate Affairs'),
  category = COALESCE(category, 'Administration'),
  featured_image_url = COALESCE(featured_image_url, 'https://www.getfund.gov.gh/wp-content/uploads/2025/02/ST852075-770x417.jpg')
WHERE slug = 'paul-adjei-assumes-office-getfund-administrator'
  AND (excerpt IS NULL OR excerpt = '' OR body IS NULL OR body = '');

-- 2024 Articles
UPDATE content SET
  excerpt = 'Former Administrator Dr. Richard Ampofo Boadu received a presidential state award from President Akufo-Addo.',
  body = '<p>Former GETFund Administrator Dr. Richard Ampofo Boadu received a presidential state award for outstanding public service from President Nana Addo Dankwa Akufo-Addo.</p><p>The award recognizes Dr. Boadu''s distinguished service and contributions to Ghana''s educational sector during his tenure.</p><p>The ceremony highlighted the importance of dedicated public service in national development.</p>',
  author = COALESCE(author, 'Corporate Affairs'),
  category = COALESCE(category, 'Award'),
  featured_image_url = COALESCE(featured_image_url, 'https://www.getfund.gov.gh/wp-content/uploads/2024/12/ST850255-714x417.jpg')
WHERE slug = 'getfund-administrator-receives-state-award-outstanding-public-service'
  AND (excerpt IS NULL OR excerpt = '' OR body IS NULL OR body = '');

UPDATE content SET
  excerpt = 'The Board of Trustees of GETFund inaugurated a modern four-storey headquarters building on Monday, 23rd December 2024.',
  body = '<p>The Board of Trustees of the Ghana Education Trust Fund (GETFund) inaugurated a modern four-storey headquarters building on Monday, 23rd December 2024.</p><p>The new headquarters provides modern office facilities for GETFund staff and enhances operational efficiency.</p><p>The building represents GETFund''s commitment to institutional development and improved service delivery.</p>',
  author = COALESCE(author, 'Corporate Affairs'),
  category = COALESCE(category, 'Infrastructure'),
  featured_image_url = COALESCE(featured_image_url, 'https://www.getfund.gov.gh/wp-content/uploads/2025/01/IMGG_9999_244-770x417.jpg')
WHERE slug = 'getfund-inaugurates-four-storey-headquarters-building'
  AND (excerpt IS NULL OR excerpt = '' OR body IS NULL OR body = '');

UPDATE content SET
  excerpt = 'Your success is not just personal but also a sacred trust - GETFund Administrator tells new pastors at graduation.',
  body = '<p>"Your success is not just personal but also a sacred trust" - GETFund Administrator told new pastors at the 2024 Trinity Theological Seminary graduation ceremony.</p><p>The Administrator encouraged graduates to use their education for the benefit of society and national development.</p><p>GETFund has supported numerous students at the seminary through its scholarship programs.</p>',
  author = COALESCE(author, 'Corporate Affairs'),
  category = COALESCE(category, 'Education'),
  featured_image_url = COALESCE(featured_image_url, 'https://www.getfund.gov.gh/wp-content/uploads/2024/11/1Z0A7382-770x417.jpg')
WHERE slug = '2024-trinity-theological-seminary-graduation'
  AND (excerpt IS NULL OR excerpt = '' OR body IS NULL OR body = '');

UPDATE content SET
  excerpt = 'GETFund provides scholarship grants to Ghana Teacher Prize recipients and finalists through its Administrator.',
  body = '<p>GETFund provides scholarship grants to Ghana Teacher Prize recipients and finalists through its Administrator.</p><p>The scholarships recognize outstanding teachers and support their continued professional development.</p><p>This initiative demonstrates GETFund''s commitment to supporting educators in Ghana.</p>',
  author = COALESCE(author, 'Corporate Affairs'),
  category = COALESCE(category, 'Scholarship'),
  featured_image_url = COALESCE(featured_image_url, 'https://www.getfund.gov.gh/wp-content/uploads/2024/10/86B6195-770x417.jpg')
WHERE slug = 'getfund-grants-scholarships-gtp-finalists'
  AND (excerpt IS NULL OR excerpt = '' OR body IS NULL OR body = '');

UPDATE content SET
  excerpt = 'GETFund Administrator provides guidance to tertiary institutions on diverse financing options for educational development.',
  body = '<p>GETFund Administrator provided guidance to tertiary institutions on diverse financing options for educational development.</p><p>The engagement aimed to help institutions explore sustainable funding mechanisms beyond government support.</p><p>Discussions covered partnerships, endowment funds, and other innovative financing approaches.</p>',
  author = COALESCE(author, 'Corporate Affairs'),
  category = COALESCE(category, 'Education'),
  featured_image_url = COALESCE(featured_image_url, 'https://www.getfund.gov.gh/wp-content/uploads/2024/04/ST857443-770x417.jpg')
WHERE slug = 'getfund-administrator-counsels-tertiary-institutions-financing-options'
  AND (excerpt IS NULL OR excerpt = '' OR body IS NULL OR body = '');

UPDATE content SET
  excerpt = 'GETFund Administrator engages media practitioners in Kumasi to discuss the organization''s activities and achievements.',
  body = '<p>GETFund Administrator engaged media practitioners in Kumasi to discuss the organization''s activities and achievements.</p><p>The engagement provided an opportunity to share updates on GETFund projects and respond to media inquiries.</p><p>The Administrator emphasized the importance of media partnership in communicating GETFund''s impact.</p>',
  author = COALESCE(author, 'Corporate Affairs'),
  category = COALESCE(category, 'Media Engagement'),
  featured_image_url = COALESCE(featured_image_url, 'https://www.getfund.gov.gh/wp-content/uploads/2024/04/9CCC830E-CBF2-4AFA-B485-AAE9B0B623D4-770x417.jpg')
WHERE slug = 'getfund-administrator-engages-media-kumasi'
  AND (excerpt IS NULL OR excerpt = '' OR body IS NULL OR body = '');

-- 2023 Articles
UPDATE content SET
  excerpt = 'GETFund announces improvements to scholarship application and processing procedures.',
  body = '<p>GETFund announces improvements to scholarship application and processing procedures.</p><p>The enhancements aim to make the scholarship process more transparent, efficient, and accessible to all qualified applicants.</p><p>These improvements reflect GETFund''s commitment to supporting more Ghanaian students in their educational pursuits.</p>',
  author = COALESCE(author, 'Corporate Affairs'),
  category = COALESCE(category, 'Scholarship'),
  featured_image_url = COALESCE(featured_image_url, 'https://www.getfund.gov.gh/wp-content/uploads/2023/09/GETFund-Press-Release-Cover-770x417.jpg')
WHERE slug = 'scholarship-processes-getfund-improved'
  AND (excerpt IS NULL OR excerpt = '' OR body IS NULL OR body = '');

UPDATE content SET
  excerpt = 'GETFund Administrator encourages universities to explore innovative approaches to generating alternative revenue.',
  body = '<p>GETFund Administrator encourages universities to explore innovative approaches to generating alternative revenue.</p><p>The call emphasizes the need for tertiary institutions to diversify funding sources beyond government allocations.</p><p>Suggested approaches include industry partnerships, consultancy services, and endowment funds.</p>',
  author = COALESCE(author, 'Corporate Affairs'),
  category = COALESCE(category, 'Education'),
  featured_image_url = COALESCE(featured_image_url, 'https://www.getfund.gov.gh/wp-content/uploads/2023/09/S8503168-770x417.jpg')
WHERE slug = 'administrator-urges-universities-innovative-alternative-revenue-streams'
  AND (excerpt IS NULL OR excerpt = '' OR body IS NULL OR body = '');

UPDATE content SET
  excerpt = 'Government through GETFund awards new scholarships to 4,279 students at local tertiary institutions.',
  body = '<p>Government through GETFund awards new scholarships to 4,279 students at local tertiary institutions.</p><p>The scholarships cover tuition and other educational expenses for qualified students across various fields of study.</p><p>This initiative reflects continued commitment to making tertiary education accessible to all Ghanaians.</p>',
  author = COALESCE(author, 'Corporate Affairs'),
  category = COALESCE(category, 'Scholarship'),
  featured_image_url = COALESCE(featured_image_url, 'https://www.getfund.gov.gh/wp-content/uploads/2023/08/Unknown-1-770x417.jpeg')
WHERE slug = 'government-grants-new-scholarships-4279-local-tertiary-students'
  AND (excerpt IS NULL OR excerpt = '' OR body IS NULL OR body = '');

UPDATE content SET
  excerpt = 'GETFund clarifies that it has not used its receivables to borrow $1.5 billion, addressing media reports.',
  body = '<p>GETFund clarifies that it has not used its receivables to borrow $1.5 billion, addressing media reports.</p><p>The statement aims to correct misinformation and provide accurate information about GETFund''s financial operations.</p><p>GETFund remains committed to transparency in all its financial dealings.</p>',
  author = COALESCE(author, 'Corporate Affairs'),
  category = COALESCE(category, 'Press Release'),
  featured_image_url = COALESCE(featured_image_url, 'https://www.getfund.gov.gh/wp-content/uploads/2023/07/S8500045-1-770x417.jpg')
WHERE slug = 'getfund-has-not-used-receivables-borrow-1-5-billion'
  AND (excerpt IS NULL OR excerpt = '' OR body IS NULL OR body = '');

UPDATE content SET
  excerpt = 'A delegation from Voorhees University visited GETFund to explore partnership opportunities.',
  body = '<p>A delegation from Voorhees University visited GETFund to explore partnership opportunities.</p><p>The visit focused on scholarship programs and educational exchange opportunities for Ghanaian students.</p><p>Both institutions expressed commitment to fostering educational collaboration.</p>',
  author = COALESCE(author, 'Corporate Affairs'),
  category = COALESCE(category, 'Courtesy Call'),
  featured_image_url = COALESCE(featured_image_url, 'https://www.getfund.gov.gh/wp-content/uploads/2023/04/DSC_03245-770x417.jpg')
WHERE slug = 'voorhees-university-delegation-calls-getfund'
  AND (excerpt IS NULL OR excerpt = '' OR body IS NULL OR body = '');

UPDATE content SET
  excerpt = 'A delegation from Carleton University in Ottawa, Canada visited to discuss partnership with regards to scholarship opportunities.',
  body = '<p>A delegation from Carleton University in Ottawa, Canada visited GETFund to discuss "partnership with regards to scholarship opportunities for GETFund future awardees."</p><p>The meeting explored potential collaboration in supporting Ghanaian students pursuing education in Canada.</p><p>Both parties expressed interest in formalizing the partnership through an MOU.</p>',
  author = COALESCE(author, 'Corporate Affairs'),
  category = COALESCE(category, 'Courtesy Call'),
  featured_image_url = COALESCE(featured_image_url, 'https://www.getfund.gov.gh/wp-content/uploads/2023/03/5H8A3236-770x417.jpg')
WHERE slug = 'carleton-university-pays-courtesy-call-getfund'
  AND (excerpt IS NULL OR excerpt = '' OR body IS NULL OR body = '');

UPDATE content SET
  excerpt = 'A high-powered delegation from the Ghana Armed Forces, led by the Chief of Defense Staff, visited GETFund.',
  body = '<p>A high-powered delegation from the Ghana Armed Forces, led by the Chief of Defense Staff (CDS), Vice Admiral Seth Amoama visited GETFund on 21 February 2023.</p><p>The courtesy call explored areas of collaboration between GETFund and the military in educational development.</p><p>Discussions included support for military educational institutions and training programs.</p>',
  author = COALESCE(author, 'Corporate Affairs'),
  category = COALESCE(category, 'Courtesy Call'),
  featured_image_url = COALESCE(featured_image_url, 'https://www.getfund.gov.gh/wp-content/uploads/2023/02/1Z0A9913-770x417.jpg')
WHERE slug = 'military-high-command-pays-courtesy-call-getfund-administrator'
  AND (excerpt IS NULL OR excerpt = '' OR body IS NULL OR body = '');

UPDATE content SET
  excerpt = 'A four-member delegation from Tanzania''s Higher Education Students Loans Board visited GETFund.',
  body = '<p>A four-member delegation from Tanzania''s Higher Education Students Loans Board (HESLB) visited GETFund.</p><p>The visit provided an opportunity for knowledge exchange on educational financing mechanisms.</p><p>Both organizations discussed best practices in student support and scholarship administration.</p>',
  author = COALESCE(author, 'Corporate Affairs'),
  category = COALESCE(category, 'Courtesy Call'),
  featured_image_url = COALESCE(featured_image_url, 'https://www.getfund.gov.gh/wp-content/uploads/2023/03/1Z0A0148-770x417.jpg')
WHERE slug = 'delegation-heslb-tanzania-visits-getfund'
  AND (excerpt IS NULL OR excerpt = '' OR body IS NULL OR body = '');

UPDATE content SET
  excerpt = 'Administrator Dr. Richard Ampofo Boadu counseled the National Union of Ghana Students leadership.',
  body = '<p>Administrator Dr. Richard Ampofo Boadu counseled the National Union of Ghana Students (NUGS) leadership.</p><p>The engagement provided a platform for student leaders to share concerns and receive guidance on educational matters.</p><p>The Administrator encouraged students to take advantage of GETFund scholarship opportunities.</p>',
  author = COALESCE(author, 'Corporate Affairs'),
  category = COALESCE(category, 'Student Engagement'),
  featured_image_url = COALESCE(featured_image_url, 'https://www.getfund.gov.gh/wp-content/uploads/2023/02/S8509378-770x417.jpg')
WHERE slug = 'getfund-administrator-interacts-nugs-leadership'
  AND (excerpt IS NULL OR excerpt = '' OR body IS NULL OR body = '');

-- 2022 Articles
UPDATE content SET
  excerpt = 'GETFund announces local scholarship application period from Monday, 12th December 2022 through Tuesday, 31st January 2023.',
  body = '<p>GETFund announces local scholarship application period from Monday, 12th December 2022 through Tuesday, 31st January 2023 for postgraduate programs.</p><p>Eligible students are encouraged to apply through the official GETFund portal.</p><p>The scholarships cover various postgraduate programs at accredited institutions.</p>',
  author = COALESCE(author, 'Corporate Affairs'),
  category = COALESCE(category, 'Scholarship'),
  featured_image_url = COALESCE(featured_image_url, 'https://www.getfund.gov.gh/wp-content/uploads/2022/12/Home-background-with-Dark-Cover-copywrite-770x417.jpg')
WHERE slug = 'getfund-2022-23-local-scholarship-application'
  AND (excerpt IS NULL OR excerpt = '' OR body IS NULL OR body = '');

UPDATE content SET
  excerpt = 'A Kenyan delegation from the Universities Fund visited GETFund to learn about its operations and mandate.',
  body = '<p>A Kenyan delegation from the Universities Fund visited GETFund to learn about its operations and mandate.</p><p>The visit provided an opportunity for knowledge sharing on educational funding mechanisms.</p><p>Both organizations explored potential areas of collaboration.</p>',
  author = COALESCE(author, 'Corporate Affairs'),
  category = COALESCE(category, 'Courtesy Call'),
  featured_image_url = COALESCE(featured_image_url, 'https://www.getfund.gov.gh/wp-content/uploads/2022/10/S8507486-770x417.jpg')
WHERE slug = 'universities-fund-kenya-understudies-getfund'
  AND (excerpt IS NULL OR excerpt = '' OR body IS NULL OR body = '');

UPDATE content SET
  excerpt = 'Board and management held a stakeholder engagement forum at the Academy of Arts and Sciences in Accra.',
  body = '<p>GETFund Board and management held a stakeholder engagement forum at the Academy of Arts and Sciences in Accra.</p><p>The forum provided an opportunity to account to the public on GETFund''s activities and achievements.</p><p>Stakeholders were briefed on ongoing projects and future plans.</p>',
  author = COALESCE(author, 'Corporate Affairs'),
  category = COALESCE(category, 'Stakeholder Engagement'),
  featured_image_url = COALESCE(featured_image_url, 'https://www.getfund.gov.gh/wp-content/uploads/2022/11/5H8A0438-770x417.jpg')
WHERE slug = 'getfund-accounts-to-public-stakeholder-forum'
  AND (excerpt IS NULL OR excerpt = '' OR body IS NULL OR body = '');

UPDATE content SET
  excerpt = 'Administrator inspected a lecture hall and office complex project at University for Development Studies.',
  body = '<p>GETFund Administrator inspected a lecture hall and office complex project at the University for Development Studies (UDS).</p><p>The inspection assessed progress on the GETFund-funded infrastructure project.</p><p>The Administrator expressed satisfaction with the pace of work and encouraged timely completion.</p>',
  author = COALESCE(author, 'Corporate Affairs'),
  category = COALESCE(category, 'Infrastructure'),
  featured_image_url = COALESCE(featured_image_url, 'https://www.getfund.gov.gh/wp-content/uploads/2022/09/IMG_6526-770x417.jpg')
WHERE slug = 'getfund-administrator-inspects-uds-project'
  AND (excerpt IS NULL OR excerpt = '' OR body IS NULL OR body = '');

UPDATE content SET
  excerpt = 'Administrator visited the Northern Sector office in Tamale on 3 October 2022.',
  body = '<p>GETFund Administrator visited the Northern Sector office in Tamale on 3 October 2022.</p><p>The working visit provided an opportunity to engage with staff and assess operations in the northern zone.</p><p>The Administrator discussed strategies for accelerating project delivery in the region.</p>',
  author = COALESCE(author, 'Corporate Affairs'),
  category = COALESCE(category, 'Administration'),
  featured_image_url = COALESCE(featured_image_url, 'https://www.getfund.gov.gh/wp-content/uploads/2022/05/IMG_6421-770x417.jpg')
WHERE slug = 'getfund-administrator-pays-working-visit-northern-sector-office'
  AND (excerpt IS NULL OR excerpt = '' OR body IS NULL OR body = '');

UPDATE content SET
  excerpt = 'Board subcommittee led by Chair Ms. Aretha A.A Duku monitored twenty selected ongoing project sites in the Eastern Region.',
  body = '<p>GETFund Board subcommittee led by Chair Ms. Aretha A.A Duku monitored "twenty (20) selected ongoing project sites in the Eastern Region."</p><p>The tour assessed project progress and quality of infrastructure development.</p><p>The Board expressed commitment to ensuring timely completion of all projects.</p>',
  author = COALESCE(author, 'Corporate Affairs'),
  category = COALESCE(category, 'Project Monitoring'),
  featured_image_url = COALESCE(featured_image_url, 'https://www.getfund.gov.gh/wp-content/uploads/2022/09/MG_9824-770x417.jpg')
WHERE slug = 'getfund-board-trustees-tours-projects-eastern-region'
  AND (excerpt IS NULL OR excerpt = '' OR body IS NULL OR body = '');

UPDATE content SET
  excerpt = 'On 26 May 2022, the Vice President handed over 75 buses and 5 Pickup trucks to some heads of Senior High Schools across Ghana.',
  body = '<p>On 26 May 2022, the Vice President handed over "75 buses and 5 Pickup trucks to some heads of Senior High Schools across Ghana."</p><p>The vehicles will support student transportation and school operations.</p><p>This donation demonstrates the government''s commitment to supporting Free SHS implementation.</p>',
  author = COALESCE(author, 'Corporate Affairs'),
  category = COALESCE(category, 'Donation'),
  featured_image_url = COALESCE(featured_image_url, 'https://www.getfund.gov.gh/wp-content/uploads/2022/06/blog-1-1-770x417-1.jpg')
WHERE slug = 'vice-president-hands-over-buses-pickups-schools'
  AND (excerpt IS NULL OR excerpt = '' OR body IS NULL OR body = '');

UPDATE content SET
  excerpt = 'Daakye Trust PLC held the first Annual General Meeting focusing on financial matters.',
  body = '<p>Daakye Trust PLC held "the first Annual General Meeting (AGM) of the Daakye Trust PLC" with focus on financial matters.</p><p>The meeting reviewed the organization''s performance and set strategic direction for the coming year.</p><p>Shareholders received updates on investments and financial position.</p>',
  author = COALESCE(author, 'Corporate Affairs'),
  category = COALESCE(category, 'Corporate'),
  featured_image_url = COALESCE(featured_image_url, 'https://www.getfund.gov.gh/wp-content/uploads/2022/05/blog-1-1-770x417-1.jpg')
WHERE slug = 'daakye-trust-plc-holds-inaugural-agm-accra'
  AND (excerpt IS NULL OR excerpt = '' OR body IS NULL OR body = '');

UPDATE content SET
  excerpt = 'GETFund details educational sector development priorities under current administration.',
  body = '<p>GETFund details educational sector development priorities under current administration.</p><p>The organization outlines its strategic approach to accelerating educational infrastructure development across Ghana.</p><p>Key focus areas include classroom construction, laboratory facilities, and dormitory projects.</p>',
  author = COALESCE(author, 'Corporate Affairs'),
  category = COALESCE(category, 'Infrastructure'),
  featured_image_url = COALESCE(featured_image_url, 'https://www.getfund.gov.gh/wp-content/uploads/2022/01/GETFund-News-2-2-1024x683-1-770x417.jpg')
WHERE slug = 'getfund-bold-march-educational-infrastructure'
  AND (excerpt IS NULL OR excerpt = '' OR body IS NULL OR body = '');

UPDATE content SET
  excerpt = 'Government is committed to the completion of Educational Sector Infrastructure projects.',
  body = '<p>"Government is committed to the completion of Educational Sector Infrastructure projects."</p><p>GETFund provides updates on ongoing infrastructure projects and completion timelines.</p><p>The update addresses stakeholder concerns and reaffirms commitment to project delivery.</p>',
  author = COALESCE(author, 'Corporate Affairs'),
  category = COALESCE(category, 'Press Release'),
  featured_image_url = COALESCE(featured_image_url, 'https://www.getfund.gov.gh/wp-content/uploads/2022/05/Screenshot-2022-06-24-at-11.14.12-PM-770x417.png')
WHERE slug = 'press-update-infrastructure-projects'
  AND (excerpt IS NULL OR excerpt = '' OR body IS NULL OR body = '');

UPDATE content SET
  excerpt = 'GETFund receives Parliamentary approval for project completion.',
  body = '<p>GETFund received Parliamentary approval for project completion.</p><p>The approval enables the organization to proceed with financing for key educational infrastructure projects.</p><p>This milestone demonstrates Parliamentary confidence in GETFund''s mandate.</p>',
  author = COALESCE(author, 'Corporate Affairs'),
  category = COALESCE(category, 'Governance'),
  featured_image_url = COALESCE(featured_image_url, 'https://www.getfund.gov.gh/wp-content/uploads/2021/12/GETFund-News-1-1-1024x683-1-770x417.jpg')
WHERE slug = 'getfund-obtains-parliamentary-nod'
  AND (excerpt IS NULL OR excerpt = '' OR body IS NULL OR body = '');

UPDATE content SET
  excerpt = '453 GETFund sponsored projects have been initiated in the Volta Region.',
  body = '<p>"453 GETFund sponsored projects have been initiated in the Volta Region."</p><p>The first quarter project monitoring exercise assessed progress and quality of work on ongoing projects.</p><p>The monitoring team engaged with contractors and beneficiary institutions.</p>',
  author = COALESCE(author, 'Corporate Affairs'),
  category = COALESCE(category, 'Project Monitoring'),
  featured_image_url = COALESCE(featured_image_url, 'https://www.getfund.gov.gh/wp-content/uploads/2022/03/Volt-Monitoring-1-770x417-1.jpg')
WHERE slug = 'getfund-completes-q1-project-monitoring-volta-region'
  AND (excerpt IS NULL OR excerpt = '' OR body IS NULL OR body = '');

-- 2021 and 2020 Articles
UPDATE content SET
  excerpt = 'GETFund conducted a scholarship monitoring visit to the United Kingdom.',
  body = '<p>GETFund conducted a scholarship monitoring visit to the United Kingdom.</p><p>The visit assessed the progress and welfare of GETFund scholarship beneficiaries studying in the UK.</p><p>The monitoring team engaged with students and university officials.</p>',
  author = COALESCE(author, 'Corporate Affairs'),
  category = COALESCE(category, 'Scholarship'),
  featured_image_url = COALESCE(featured_image_url, 'https://www.getfund.gov.gh/wp-content/uploads/2022/01/GETFund-News-3-3-1024x683-1-770x417.jpg')
WHERE slug = '2021-scholarship-monitoring-programme'
  AND (excerpt IS NULL OR excerpt = '' OR body IS NULL OR body = '');

UPDATE content SET
  excerpt = 'Discussion of Free Senior High School policy achievements and educational infrastructure development.',
  body = '<p>The State of the Nation Address (SONA) 2020 highlighted achievements in educational infrastructure development.</p><p>Key focus areas included the Free Senior High School policy and its impact on access to education.</p><p>GETFund''s contributions to infrastructure development were acknowledged.</p>',
  author = COALESCE(author, 'Corporate Affairs'),
  category = COALESCE(category, 'Policy'),
  featured_image_url = COALESCE(featured_image_url, 'https://www.getfund.gov.gh/wp-content/uploads/2022/01/SONA-GETFund-1-770x417-1.jpg')
WHERE slug = 'sona-2020-educational-infrastructure'
  AND (excerpt IS NULL OR excerpt = '' OR body IS NULL OR body = '');

-- Also update any articles that might only have empty strings instead of NULL
UPDATE content SET
  excerpt = NULL
WHERE excerpt = '' AND type = 'news';

UPDATE content SET
  body = NULL
WHERE body = '' AND type = 'news';

-- Force update articles with missing info regardless of conditional
-- This ensures all articles have proper content
UPDATE content SET
  author = 'Corporate Affairs'
WHERE author IS NULL AND type = 'news';
