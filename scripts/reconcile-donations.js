/**
 * Asks Xcel what actually happened to donations still recorded as pending, and
 * writes the answer to both the CMS database and the fundraising CRM.
 *
 *   node scripts/reconcile-donations.js --dry-run        # ask, change nothing
 *   node scripts/reconcile-donations.js                  # last 14 days
 *   node scripts/reconcile-donations.js --all            # the whole backlog
 *
 * Why this exists: the Xcel webhook at app/api/payments/webhook/route.ts is the
 * only thing that ever moves a donation off `pending`. When it does not arrive
 * — a deploy mid-delivery, a network blip, an outage at either end — the
 * donation stays pending forever and nobody hears about money that was actually
 * received. On this site that went unnoticed for six months: 225 donations
 * recorded, 114 of them still pending, and no process anywhere asking Xcel
 * whether that was true.
 *
 * This is the process that asks. It is not a substitute for the webhook and
 * does not try to be: the webhook records a donation within seconds, this
 * catches what slipped. Running it when nothing is wrong does nothing at all.
 *
 * The EFPI site has had this since its own reconciliation was written
 * (EFPI-Website/server/reconcile.js). This is the same job for GETFund, with
 * one difference: EFPI keeps no donations table of its own and so writes only
 * to the CRM, while this site is the system of record and must update both.
 */

const { Pool } = require('pg');
require('dotenv').config();

const XCEL_API_URL = (process.env.XCEL_API_URL || 'https://api.xcelapp.com').replace(/\/+$/, '');
const XCEL_MERCHANT_ID = process.env.XCEL_MERCHANT_ID || '';
const XCEL_PUBLIC_KEY = process.env.XCEL_PUBLIC_KEY || '';

/*
 * Where confirmed donations are sent — the HRM's Fundraising CRM. Optional: with
 * it unset this still repairs the CMS database, and the artisan importer can
 * carry the result across afterwards. With it set the CRM is correct the moment
 * this finishes.
 */
const CRM_INGEST_URL = process.env.CRM_INGEST_URL || '';
const CRM_INGEST_SECRET = process.env.CRM_INGEST_SECRET || '';

const ALL = process.argv.includes('--all');
const DRY_RUN = process.argv.includes('--dry-run');

/*
 * Xcel's vocabulary for an outcome, which is wider than ours. Anything not named
 * here is treated as still pending — an unfamiliar status is a question we
 * cannot answer, and guessing at it would either invent income or write off a
 * donation that is merely slow.
 */
const PAID = new Set(['success', 'successful', 'completed', 'paid']);
const FAILED = new Set(['failed', 'cancelled', 'canceled', 'declined', 'expired', 'reversed']);

const log = (...parts) => console.log(new Date().toISOString(), '[reconcile]', ...parts);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 180000, // Neon sleeps; give it time to wake.
  max: 5,
});

/**
 * Donations whose outcome nobody has established.
 *
 * A fortnight by default, because that is the scheduled run's question: "has
 * anything just settled?" Re-asking about donations abandoned months ago, every
 * night, forever, is work with no chance of an answer. `--all` is the other
 * question, asked once rather than on a schedule: "is there anything in the
 * backlog we never resolved?" That is how a donation older than the window gets
 * confirmed at all.
 */
async function pendingDonations() {
  const { rows } = await pool.query(
    `SELECT payment_reference, amount, currency, paid_at
       FROM donations
      WHERE payment_status = 'pending'
        AND payment_reference IS NOT NULL
        ${ALL ? '' : "AND created_at >= NOW() - INTERVAL '14 days'"}
      ORDER BY created_at DESC`
  );
  return rows;
}

/**
 * Asks Xcel what actually happened. Nothing else is trusted for this.
 *
 * A refusal is raised rather than returned. Everything this cannot interpret
 * would otherwise fall through to "pending", which is indistinguishable from
 * Xcel calmly answering that the donor never paid — so an expired key or a
 * change of endpoint would produce a sweep reporting "114 still pending, 0
 * errors" and looking like a clean bill of health. That is precisely the silent
 * failure this script was written to end, and it must not be reintroduced by
 * the script itself.
 */
