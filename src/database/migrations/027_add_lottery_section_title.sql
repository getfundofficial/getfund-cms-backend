-- Migration 027: Add section_title to lottery_config
ALTER TABLE lottery_config
ADD COLUMN IF NOT EXISTS section_title TEXT DEFAULT 'GETFund Scholarship Lottery';

COMMENT ON COLUMN lottery_config.section_title IS 'Main title displayed above the lottery section (CMS editable)';
