import { NextRequest, NextResponse } from 'next/server';

const XCEL_API_URL = 'https://api.xcelapp.com';
const XCEL_PUBLIC_KEY = process.env.XCEL_PUBLIC_KEY || '';
const XCEL_WEBHOOK_SECRET = process.env.XCEL_WEBHOOK_SECRET || '';

interface PaymentRequest {
  amount: number;
  currency: string;
  paymentMethod: string;
  customerEmail: string;
  customerPhone?: string;
  reference: string;
  description: string;
  metadata?: {
    campaignTitle?: string;
    donorName?: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: PaymentRequest = await request.json();

    // Validate required fields
    if (!body.amount || !body.currency || !body.paymentMethod || !body.customerEmail) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate API keys
    if (!XCEL_PUBLIC_KEY || !XCEL_WEBHOOK_SECRET) {
      return NextResponse.json(
        { success: false, error: 'Payment gateway not configured' },
        { status: 500 }
      );
    }

    // Initialize payment with Xcel
    const paymentPayload = {
      amount: body.amount,
      currency: body.currency,
      payment_method: body.paymentMethod,
      customer: {
        email: body.customerEmail,
        phone: body.customerPhone,
      },
      reference: body.reference,
      description: body.description,
      metadata: body.metadata,
      callback_url: `${process.env.NEXT_PUBLIC_WEBSITE_URL || 'https://getfund-website.vercel.app'}/payment/callback`,
      return_url: `${process.env.NEXT_PUBLIC_WEBSITE_URL || 'https://getfund-website.vercel.app'}/payment/success`,
    };

    const response = await fetch(`${XCEL_API_URL}/v1/payments/initialize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${XCEL_PUBLIC_KEY}`,
        'X-Webhook-Secret': XCEL_WEBHOOK_SECRET,
      },
      body: JSON.stringify(paymentPayload),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: data.message || 'Payment initialization failed' },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        paymentUrl: data.payment_url || data.authorization_url,
        reference: data.reference,
        accessCode: data.access_code,
      },
    });
  } catch (error) {
    console.error('Payment initialization error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Verify payment status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reference = searchParams.get('reference');

    if (!reference) {
      return NextResponse.json(
        { success: false, error: 'Payment reference is required' },
        { status: 400 }
      );
    }

    const response = await fetch(`${XCEL_API_URL}/v1/payments/verify/${reference}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${XCEL_PUBLIC_KEY}`,
        'X-Webhook-Secret': XCEL_WEBHOOK_SECRET,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: data.message || 'Payment verification failed' },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        status: data.status,
        amount: data.amount,
        currency: data.currency,
        reference: data.reference,
        paidAt: data.paid_at,
      },
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