async function verifyWithXcel(reference) {
  const response = await fetch(
    `${XCEL_API_URL}/transactions-service/paygate/tsq/${encodeURIComponent(reference)}`,
    {
      headers: {
        'Content-Type': 'application/json',
        'X-MERCHANT-ID': XCEL_MERCHANT_ID,
        'X-PUBLIC-KEY': XCEL_PUBLIC_KEY,
      },
      signal: AbortSignal.timeout(20_000),
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} from Xcel`);
  }

  const data = await response.json().catch(() => ({}));
  const field = data.status ?? data.data?.status ?? null;

  // A 200 carrying no status at all is not an answer, whatever else it holds.
  if (field === null || field === '') {
    throw new Error('Xcel returned no status field');
  }

  // Xcel answers in upper case ("SUCCESS", "PENDING"); our sets are lower.
  const raw = String(field).toLowerCase();

  if (!PAID.has(raw) && !FAILED.has(raw) && raw !== 'pending') {
    // Left as pending on purpose — an unfamiliar word is not grounds to invent
    // income or write a donation off — but said out loud, because it means this
    // list has fallen behind Xcel's vocabulary.
    log(`${reference} -> unrecognised status "${raw}", treating as pending`);
  }

  return {
    status: PAID.has(raw) ? 'completed' : FAILED.has(raw) ? 'failed' : 'pending',
    raw: data,
  };
}

/**
 * Records the outcome against the three tables the webhook keeps in step, so a
 * donation settled here looks exactly like one settled by the callback.
 *
 * The amount is deliberately not written. This table already holds the figure
 * the donor agreed to; Xcel's verification response often omits it and returns
 * a zero, and taking that literally would turn a real donation into GHS 0.00 —
 * silently, and in the column every total is summed from.
 *
 * No lottery entry is created, though the webhook creates one on success. That
 * is a live prize draw, and back-filling entries for donations that settled
 * months ago is a decision about who is in a draw, not a data repair. See the
 * note at the end of this file.
 */
async function recordOutcome(reference, status) {
  const paidAt = status === 'completed' ? 'CURRENT_TIMESTAMP' : 'paid_at';

  await pool.query(
    `UPDATE donations
        SET payment_status = $2, paid_at = ${paidAt}, updated_at = CURRENT_TIMESTAMP
      WHERE payment_reference = $1`,
    [reference, status]
  );

  await pool.query(
    `UPDATE campaign_donations
        SET payment_status = $2, paid_at = ${paidAt}, updated_at = CURRENT_TIMESTAMP
      WHERE payment_reference = $1`,
    [reference, status]
  );

  await pool.query(
    `UPDATE impact_donations
        SET payment_status = $2, paid_at = ${paidAt}, updated_at = CURRENT_TIMESTAMP
      WHERE payment_reference = $1`,
    [reference, status]
  );
}

/**
 * Sends the settled donation to the CRM.
 *
 * Failure is logged and swallowed: the CMS database has already been corrected,
 * which is the part that must not be lost, and the artisan importer can carry
 * anything the CRM missed. Throwing here would abandon the rest of the backlog
 * over one unreachable host.
 */
async function pushToCrm(donation, status) {
  if (!CRM_INGEST_URL || !CRM_INGEST_SECRET) return null;

  try {
    const response = await fetch(CRM_INGEST_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-Ingest-Secret': CRM_INGEST_SECRET,
      },
      body: JSON.stringify({
        reference: donation.payment_reference,
        source: 'getfund',
        // The CRM speaks of a donation that succeeded as 'success'.
        status: status === 'completed' ? 'success' : status,
        // Sent from our own row, not from Xcel, for the reason in recordOutcome.
        amount: Number(donation.amount) || 0,
        currency: donation.currency || 'GHS',
        paid_at: status === 'completed' ? new Date().toISOString() : null,
      }),
      signal: AbortSignal.timeout(20_000),
    });

    return response.ok ? 'recorded' : `HTTP ${response.status}`;
  } catch (err) {
    return `error: ${err.message}`;
  }
}

async function main() {
  if (!XCEL_MERCHANT_ID || !XCEL_PUBLIC_KEY) {
    log('not configured — set XCEL_MERCHANT_ID and XCEL_PUBLIC_KEY in .env');
    process.exit(1);
  }

  if (!CRM_INGEST_URL || !CRM_INGEST_SECRET) {
    log('note: CRM_INGEST_URL/CRM_INGEST_SECRET unset — repairing the CMS database only.');
    log('      run `php artisan crm:import-website-donations` afterwards to carry it across.');
  }

  const donations = await pendingDonations();
  log(`${donations.length} pending donation(s) to check${ALL ? ' (full backlog)' : ' (last 14 days)'}`);
  if (DRY_RUN) log('dry run — nothing will be written');

  const tally = { completed: 0, failed: 0, pending: 0, error: 0 };
  let recovered = 0;

  for (const donation of donations) {
    const reference = donation.payment_reference;

    try {
      const verified = await verifyWithXcel(reference);
      tally[verified.status] += 1;

      /*
       * Only write when the answer has changed. Re-sending "still pending"
       * every night would touch every row and make updated_at meaningless as a
       * signal that somebody learned something.
       */
      if (verified.status === 'pending') {
        continue;
      }

      if (verified.status === 'completed') {
        recovered += Number(donation.amount) || 0;
      }

      if (DRY_RUN) {
        log(`${reference} -> ${verified.status} (not written)`);
        continue;
      }

      await recordOutcome(reference, verified.status);
      const crm = await pushToCrm(donation, verified.status);
      log(`${reference} -> ${verified.status}${crm ? ` (crm: ${crm})` : ''}`);
    } catch (err) {
      tally.error += 1;
      log(`${reference} -> error: ${err.message}`);
    }

    // Gentle on the provider: this is a background job, not a queue to drain.
    await new Promise((resolve) => setTimeout(resolve, 150));
  }

  log(
    `done — ${tally.completed} paid, ${tally.failed} failed, ` +
      `${tally.pending} still pending, ${tally.error} errors`
  );

  if (recovered > 0) {
    log(`GHS ${recovered.toFixed(2)} previously invisible${DRY_RUN ? ' (dry run)' : ' and now recorded'}`);
  }

  await pool.end();
}

main().catch(async (err) => {
  log('failed:', err.message);
  await pool.end().catch(() => {});
  process.exit(1);
});

/*
 * On lottery entries, deliberately not created above.
 *
 * The webhook writes a lottery_entries row for every successful payment, so in
 * principle a donation confirmed here should get one too. It is left out
 * because lottery_entries is currently empty while 59 donations have already
 * completed — the entry-writing path has evidently never run — and a sweep of
 * the backlog would therefore not be topping up a draw but inventing one, with
 * over a hundred retroactive entries whose draw_month is whatever this script
 * happened to read today. Who is in a prize draw is somebody's decision to
 * make, not a side effect of repairing payment statuses.
 */
