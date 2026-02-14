-- Migration: 050_fix_article_data_quality.sql
-- Fix data quality issues identified when comparing DB with getfund.gov.gh:
-- 1. Delete duplicate "Minister Inaugurates Board" CMS entry with wrong date
-- 2. Delete duplicate "Counsels Tertiary Institutions" with wrong date
-- 3. Fix Kumasi article date (2025-03-25 → 2024-01-15)
-- 4. Re-insert CHASS 2025 article (incorrectly deleted as duplicate of Kumasi)

-- 1. Delete duplicate "Minister of Education Inaugurates 7th GETFund Board" (CMS version with wrong date 2025-06-25)
-- The correct version is at slug 'minister-education-inaugurates-7th-getfund-board' with date 2025-04-11
DELETE FROM content
WHERE slug = 'minister-of-education-inaugurates-7th-getfund-board' AND type = 'news';

-- 2. Delete duplicate "Counsels Tertiary Institutions" dated 2023-09-11 (wrong date)
-- The correct version is at 'getfund-administrator-counsels-tertiary-institutions-financing-options' dated 2024-04-03
DELETE FROM content
WHERE slug = 'getfund-administrator-counsels-tertiary-institutions' AND type = 'news';

-- 3. Fix Kumasi article date from 2025-03-25 to 2024-01-15 (per getfund.gov.gh)
UPDATE content SET published_at = '2024-01-15'
WHERE slug = 'getfund-administrator-engages-media-in-kumasi' AND type = 'news';

-- Also restore Kumasi featured_image_url (was overwritten with CHASS image by dedup script)
UPDATE content SET featured_image_url = '/images/news/getfund-administrator-engages-media-in-kumasi.jpg'
WHERE slug = 'getfund-administrator-engages-media-in-kumasi' AND type = 'news';

-- 4. Re-insert CHASS 2025 article (incorrectly deleted during deduplication)
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
  '/images/news/getfund-administrator-engages-chass-leadership.jpg',
  'published',
  '2025-03-25',
  NOW()
)
ON CONFLICT (slug) DO NOTHING;
