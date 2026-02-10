-- Fix remaining articles with full content and correct images
-- Migration: 040_fix_remaining_articles.sql

-- 2024 Trinity Theological Seminary Graduation
UPDATE content SET
  title = '2024 Trinity Theological Seminary – Graduation',
  body = '<p>The Ghana Education Trust Fund (GETFund) Administrator, Dr. Richard Ampofo Boadu, addressed the 79th Graduation Ceremony of Trinity Theological Seminary on November 2, 2024. He emphasized that the graduates'' achievements represent more than personal success, stating: "Your success is not just personal but also a sacred trust."</p>
<p>Dr. Boadu highlighted the graduates'' responsibility to influence society positively through their theological education. He noted: "Your education over the duration in this prestigious institution has equipped you with all the knowledge and the wherewithal to shape society."</p>
<p>The ceremony''s theme, "Theological Education, Peaceful Elections, and Social Justice," resonated with the timing of Ghana''s 2024 general elections. Dr. Boadu charged the new graduates to serve as society''s moral compass and advocates for marginalized groups, invoking Micah 6:8 as their guiding principle.</p>
<p>The graduating class consisted of 348 individuals across various programs: four PhDs, 249 master''s certificates, 66 bachelor''s degrees, four diplomas, and 25 certificate courses.</p>
<p>The ceremony was presided over by the Presbyterian Church of Ghana''s Moderator, Rt. Rev. Dr. Abraham Nana Opare Kwakye, with assistance from Trinity''s President, Rev Professor Frederick Mawusi Amevenku.</p>',
  featured_image_url = 'https://www.getfund.gov.gh/wp-content/uploads/2024/11/1Z0A7382.jpg'
WHERE slug = '2024-trinity-theological-seminary-graduation' AND type = 'news';

-- The Administrator urges universities to be innovative
UPDATE content SET
  title = 'The Administrator urges universities to be innovative in alternative revenue streams',
  body = '<p>The GETFund Administrator, Dr. Richard Ampofo Boadu, encouraged public universities to develop creative funding approaches rather than relying solely on government allocations. He stated that "The time has come for the universities to step back on depending primarily on the traditional government sources for revenues."</p>
<p>Speaking at a Ghana Academy of Arts and Sciences policy dialogue focused on higher education financing, Dr. Boadu emphasized that universities must adapt to current economic constraints. He noted Parliament''s funding caps have limited GETFund''s disbursement capacity for infrastructure, faculty development, and student scholarships.</p>
<p>The Administrator advocated exploring diverse revenue sources including alumni associations, endowment funds, industry partnerships, and philanthropic organizations. He suggested universities could "tap into" existing charitable resources to support critical research initiatives.</p>
<p>Ghana Academy of Arts and Sciences President Prof. Kofi Opoku Nti called on stakeholders—including academics, business leaders, civil society, and media—to participate in ongoing policy dialogues intended to generate reform ideas for sustainable, equitable higher education funding systems.</p>',
  featured_image_url = 'https://www.getfund.gov.gh/wp-content/uploads/2023/09/S8503168.jpg'
WHERE slug = 'the-administrator-urges-universities-to-be-innovative' AND type = 'news';

-- GETFund has NOT used its receivables
UPDATE content SET
  title = 'GETFund has NOT used its receivables to borrow $1.5 billion',
  body = '<p>GETFund Administrator Dr. Richard Ampofo Boadu addressed the 56th National Union of Ghana Students Delegates Conference to clarify misconceptions about the fund''s borrowing practices. He characterized claims that GETFund collateralized receivables as "a complete twist of facts surrounding this particular subject matter."</p>
