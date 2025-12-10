-- Migration 020: Create lottery_entries table
-- Tracks all lottery entries from donations

CREATE TABLE IF NOT EXISTS lottery_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Payment linkage with uniqueness constraint (prevents duplicates)
  payment_reference VARCHAR(255) NOT NULL UNIQUE,
  donation_amount DECIMAL(12, 2) NOT NULL CHECK (donation_amount > 0),
  currency VARCHAR(3) DEFAULT 'GHS' CHECK (currency IN ('GHS', 'USD', 'EUR')),

  -- Donor information (validated)
  donor_email VARCHAR(255) NOT NULL CHECK (donor_email ~ '^[^@]+@[^@]+\.[^@]+$'),
  donor_phone VARCHAR(50),
  donor_name VARCHAR(255) CHECK (char_length(donor_name) <= 255),

  -- Campaign link (optional, with CASCADE delete)
  campaign_id UUID REFERENCES fundraising_campaigns(id) ON DELETE SET NULL,

  -- Draw assignment (immutable after creation)
  draw_month DATE NOT NULL,

  -- Winner status
  is_winner BOOLEAN DEFAULT false,
  is_valid BOOLEAN DEFAULT true, -- For handling refunds
  prize_rank INTEGER CHECK (prize_rank IS NULL OR prize_rank > 0),
  prize_amount DECIMAL(12, 2) CHECK (prize_amount IS NULL OR prize_amount > 0),
  notified_at TIMESTAMP WITH TIME ZONE,
  claimed_at TIMESTAMP WITH TIME ZONE,

  -- Audit fields
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Validation: winner must have prize details
  CONSTRAINT winner_has_prize CHECK (
    (is_winner = false) OR
    (is_winner = true AND prize_rank IS NOT NULL AND prize_amount IS NOT NULL)
  )
);

-- Performance indexes
CREATE INDEX idx_lottery_entries_draw_month ON lottery_entries(draw_month) WHERE is_valid = true;
CREATE INDEX idx_lottery_entries_donor_email ON lottery_entries(donor_email);
CREATE INDEX idx_lottery_entries_campaign_id ON lottery_entries(campaign_id) WHERE campaign_id IS NOT NULL;
CREATE INDEX idx_lottery_entries_is_winner ON lottery_entries(is_winner) WHERE is_winner = true;
CREATE INDEX idx_lottery_entries_payment_ref ON lottery_entries(payment_reference);

-- Auto-update timestamp trigger
CREATE OR REPLACE FUNCTION update_lottery_entries_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER update_lottery_entries_timestamp
  BEFORE UPDATE ON lottery_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_lottery_entries_timestamp();

-- Add comment for documentation
COMMENT ON TABLE lottery_entries IS 'Tracks all lottery entries generated from donations with winner management';
