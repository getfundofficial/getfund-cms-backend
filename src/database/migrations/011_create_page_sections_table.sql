-- Migration 011: Create page_sections table for Page CMS
-- This table stores individual editable sections within pages

CREATE TABLE IF NOT EXISTS page_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  section_key VARCHAR(100) NOT NULL,
  section_type VARCHAR(50) NOT NULL,
  title VARCHAR(255),
  content JSONB NOT NULL DEFAULT '{}',
  order_index INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_page_section_key UNIQUE (page_id, section_key)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_page_sections_page_id ON page_sections(page_id);
CREATE INDEX IF NOT EXISTS idx_page_sections_section_key ON page_sections(section_key);
CREATE INDEX IF NOT EXISTS idx_page_sections_section_type ON page_sections(section_type);
CREATE INDEX IF NOT EXISTS idx_page_sections_order_index ON page_sections(page_id, order_index);
CREATE INDEX IF NOT EXISTS idx_page_sections_is_active ON page_sections(is_active);
CREATE INDEX IF NOT EXISTS idx_page_sections_content ON page_sections USING GIN (content);

-- Add comments
COMMENT ON TABLE page_sections IS 'Editable sections within static pages';
COMMENT ON COLUMN page_sections.section_key IS 'Unique identifier within page (e.g., "hero", "mission", "stats")';
COMMENT ON COLUMN page_sections.section_type IS 'Type of content: text, html, image, gallery, video, stats, hero, cta';
COMMENT ON COLUMN page_sections.content IS 'Flexible JSON content based on section_type';
COMMENT ON COLUMN page_sections.order_index IS 'Display order of sections on page';
COMMENT ON COLUMN page_sections.is_active IS 'Whether section is visible on website';
