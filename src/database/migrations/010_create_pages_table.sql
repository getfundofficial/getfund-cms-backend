-- Migration 010: Create pages table for Page CMS
-- This table stores static website pages (About, Programs, etc.)

CREATE TABLE IF NOT EXISTS pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug VARCHAR(255) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  meta_title VARCHAR(255),
  meta_description TEXT,
  is_active BOOLEAN DEFAULT true,
  layout_template VARCHAR(100) DEFAULT 'default',
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug);
CREATE INDEX IF NOT EXISTS idx_pages_is_active ON pages(is_active);
CREATE INDEX IF NOT EXISTS idx_pages_created_by ON pages(created_by);
CREATE INDEX IF NOT EXISTS idx_pages_updated_at ON pages(updated_at DESC);

-- Add comment
COMMENT ON TABLE pages IS 'Static website pages with editable sections';
COMMENT ON COLUMN pages.slug IS 'URL-friendly identifier (e.g., "about-us", "programs")';
COMMENT ON COLUMN pages.layout_template IS 'Template name for page rendering (e.g., "default", "full-width")';
COMMENT ON COLUMN pages.is_active IS 'Whether page is published and visible on website';
