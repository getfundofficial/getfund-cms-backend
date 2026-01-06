-- Migration: Update user permissions to granular structure
-- This replaces the simple array with a structured JSONB object

-- Update permissions column to new structure for existing users based on role

-- Admin users get full access
UPDATE users
SET permissions = '{
  "navigation": {
    "dashboard": true,
    "news": true,
    "pages": true,
    "heroSlides": true,
    "mediaLibrary": true,
    "impactStats": true,
    "campaigns": true,
    "teamMembers": true,
    "reviewQueue": true,
    "approvalQueue": true
  },
  "admin": {
    "users": true,
    "menuConfig": true,
    "footerSettings": true,
    "auditLogs": true,
    "lotteryConfig": true,
    "lotteryEntries": true,
    "pledges": true
  },
  "actions": {
    "canPublish": true,
    "canReview": true,
    "canDelete": true
  }
}'::jsonb
WHERE role = 'admin';

-- Creator users get content access but no admin features
UPDATE users
SET permissions = '{
  "navigation": {
    "dashboard": true,
    "news": true,
    "pages": true,
    "heroSlides": true,
    "mediaLibrary": true,
    "impactStats": true,
    "campaigns": true,
    "teamMembers": true,
    "reviewQueue": false,
    "approvalQueue": false
  },
  "admin": {
    "users": false,
    "menuConfig": false,
    "footerSettings": false,
    "auditLogs": false,
    "lotteryConfig": false,
    "lotteryEntries": false,
    "pledges": false
  },
  "actions": {
    "canPublish": false,
    "canReview": false,
    "canDelete": false
  }
}'::jsonb
WHERE role = 'creator';

-- Reviewer users get review queue access
UPDATE users
SET permissions = '{
  "navigation": {
    "dashboard": true,
    "news": true,
    "pages": true,
    "heroSlides": true,
    "mediaLibrary": true,
    "impactStats": true,
    "campaigns": true,
    "teamMembers": true,
    "reviewQueue": true,
    "approvalQueue": false
  },
  "admin": {
    "users": false,
    "menuConfig": false,
    "footerSettings": false,
    "auditLogs": false,
    "lotteryConfig": false,
    "lotteryEntries": false,
    "pledges": false
  },
  "actions": {
    "canPublish": false,
    "canReview": true,
    "canDelete": false
  }
}'::jsonb
WHERE role = 'reviewer';

-- Approver users get approval queue access
UPDATE users
SET permissions = '{
  "navigation": {
    "dashboard": true,
    "news": true,
    "pages": true,
    "heroSlides": true,
    "mediaLibrary": true,
    "impactStats": true,
    "campaigns": true,
    "teamMembers": true,
    "reviewQueue": false,
    "approvalQueue": true
  },
  "admin": {
    "users": false,
    "menuConfig": false,
    "footerSettings": false,
    "auditLogs": false,
    "lotteryConfig": false,
    "lotteryEntries": false,
    "pledges": false
  },
  "actions": {
    "canPublish": true,
    "canReview": false,
    "canDelete": false
  }
}'::jsonb
WHERE role = 'approver';

-- Update comment on permissions column
COMMENT ON COLUMN users.permissions IS 'Granular permissions object with navigation, admin, and actions sections';
