-- Migration 025: Fix fundraising menu order
-- Reorder: Why Fundraising, Ways to Donate, Fundraising Campaigns, Partnerships, Beneficiaries Give Back, Events
-- Remove SUPPORT US from menu

-- Update menu order for fundraising child pages
UPDATE pages SET menu_order = 1 WHERE slug = 'fundraising/why-fundraising';
UPDATE pages SET menu_order = 2 WHERE slug = 'fundraising/ways-to-donate';
UPDATE pages SET menu_order = 3 WHERE slug = 'fundraising-campaigns' OR slug = 'fundraising/fundraising-campaigns';
UPDATE pages SET menu_order = 4 WHERE slug = 'fundraising/partnerships';
UPDATE pages SET menu_order = 5 WHERE slug = 'fundraising/beneficiaries-give-back';
UPDATE pages SET menu_order = 6 WHERE slug = 'fundraising/events';

-- Hide SUPPORT US from menu (if it exists)
UPDATE pages SET show_in_menu = false WHERE slug = 'fundraising/support-us' OR menu_label = 'SUPPORT US' OR title = 'SUPPORT US';

-- Also try with different slug patterns
UPDATE pages SET show_in_menu = false WHERE slug ILIKE '%support-us%' OR slug ILIKE '%support_us%';
