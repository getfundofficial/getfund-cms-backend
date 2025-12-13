-- Migration 024: Create pledge_to_support table
-- Tracks pledge-to-support form submissions from the Ways to Donate page

CREATE TABLE IF NOT EXISTS pledge_to_support (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Personal information (validated)
  first_name VARCHAR(100) NOT NULL CHECK (char_length(first_name) >= 1),
  last_name VARCHAR(100) NOT NULL CHECK (char_length(last_name) >= 1),
  email VARCHAR(255) NOT NULL CHECK (email ~ '^[^@]+@[^@]+\.[^@]+$'),

  -- Phone information
  phone_country_code VARCHAR(10) NOT NULL CHECK (char_length(phone_country_code) >= 1),
  phone_number VARCHAR(20) NOT NULL CHECK (char_length(phone_number) >= 5),

  -- Location information
  country VARCHAR(100) NOT NULL,
  address TEXT,

  -- Donation details
  donation_description TEXT NOT NULL CHECK (char_length(donation_description) >= 10),

  -- Status tracking
  status VARCHAR(20) DEFAULT 'pending'
    CHECK (status IN ('pending', 'contacted', 'completed', 'cancelled')),
  notes TEXT, -- Admin notes

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_pledge_to_support_email ON pledge_to_support(email);
CREATE INDEX IF NOT EXISTS idx_pledge_to_support_country ON pledge_to_support(country);
CREATE INDEX IF NOT EXISTS idx_pledge_to_support_status ON pledge_to_support(status);
CREATE INDEX IF NOT EXISTS idx_pledge_to_support_created_at ON pledge_to_support(created_at DESC);

-- Auto-update timestamp trigger
CREATE OR REPLACE FUNCTION update_pledge_to_support_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS update_pledge_to_support_timestamp ON pledge_to_support;
CREATE TRIGGER update_pledge_to_support_timestamp
  BEFORE UPDATE ON pledge_to_support
  FOR EACH ROW
  EXECUTE FUNCTION update_pledge_to_support_timestamp();

-- Add comment for documentation
COMMENT ON TABLE pledge_to_support IS 'Tracks pledge-to-support form submissions from the Ways to Donate page';
