import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
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
    const drawMonth = new Date();
    drawMonth.setDate(1); // First day of current month
    drawMonth.setHours(0, 0, 0, 0);

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
      drawMonth.toISOString().split('T')[0]
    ]);
  } catch {
    // Payment processing error
  }
}

async function handleFailedPayment(data: any) {
  try {
    const { reference, metadata } = data;

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
  } catch {
    // Failed payment handling error
  }
}

async function handlePendingPayment(data: any) {
  try {
    const { reference, metadata } = data;

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
  } catch {
    // Pending payment handling error
  }
}
