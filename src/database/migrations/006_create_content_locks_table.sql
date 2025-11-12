-- Create content_locks table to prevent simultaneous editing
CREATE TABLE IF NOT EXISTS content_locks (
  content_id UUID PRIMARY KEY REFERENCES content(id) ON DELETE CASCADE,
  locked_by UUID REFERENCES users(id),
  locked_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL
);

-- Index for cleaning up expired locks
CREATE INDEX IF NOT EXISTS idx_locks_expires ON content_locks(expires_at);
