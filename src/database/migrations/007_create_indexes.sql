-- Additional indexes for performance
CREATE INDEX IF NOT EXISTS idx_content_status ON content(status);
CREATE INDEX IF NOT EXISTS idx_content_type ON content(type);
CREATE INDEX IF NOT EXISTS idx_content_published ON content(type, status, published_at DESC) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_content_created_by ON content(created_by);
CREATE INDEX IF NOT EXISTS idx_content_slug ON content(slug);
CREATE INDEX IF NOT EXISTS idx_content_deleted ON content(deleted_at) WHERE deleted_at IS NULL;
