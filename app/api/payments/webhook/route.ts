export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { postDonationToCrm } from '@/lib/crm';
import crypto from 'crypto';

// Verify webhook signature from Xcel payment gateway
function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  try {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch {
    return false;
  }
}

// Webhook handler for payment callbacks from Xcel
export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const body = JSON.parse(rawBody);

    // Verify webhook signature if provided by Xcel
    const signature = request.headers.get('x-xcel-signature');
    const webhookSecret = process.env.XCEL_WEBHOOK_SECRET;

    if (signature && webhookSecret) {
      const isValid = verifyWebhookSignature(rawBody, signature, webhookSecret);
      if (!isValid) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    switch (body.event) {
      case 'payment.success':
        await handleSuccessfulPayment(body.data);
        break;

      case 'payment.failed':
        await handleFailedPayment(body.data);
        break;

      case 'payment.pending':
        await handlePendingPayment(body.data);
        break;

      default:
        break;
    }

    return NextResponse.json({ success: true, received: true });
  } catch {
    return NextResponse.json({ success: true, received: true });
  }
}

async function handleSuccessfulPayment(data: any) {
  try {
    const { reference, amount, currency, customer, metadata, status } = data;

    if (!reference || !amount || !customer?.email) {
      return;
    }

    // 1. Update the main donations table
    await query(`
      UPDATE donations
      SET payment_status = 'completed',
          paid_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE payment_reference = $1
    `, [reference]);

    // 2. Update campaign donation record if campaign-related
    if (metadata?.campaignId) {
      await query(`
        UPDATE campaign_donations
        SET payment_status = 'completed',
            paid_at = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
        WHERE payment_reference = $1
      `, [reference]);
    }

    // 3. Update impact donation record if it exists
    await query(`
      UPDATE impact_donations
      SET payment_status = 'completed',
          paid_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE payment_reference = $1
    `, [reference]);

    // 3. Create lottery entry automatically (idempotent with ON CONFLICT)
    // Get the draw_month from lottery config (matches the next_draw_date month)
    const lotteryConfig = await query(`
      SELECT date_trunc('month', next_draw_date)::date as draw_month
      FROM lottery_config WHERE id = 1
    `);

    const drawMonth = lotteryConfig.rows.length > 0
      ? lotteryConfig.rows[0].draw_month
      : new Date().toISOString().split('T')[0].substring(0, 8) + '01'; // Fallback to first of current month

    await query(`
      INSERT INTO lottery_entries (
        payment_reference,
        donation_amount,
        currency,
        donor_email,
        donor_phone,
        donor_name,
        campaign_id,
        draw_month
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (payment_reference) DO NOTHING
    `, [
      reference,
      amount,
      currency || 'GHS',
      customer.email,
      customer.phone || null,
      metadata?.donorName || customer.name || null,
      metadata?.campaignId || null,
      drawMonth
    ]);

    /*
     * Tell the fundraising CRM. Last, on purpose: the tables above are this
     * site's own record and must be written whatever the CRM is doing.
     */
    const crm = await postDonationToCrm({
      reference,
      status: 'success',
      amount,
      currency: currency || 'GHS',
      paidAt: new Date().toISOString(),
      donorName: metadata?.donorName || customer.name || null,
      donorEmail: customer.email || null,
      donorPhone: customer.phone || null,
      donorCategory: metadata?.donorCategory || null,
      frequency: metadata?.donationFrequency || null,
      providerPayload: data,
    });
    console.log('[webhook] crm', reference, crm);
  } catch {
    // Payment processing error
  }
}

async function handleFailedPayment(data: any) {
  try {
    const { reference, metadata, amount, currency } = data;

    // Update the main donations table
    await query(`
      UPDATE donations
      SET payment_status = 'failed',
          updated_at = CURRENT_TIMESTAMP
      WHERE payment_reference = $1
    `, [reference]);

    // Update campaign donation record if exists
    if (metadata?.campaignId) {
      await query(`
        UPDATE campaign_donations
        SET payment_status = 'failed',
            updated_at = CURRENT_TIMESTAMP
        WHERE payment_reference = $1
      `, [reference]);
    }

    // Update impact donation record if it exists
    await query(`
      UPDATE impact_donations
      SET payment_status = 'failed',
          updated_at = CURRENT_TIMESTAMP
      WHERE payment_reference = $1
    `, [reference]);

    const crm = await postDonationToCrm({
      reference,
      status: 'failed',
      amount,
      currency: currency || 'GHS',
      providerPayload: data,
    });
    console.log('[webhook] crm', reference, crm);
  } catch {
    // Failed payment handling error
  }
}

async function handlePendingPayment(data: any) {
  try {
    const { reference, metadata, amount, currency } = data;

    // Update the main donations table
    await query(`
      UPDATE donations
      SET payment_status = 'pending',
          updated_at = CURRENT_TIMESTAMP
      WHERE payment_reference = $1
    `, [reference]);

    // Update campaign donation record if exists
    if (metadata?.campaignId) {
      await query(`
        UPDATE campaign_donations
        SET payment_status = 'pending',
            updated_at = CURRENT_TIMESTAMP
        WHERE payment_reference = $1
      `, [reference]);
    }

    // Update impact donation record if it exists
    await query(`
      UPDATE impact_donations
      SET payment_status = 'pending',
          updated_at = CURRENT_TIMESTAMP
      WHERE payment_reference = $1
    `, [reference]);

    /*
     * Safe to send even for a donation the CRM has already seen settle: it
     * ignores a pending that arrives after a success or failure, because these
     * messages can arrive in any order and "still pending" asked earlier must
     * never un-confirm money already counted.
     */
    const crm = await postDonationToCrm({
      reference,
      status: 'pending',
      amount,
      currency: currency || 'GHS',
      providerPayload: data,
    });
    console.log('[webhook] crm', reference, crm);
  } catch {
    // Pending payment handling error
  }
}
