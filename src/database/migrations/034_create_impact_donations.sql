-- Migration 034: Create impact_donations table
-- Tracks donations made through the "Ways to Donate" page impact options

CREATE TABLE IF NOT EXISTS impact_donations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Donation category (e.g., "Classroom construction support", "School Meals")
  donation_type VARCHAR(255) NOT NULL,
  donation_description TEXT,

  -- Payment information
  payment_reference VARCHAR(255) UNIQUE,
  amount DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
  currency VARCHAR(3) DEFAULT 'GHS' CHECK (currency IN ('GHS', 'USD', 'EUR')),
  payment_status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),

  -- Donor information
  donor_email VARCHAR(255) CHECK (donor_email ~ '^[^@]+@[^@]+\.[^@]+$'),
  donor_phone VARCHAR(50),
  donor_name VARCHAR(255),
  donor_type VARCHAR(50) DEFAULT 'Individual'
    CHECK (donor_type IN ('Individual', 'Corporate', 'Organization', 'Anonymous')),

  -- Donation settings
  frequency VARCHAR(20) DEFAULT 'one-time'
    CHECK (frequency IN ('one-time', 'monthly', 'quarterly', 'yearly')),
  is_anonymous BOOLEAN DEFAULT false,

  -- Additional metadata
  metadata JSONB DEFAULT '{}' CHECK (jsonb_typeof(metadata) = 'object'),
  payment_method VARCHAR(50),
  notes TEXT,

  -- Timestamps
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_impact_donations_type ON impact_donations(donation_type);
CREATE INDEX IF NOT EXISTS idx_impact_donations_status ON impact_donations(payment_status);
CREATE INDEX IF NOT EXISTS idx_impact_donations_donor_email ON impact_donations(donor_email);
CREATE INDEX IF NOT EXISTS idx_impact_donations_paid_at ON impact_donations(paid_at DESC) WHERE paid_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_impact_donations_created_at ON impact_donations(created_at DESC);

-- Auto-update timestamp trigger
CREATE OR REPLACE FUNCTION update_impact_donations_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS update_impact_donations_timestamp ON impact_donations;
CREATE TRIGGER update_impact_donations_timestamp
  BEFORE UPDATE ON impact_donations
  FOR EACH ROW
  EXECUTE FUNCTION update_impact_donations_timestamp();

-- Add comment for documentation
COMMENT ON TABLE impact_donations IS 'Tracks donations made through the Ways to Donate page impact options (not tied to specific campaigns)';
