-- Migration 036: Fix fundraising menu order
-- Ensure Why Fundraising appears above Ways to Donate

-- Update menu order for fundraising child pages
UPDATE pages SET menu_order = 1 WHERE slug = 'fundraising/why-fundraising' OR slug = 'why-fundraising';
UPDATE pages SET menu_order = 2 WHERE slug = 'fundraising/ways-to-donate' OR slug = 'ways-to-donate';
UPDATE pages SET menu_order = 3 WHERE slug = 'fundraising-campaigns' OR slug = 'fundraising/fundraising-campaigns';
UPDATE pages SET menu_order = 4 WHERE slug = 'fundraising/partnerships' OR slug = 'partnerships';
UPDATE pages SET menu_order = 5 WHERE slug = 'fundraising/beneficiaries-give-back' OR slug = 'beneficiaries-give-back';
UPDATE pages SET menu_order = 6 WHERE slug = 'fundraising/events' OR slug = 'events';