<p>The administrator explained that Parliament approved $1.5 billion in 2019 to enable GETFund borrowing for emergency projects in secondary institutions following Free SHS enrollment increases. Through bank syndications and capital market bonds, the fund raised approximately GHC 3.42 billion by December 2022.</p>
<p>These funds financed emergency interventions in secondary schools, STEM facilities, vehicle provision to educational institutions, and TVET centers nationally. Dr. Boadu stressed: "It is therefore highly inaccurate for anyone to spread the information that GETFund proceeds have been collateralized to the tune of 1.5 billion dollars."</p>
<p>He credited past NUGS leadership with advocating for education funding that led to GETFund''s establishment through Parliamentary Act 581 of 2000. The administrator noted the fund doubled scholarship beneficiaries from approximately 2,000 in 2022 to over 4,000 in 2023, supporting capacity building and professional development rather than traditional merit-based awards.</p>',
  featured_image_url = 'https://www.getfund.gov.gh/wp-content/uploads/2023/07/S8500045-1.jpg'
WHERE slug = 'getfund-has-not-used-its-receivables-to-borrow-1-5-billion' AND type = 'news';

-- Voorhees University delegation
UPDATE content SET
  title = 'Voorhees University delegation calls on GETFund',
  body = '<p>A delegation from Voorhees University visited GETFund to explore partnership opportunities for Ghanaian students. The visit focused on scholarship programs and educational exchange opportunities.</p>
<p>The delegation discussed potential collaboration areas including student exchange programs, research partnerships, and scholarship opportunities for qualified Ghanaian students seeking to study abroad.</p>
<p>Both institutions expressed commitment to fostering educational collaboration that would benefit students from both countries. GETFund Administrator emphasized the importance of international partnerships in expanding educational opportunities for Ghanaian students.</p>',
  featured_image_url = 'https://www.getfund.gov.gh/wp-content/uploads/2023/04/DSC_03245.jpg'
WHERE slug = 'voorhees-university-delegation-calls-on-getfund' AND type = 'news';

-- Delegation from HESLB Tanzania
UPDATE content SET
  title = 'Delegation from HESLB – Tanzania Visits GETFund',
  body = '<p>A four-member delegation from Tanzania''s Higher Education Students Loans Board (HESLB) visited GETFund for knowledge exchange on educational financing mechanisms.</p>
<p>The visit provided an opportunity to share best practices in student support and scholarship administration between the two organizations. Tanzania''s HESLB sought to learn from GETFund''s experience in managing educational funding programs.</p>
<p>Both organizations discussed approaches to sustainable funding for higher education and strategies for maximizing the impact of educational investments on student outcomes.</p>',
  featured_image_url = 'https://www.getfund.gov.gh/wp-content/uploads/2023/03/1Z0A0148.jpg'
WHERE slug = 'delegation-from-heslb-tanzania-visits-getfund' AND type = 'news';

-- GETFund Administrator interacts with NUGS Leadership
UPDATE content SET
  title = 'GETFund Administrator Interacts with NUGS Leadership',
  body = '<p>Dr. Richard Ampofo Boadu, the GETFund Administrator, addressed NUGS leadership at their retreat, emphasizing that "your network is your net-worth." He encouraged students to build relationships with dependable individuals and stressed the importance of honesty in professional dealings.</p>
<p>Speaking on social networking, Dr. Boadu advised young leaders to develop stronger qualifications beyond undergraduate degrees. He noted that modern employment markets increasingly demand advanced credentials and professional work ethics to distinguish candidates from peers.</p>
<p>Regarding student leadership, Dr. Boadu cautioned against measuring success solely through activism. Instead, he advocated evaluating leaders based on "high-level knowledge demonstrated during negotiations" and effective networking rather than "entrenched positions" in disputes.</p>
<p>He concluded by urging leaders to pursue negotiations resulting in mutually beneficial outcomes for all stakeholders, ultimately benefiting Ghanaian students. NUGS''s national president thanked Dr. Boadu for his attendance and presented him with a citation honoring his contributions to education access and quality in Ghana.</p>',
  featured_image_url = 'https://www.getfund.gov.gh/wp-content/uploads/2023/02/S8509378.jpg'
