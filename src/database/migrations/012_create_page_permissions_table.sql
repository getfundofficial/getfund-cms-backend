-- Migration 012: Create page_permissions table for Page CMS
-- This table stores granular permissions for pages and sections

CREATE TABLE IF NOT EXISTS page_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_id UUID REFERENCES pages(id) ON DELETE CASCADE,
  section_id UUID REFERENCES page_sections(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50),
  permission_type VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_permission_target CHECK (
    (page_id IS NOT NULL AND section_id IS NULL) OR
    (page_id IS NULL AND section_id IS NOT NULL)
  ),
  CONSTRAINT chk_permission_subject CHECK (
    (user_id IS NOT NULL AND role IS NULL) OR
    (user_id IS NULL AND role IS NOT NULL)
  ),
  CONSTRAINT chk_permission_type CHECK (
    permission_type IN ('view', 'edit', 'publish')
  ),
  CONSTRAINT chk_permission_role CHECK (
    role IS NULL OR role IN ('admin', 'creator', 'reviewer', 'approver')
  )
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_page_permissions_page_id ON page_permissions(page_id);
CREATE INDEX IF NOT EXISTS idx_page_permissions_section_id ON page_permissions(section_id);
CREATE INDEX IF NOT EXISTS idx_page_permissions_user_id ON page_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_page_permissions_role ON page_permissions(role);
CREATE INDEX IF NOT EXISTS idx_page_permissions_type ON page_permissions(permission_type);

-- Prevent duplicate permissions
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_page_user_permission
  ON page_permissions(page_id, user_id, permission_type)
  WHERE page_id IS NOT NULL AND user_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_page_role_permission
  ON page_permissions(page_id, role, permission_type)
  WHERE page_id IS NOT NULL AND role IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_section_user_permission
  ON page_permissions(section_id, user_id, permission_type)
  WHERE section_id IS NOT NULL AND user_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_section_role_permission
  ON page_permissions(section_id, role, permission_type)
  WHERE section_id IS NOT NULL AND role IS NOT NULL;

-- Add comments
COMMENT ON TABLE page_permissions IS 'Granular permissions for pages and sections';
COMMENT ON COLUMN page_permissions.page_id IS 'Page-level permission (NULL for section-level)';
COMMENT ON COLUMN page_permissions.section_id IS 'Section-level permission (NULL for page-level)';
COMMENT ON COLUMN page_permissions.user_id IS 'User-specific permission (NULL for role-based)';
COMMENT ON COLUMN page_permissions.role IS 'Role-based permission (NULL for user-specific)';
COMMENT ON COLUMN page_permissions.permission_type IS 'Type: view, edit, or publish';
