-- Migration: Add title column to impact_stats_config table
-- This allows the section title "Our Impact" to be editable per page

-- Add the title column with a default value
ALTER TABLE impact_stats_config
ADD COLUMN IF NOT EXISTS title VARCHAR(100) DEFAULT 'Our Impact';

-- Update existing rows to have the default title
UPDATE impact_stats_config
SET title = 'Our Impact'
WHERE title IS NULL;

-- Add comment
COMMENT ON COLUMN impact_stats_config.title IS 'The main heading for the impact stats section (e.g., "Our Impact")';