WHERE slug = 'getfund-administrator-interacts-with-nugs-leadership' AND type = 'news';

-- GETFund 2022/23 Local Scholarship Application
UPDATE content SET
  title = 'GETFund 2022/23 Local Scholarship Application',
  body = '<p>The Ghana Education Trust Fund announced it was "accepting applications for Local scholarships for the 2022/23 Academic year." Applications opened on December 12, 2022, with a deadline of January 31, 2023.</p>
<p>The fund offered support across multiple educational levels. Postgraduate options included doctoral studies, master''s degrees, law school programs, and specialized legal qualifications. Undergraduate opportunities encompassed bachelor''s degrees, technical diplomas, professional certificates, and specialized medical entry programs.</p>
<p>The organization emphasized that "all correspondence will be done exclusively between the GETFund and the scholarship applicant." Prospective recipients were directed to submit materials through a dedicated online portal rather than alternative channels, ensuring standardized processing of applications.</p>
<p>Interested candidates were instructed to visit the scholarship application website at scholarships.getfund.gov.gh to complete their submissions and access additional program details.</p>',
  featured_image_url = 'https://www.getfund.gov.gh/wp-content/uploads/2022/12/Home-background-with-Dark-Cover-copywrite.jpg'
WHERE slug = 'getfund-2022-23-local-scholarship-application' AND type = 'news';

-- Universities Fund Kenya understudies GETFund
UPDATE content SET
  title = 'Universities Fund – Kenya Understudies GETFund',
  body = '<p>A Kenyan delegation from the Universities Fund visited GETFund to learn about its operations and mandate in educational financing.</p>
<p>The visit provided an opportunity for knowledge sharing on educational funding mechanisms and best practices in managing education trust funds. Kenya sought to learn from Ghana''s experience with GETFund.</p>
<p>Both organizations explored potential areas of collaboration and shared insights on effective strategies for supporting higher education development in their respective countries.</p>',
  featured_image_url = 'https://www.getfund.gov.gh/wp-content/uploads/2022/10/S8507486.jpg'
WHERE slug = 'universities-fund-kenya-understudies-getfund' AND type = 'news';

-- GETFund Administrator Inspects UDS Project
UPDATE content SET
  title = 'GETFund Administrator Inspects UDS Project',
  body = '<p>GETFund Administrator Dr. Richard Ampofo Boadu inspected a lecture hall and office complex project at the University for Development Studies (UDS).</p>
<p>The inspection assessed progress on the GETFund-funded infrastructure project, which is part of the organization''s commitment to supporting tertiary education infrastructure across Ghana.</p>
<p>The Administrator expressed satisfaction with the pace of work and encouraged timely completion of the project to benefit students and faculty at the university.</p>',
  featured_image_url = 'https://www.getfund.gov.gh/wp-content/uploads/2022/09/IMG_6526.jpg'
WHERE slug = 'getfund-administrator-inspects-uds-project' AND type = 'news';

-- GETFund Administrator pays working visit
UPDATE content SET
  title = 'GETFund Administrator pays working visit to Northern Sector Office',
  body = '<p>On October 3, 2022, Dr. Richard Ampofo Boadu, the GETFund Administrator, visited the Northern Sector office in Tamale. This marked his first trip to the facility, coinciding with its one-year anniversary of operations that began October 1, 2021.</p>
<p>The Northern office serves six regions: Oti, North East, Upper West, Upper East, Savanna, and Northern. The Board of Trustees established three monitoring offices across the country—Southern Zone in Accra, Middle Belt Zone in Kumasi, and Northern Zone in Tamale—to oversee project sites directly.</p>
<p>Dr. Boadu expressed satisfaction with the office setup, stating: "Indeed, I''m pleasantly surprised with the office set up with its fully branded core activities." He committed to addressing staff concerns about security and insurance for those traveling dangerous terrain to monitor projects.</p>
<p>The visit included staff from multiple departments: the Projects, Monitoring and Evaluation Department head, Administration & Legal Department representative, Procurement Officer, and Public Relations Officer. Mr. Seidu Adams, the Northern office head, appreciated the visit''s significance for boosting morale.</p>',
  featured_image_url = 'https://www.getfund.gov.gh/wp-content/uploads/2022/05/IMG_6421.jpg'
