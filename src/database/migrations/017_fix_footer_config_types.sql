-- Migration: Fix footer_config type mismatches
-- Description: Change footer_config ID and updated_by to UUID to match users and audit_logs tables
-- Date: 2025-12-09

-- Step 1: Add new UUID columns
ALTER TABLE footer_config
  ADD COLUMN id_new UUID DEFAULT uuid_generate_v4(),
  ADD COLUMN updated_by_new UUID;

-- Step 2: Update new UUID column with generated UUIDs for existing rows
UPDATE footer_config SET id_new = uuid_generate_v4() WHERE id_new IS NULL;

-- Step 3: Drop old constraints and indexes
DROP INDEX IF EXISTS idx_footer_config_active;
ALTER TABLE footer_config DROP CONSTRAINT IF EXISTS footer_config_pkey;
ALTER TABLE footer_config DROP CONSTRAINT IF EXISTS footer_config_updated_by_fkey;

-- Step 4: Drop old columns
ALTER TABLE footer_config DROP COLUMN id;
ALTER TABLE footer_config DROP COLUMN updated_by;

-- Step 5: Rename new columns
ALTER TABLE footer_config RENAME COLUMN id_new TO id;
ALTER TABLE footer_config RENAME COLUMN updated_by_new TO updated_by;

-- Step 6: Add primary key and constraints
ALTER TABLE footer_config ADD PRIMARY KEY (id);
ALTER TABLE footer_config
  ADD CONSTRAINT footer_config_updated_by_fkey
  FOREIGN KEY (updated_by) REFERENCES users(id);

-- Step 7: Recreate unique index
CREATE UNIQUE INDEX idx_footer_config_active
  ON footer_config (is_active)
  WHERE is_active = true;
