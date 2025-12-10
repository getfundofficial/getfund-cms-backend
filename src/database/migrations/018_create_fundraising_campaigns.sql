-- Migration 018: Create fundraising_campaigns table
-- This table stores all fundraising campaigns with progress tracking

CREATE TABLE IF NOT EXISTS fundraising_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT NOT NULL CHECK (char_length(description) <= 5000),
  image_url VARCHAR(500),

  -- Financial data with validation
  goal_amount DECIMAL(12, 2) NOT NULL CHECK (goal_amount > 0),
  raised_amount DECIMAL(12, 2) DEFAULT 0 CHECK (raised_amount >= 0),
  currency VARCHAR(3) DEFAULT 'GHS' CHECK (currency IN ('GHS', 'USD', 'EUR')),

  -- Campaign timing
  start_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  end_date TIMESTAMP WITH TIME ZONE,

  -- Status with strict enum
  status VARCHAR(20) NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'active', 'paused', 'completed', 'archived')),
  is_featured BOOLEAN DEFAULT false,

  -- Display settings
  display_order INTEGER DEFAULT 0 CHECK (display_order >= 0),
  button_text VARCHAR(50) DEFAULT 'Donate Now' CHECK (char_length(button_text) <= 50),

  -- Audit fields
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP,

  -- Date validation constraint
  CONSTRAINT valid_date_range CHECK (end_date IS NULL OR end_date > start_date)
);

-- Performance indexes
CREATE INDEX idx_campaigns_status ON fundraising_campaigns(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_campaigns_featured ON fundraising_campaigns(is_featured) WHERE deleted_at IS NULL;
CREATE INDEX idx_campaigns_slug ON fundraising_campaigns(slug) WHERE deleted_at IS NULL;
CREATE INDEX idx_campaigns_display_order ON fundraising_campaigns(display_order, created_at DESC);

-- Auto-update timestamp trigger
CREATE OR REPLACE FUNCTION update_campaigns_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER update_campaigns_timestamp
  BEFORE UPDATE ON fundraising_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_campaigns_timestamp();

-- Add comment for documentation
COMMENT ON TABLE fundraising_campaigns IS 'Stores fundraising campaign information with progress tracking and status management';