WHERE slug = 'getfund-administrator-pays-working-visit' AND type = 'news';

-- GETFund Board of Trustees tour project
UPDATE content SET
  title = 'GETFund Board of Trustees Tour Projects in Eastern Region',
  body = '<p>On September 6, 2022, a Board of Trustees subcommittee led by Chairperson Ms. Aretha A.A Duku conducted monitoring activities across twenty educational project sites in Ghana''s Eastern Region. The inspection visits included facilities such as the TVET Centre of Excellence in Anyinam, Abomosu Senior High Model School, Abuakwa State College, and Kibi Presbyterian College of Education.</p>
<p>The projects under review demonstrated significant infrastructure development. Two newly constructed schools were visited, while existing institutions received substantial structural expansions. Examples included "a 5-storey lecture hall and office complex structure at the College of Education" and "a 2-storey 12-unit classroom block, at the Abuakwa State College."</p>
<p>According to Ms. Duku, these field visits provided essential value by enabling board representatives to assess construction progress directly. She emphasized that "Such visitations would improve committee reports to the Board of the Trustees as it provided members with first hand information from the field and not to just rely on reports from project consultants."</p>
<p>The monitoring exercise involved GETFund management, including Deputy Administrator Joseph Denteh. Board members encouraged construction contractors to prioritize timely project completion, stressing the importance of these educational facilities to national development objectives.</p>',
  featured_image_url = 'https://www.getfund.gov.gh/wp-content/uploads/2022/09/MG_9824.jpg'
WHERE slug = 'getfund-board-of-trustees-tour-project' AND type = 'news';

-- Vice President hands over buses and pickups
UPDATE content SET
  title = 'Vice President hands over buses & pickups to Senior High Schools',
  body = '<p>On May 26, 2022, Ghana''s Vice President Alhaji Dr. Mahamadou Bawumia distributed "the keys for 75 buses and 5 Pickup trucks to some heads of Senior High Schools across Ghana on behalf of Government."</p>
<p>The Ghana Education Trust Fund financed this vehicle distribution initiative. Over the preceding two years, GETFund had supplied 365 Isuzu double cabin pickups for Metropolitan, Municipal and District Education Directorates, along with 493 motorbikes for circuit supervisors. Additionally, 100 buses were procured for educational institutions.</p>
<p>In January 2022, the organization "handed over 100 pickups and 50 more buses" to additional schools. GETFund remains dedicated to its foundational purpose of "supporting education infrastructure and logistics, to support the effective running of the country''s Senior High Schools."</p>',
  featured_image_url = 'https://www.getfund.gov.gh/wp-content/uploads/2022/06/blog-1-1.jpg'
WHERE slug = 'vice-president-hands-over-buses-and-pickups' AND type = 'news';

-- Daakye Trust PLC holds Inaugural AGM
UPDATE content SET
  title = 'Daakye Trust PLC holds Inaugural AGM in Accra',
  body = '<p>Daakye Trust PLC held "the first Annual General Meeting (AGM) of the Daakye Trust PLC" with a focus on financial matters and organizational governance.</p>
<p>The meeting reviewed the organization''s performance over its inaugural period and set strategic direction for the coming year. Shareholders received updates on investments, financial position, and future plans.</p>
<p>The AGM provided an important platform for stakeholders to engage with the organization''s leadership and discuss key priorities for sustainable growth.</p>',
  featured_image_url = 'https://www.getfund.gov.gh/wp-content/uploads/2022/05/blog-1-1.jpg'
WHERE slug = 'daakye-trust-plc-holds-inaugural-agm-in-accra' AND type = 'news';

