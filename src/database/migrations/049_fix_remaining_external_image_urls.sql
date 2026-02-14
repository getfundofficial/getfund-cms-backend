-- Migration: 049_fix_remaining_external_image_urls.sql
-- Fix the 5 remaining articles that still use external getfund.gov.gh URLs.
-- These articles have longer slugs from CMS creation that didn't match migration 048.

-- 1. Karaga SHS Infrastructure
UPDATE content SET featured_image_url = '/images/news/getfund-gives-greenlight-for-the-construction-of-ultra-moder.png'
WHERE slug = 'getfund-gives-greenlight-for-the-construction-of-ultra-modern-infrastructure-at-karaga-shs' AND type = 'news';

-- 2. Counsels Tertiary Institutions
UPDATE content SET featured_image_url = '/images/news/getfund-administrator-counsels-tertiary-institutions-on-fina.jpg'
WHERE slug = 'getfund-administrator-counsels-tertiary-institutions' AND type = 'news';

-- 3. Ghana Senior High School Infrastructure
UPDATE content SET featured_image_url = '/images/news/nr-getfund-launches-major-infrastructure-expansion-at-ghana-.png'
WHERE slug = 'n-r-getfund-launches-major-infrastructure-expansion-at-ghana-senior-high-school' AND type = 'news';

-- 4. Ambariya Schools Infrastructure
UPDATE content SET featured_image_url = '/images/news/getfund-commences-accelerated-infrastructure-program-ambariy.png'
WHERE slug = 'getfund-commences-accelerated-infrastructure-program-at-ambariya-schools' AND type = 'news';

-- 5. Multi-Project Construction Northern Region
UPDATE content SET featured_image_url = '/images/news/getfund-kicks-off-multi-project-construction-to-boost-educat.png'
WHERE slug = 'getfund-kicks-off-multi-project-construction-in-northern-region' AND type = 'news';
