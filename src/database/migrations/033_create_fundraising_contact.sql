-- Create fundraising_contact table for the floating contact button on fundraising pages
CREATE TABLE IF NOT EXISTS fundraising_contact (
  id SERIAL PRIMARY KEY,
  phone VARCHAR(50) DEFAULT '+233 30 266 4061',
  email VARCHAR(100) DEFAULT 'info@getfund.gov.gh',
  address VARCHAR(200) DEFAULT 'GETFund House, Accra',
  button_text VARCHAR(100) DEFAULT 'GET IN TOUCH WITH FUNDRAISING!',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by INTEGER REFERENCES users(id)
);

-- Insert default record
INSERT INTO fundraising_contact (phone, email, address, button_text, is_active)
VALUES ('+233 30 266 4061', 'info@getfund.gov.gh', 'GETFund House, Accra', 'GET IN TOUCH WITH FUNDRAISING!', true)
ON CONFLICT DO NOTHING;

-- Add button_text column if table already exists
ALTER TABLE fundraising_contact ADD COLUMN IF NOT EXISTS button_text VARCHAR(100) DEFAULT 'GET IN TOUCH WITH FUNDRAISING!';

COMMENT ON TABLE fundraising_contact IS 'Stores contact information for the floating contact button on fundraising pages';
