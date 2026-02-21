-- Add category column to partners table for distinguishing partner types (e.g., 'university')
ALTER TABLE partners ADD COLUMN IF NOT EXISTS category VARCHAR(50);
CREATE INDEX IF NOT EXISTS idx_partners_category ON partners(category);
