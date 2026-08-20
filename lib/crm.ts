// lib/crm.ts
/**
 * Sends donations to the HRM's Fundraising CRM.
 *
 * Until this existed, donations taken on this site reached the CRM only when
 * somebody exported the table by hand and ran an artisan importer against it.
 * Between those exports the fundraising team's screen was simply out of date,
 * and nobody could tell by looking at it. This closes that: every donation is
 * announced as it happens.
 *
 * Three callers, each reporting a different moment in the same donation's life:
 *
 *   app/api/payments/route.ts          the donor started it — who they are
 *   app/api/payments/webhook/route.ts  Xcel says what became of it
 *   app/api/cron/reconcile/route.ts    the nightly sweep, when no webhook came
 *
 * The CRM keys on the reference, so all three write to one row.
 */

/** What the CRM calls an outcome. Note 'success', where this site says 'completed'. */
export type CrmStatus = 'pending' | 'success' | 'failed';

export interface CrmDonation {
  reference: string;
  status: CrmStatus;
  amount?: number | string | null;
  currency?: string | null;
  paidAt?: string | null;
  /** Only worth sending on the first write; see the note in postDonationToCrm. */
  donorName?: string | null;
  donorEmail?: string | null;
  donorPhone?: string | null;
  donorCategory?: string | null;
  paymentMethod?: string | null;
  frequency?: string | null;
  providerPayload?: unknown;
}

const CRM_INGEST_URL = () => process.env.CRM_INGEST_URL || '';
const CRM_INGEST_SECRET = () => process.env.CRM_INGEST_SECRET || '';

/** This site's vocabulary for a settled payment, translated to the CRM's. */
export function toCrmStatus(paymentStatus: string): CrmStatus {
  if (paymentStatus === 'completed' || paymentStatus === 'success') {
    return 'success';
  }
  return paymentStatus === 'failed' ? 'failed' : 'pending';
}

/**
 * Announces a donation to the CRM.
 *
 * Never throws. Every caller is in the middle of something that matters more
 * than this: a donor waiting on a payment link, or Xcel waiting on a webhook
 * acknowledgement it will retry if we fail it — and retrying a payment that
 * already succeeded is a worse outcome than a CRM row arriving late. The
 * nightly reconciliation catches anything lost here, which is exactly the job
 * it was built for.
 *
 * Returns a short description of what happened, for the caller's log.
 */
export async function postDonationToCrm(donation: CrmDonation): Promise<string> {
  const url = CRM_INGEST_URL();
  const secret = CRM_INGEST_SECRET();

  if (!url || !secret) {
    return 'skipped: CRM_INGEST_URL/CRM_INGEST_SECRET not set';
  }

  /*
   * Fields are omitted rather than sent as null.
   *
   * A donation is written to the CRM more than once — first when the donor
   * starts it, carrying their name and email, then again when Xcel confirms the
   * outcome, and that second message is about the payment, so it says nothing
   * about the donor. The CRM writes only the fields it actually receives, so
   * omitting them here preserves the name the first write recorded. Sending
   * nulls would erase it, and the screen would show a donor as Anonymous.
   */
  const payload: Record<string, unknown> = {
    reference: donation.reference,
    source: 'getfund',
    status: donation.status,
  };

  /*
   * The amount is always sent, even when it is zero.
   *
   * Xcel's confirmation often omits the figure and returns a zero, and writing
   * that literally would turn a real donation into GHS 0.00 in the column every
   * total is summed from. The guard against that lives in the CRM, which keeps
   * the figure it already holds when a zero arrives for a donation it knows.
   *
   * So this must not try to help by omitting the field: `amount` is required by
   * the CRM's validator, and leaving it out earns a 422 — which would mean the
   * confirmation never lands and the donation stays pending forever. That is a
   * worse failure than the one it was trying to avoid, and it is the reason the
   * lifecycle is covered by a test.
   */
  payload.amount = Number(donation.amount ?? 0) || 0;

  const optional: Array<[string, unknown]> = [
    ['currency', donation.currency],
    ['donor_name', donation.donorName],
    ['donor_email', donation.donorEmail],
    ['donor_phone', donation.donorPhone],
    ['donor_category', donation.donorCategory],
    ['payment_method', donation.paymentMethod],
    ['frequency', donation.frequency],
    ['paid_at', donation.paidAt],
    ['provider_payload', donation.providerPayload],
  ];

  for (const [key, value] of optional) {
    if (value !== undefined && value !== null && value !== '') {
      payload[key] = value;
    }
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-Ingest-Secret': secret,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(20_000),
    });

    if (!response.ok) {
      // Read the body: the CRM explains a rejected payload in it, and without
      // that a 422 here is indistinguishable from a 422 there.
      const detail = await response.text().catch(() => '');
      console.error('[crm] rejected', donation.reference, response.status, detail.slice(0, 300));
      return `HTTP ${response.status}`;
    }

    return 'recorded';
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown error';
    console.error('[crm] failed', donation.reference, message);
    return `error: ${message}`;
  }
}
