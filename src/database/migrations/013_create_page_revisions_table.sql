-- Migration 013: Create page_revisions table for Page CMS
-- This table stores version history for page sections

CREATE TABLE IF NOT EXISTS page_revisions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  section_id UUID REFERENCES page_sections(id) ON DELETE CASCADE,
  content_snapshot JSONB NOT NULL,
  changed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  change_summary TEXT,
  version_number INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_page_revisions_page_id ON page_revisions(page_id);
CREATE INDEX IF NOT EXISTS idx_page_revisions_section_id ON page_revisions(section_id);
CREATE INDEX IF NOT EXISTS idx_page_revisions_changed_by ON page_revisions(changed_by);
CREATE INDEX IF NOT EXISTS idx_page_revisions_created_at ON page_revisions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_revisions_version ON page_revisions(page_id, section_id, version_number DESC);

-- Add comments
COMMENT ON TABLE page_revisions IS 'Version history for page sections';
COMMENT ON COLUMN page_revisions.page_id IS 'Page this revision belongs to';
COMMENT ON COLUMN page_revisions.section_id IS 'Section this revision belongs to (NULL for page-level changes)';
COMMENT ON COLUMN page_revisions.content_snapshot IS 'Complete content at time of save';
COMMENT ON COLUMN page_revisions.change_summary IS 'Description of what changed';
COMMENT ON COLUMN page_revisions.version_number IS 'Sequential version number';
