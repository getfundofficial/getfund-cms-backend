-- Migration 035: Create donations table
-- Tracks all donations (general, campaign, and impact donations)
-- This is the main donations table that consolidates all donation types

CREATE TABLE IF NOT EXISTS donations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Donation type classification
  donation_type VARCHAR(50) NOT NULL DEFAULT 'general'
    CHECK (donation_type IN ('general', 'campaign', 'impact')),

  -- Category/title (e.g., "General Donation", campaign name, impact category)
  donation_category VARCHAR(255),

  -- Description of the donation
  donation_description TEXT,

  -- Donor's reason for donating (optional field for donor to explain their motivation)
  donation_reason TEXT,

  -- Donation frequency
  donation_frequency VARCHAR(20) DEFAULT 'one-time'
    CHECK (donation_frequency IN ('one-time', 'daily', 'weekly', 'monthly', 'yearly')),

  -- Payment information
  payment_reference VARCHAR(255) UNIQUE,
  amount DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
  currency VARCHAR(3) DEFAULT 'GHS' CHECK (currency IN ('GHS', 'USD', 'EUR', 'GBP')),
  payment_status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_method VARCHAR(50),

  -- Donor information
  donor_email VARCHAR(255),
  donor_phone VARCHAR(50),
  donor_name VARCHAR(255),
  donor_type VARCHAR(50) DEFAULT 'Individual'
    CHECK (donor_type IN ('Individual', 'Corporate', 'GETFund Beneficiary', 'Anonymous')),

  -- Campaign reference (for campaign donations)
  campaign_id UUID,
  campaign_slug VARCHAR(255),

  -- Additional metadata (payment codes, transaction IDs, etc.)
  metadata JSONB DEFAULT '{}' CHECK (jsonb_typeof(metadata) = 'object'),

  -- Timestamps
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_donations_type ON donations(donation_type);
CREATE INDEX IF NOT EXISTS idx_donations_category ON donations(donation_category);
CREATE INDEX IF NOT EXISTS idx_donations_status ON donations(payment_status);
CREATE INDEX IF NOT EXISTS idx_donations_donor_email ON donations(donor_email);
CREATE INDEX IF NOT EXISTS idx_donations_frequency ON donations(donation_frequency);
CREATE INDEX IF NOT EXISTS idx_donations_donor_type ON donations(donor_type);
CREATE INDEX IF NOT EXISTS idx_donations_campaign_id ON donations(campaign_id);
CREATE INDEX IF NOT EXISTS idx_donations_campaign_slug ON donations(campaign_slug);
CREATE INDEX IF NOT EXISTS idx_donations_paid_at ON donations(paid_at DESC) WHERE paid_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_donations_created_at ON donations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_donations_amount ON donations(amount DESC);

-- Auto-update timestamp trigger
CREATE OR REPLACE FUNCTION update_donations_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS update_donations_timestamp ON donations;
CREATE TRIGGER update_donations_timestamp
  BEFORE UPDATE ON donations
  FOR EACH ROW
  EXECUTE FUNCTION update_donations_timestamp();

-- Add comment for documentation
COMMENT ON TABLE donations IS 'Main donations table tracking all donation types (general, campaign, impact) with donor information and payment details';
COMMENT ON COLUMN donations.donation_type IS 'Type of donation: general (Ways to Donate), campaign (specific fundraising campaign), impact (specific impact category)';
COMMENT ON COLUMN donations.donation_category IS 'Category or title of the donation (e.g., General Donation, campaign name)';
COMMENT ON COLUMN donations.donation_reason IS 'Optional text where donor explains why they are donating';
COMMENT ON COLUMN donations.donation_frequency IS 'How often the donation recurs: one-time, daily, weekly, monthly, or yearly';
COMMENT ON COLUMN donations.donor_type IS 'Category of donor: Individual, Corporate (organization/company), GETFund Beneficiary, or Anonymous';
