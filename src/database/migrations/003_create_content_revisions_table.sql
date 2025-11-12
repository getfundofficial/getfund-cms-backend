-- Create content_revisions table for version history
CREATE TABLE IF NOT EXISTS content_revisions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_id UUID REFERENCES content(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  title VARCHAR(500),
  excerpt TEXT,
  body TEXT,
  meta_data JSONB,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(content_id, version_number)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_revisions_content_id ON content_revisions(content_id);
