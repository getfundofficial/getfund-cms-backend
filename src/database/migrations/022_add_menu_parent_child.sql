-- Migration 022: Add menu parent-child support to pages table
-- Enables hierarchical dropdown menu structure

-- Add menu columns to pages table (some may already exist)
ALTER TABLE pages
  ADD COLUMN IF NOT EXISTS parent_page_id UUID REFERENCES pages(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS show_in_menu BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS menu_label VARCHAR(100) CHECK (char_length(menu_label) <= 100),
  ADD COLUMN IF NOT EXISTS menu_order INTEGER DEFAULT 0 CHECK (menu_order >= 0),
  ADD COLUMN IF NOT EXISTS is_cta_button BOOLEAN DEFAULT false;

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_pages_show_in_menu ON pages(show_in_menu) WHERE show_in_menu = true;
CREATE INDEX IF NOT EXISTS idx_pages_parent_page_id ON pages(parent_page_id) WHERE parent_page_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_pages_menu_order ON pages(menu_order, created_at);

-- Prevent circular parent-child relationships
CREATE OR REPLACE FUNCTION prevent_circular_menu_hierarchy()
RETURNS TRIGGER AS $$
DECLARE
  ancestor_id UUID;
BEGIN
  -- If no parent, allow
  IF NEW.parent_page_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Check if parent references self
  IF NEW.parent_page_id = NEW.id THEN
    RAISE EXCEPTION 'Page cannot be its own parent';
  END IF;

  -- Check for circular reference (parent's parent cannot be this page)
  SELECT parent_page_id INTO ancestor_id FROM pages WHERE id = NEW.parent_page_id;
  IF ancestor_id = NEW.id THEN
    RAISE EXCEPTION 'Circular menu hierarchy detected';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER prevent_circular_menu_hierarchy_trigger
  BEFORE INSERT OR UPDATE ON pages
  FOR EACH ROW
  EXECUTE FUNCTION prevent_circular_menu_hierarchy();

-- Add comment for documentation
COMMENT ON COLUMN pages.parent_page_id IS 'Parent page for dropdown menu structure';
COMMENT ON COLUMN pages.show_in_menu IS 'Whether page appears in navigation menu';
COMMENT ON COLUMN pages.menu_label IS 'Custom label for menu (defaults to title)';
COMMENT ON COLUMN pages.menu_order IS 'Sort order in menu';
