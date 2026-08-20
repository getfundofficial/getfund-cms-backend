export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { postDonationToCrm } from '@/lib/crm';

/**
 * The nightly sweep: asks Xcel what became of donations still recorded as
 * pending, and writes the answer to this database and the CRM.
 *
 * The webhook at app/api/payments/webhook/route.ts is the only thing that
 * normally moves a donation off `pending`, and webhooks get missed — a deploy
 * mid-delivery, a network blip, an outage at either end. When one is lost the
 * donation stays pending forever and nobody hears about money that was actually
 * received. On this site that went unnoticed for six months.
 *
 * This is not a substitute for the webhook and does not try to be: the webhook
 * records a donation within seconds, this catches what slipped, so a lost
 * callback costs a day rather than a donation. Running it when nothing is wrong
 * does nothing at all.
 *
 * Scheduled by vercel.json. scripts/reconcile-donations.js is the same job as a
 * command, for sweeping the whole backlog by hand with --all.
 */

const XCEL_API_URL = (process.env.XCEL_API_URL || 'https://api.xcelapp.com').replace(/\/+$/, '');

/*
 * Xcel's vocabulary for an outcome, which is wider than ours. Anything not named
 * here is left pending: an unfamiliar status is a question we cannot answer, and
 * guessing would either invent income or write off a donation that is merely slow.
 */
const PAID = new Set(['success', 'successful', 'completed', 'paid']);
const FAILED = new Set(['failed', 'cancelled', 'canceled', 'declined', 'expired', 'reversed']);

/*
 * A fortnight, because that is this job's question: "has anything just settled?"
 * Re-asking every night about donations abandoned months ago is work with no
 * chance of an answer. The backlog is a separate, one-off question — that is
 * what the command's --all is for.
 */
const WINDOW_DAYS = 14;

/** How many to check in one run, so a backlog cannot outlast the function's time limit. */
const MAX_PER_RUN = 100;

interface XcelVerdict {
  status: 'completed' | 'failed' | 'pending';
  raw: unknown;
}

/**
 * Asks Xcel what actually happened. Nothing else is trusted for this.
 *
 * A refusal is raised rather than returned. Anything this cannot interpret would
 * otherwise fall through to "pending", which is indistinguishable from Xcel
 * calmly answering that the donor never paid — so an expired key would produce a
 * sweep reporting "nothing settled, no errors" and looking like a clean bill of
 * health. That is the silent failure this job exists to end.
 */
async function verifyWithXcel(reference: string): Promise<XcelVerdict> {
  const response = await fetch(
    `${XCEL_API_URL}/transactions-service/paygate/tsq/${encodeURIComponent(reference)}`,
    {
      headers: {
        'Content-Type': 'application/json',
        'X-MERCHANT-ID': process.env.XCEL_MERCHANT_ID || '',
        'X-PUBLIC-KEY': process.env.XCEL_PUBLIC_KEY || '',
      },
      signal: AbortSignal.timeout(20_000),
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} from Xcel`);
  }

  const data = await response.json().catch(() => ({}));
  const field = data?.status ?? data?.data?.status ?? null;

  if (field === null || field === '') {
    throw new Error('Xcel returned no status field');
  }

  // Xcel answers in upper case ("SUCCESS", "PENDING"); our sets are lower.
  const raw = String(field).toLowerCase();

  return {
    status: PAID.has(raw) ? 'completed' : FAILED.has(raw) ? 'failed' : 'pending',
    raw: data,
  };
}

/**
 * Records the outcome against the three tables the webhook keeps in step.
 *
 * The amount is deliberately not written: this table already holds the figure
 * the donor agreed to, and Xcel's verification often omits it and returns a
 * zero, which would turn a real donation into GHS 0.00 in the column every
 * total is summed from.
 */
async function recordOutcome(reference: string, status: string): Promise<void> {
  const paidAt = status === 'completed' ? 'CURRENT_TIMESTAMP' : 'paid_at';

  for (const table of ['donations', 'campaign_donations', 'impact_donations']) {
    await query(
      `UPDATE ${table}
          SET payment_status = $2, paid_at = ${paidAt}, updated_at = CURRENT_TIMESTAMP
        WHERE payment_reference = $1`,
      [reference, status]
    );
  }
}

/**
 * Vercel Cron calls this with a bearer token it generates from CRON_SECRET.
 *
 * Checked before anything else: this endpoint spends money's worth of provider
 * calls and rewrites payment statuses, so it must not be something the open
 * internet can trigger. Unset means unconfigured, and an unprotected endpoint of
 * this kind is worse than a broken one, so it refuses everything.
 */
function authorised(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET || '';
  if (!secret) {
    console.warn('[reconcile] rejected: no CRON_SECRET configured');
    return false;
  }
  return request.headers.get('authorization') === `Bearer ${secret}`;
}

export async function GET(request: NextRequest) {
  if (!authorised(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!process.env.XCEL_MERCHANT_ID || !process.env.XCEL_PUBLIC_KEY) {
    return NextResponse.json(
      { error: 'Xcel credentials not configured' },
      { status: 500 }
    );
  }

  const { rows } = await query(
    `SELECT payment_reference, amount, currency
       FROM donations
      WHERE payment_status = 'pending'
        AND payment_reference IS NOT NULL
        AND created_at >= NOW() - INTERVAL '${WINDOW_DAYS} days'
      ORDER BY created_at DESC
      LIMIT ${MAX_PER_RUN}`
  );

  const tally = { checked: rows.length, completed: 0, failed: 0, pending: 0, errors: 0 };
  let recovered = 0;

  for (const row of rows) {
    const reference = row.payment_reference;

    try {
      const verified = await verifyWithXcel(reference);

      // Only write when the answer has changed. Re-sending "still pending" every
      // night would touch every row and make updated_at meaningless.
      if (verified.status === 'pending') {
        tally.pending += 1;
        continue;
      }

      await recordOutcome(reference, verified.status);
      await postDonationToCrm({
        reference,
        status: verified.status === 'completed' ? 'success' : 'failed',
        // From our own row, not from Xcel, for the reason in recordOutcome.
        amount: Number(row.amount) || 0,
        currency: row.currency || 'GHS',
        paidAt: verified.status === 'completed' ? new Date().toISOString() : null,
        providerPayload: verified.raw,
      });

      if (verified.status === 'completed') {
        tally.completed += 1;
        recovered += Number(row.amount) || 0;
      } else {
        tally.failed += 1;
      }

      console.log('[reconcile]', reference, '->', verified.status);
    } catch (error) {
      tally.errors += 1;
      console.error('[reconcile]', reference, error instanceof Error ? error.message : error);
    }
  }

  console.log('[reconcile] done', JSON.stringify(tally), 'recovered GHS', recovered.toFixed(2));

  return NextResponse.json({ success: true, ...tally, recovered });
}
