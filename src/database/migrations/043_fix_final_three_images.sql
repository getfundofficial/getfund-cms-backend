-- Migration 043: Fix final 3 articles with missing images
-- Use fire image for both fire-related articles, placeholder for chief justice

-- Both fire articles use the same downloaded image
UPDATE content SET featured_image_url = '/images/news/getfund-deputy-administrator-fires-investigation.png'
WHERE slug = 'getfund-deputy-administrator-calls-investigation-recurrent-fires-nobisco-tolon-shs' AND type = 'news';

UPDATE content SET featured_image_url = '/images/news/getfund-deputy-administrator-fires-investigation.png'
WHERE slug = 'getfund-deputy-administrator-visits-schools-affected-by-fire-northern-region' AND type = 'news';

-- Chief justice article uses placeholder (no image available on source)
UPDATE content SET featured_image_url = '/images/news/news-placeholder.svg'
WHERE slug = 'chief-justice-calls-getfund-judicial-service-reforms' AND type = 'news';
