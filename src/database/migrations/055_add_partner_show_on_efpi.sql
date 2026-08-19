-- Which partners appear on the EFPI site.
--
-- The partners table serves both sites, but they mean different things by the
-- word. GETFund's list is mostly scholarship partner universities — 22 of the
-- 25 rows today. EFPI's is the organisations funding education projects, which
-- is currently three of them. Showing one site's list on the other would be
-- wrong in both directions.
--
-- A column rather than a category, because the two are independent: an
-- organisation can be a scholarship university and an EFPI funding partner at
-- once, and category already carries its own meaning.
--
-- Defaults to false. A partner added for GETFund tomorrow does not quietly
-- appear on EFPI — it has to be chosen. That is the point of the column: the
-- alternative considered was inferring it from "not a university", which is a
-- rule nobody states and everybody forgets.

BEGIN;

ALTER TABLE partners ADD COLUMN IF NOT EXISTS show_on_efpi BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_partners_efpi
  ON partners(show_on_efpi, display_order) WHERE show_on_efpi;

COMMENT ON COLUMN partners.show_on_efpi IS 'Show this partner on the EFPI website partner page';

COMMIT;

-- Reversing this:
--   DROP INDEX IF EXISTS idx_partners_efpi;
--   ALTER TABLE partners DROP COLUMN show_on_efpi;