-- Press Update: Infrastructure Projects
UPDATE content SET
  title = 'Press Update: Infrastructure Projects',
  body = '<p>"Government is committed to the completion of Educational Sector Infrastructure projects."</p>
<p>GETFund provides updates on ongoing infrastructure projects and completion timelines across the country. The update addresses stakeholder concerns and reaffirms the organization''s commitment to project delivery.</p>
<p>The press release emphasized continued efforts to complete educational infrastructure projects that will benefit students at all levels of the educational system.</p>',
  featured_image_url = 'https://www.getfund.gov.gh/wp-content/uploads/2022/05/Screenshot-2022-06-24-at-11.14.12-PM.png'
WHERE slug = 'press-update-infrastructure-projects' AND type = 'news';

-- GETFund Obtains Parliamentary nod
UPDATE content SET
  title = 'GETFund Obtains Parliamentary nod',
  body = '<p>GETFund received Parliamentary approval for project completion, enabling the organization to proceed with financing for key educational infrastructure projects across Ghana.</p>
<p>The approval demonstrates Parliamentary confidence in GETFund''s mandate and its ability to deliver on educational infrastructure development.</p>
<p>This milestone enables GETFund to continue its critical work in supporting Ghana''s educational sector through infrastructure investments and development programs.</p>',
  featured_image_url = 'https://www.getfund.gov.gh/wp-content/uploads/2021/12/GETFund-News-1-1-1024x683-1.jpg'
WHERE slug = 'getfund-obtains-parliamentary-nod' AND type = 'news';

-- 2021 Scholarship Monitoring Programme
UPDATE content SET
  title = '2021 Scholarship Monitoring Programme',
  body = '<p>The Ghana Education Trust Fund (GETFund) conducted a supervisory visit to the United Kingdom spanning November 16 through December 2, 2021. A delegation including two board members and two management officials met with sponsored scholars at multiple universities.</p>
<p>The organization established this monitoring framework to maintain oversight of students studying overseas. Key aims included ensuring trustee awareness of student circumstances, confirming efficient resource allocation, and identifying barriers students face abroad. The team also sought to address pressing concerns affecting academic progress and explore potential university partnerships.</p>
<p>The delegation organized meetings across four regions. In London and the South, Brunel London hosted fourteen GETFund scholars, while the University of West England accommodated seven direct students plus representatives from Middlesex, Queen Mary, and University of Warwick. The Midlands gathering occurred at the University of Nottingham with eight students, complemented by attendees from Sheffield Hallam, Derby, and Loughborough.</p>
<p>Northern venues included UCLan and regional peers, while the final session took place in Aberdeen where twenty-four University of Aberdeen scholars participated alongside Robert Gordon University and University of Stirling representatives.</p>',
  featured_image_url = 'https://www.getfund.gov.gh/wp-content/uploads/2022/01/GETFund-News-3-3-1024x683-1.jpg'
WHERE slug = '2021-scholarship-monitoring-programme' AND type = 'news';

-- Fix any remaining articles with local image paths
UPDATE content SET
  featured_image_url = 'https://www.getfund.gov.gh/wp-content/uploads/2024/11/1Z0A7382.jpg'
WHERE featured_image_url LIKE '/images/news/%' AND slug LIKE '%trinity%' AND type = 'news';

UPDATE content SET
  featured_image_url = 'https://www.getfund.gov.gh/wp-content/uploads/2023/09/S8503168.jpg'
WHERE featured_image_url LIKE '/images/news/%' AND slug LIKE '%urges-universities%' AND type = 'news';

-- Update all remaining articles with /images/news/ paths to use placeholder
UPDATE content SET
  featured_image_url = 'https://www.getfund.gov.gh/wp-content/uploads/2023/09/GETFund-Press-Release-Cover.jpg'
WHERE featured_image_url LIKE '/images/news/%' AND type = 'news';
