-- Add deleted_at column to media table for soft deletes
ALTER TABLE media ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP DEFAULT NULL;

-- Index for filtering out deleted media
CREATE INDEX IF NOT EXISTS idx_media_deleted_at ON media(deleted_at);
