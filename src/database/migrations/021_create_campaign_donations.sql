-- Migration 021: Create campaign_donations table
-- Tracks all donations to campaigns with automatic raised_amount updates

CREATE TABLE IF NOT EXISTS campaign_donations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Campaign link (CASCADE delete for integrity)
  campaign_id UUID NOT NULL REFERENCES fundraising_campaigns(id) ON DELETE CASCADE,

  -- Payment information (validated)
  payment_reference VARCHAR(255) NOT NULL UNIQUE,
  amount DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
  currency VARCHAR(3) DEFAULT 'GHS' CHECK (currency IN ('GHS', 'USD', 'EUR')),
  payment_status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),

  -- Donor information (validated, respects privacy)
  donor_email VARCHAR(255) NOT NULL CHECK (donor_email ~ '^[^@]+@[^@]+\.[^@]+$'),
  donor_phone VARCHAR(50),
  donor_name VARCHAR(255) CHECK (char_length(donor_name) <= 255),
  donor_type VARCHAR(50) DEFAULT 'Individual'
    CHECK (donor_type IN ('Individual', 'Corporate', 'Organization', 'Anonymous')),

  -- Donation settings
  frequency VARCHAR(20) DEFAULT 'one-time'
    CHECK (frequency IN ('one-time', 'monthly', 'quarterly', 'yearly')),
  is_anonymous BOOLEAN DEFAULT false,

  -- Secure metadata storage (JSONB for flexibility)
  metadata JSONB DEFAULT '{}' CHECK (jsonb_typeof(metadata) = 'object'),
  payment_method VARCHAR(50) CHECK (char_length(payment_method) <= 50),

  -- Timestamps
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Validation: completed donations must have paid_at timestamp
  CONSTRAINT paid_donation_has_timestamp CHECK (
    (payment_status != 'completed') OR
    (payment_status = 'completed' AND paid_at IS NOT NULL)
  )
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_campaign_donations_campaign_id ON campaign_donations(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_donations_status ON campaign_donations(payment_status);
CREATE INDEX IF NOT EXISTS idx_campaign_donations_donor_email ON campaign_donations(donor_email);
CREATE INDEX IF NOT EXISTS idx_campaign_donations_paid_at ON campaign_donations(paid_at DESC) WHERE paid_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_campaign_donations_payment_ref ON campaign_donations(payment_reference);

-- Auto-update timestamp trigger
CREATE OR REPLACE FUNCTION update_campaign_donations_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS update_campaign_donations_timestamp ON campaign_donations;
CREATE TRIGGER update_campaign_donations_timestamp
  BEFORE UPDATE ON campaign_donations
  FOR EACH ROW
  EXECUTE FUNCTION update_campaign_donations_timestamp();

-- CRITICAL: Trigger to update campaign raised_amount (atomic operation)
CREATE OR REPLACE FUNCTION update_campaign_raised_amount()
RETURNS TRIGGER AS $$
BEGIN
  -- Payment status changed to 'completed' (add to raised amount)
  IF NEW.payment_status = 'completed' AND (OLD.payment_status IS NULL OR OLD.payment_status != 'completed') THEN
    UPDATE fundraising_campaigns
    SET raised_amount = raised_amount + NEW.amount,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.campaign_id AND deleted_at IS NULL;
  END IF;

  -- Payment status changed from 'completed' to 'refunded' (subtract from raised amount)
  IF OLD.payment_status = 'completed' AND NEW.payment_status = 'refunded' THEN
    UPDATE fundraising_campaigns
    SET raised_amount = GREATEST(0, raised_amount - NEW.amount),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.campaign_id AND deleted_at IS NULL;

    -- Mark lottery entry as invalid
    UPDATE lottery_entries
    SET is_valid = false,
        updated_at = CURRENT_TIMESTAMP
    WHERE payment_reference = NEW.payment_reference;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS update_campaign_raised_amount ON campaign_donations;
CREATE TRIGGER update_campaign_raised_amount
  AFTER UPDATE ON campaign_donations
  FOR EACH ROW
  EXECUTE FUNCTION update_campaign_raised_amount();

-- Add comment for documentation
COMMENT ON TABLE campaign_donations IS 'Tracks all donations to campaigns with automatic raised_amount updates via triggers';
