-- Fix news articles: Remove duplicates and update with full content
-- Migration: 039_fix_news_duplicates_and_content.sql

-- Step 1: Remove duplicate articles (keep the one with more content or older ID)
-- First, identify and delete duplicates keeping the one with longer body content

WITH duplicates AS (
  SELECT id, title, body,
    ROW_NUMBER() OVER (
      PARTITION BY title 
      ORDER BY 
        CASE WHEN body IS NOT NULL AND LENGTH(body) > 100 THEN 0 ELSE 1 END,
        LENGTH(COALESCE(body, '')) DESC,
        created_at ASC
    ) as rn
  FROM content
  WHERE type = 'news' AND deleted_at IS NULL
)
DELETE FROM content 
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);

-- Step 2: Update articles with full content

-- GETFund Deputy Administrator Visits Schools Affected by Fire
UPDATE content SET
  body = '<p>Ghana Education Trust Fund''s Deputy Administrator Hon. Sualihu Dandaawa visited two senior high schools in the Northern Region following catastrophic fire incidents that displaced over 1,000 female students.</p>
<p>The fires occurred at Northern Business Senior High School (NOBISCO) on January 28, displacing 900 students, and Tolon SHS on February 2, displacing 173 students. Beyond structural damage, affected students lost personal belongings and experienced significant trauma.</p>
<p>During the visit representing Administrator Paul Adjei, the Deputy Administrator expressed sympathy to both institutions and emphasized GETFund''s commitment to educational continuity. He stated: "Our priority is to restore normalcy. We are working around the clock to ensure repairs begin at the earliest possible time so that these students can return to decent dormitories and focus on their studies."</p>
<p>Key directives issued include expedited comprehensive damage assessment by Northern Zone leadership, fast-tracked repair initiatives to restore safe dormitory conditions, and focus on providing conducive learning environments.</p>
<p>GETFund remains dedicated to its infrastructure mandate across Ghana''s educational institutions.</p>',
  featured_image_url = 'https://www.getfund.gov.gh/wp-content/uploads/2026/02/Dept-1024x768.png'
WHERE slug LIKE '%deputy-administrator-visits-schools-affected-by-fire%' AND type = 'news';

-- Chief Justice Calls on GETFund
UPDATE content SET
  body = '<p>Chief Justice Paul Baffoe Bonnie visited GETFund Administrator Paul Adjei to request support for transforming Ghana''s legal education system. The Chief Justice outlined plans to restructure legal professional training, establish computerized bar examination testing centers modeled after international standards, and modernize aging facilities currently overcrowded beyond capacity.</p>
<p>The proposed General Legal Council Bill, currently in Parliament, would create new accreditation standards and an inspectorate system. Current law school facilities were designed for approximately 80 students but now serve thousands, making infrastructure upgrades essential.</p>
<p>GETFund pledged to establish dedicated budget lines for judicial infrastructure and leverage partnerships with institutions like Temple University and Johns Hopkins to provide scholarships for Ghanaian law students pursuing advanced degrees abroad.</p>
<p>The organization also announced a new fundraising department and a tax deduction agreement with Ghana Revenue Authority, allowing companies to claim contributions as tax deductions.</p>
<p>The Chief Justice emphasized this partnership aligns with broader educational development goals, accompanied by Prof. Raymond Atuguba and Judicial Secretary Musah Ahmed Esq.</p>',
  featured_image_url = 'https://www.getfund.gov.gh/wp-content/uploads/2026/02/CJ-1024x678.png'
WHERE slug LIKE '%chief-justice%judicial%' AND type = 'news';

-- FuelTrade Supports GETFund
UPDATE content SET
  body = '<p>The Ghana Education Trust Fund (GETFund) has received a transformative donation of One Million Ghana Cedis (GHS 1,000,000) from FuelTrade Ghana Limited, a proudly Ghanaian owned Bulk Distribution Company (BDC) and one of the nation''s leading players in the downstream petroleum sector.</p>
