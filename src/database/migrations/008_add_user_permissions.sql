-- Add permissions column to users table (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'permissions'
  ) THEN
    ALTER TABLE users
    ADD COLUMN permissions JSONB DEFAULT '["news", "hero_slide"]'::jsonb;
  END IF;
END $$;

-- Update existing users with default permissions
-- Admins get all permissions
UPDATE users
SET permissions = '["news", "hero_slide"]'::jsonb
WHERE role = 'admin';

-- Creators get all content type permissions by default
UPDATE users
SET permissions = '["news", "hero_slide"]'::jsonb
WHERE role = 'creator';

-- Reviewers and approvers don't create content, so empty permissions
UPDATE users
SET permissions = '[]'::jsonb
WHERE role IN ('reviewer', 'approver');

-- Add comment
COMMENT ON COLUMN users.permissions IS 'Array of content types the user can create/edit (e.g., ["news", "hero_slide"])';
