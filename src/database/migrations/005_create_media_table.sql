-- Create media table for tracking uploaded files
CREATE TABLE IF NOT EXISTS media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  filename VARCHAR(500) NOT NULL,
  original_name VARCHAR(500),
  mime_type VARCHAR(100),
  size_bytes INTEGER,
  file_path TEXT NOT NULL,
  url TEXT NOT NULL,
  alt_text VARCHAR(500),
  uploaded_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_media_uploaded_by ON media(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_media_created_at ON media(created_at DESC);
