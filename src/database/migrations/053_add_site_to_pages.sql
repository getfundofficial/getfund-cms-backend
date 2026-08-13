-- Make the CMS serve more than one site.
--
-- EFPI (efpi.getfund.gov.gh) is a second site that should be edited from this
-- CMS, and its pages want everything `pages` and `page_sections` already give:
-- sections, revisions, permissions, media, the lot. A parallel set of tables
-- would mean a second copy of all of it, drifting from this one.
--
-- What stands in the way is that `pages.slug` is globally unique, and both
-- sites have an `about`, an `impact` and a `contact`. So the identity of a page
-- becomes (site, slug) rather than slug alone.
--
-- Existing rows are all GETFund, which is why `site` defaults to 'getfund':
-- every current row and every query that does not mention a site keeps the
-- behaviour it has today.
--
-- Order matters here. `menu_items.page_slug` carries a foreign key onto
-- `pages(slug)`, and that key is what makes the unique constraint
-- undroppable — so it comes off first and goes back on afterwards against the
-- new composite key.

BEGIN;

-- 1. The dependent foreign key, so the unique constraint can be dropped.
ALTER TABLE menu_items DROP CONSTRAINT IF EXISTS fk_menu_page;

-- 2. Which site each page belongs to.
ALTER TABLE pages ADD COLUMN IF NOT EXISTS site VARCHAR(20) NOT NULL DEFAULT 'getfund';

ALTER TABLE pages DROP CONSTRAINT IF EXISTS pages_site_check;
ALTER TABLE pages ADD CONSTRAINT pages_site_check CHECK (site IN ('getfund', 'efpi'));

-- 3. Slug is unique per site, not globally.
ALTER TABLE pages DROP CONSTRAINT IF EXISTS pages_slug_key;
ALTER TABLE pages DROP CONSTRAINT IF EXISTS pages_site_slug_key;
ALTER TABLE pages ADD CONSTRAINT pages_site_slug_key UNIQUE (site, slug);

-- 4. Menu items belong to a site too — each site has its own navigation.
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS site VARCHAR(20) NOT NULL DEFAULT 'getfund';

ALTER TABLE menu_items DROP CONSTRAINT IF EXISTS menu_items_site_check;
ALTER TABLE menu_items ADD CONSTRAINT menu_items_site_check CHECK (site IN ('getfund', 'efpi'));

-- 5. Re-attach the foreign key against the new composite identity.
ALTER TABLE menu_items
  ADD CONSTRAINT fk_menu_page FOREIGN KEY (site, page_slug)
  REFERENCES pages(site, slug) ON DELETE SET NULL;

-- 6. Every lookup is now scoped by site, so the indexes should be too.
DROP INDEX IF EXISTS idx_pages_slug;
CREATE INDEX IF NOT EXISTS idx_pages_site_slug ON pages(site, slug);
CREATE INDEX IF NOT EXISTS idx_pages_site_active ON pages(site, is_active);
CREATE INDEX IF NOT EXISTS idx_menu_items_site_order ON menu_items(site, order_index);

COMMENT ON COLUMN pages.site IS 'Which site this page belongs to: getfund or efpi';
COMMENT ON COLUMN menu_items.site IS 'Which site this menu item belongs to';

COMMIT;

-- Reversing this, should it be needed:
--
--   ALTER TABLE menu_items DROP CONSTRAINT fk_menu_page;
--   ALTER TABLE pages DROP CONSTRAINT pages_site_slug_key;
--   DELETE FROM pages WHERE site = 'efpi';        -- or the unique add below fails
--   ALTER TABLE pages ADD CONSTRAINT pages_slug_key UNIQUE (slug);
--   ALTER TABLE menu_items ADD CONSTRAINT fk_menu_page FOREIGN KEY (page_slug)
--     REFERENCES pages(slug) ON DELETE SET NULL;
--   ALTER TABLE menu_items DROP COLUMN site;
--   ALTER TABLE pages DROP COLUMN site;
