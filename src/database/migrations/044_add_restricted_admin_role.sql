-- Add restricted_admin to the users role constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check
  CHECK (role IN ('admin', 'restricted_admin', 'creator', 'reviewer', 'approver'));
