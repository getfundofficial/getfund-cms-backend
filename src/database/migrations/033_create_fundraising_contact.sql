-- Create fundraising_contact table for the floating contact button on fundraising pages
CREATE TABLE IF NOT EXISTS fundraising_contact (
  id SERIAL PRIMARY KEY,
  phone VARCHAR(50) DEFAULT '+233 30 266 4061',
  email VARCHAR(100) DEFAULT 'info@getfund.gov.gh',
  address VARCHAR(200) DEFAULT 'GETFund House, Accra',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by INTEGER REFERENCES users(id)
);

-- Insert default record
INSERT INTO fundraising_contact (phone, email, address, is_active)
VALUES ('+233 30 266 4061', 'info@getfund.gov.gh', 'GETFund House, Accra', true)
ON CONFLICT DO NOTHING;

COMMENT ON TABLE fundraising_contact IS 'Stores contact information for the floating contact button on fundraising pages';
