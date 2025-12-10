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
  } catch (error) {
    console.error('Signature verification error:', error);
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
        console.error('Invalid webhook signature');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    // Log the payment event (redact sensitive data)
    console.log('Payment webhook received:', {
      event: body.event,
      reference: body.data?.reference,
      status: body.data?.status,
      timestamp: new Date().toISOString(),
    });

    // Handle different payment events
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
        console.log('Unhandled webhook event:', body.event);
    }

    // Always return 200 OK to prevent retries
    return NextResponse.json({ success: true, received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    // Still return 200 to prevent webhook retries
    return NextResponse.json({ success: true, received: true });
  }
}

async function handleSuccessfulPayment(data: any) {
  try {
    const { reference, amount, currency, customer, metadata, status } = data;

    // Validate payment data
    if (!reference || !amount || !customer?.email) {
      console.error('Missing required payment data');
      return;
    }

    // 1. Update campaign donation record if campaign-related
    if (metadata?.campaignId) {
      await query(`
        UPDATE campaign_donations
        SET payment_status = 'completed',
            paid_at = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
        WHERE payment_reference = $1
      `, [reference]);

      console.log(`Updated campaign donation: ${reference}`);
    }

    // 2. Create lottery entry automatically (idempotent with ON CONFLICT)
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

    console.log(`Created lottery entry for payment: ${reference}`);

    // TODO: Send thank you email to donor
    // TODO: Generate receipt
  } catch (error) {
    console.error('Error handling successful payment:', error);
  }
}

async function handleFailedPayment(data: any) {
  try {
    const { reference, metadata } = data;

    // Update campaign donation record if exists
    if (metadata?.campaignId) {
      await query(`
        UPDATE campaign_donations
        SET payment_status = 'failed',
            updated_at = CURRENT_TIMESTAMP
        WHERE payment_reference = $1
      `, [reference]);

      console.log(`Updated failed campaign donation: ${reference}`);
    }

    // TODO: Notify donor about failed payment
  } catch (error) {
    console.error('Error handling failed payment:', error);
  }
}

async function handlePendingPayment(data: any) {
  try {
    const { reference, metadata } = data;

    // Update campaign donation record if exists
    if (metadata?.campaignId) {
      await query(`
        UPDATE campaign_donations
        SET payment_status = 'pending',
            updated_at = CURRENT_TIMESTAMP
        WHERE payment_reference = $1
      `, [reference]);

      console.log(`Updated pending campaign donation: ${reference}`);
    }
  } catch (error) {
    console.error('Error handling pending payment:', error);
  }
}
