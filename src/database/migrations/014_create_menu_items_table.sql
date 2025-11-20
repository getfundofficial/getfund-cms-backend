-- Create menu_items table for managing navigation menu
CREATE TABLE IF NOT EXISTS menu_items (
  id SERIAL PRIMARY KEY,
  label VARCHAR(100) NOT NULL,
  url VARCHAR(500) NOT NULL,
  page_slug VARCHAR(255),
  order_index INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  item_type VARCHAR(20) NOT NULL CHECK (item_type IN ('menu', 'cta')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  -- Foreign key to pages table for linked pages
  CONSTRAINT fk_menu_page FOREIGN KEY (page_slug)
    REFERENCES pages(slug) ON DELETE SET NULL
);

-- Create index for ordering
CREATE INDEX IF NOT EXISTS idx_menu_items_order ON menu_items(order_index);

-- Create index for active items
CREATE INDEX IF NOT EXISTS idx_menu_items_active ON menu_items(is_active);

-- Create index for item type
CREATE INDEX IF NOT EXISTS idx_menu_items_type ON menu_items(item_type);

-- Add constraint to ensure max 5 menu items and 2 CTA buttons
CREATE OR REPLACE FUNCTION check_menu_item_limits()
RETURNS TRIGGER AS $$
BEGIN
  -- Check menu items limit (max 5)
  IF NEW.item_type = 'menu' THEN
    IF (SELECT COUNT(*) FROM menu_items WHERE item_type = 'menu' AND id != COALESCE(NEW.id, 0)) >= 5 THEN
      RAISE EXCEPTION 'Cannot add more than 5 menu items';
    END IF;
  END IF;

  -- Check CTA buttons limit (max 2)
  IF NEW.item_type = 'cta' THEN
    IF (SELECT COUNT(*) FROM menu_items WHERE item_type = 'cta' AND id != COALESCE(NEW.id, 0)) >= 2 THEN
      RAISE EXCEPTION 'Cannot add more than 2 CTA buttons';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to enforce limits
DROP TRIGGER IF EXISTS enforce_menu_item_limits ON menu_items;
CREATE TRIGGER enforce_menu_item_limits
  BEFORE INSERT OR UPDATE ON menu_items
  FOR EACH ROW
  EXECUTE FUNCTION check_menu_item_limits();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_menu_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update updated_at timestamp
DROP TRIGGER IF EXISTS update_menu_items_updated_at ON menu_items;
CREATE TRIGGER update_menu_items_updated_at
  BEFORE UPDATE ON menu_items
  FOR EACH ROW
  EXECUTE FUNCTION update_menu_items_updated_at();

-- Insert default menu items (without page_slug references for now)
INSERT INTO menu_items (label, url, order_index, item_type)
SELECT 'Home', '/', 0, 'menu'
WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE label = 'Home' AND item_type = 'menu');

INSERT INTO menu_items (label, url, order_index, item_type)
SELECT 'About', '/about', 1, 'menu'
WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE label = 'About' AND item_type = 'menu');

INSERT INTO menu_items (label, url, order_index, item_type)
SELECT 'Programs', '/programs', 2, 'menu'
WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE label = 'Programs' AND item_type = 'menu');

INSERT INTO menu_items (label, url, order_index, item_type)
SELECT 'News', '/news', 3, 'menu'
WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE label = 'News' AND item_type = 'menu');

INSERT INTO menu_items (label, url, order_index, item_type)
SELECT 'Contact', '/contact', 4, 'menu'
WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE label = 'Contact' AND item_type = 'menu');

-- Insert default CTA buttons
INSERT INTO menu_items (label, url, order_index, item_type)
SELECT 'Apply Now', '/apply', 0, 'cta'
WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE label = 'Apply Now' AND item_type = 'cta');

INSERT INTO menu_items (label, url, order_index, item_type)
SELECT 'Donate', '/donate', 1, 'cta'
WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE label = 'Donate' AND item_type = 'cta');
