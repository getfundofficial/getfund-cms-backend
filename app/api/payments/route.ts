import { NextRequest, NextResponse } from 'next/server';

const XCEL_API_URL = 'https://api.xcelapp.com';
const XCEL_PUBLIC_KEY = process.env.XCEL_PUBLIC_KEY || '';
const XCEL_WEBHOOK_SECRET = process.env.XCEL_WEBHOOK_SECRET || '';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

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

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request: NextRequest) {
  try {
    const body: PaymentRequest = await request.json();
    
    console.log('Payment request received:', {
      amount: body.amount,
      currency: body.currency,
      method: body.paymentMethod,
      email: body.customerEmail,
    });

    // Validate required fields
    if (!body.amount || !body.currency || !body.paymentMethod || !body.customerEmail) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Validate API keys
    if (!XCEL_PUBLIC_KEY || !XCEL_WEBHOOK_SECRET) {
      console.error('Payment gateway configuration missing:', {
        hasPublicKey: !!XCEL_PUBLIC_KEY,
        hasWebhookSecret: !!XCEL_WEBHOOK_SECRET,
      });
      return NextResponse.json(
        { 
          success: false, 
          error: 'Payment gateway not configured. Please contact support.',
          debug: process.env.NODE_ENV === 'development' ? {
            hasPublicKey: !!XCEL_PUBLIC_KEY,
            hasWebhookSecret: !!XCEL_WEBHOOK_SECRET,
          } : undefined
        },
        { status: 500, headers: corsHeaders }
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

    console.log('Initializing payment with Xcel:', {
      url: `${XCEL_API_URL}/v1/payments/initialize`,
      amount: body.amount,
      currency: body.currency,
    });

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
    
    console.log('Xcel API response:', {
      status: response.status,
      ok: response.ok,
      data: data,
    });

    if (!response.ok) {
      console.error('Xcel payment initialization failed:', {
        status: response.status,
        statusText: response.statusText,
        data: data,
      });
      
      // Return detailed error from Xcel
      return NextResponse.json(
        { 
          success: false, 
          error: data.message || data.error || 'Payment initialization failed',
          xcelError: data,
          suggestion: 'Please check your Xcel API credentials and account status'
        },
        { status: 200, headers: corsHeaders } // Return 200 so frontend can read the error
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        paymentUrl: data.payment_url || data.authorization_url,
        reference: data.reference,
        accessCode: data.access_code,
      },
    }, { headers: corsHeaders });
  } catch (error) {
    console.error('Payment initialization error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
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
        { status: 400, headers: corsHeaders }
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
        { status: response.status, headers: corsHeaders }
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
    }, { headers: corsHeaders });
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}