<p>Formally confirmed through a letter dated 24 November 2025 and signed by the Deputy Director of Finance and Accounts of FuelTrade, the donation marks the very first major corporate partnership secured by GETFund''s newly established Fundraising and Scholarship Department. The full amount will be directed towards financing critical educational infrastructure projects across the country.</p>
<p>The Administrator of GETFund, Mr Paul Adjei, expressed profound gratitude to FuelTrade Ghana, describing the contribution as "a powerful vote of confidence in the future of education as the bedrock of national progress."</p>
<p>"We are deeply humbled and immensely grateful to the Board, Management, and entire FuelTrade family for this extraordinary act of corporate citizenship. This donation is not just funding, it is hope, opportunity, and a brighter future for thousands of Ghanaian children. FuelTrade has set a shining example for corporate Ghana, proving that when the private sector steps forward, our nation''s educational dreams become an achievable reality," Mr Adjei stated.</p>
<p>For many years, GETFund has relied almost exclusively on statutory allocations, which, while essential, have faced increasing pressure from rapid population growth, rising enrolment figures, and the soaring cost of modern educational facilities. Recognising these challenges, the GETFund Board and Management, under the leadership of the administrator, Mr Paul Adjei, took the bold decision to create the Fundraising and Scholarship Department.</p>
<p>The Department''s core mandate is to diversify and strengthen GETFund''s resource base by building sustainable, mutually beneficial partnerships with corporate Ghana, philanthropic organisations, diaspora communities, and international development partners.</p>
<p>A win-win partnership model: GETFund has worked closely with the Ghana Revenue Authority to ensure that every cedi donated qualifies for tax deduction under the Income Tax Act, 2015 (Act 896). This means companies like FuelTrade can fulfil their CSR obligations, support national priorities, reduce their tax liability, and earn widespread public recognition all through a single strategic decision.</p>',
  featured_image_url = 'https://www.getfund.gov.gh/wp-content/uploads/2025/12/Fuel-Trade-770x417.jpg'
WHERE slug LIKE '%fueltrade%' AND type = 'news';

-- STEMBox Initiative
UPDATE content SET
  body = '<p>The Ghana Education Trust Fund (GETFund) has announced strategic funding for a nationwide rollout of the Dext STEMBox initiative targeting basic schools across the country.</p>
<p>The national launch took place on December 4, 2025, at the Osu Eben-Ezar Presbyterian Church in Accra, with President John Dramani Mahama as guest of honor, alongside the Minister of Education and other government officials.</p>
<p>According to GETFund Administrator Paul Adjei, the initiative represents "another strategic move to expand opportunities, increase access, and advance a national commitment to practical and modern learning." The project addresses persistent inequalities in science laboratory access, particularly in rural and peri-urban schools where science instruction remains predominantly theoretical.</p>
<p>The STEMBox is a locally-engineered portable toolkit that consolidates full laboratory capabilities into a compact, durable, cost-effective unit. Through GETFund''s investment, 667 selected basic schools nationwide are receiving these devices to democratize access to practical science education.</p>
<p>Adjei emphasized that the initiative supports Ghana''s economic competitiveness by developing "a workforce capable of competing in advanced industrial, technological, and digital economies." Early impacts in beneficiary schools show students actively engaging in hands-on experimentation rather than memorization, while teachers demonstrate increased confidence in delivering practical science instruction.</p>
<p>The administrator commended Dext Technology for delivering a locally manufactured solution with broader continental relevance.</p>',
  featured_image_url = 'https://www.getfund.gov.gh/wp-content/uploads/2025/12/Admin@Stembox.png'
WHERE slug LIKE '%stembox%' AND type = 'news';

-- Paul Adjei Assumes Office
UPDATE content SET
  body = '<p>The Management and Staff of the Ghana Education Trust Fund (GETFund) officially welcomed Mr. Paul Adjei as he began his tenure as Administrator on February 3, 2025.</p>
<p>During his first day, the new administrator convened with senior staff to discuss priorities and ongoing work. Mr. Adjei held his first meeting with the GETFund Management Team, where key priorities and ongoing initiatives were discussed.</p>
<p>The Fund expressed confidence in the appointment, highlighting the administrator''s qualifications. With his extensive experience in public administration, as well as his work with international development partners, Mr. Adjei''s leadership is expected to drive the Fund''s commitment to supporting the delivery of quality education in Ghana.</p>
<p>In his opening remarks, the new Administrator outlined his vision for the organization and priorities for his tenure. He emphasized commitment to transparency, efficiency, and maximizing the impact of GETFund resources on education.</p>',
  featured_image_url = 'https://www.getfund.gov.gh/wp-content/uploads/2025/02/ST852075.jpg'
WHERE slug LIKE '%paul-adjei-assumes-office%' AND type = 'news';

-- Minister Inaugurates 7th Board
UPDATE content SET
  body = '<p>On April 11, 2025, Ghana''s Education Minister Hon. Haruna Iddrisu formally inaugurated the 7th Board of Trustees for the Ghana Education Trust Fund at its Accra headquarters.</p>
