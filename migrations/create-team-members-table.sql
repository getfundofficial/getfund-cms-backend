-- Create team_members table for managing leadership team
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  role VARCHAR(100) NOT NULL CHECK (role IN ('board_chairman', 'board_member', 'management', 'historical_admin')),
  image_url TEXT,
  bio TEXT,
  date_range VARCHAR(50), -- For historical admins (e.g., "2001-2009")
  display_order INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_team_members_role ON team_members(role);
CREATE INDEX IF NOT EXISTS idx_team_members_status ON team_members(status);
CREATE INDEX IF NOT EXISTS idx_team_members_order ON team_members(display_order);

-- Note: Trigger for updated_at will be managed by the application

-- Add comments for documentation
COMMENT ON TABLE team_members IS 'Stores information about GETFund leadership team members';
COMMENT ON COLUMN team_members.role IS 'board_chairman, board_member, management, or historical_admin';
COMMENT ON COLUMN team_members.date_range IS 'For historical admins only (e.g., "2001-2009")';
COMMENT ON COLUMN team_members.display_order IS 'Controls the order of display in the UI';
