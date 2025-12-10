-- Migration 019: Create lottery_config table
-- Single-row configuration table for GETfund Scholarship Lottery

CREATE TABLE IF NOT EXISTS lottery_config (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1), -- Single row enforced

  -- Prize structure (validated JSONB)
  prizes JSONB NOT NULL DEFAULT '[]'
    CHECK (jsonb_typeof(prizes) = 'array'),

  -- Draw settings
  next_draw_date TIMESTAMP WITH TIME ZONE NOT NULL,
  draw_frequency VARCHAR(20) DEFAULT 'monthly'
    CHECK (draw_frequency IN ('weekly', 'monthly', 'quarterly')),

  -- How It Works steps (validated JSONB)
  how_it_works_steps JSONB NOT NULL DEFAULT '[]'
    CHECK (jsonb_typeof(how_it_works_steps) = 'array'),

  -- Display settings
  is_active BOOLEAN DEFAULT true,
  banner_color VARCHAR(7) DEFAULT '#FCD34D'
    CHECK (banner_color ~ '^#[0-9A-Fa-f]{6}$'), -- Valid hex color

  -- Audit fields
  updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default secure configuration
INSERT INTO lottery_config (id, prizes, next_draw_date, how_it_works_steps)
VALUES (
  1,
  '[
    {"rank": 1, "amount": 50000, "description": "University Scholarship", "currency": "GHS"},
    {"rank": 2, "amount": 20000, "description": "Technical Education", "currency": "GHS"},
    {"rank": 3, "amount": 10000, "description": "Secondary School", "currency": "GHS"},
    {"rank": "additional", "count": 20, "amount": 1000, "description": "Additional Prize", "currency": "GHS"}
  ]'::jsonb,
  (CURRENT_DATE + INTERVAL '1 month')::timestamp with time zone,
  '[
    {"step": 1, "title": "Donate to Any Campaign", "description": "Every ¢10 donated gives you one lottery entry. The more you give, the better your chances!"},
    {"step": 2, "title": "Monthly Draw", "description": "Winners are selected transparently on the last Friday of each month via live broadcast."},
    {"step": 3, "title": "Claim Your Prize", "description": "Scholarship winners receive direct educational funding or can nominate deserving candidates."}
  ]'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- Add comment for documentation
COMMENT ON TABLE lottery_config IS 'Single-row configuration table for GETfund Scholarship Lottery settings';
