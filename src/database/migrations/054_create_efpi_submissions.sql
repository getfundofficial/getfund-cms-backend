-- Form submissions from the EFPI site.
--
-- Three forms feed this: the contact page, the partner enquiry, and the
-- factsheet download. They are kept in one table rather than three because the
-- shape is the same every time — who, how to reach them, and whatever else that
-- particular form asked — and because a partner enquiry and a factsheet
-- download are the same thing to whoever follows them up: a lead.
--
-- The per-form questions live in `fields` as JSONB. The alternative, a column
-- per question, would mean a migration every time someone adds a field to a
-- form in the CMS.
--
-- `name` and `email` are lifted out of that JSONB into their own columns. They
-- are what every listing shows and what anyone searches by, and reaching into
-- JSONB for the one query that runs constantly is the wrong trade.

BEGIN;

CREATE TABLE IF NOT EXISTS efpi_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Which form: 'contact', 'partner', 'factsheet'.
  form_name VARCHAR(50) NOT NULL,
  -- The page it was submitted from, for context when following up.
  page VARCHAR(255),

  name VARCHAR(255),
  email VARCHAR(255),
  -- Everything the form collected, including name and email again. Keeping the
  -- submission whole means a question added later is still captured in full,
  -- even before anything here knows about it.
  fields JSONB NOT NULL DEFAULT '{}',

  -- Follow-up state. Deliberately minimal: enough to stop two people chasing
  -- the same enquiry, without pretending to be a CRM.
  is_handled BOOLEAN NOT NULL DEFAULT false,
  handled_by UUID REFERENCES users(id) ON DELETE SET NULL,
  handled_at TIMESTAMP,
  notes TEXT,

  -- Kept for abuse investigation only; not shown in the admin.
  ip_address VARCHAR(64),
  user_agent TEXT,

  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Newest first is the only order anyone reads these in.
CREATE INDEX IF NOT EXISTS idx_efpi_submissions_created ON efpi_submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_efpi_submissions_form ON efpi_submissions(form_name, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_efpi_submissions_unhandled ON efpi_submissions(is_handled, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_efpi_submissions_email ON efpi_submissions(email);

COMMENT ON TABLE efpi_submissions IS 'Contact, partner enquiry and factsheet submissions from the EFPI website';
COMMENT ON COLUMN efpi_submissions.fields IS 'The whole submission as sent, so later form changes are still captured';

COMMIT;

-- Reversing this:
--   DROP TABLE IF EXISTS efpi_submissions;
