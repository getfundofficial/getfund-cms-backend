-- Migration 028: Remove Support Us from Fundraising menu
-- Support Us should not appear in the Fundraising dropdown

-- Remove Support Us from the Fundraising menu by hiding it from menu
UPDATE pages
SET
  show_in_menu = false,
  parent_page_id = NULL,
  updated_at = CURRENT_TIMESTAMP
WHERE slug = 'support-us';

-- Also hide any other pages that shouldn't be in Fundraising menu
UPDATE pages
SET
  show_in_menu = false,
  parent_page_id = NULL,
  updated_at = CURRENT_TIMESTAMP
WHERE slug IN ('donate', 'ways-to-give')
  AND parent_page_id = (SELECT id FROM pages WHERE slug = 'fundraising' LIMIT 1);