<p>The board operates under the chairmanship of Hon. Emmanuel Kwasi Bedzrah and includes 15 additional members representing various educational, financial, and governmental institutions.</p>
<p>The Education Minister outlined several priorities: "The board must prioritize releasing GH¢258 million for the School Feeding Programme and re-examine funding allocations for the Free Senior High School Programme." He proposed a resource distribution model allocating 35% to basic education and 40% to higher education, emphasizing infrastructure development and furniture provision for schools.</p>
<p>Iddrisu advocated for supporting local PhD training through GTEC, implementing merit-based scholarships, and establishing an emergency response budget for disaster-affected schools.</p>
<p>Chairman Bedzrah pledged commitment to addressing ministerial concerns, particularly completing over 3,500 abandoned GETFund projects nationwide, expressing gratitude for the confidence demonstrated through these appointments.</p>',
  featured_image_url = 'https://www.getfund.gov.gh/wp-content/uploads/2025/04/S8507439.jpg'
WHERE slug LIKE '%minister%inaugurates%7th%board%' AND type = 'news';

-- GHC 50 Million for Persons with Disabilities
UPDATE content SET
  body = '<p>Ghana''s Education Minister announced a significant financial commitment to support students with disabilities. The Ghana Education Trust Fund (GETFund) will commit GHC 50 million each year to support disability and inclusive education across the country.</p>
<p>The announcement came during the launch of the Free Tertiary Education for Persons with Disabilities initiative in Accra on October 24, 2025. Education Minister Haruna Iddrisu made the declaration following consultations with President John Dramani Mahama and GETFund Administrator Paul Adjei.</p>
<p>The allocated funds will span from the present through 2028, specifically targeting disability-related educational interventions and inclusive programming. According to the Minister, this initiative reflects the government''s broader vision of "ensuring equality, inclusivity, and access to quality education for all, especially persons with disabilities."</p>
<p>Adjei pledged the Fund''s collaboration with the Students Loan Trust Fund on these educational support efforts. The Education Minister praised both the GETFund Administrator and his ministry''s team, noting their dedication to ensuring that disability status does not prevent Ghanaian students from pursuing their academic goals.</p>',
  featured_image_url = 'https://www.getfund.gov.gh/wp-content/uploads/2025/10/AdminPresident-1024x685.png'
WHERE slug LIKE '%50-million%disabilities%' OR slug LIKE '%free-tertiary-education-persons-disabilities%' AND type = 'news';

-- GETFund Headquarters Building
UPDATE content SET
  body = '<p>The Ghana Education Trust Fund (GETFund) officially inaugurated its new four-storey headquarters building on December 23, 2024. The modern facility is situated opposite Trinity Theological Seminary at Mempasem in Legon, Accra.</p>
<p>Construction began in 2021 with an initial 24-month completion target. However, operational challenges extended the timeline. The project consultants, Skrul Consult, acknowledged these delays were "beyond their control." The contractor, Avenue K, continues working on exterior finishing touches, making this a partial handover.</p>
<p>GETFund Administrator Dr. Richard Ampofo Boadu praised the "high-quality work delivered," noting the building suits "a corporate entity of GETFund''s stature." Board Chairman Prof. Dominic Fobih called it "an iconic piece of architecture."</p>
<p>Since its 2000 establishment, GETFund operated from a residential building in Airport West. The organization''s expanding staff and operational growth necessitated a purpose-built office to improve administrative efficiency and support its educational mission.</p>
<p>The new headquarters represents GETFund''s commitment to professional operations while advancing quality education throughout Ghana.</p>',
  featured_image_url = 'https://www.getfund.gov.gh/wp-content/uploads/2025/01/IMGG_9999_244.jpg'
WHERE slug LIKE '%four-storey-headquarters%' OR slug LIKE '%inaugurates%headquarters%' AND type = 'news';

-- Update articles with short generic body content to have proper excerpts as body
UPDATE content SET
  body = CONCAT('<p>', excerpt, '</p>')
WHERE type = 'news' 
  AND deleted_at IS NULL 
  AND (body IS NULL OR LENGTH(body) < 100)
  AND excerpt IS NOT NULL 
  AND LENGTH(excerpt) > 50;

-- Ensure all images use full resolution where available (remove -770x417 suffix)
UPDATE content SET
  featured_image_url = REPLACE(featured_image_url, '-770x417', '')
WHERE type = 'news' 
  AND featured_image_url LIKE '%-770x417%';

-- Also fix -1024x768 and other common sizes to use original
UPDATE content SET
  featured_image_url = REPLACE(featured_image_url, '-1024x768', '')
WHERE type = 'news' 
  AND featured_image_url LIKE '%-1024x768%';

UPDATE content SET
  featured_image_url = REPLACE(featured_image_url, '-1024x678', '')
WHERE type = 'news' 
  AND featured_image_url LIKE '%-1024x678%';

UPDATE content SET
  featured_image_url = REPLACE(featured_image_url, '-1024x685', '')
WHERE type = 'news' 
  AND featured_image_url LIKE '%-1024x685%';

