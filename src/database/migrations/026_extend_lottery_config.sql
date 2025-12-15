-- Migration 026: Extend lottery_config with new fields for enhanced lottery features
-- Adds: section_description, sharing_enabled, share_text, share_hashtags

-- Add section description (editable intro text shown above lottery section)
ALTER TABLE lottery_config
ADD COLUMN IF NOT EXISTS section_description TEXT DEFAULT 'Every contribution to our campaigns automatically enters you into our monthly scholarship lottery. Win full scholarships for yourself or your loved ones while supporting education in Ghana.';

-- Add sharing enabled flag
ALTER TABLE lottery_config
ADD COLUMN IF NOT EXISTS sharing_enabled BOOLEAN DEFAULT true;

-- Add share text for social sharing
ALTER TABLE lottery_config
ADD COLUMN IF NOT EXISTS share_text TEXT DEFAULT 'Support education in Ghana and enter the GETFund Scholarship Lottery! Every donation gives you a chance to win.';

-- Add hashtags for social sharing (comma-separated)
ALTER TABLE lottery_config
ADD COLUMN IF NOT EXISTS share_hashtags TEXT DEFAULT 'GETFund,EducationGhana,ScholarshipLottery';

-- Update comments to document the extended JSONB structure
COMMENT ON COLUMN lottery_config.prizes IS 'Array of prize objects: { rank, amount, description, currency, count?, flip_description? }';
COMMENT ON COLUMN lottery_config.how_it_works_steps IS 'Array of step objects: { step, title, description, flip_description? }';
COMMENT ON COLUMN lottery_config.section_description IS 'Intro text displayed above the lottery section (CMS editable)';
COMMENT ON COLUMN lottery_config.sharing_enabled IS 'Whether to show social sharing buttons';
COMMENT ON COLUMN lottery_config.share_text IS 'Text used when sharing on social media';
COMMENT ON COLUMN lottery_config.share_hashtags IS 'Comma-separated hashtags for social sharing';
