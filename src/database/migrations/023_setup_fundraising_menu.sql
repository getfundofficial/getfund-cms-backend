-- Migration 023: Setup Fundraising Menu Structure
-- This creates the parent "Fundraising" page and makes "Fundraising Campaigns" a child of it

-- Create or update the Fundraising parent page
INSERT INTO pages (
  slug,
  title,
  menu_label,
  show_in_menu,
  menu_order,
  is_active,
  parent_page_id,
  layout_template,
  created_at,
  updated_at
)
VALUES (
  'fundraising',
  'Fundraising',
  'Fundraising',
  true,
  4, -- Position in main menu (adjust as needed)
  true, -- Published/active
  NULL, -- This is a top-level menu item
  NULL, -- No specific template, just a menu parent
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT (slug)
DO UPDATE SET
  menu_label = 'Fundraising',
  show_in_menu = true,
  menu_order = 4,
  is_active = true,
  parent_page_id = NULL,
  updated_at = CURRENT_TIMESTAMP;

-- Now create or update the Fundraising Campaigns page as a child
INSERT INTO pages (
  slug,
  title,
  menu_label,
  show_in_menu,
  menu_order,
  is_active,
  parent_page_id,
  layout_template,
  created_at,
  updated_at
)
VALUES (
  'fundraising-campaigns',
  'Fundraising Campaigns',
  'Fundraising Campaigns',
  true,
  1, -- First item under Fundraising
  true, -- Published/active
  (SELECT id FROM pages WHERE slug = 'fundraising' LIMIT 1), -- Link to parent
  'fundraising-campaigns', -- Our new template
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT (slug)
DO UPDATE SET
  menu_label = 'Fundraising Campaigns',
  show_in_menu = true,
  menu_order = 1,
  is_active = true,
  parent_page_id = (SELECT id FROM pages WHERE slug = 'fundraising' LIMIT 1),
  layout_template = 'fundraising-campaigns',
  updated_at = CURRENT_TIMESTAMP;

-- Update any existing "Support Us" or similar pages to be children of Fundraising (if they exist)
UPDATE pages
SET
  parent_page_id = (SELECT id FROM pages WHERE slug = 'fundraising' LIMIT 1),
  show_in_menu = true,
  menu_order = 2,
  updated_at = CURRENT_TIMESTAMP
WHERE slug IN ('support-us', 'donate', 'ways-to-give')
  AND parent_page_id IS NULL; -- Only update if they're not already children of something

COMMENT ON COLUMN pages.parent_page_id IS 'Links child pages to parent pages for dropdown menus';
