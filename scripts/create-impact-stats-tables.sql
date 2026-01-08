-- Create impact_stats table
CREATE TABLE IF NOT EXISTS impact_stats (
  id SERIAL PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  value VARCHAR(50) NOT NULL,
  color VARCHAR(50) DEFAULT 'primary',
  page VARCHAR(50) NOT NULL, -- 'why-fundraising', 'ways-to-donate', 'all'
  order_number INTEGER DEFAULT 999,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create impact_stats_config table for titles and subtitles
CREATE TABLE IF NOT EXISTS impact_stats_config (
  id SERIAL PRIMARY KEY,
  page VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(100) DEFAULT 'Our Impact',
  subtitle VARCHAR(200) DEFAULT '25+ years of giving',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_impact_stats_page ON impact_stats(page);
CREATE INDEX IF NOT EXISTS idx_impact_stats_order ON impact_stats(order_number);
CREATE INDEX IF NOT EXISTS idx_impact_stats_active ON impact_stats(is_active);

-- Insert default stats for why-fundraising and ways-to-donate pages
INSERT INTO impact_stats (title, value, color, page, order_number) VALUES
  ('Scholarships awarded –', '[TBD]', 'primary', 'all', 1),
  ('Infrastructure projects to date -', '[TBD]', 'primary', 'all', 2),
  ('Basic education', '[TBD]', 'gold', 'all', 3),
  ('Secondary education', '[TBD]', 'gold', 'all', 4),
  ('Tertiary education', '[TBD]', 'gold', 'all', 5),
  ('Model schools', '[TBD]', 'gold', 'all', 6),
  ('TVET', '[TBD]', 'gold', 'all', 7);

-- Insert default config
INSERT INTO impact_stats_config (page, title, subtitle) VALUES
  ('all', 'Our Impact', '25+ years of giving'),
  ('why-fundraising', 'Our Impact', '25+ years of giving'),
  ('ways-to-donate', 'Our Impact', '25+ years of giving');

-- Add comment
COMMENT ON TABLE impact_stats IS 'Stores impact statistics displayed on various pages';
COMMENT ON TABLE impact_stats_config IS 'Stores configuration like titles and subtitles for impact stats sections';
