-- Migration: Create footer_config table
-- Description: Stores editable footer configuration for the website
-- Date: 2025-12-09

CREATE TABLE IF NOT EXISTS footer_config (
  id SERIAL PRIMARY KEY,

  -- Organization Info
  logo_url VARCHAR(500),
  about_text TEXT,

  -- Contact Information
  phone VARCHAR(50),
  email VARCHAR(100),
  address TEXT,

  -- Office Hours
  office_hours_weekday VARCHAR(100),
  office_hours_weekend VARCHAR(100),

  -- Footer Styling
  background_color VARCHAR(20) DEFAULT '#1e3a5f',

  -- Social Media Links (JSONB for flexibility)
  social_links JSONB DEFAULT '{}',

  -- Quick Links (JSONB array)
  quick_links JSONB DEFAULT '[]',

  -- Metadata
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by INTEGER REFERENCES users(id)
);

-- Only allow one active configuration
CREATE UNIQUE INDEX IF NOT EXISTS idx_footer_config_active
  ON footer_config (is_active)
  WHERE is_active = true;

-- Insert default configuration
INSERT INTO footer_config (
  logo_url,
  about_text,
  phone,
  email,
  address,
  office_hours_weekday,
  office_hours_weekend,
  background_color,
  social_links,
  quick_links
) VALUES (
  '/images/logos/getfund-logo-light-main.png',
  'Supporting the delivery of quality education to Ghanaians from basic to tertiary level',
  '+233 (544) 323-020',
  'info@getfund.gov.gh',
  'No. 42, 4th Close, Airport Residential Area, Accra',
  'Monday - Friday: 8:00 AM - 5:00 PM',
  'Saturday - Sunday: Closed',
  '#1e3a5f',
  '{"facebook": "https://www.facebook.com/getfund", "twitter": "https://twitter.com/GETFundOfficial", "linkedin": "https://www.linkedin.com/company/getfundofficial/", "instagram": "https://www.instagram.com/getfundofficial/", "youtube": "https://www.youtube.com/@GETFundOfficial", "whatsapp": "https://whatsapp.com/channel/0029VaF1QwFJvQ1Q2Q1Q2Q"}',
  '[{"name": "Who We Are", "href": "/who-we-are"}, {"name": "What We Do", "href": "/what-we-do"}, {"name": "Impact", "href": "/impact"}, {"name": "News & Updates", "href": "/news"}, {"name": "Resources", "href": "/resources"}, {"name": "Support Us", "href": "/support-us"}]'
)
ON CONFLICT DO NOTHING;
