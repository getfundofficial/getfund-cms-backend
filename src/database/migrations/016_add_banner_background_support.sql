-- Migration: Add banner background image support
-- Description: Adds background_image_url, tint_color, and tint_opacity fields to page sections
-- Created: 2025-12-06

-- This migration adds support for customizable banner backgrounds with tinted overlays
-- The fields are added to the JSONB content column for page_content sections

-- Note: Since content is JSONB, we don't need to alter the table structure
-- Instead, we'll document the expected schema for banner backgrounds in page_content sections

-- Expected JSONB structure for page_content sections with banner backgrounds:
-- {
--   "heroTitle": "string",
--   "heroSubtitle": "string",
--   "bannerBackground": {
--     "imageUrl": "string | null",      -- URL to background image from media library
--     "tintColor": "string",             -- Hex color code (e.g., "#DC143C")
--     "tintOpacity": number              -- Opacity percentage (0-100), default 50
--   },
--   ... other page-specific content
-- }

-- Migration is a no-op for database structure
-- The actual changes will be in the CMS frontend and website components

SELECT 'Banner background support schema documented' AS migration_status;
