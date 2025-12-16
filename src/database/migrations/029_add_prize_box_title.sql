-- Migration 029: Add prize_box_title to lottery_config
ALTER TABLE lottery_config
ADD COLUMN IF NOT EXISTS prize_box_title TEXT DEFAULT 'Monthly Scholarship Prizes';

COMMENT ON COLUMN lottery_config.prize_box_title IS 'Title displayed above the prize box section (CMS editable)';
