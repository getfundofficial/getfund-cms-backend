import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

const XCEL_API_URL = 'https://api.xcelapp.com';
const XCEL_MERCHANT_ID = process.env.XCEL_MERCHANT_ID || '';
const XCEL_PUBLIC_KEY = process.env.XCEL_PUBLIC_KEY || '';
const USE_TEST_MODE = process.env.PAYMENT_TEST_MODE === 'true';

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
    campaignId?: string;
    campaignSlug?: string;
    donationType?: 'impact' | 'campaign' | 'general';
    donationDescription?: string;
    donationFrequency?: 'one-time' | 'daily' | 'weekly' | 'monthly' | 'yearly';
    donationReason?: string;
    donorCategory?: 'Individual' | 'Corporate' | 'GETFund Beneficiary';
  };
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request: NextRequest) {
  const timestamp = new Date().toISOString();
  console.log(`\n========== PAYMENT REQUEST START [${timestamp}] ==========`);

  try {
    const body: PaymentRequest = await request.json();

    console.log('[DEBUG] Payment request received:', {
      timestamp,
      amount: body.amount,
      currency: body.currency,
      method: body.paymentMethod,
      email: body.customerEmail,
      phone: body.customerPhone || 'Not provided',
      reference: body.reference,
      description: body.description,
      metadata: body.metadata,
      testMode: USE_TEST_MODE,
      env: {
        hasMerchantId: !!XCEL_MERCHANT_ID,
        merchantIdPrefix: XCEL_MERCHANT_ID ? XCEL_MERCHANT_ID.substring(0, 10) + '...' : 'MISSING',
        hasPublicKey: !!XCEL_PUBLIC_KEY,
        publicKeyPrefix: XCEL_PUBLIC_KEY ? XCEL_PUBLIC_KEY.substring(0, 30) + '...' : 'MISSING',
        xcelApiUrl: XCEL_API_URL,
        websiteUrl: process.env.NEXT_PUBLIC_WEBSITE_URL,
      }
    });

    // Validate required fields
    if (!body.amount || !body.currency || !body.paymentMethod || !body.customerEmail) {
      console.error('[DEBUG] Validation failed - Missing required fields:', {
        hasAmount: !!body.amount,
        hasCurrency: !!body.currency,
        hasPaymentMethod: !!body.paymentMethod,
        hasCustomerEmail: !!body.customerEmail,
      });
      console.log('========== PAYMENT REQUEST END (VALIDATION ERROR) ==========\n');
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400, headers: corsHeaders }
      );
    }

    console.log('[DEBUG] Validation passed - All required fields present');

    // TEST MODE - Skip Xcel API and return mock success
    if (USE_TEST_MODE) {
      console.log('[DEBUG] TEST MODE ACTIVE - Bypassing Xcel API');
      const websiteUrl = process.env.NEXT_PUBLIC_WEBSITE_URL || 'https://getfund-website-hq.vercel.app';
      const mockPaymentUrl = `${websiteUrl}/fundraising/ways-to-donate?payment=success&reference=${body.reference}&test=true`;

      console.log('[DEBUG] Mock payment URL generated:', mockPaymentUrl);

      // Create donation record for ALL donations (test mode)
      try {
        console.log('[DEBUG] Creating donation record (test mode)...');
        await query(
          `INSERT INTO donations (
            donation_type,
            donation_category,
            donation_description,
            donation_reason,
            donation_frequency,
            payment_reference,
            amount,
            currency,
            payment_status,
            donor_email,
            donor_phone,
            donor_name,
            donor_type,
            payment_method,
            campaign_id,
            campaign_slug,
            metadata,
            created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, NOW())`,
          [
            body.metadata?.donationType || 'general',
            body.metadata?.campaignTitle || 'General Donation',
            body.metadata?.donationDescription || body.description,
            body.metadata?.donationReason || null,
            body.metadata?.donationFrequency || 'one-time',
            body.reference,
            body.amount,
            body.currency,
            'pending',
            body.customerEmail,
            body.customerPhone || null,
            body.metadata?.donorName || null,
            body.metadata?.donorCategory || 'Individual',
            body.paymentMethod,
            body.metadata?.campaignId || null,
            body.metadata?.campaignSlug || null,
            JSON.stringify({ test_mode: true }),
          ]
        );
        console.log('[DEBUG] Donation record created successfully (test mode)');
      } catch (dbError) {
        console.error('[DEBUG] Failed to create donation record:', dbError);
      }

      console.log('========== PAYMENT REQUEST END (TEST MODE SUCCESS) ==========\n');

      return NextResponse.json({
        success: true,
        data: {
          paymentUrl: mockPaymentUrl,
          reference: body.reference,
          accessCode: 'TEST_ACCESS_CODE',
        },
        testMode: true,
      }, { headers: corsHeaders });
    }

    console.log('[DEBUG] PRODUCTION MODE ACTIVE - Using Xcel API integration');

    // PRODUCTION MODE - Validate API credentials
    if (!XCEL_MERCHANT_ID || !XCEL_PUBLIC_KEY) {
      console.error('[DEBUG] ERROR - Payment gateway configuration missing:', {
        hasMerchantId: !!XCEL_MERCHANT_ID,
        hasPublicKey: !!XCEL_PUBLIC_KEY,
        merchantIdLength: XCEL_MERCHANT_ID ? XCEL_MERCHANT_ID.length : 0,
        publicKeyLength: XCEL_PUBLIC_KEY ? XCEL_PUBLIC_KEY.length : 0,
      });
      console.log('========== PAYMENT REQUEST END (CONFIG ERROR) ==========\n');
      return NextResponse.json(
        {
          success: false,
          error: 'Payment gateway not configured. Please contact support.',
          debug: {
            hasMerchantId: !!XCEL_MERCHANT_ID,
            hasPublicKey: !!XCEL_PUBLIC_KEY,
            timestamp: new Date().toISOString(),
          }
        },
        { status: 200, headers: corsHeaders }
      );
    }

    console.log('[DEBUG] API credentials validated successfully');

    // Get website URL from environment
    const websiteUrl = process.env.NEXT_PUBLIC_WEBSITE_URL || 'https://getfund-website-hq.vercel.app';
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://getfund-cms-backend.vercel.app';

    // Initialize payment with Xcel Checkout URL API
    const paymentPayload = {
      amount: body.amount.toString(),
      currency: body.currency,
      client_transaction_id: body.reference,
      customer_name: body.metadata?.donorName || 'Anonymous Donor',
      customer_email: body.customerEmail,
      customer_phone: body.customerPhone,
      description: body.description || 'Donation to GETFUND',
      channel: 'WEB',
      metadata: body.metadata || {},
      redirect_url: `${websiteUrl}/fundraising/ways-to-donate?payment=success&reference=${body.reference}`,
      webhook_url: `${backendUrl}/api/payments/webhook`,
      customTxn: {
        editAmt: false, // Prevent users from changing the donation amount
        minAmt: parseFloat(body.amount.toString()),
        maxAmt: parseFloat(body.amount.toString()),
      },
    };

    console.log('[DEBUG] Initializing payment with Xcel Checkout URL API:', {
      url: `${XCEL_API_URL}/transactions-service/paygate/generate-payment-link`,
      method: 'POST',
      amount: body.amount,
      currency: body.currency,
      clientTransactionId: body.reference,
      payload: paymentPayload,
      hasMerchantId: !!XCEL_MERCHANT_ID,
      hasPublicKey: !!XCEL_PUBLIC_KEY,
      timestamp: new Date().toISOString(),
    });

    console.log('[DEBUG] Making fetch request to Xcel...');
    const fetchStartTime = Date.now();

    const response = await fetch(`${XCEL_API_URL}/transactions-service/paygate/generate-payment-link`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-MERCHANT-ID': XCEL_MERCHANT_ID,
        'X-PUBLIC-KEY': XCEL_PUBLIC_KEY,
      },
      body: JSON.stringify(paymentPayload),
    });

    const fetchDuration = Date.now() - fetchStartTime;
    console.log(`[DEBUG] Fetch completed in ${fetchDuration}ms`);

    let data;
    const responseText = await response.text();

    console.log('[DEBUG] Xcel API raw response:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      duration: `${fetchDuration}ms`,
      headers: Object.fromEntries(response.headers.entries()),
      bodyLength: responseText.length,
      bodyPreview: responseText.substring(0, 200),
      fullBody: responseText,
    });

    try {
      data = JSON.parse(responseText);
      console.log('[DEBUG] Successfully parsed Xcel response JSON:', data);
    } catch (e) {
      console.error('[DEBUG] ERROR - Failed to parse Xcel response as JSON:', {
        error: e instanceof Error ? e.message : 'Unknown error',
        responseText: responseText,
        responseTextLength: responseText.length,
      });
      data = { error: 'Invalid response format from payment gateway' };
    }

    if (!response.ok) {
      console.error('[DEBUG] ERROR - Xcel payment initialization failed:', {
        status: response.status,
        statusText: response.statusText,
        data: data,
        fullResponse: responseText,
      });
      console.log('========== PAYMENT REQUEST END (XCEL API ERROR) ==========\n');

      // Return detailed error from Xcel
      return NextResponse.json(
        {
          success: false,
          error: data.message || data.error || 'Payment initialization failed',
          xcelError: data,
          suggestion: 'Please check your Xcel API credentials and account status',
          debug: {
            status: response.status,
            statusText: response.statusText,
            timestamp: new Date().toISOString(),
          }
        },
        { status: 200, headers: corsHeaders } // Return 200 so frontend can read the error
      );
    }

    console.log('[DEBUG] Xcel payment initialization successful!');
    console.log('[DEBUG] Payment Link:', data.data?.payment_link);
    console.log('[DEBUG] Transaction ID:', data.data?.transaction_id);
    console.log('[DEBUG] Payment Code:', data.data?.payment_code);
    console.log('[DEBUG] Status:', data.status);
    console.log('========== PAYMENT REQUEST END (SUCCESS) ==========\n');

    // Construct full payment URL using the correct Xcel format
    // Format: https://paygate.xcelapp.com/v1/main/xcel?code=PMT251212N41UFY52O
    const paymentLink = data.data?.payment_link;
    const paymentCode = data.data?.payment_code;

    let fullPaymentUrl: string;

    if (paymentLink?.startsWith('http')) {
      // Already a full URL
      fullPaymentUrl = paymentLink;
    } else if (paymentLink?.startsWith('?code=')) {
      // Starts with ?code=, use the new format
      fullPaymentUrl = `https://paygate.xcelapp.com/v1/main/xcel${paymentLink}`;
    } else if (paymentCode) {
      // Use payment code to construct URL
      fullPaymentUrl = `https://paygate.xcelapp.com/v1/main/xcel?code=${paymentCode}`;
    } else {
      // Fallback to old format
      fullPaymentUrl = `https://paygate.xcelapp.com/pay/${paymentLink || paymentCode}`;
    }

    console.log('[DEBUG] Constructed payment URL:', fullPaymentUrl);

    // Create donation record for ALL donations
    try {
      console.log('[DEBUG] Creating donation record...');
      await query(
        `INSERT INTO donations (
          donation_type,
          donation_category,
          donation_description,
          donation_reason,
          donation_frequency,
          payment_reference,
          amount,
          currency,
          payment_status,
          donor_email,
          donor_phone,
          donor_name,
          donor_type,
          payment_method,
          campaign_id,
          campaign_slug,
          metadata,
          created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, NOW())`,
        [
          body.metadata?.donationType || 'general',
          body.metadata?.campaignTitle || 'General Donation',
          body.metadata?.donationDescription || body.description,
          body.metadata?.donationReason || null,
          body.metadata?.donationFrequency || 'one-time',
          body.reference,
          body.amount,
          body.currency,
          'pending',
          body.customerEmail,
          body.customerPhone || null,
          body.metadata?.donorName || null,
          body.metadata?.donorCategory || 'Individual',
          body.paymentMethod,
          body.metadata?.campaignId || null,
          body.metadata?.campaignSlug || null,
          JSON.stringify({
            payment_code: data.data?.payment_code,
            transaction_id: data.data?.transaction_id,
          }),
        ]
      );
      console.log('[DEBUG] Donation record created successfully');
    } catch (dbError) {
      console.error('[DEBUG] Failed to create donation record:', dbError);
      // Don't fail the payment, just log the error
    }

    return NextResponse.json({
      success: true,
      data: {
        paymentUrl: fullPaymentUrl,
        reference: data.data?.client_transaction_id || body.reference,
        accessCode: data.data?.payment_code,
        transactionId: data.data?.transaction_id,
      },
    }, { headers: corsHeaders });
  } catch (error) {
    console.error('[DEBUG] CRITICAL ERROR - Payment initialization exception:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      type: error instanceof Error ? error.constructor.name : typeof error,
      timestamp: new Date().toISOString(),
    });
    console.log('========== PAYMENT REQUEST END (EXCEPTION) ==========\n');

    // Return more detailed error information
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    const errorStack = error instanceof Error ? error.stack : undefined;

    return NextResponse.json(
      {
        success: false,
        error: 'Payment initialization failed',
        details: errorMessage,
        suggestion: 'Please try again or contact support if the issue persists',
        debug: {
          errorType: error instanceof Error ? error.constructor.name : typeof error,
          stack: errorStack,
          timestamp: new Date().toISOString(),
        }
      },
      { status: 200, headers: corsHeaders } // Return 200 so frontend can read the error
    );
  }
}

// Verify payment status
export async function GET(request: NextRequest) {
  const timestamp = new Date().toISOString();
  console.log(`\n========== PAYMENT VERIFICATION START [${timestamp}] ==========`);

  try {
    const { searchParams } = new URL(request.url);
    const reference = searchParams.get('reference');

    console.log('[DEBUG] Payment verification request:', {
      timestamp,
      reference: reference || 'MISSING',
      fullUrl: request.url,
    });

    if (!reference) {
      console.error('[DEBUG] ERROR - Payment reference missing');
      console.log('========== PAYMENT VERIFICATION END (NO REFERENCE) ==========\n');
      return NextResponse.json(
        { success: false, error: 'Payment reference is required' },
        { status: 400, headers: corsHeaders }
      );
    }

    console.log('[DEBUG] Calling Xcel transaction status API...');
    console.log('[DEBUG] API URL:', `${XCEL_API_URL}/transactions-service/paygate/tsq/${reference}`);
    console.log('[DEBUG] Headers:', {
      'X-MERCHANT-ID': XCEL_MERCHANT_ID?.substring(0, 10) + '...',
      'X-PUBLIC-KEY': XCEL_PUBLIC_KEY?.substring(0, 20) + '...',
    });

    const fetchStartTime = Date.now();

    const response = await fetch(`${XCEL_API_URL}/transactions-service/paygate/tsq/${reference}`, {
      method: 'GET',
      headers: {
        'X-MERCHANT-ID': XCEL_MERCHANT_ID,
        'X-PUBLIC-KEY': XCEL_PUBLIC_KEY,
      },
    });

    const fetchDuration = Date.now() - fetchStartTime;
    console.log(`[DEBUG] Verification fetch completed in ${fetchDuration}ms`);

    let data;
    const responseText = await response.text();
    console.log('[DEBUG] Raw response:', responseText);

    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error('[DEBUG] Failed to parse verification response:', e);
      data = { error: 'Invalid response from payment gateway' };
    }

    console.log('[DEBUG] Xcel verification response:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      duration: `${fetchDuration}ms`,
      data: data,
    });

    if (!response.ok) {
      console.error('[DEBUG] ERROR - Payment verification failed:', {
        status: response.status,
        error: data.message || 'Unknown error',
        data: data,
      });
      console.log('========== PAYMENT VERIFICATION END (API ERROR) ==========\n');
      return NextResponse.json(
        { success: false, error: data.message || 'Payment verification failed' },
        { status: response.status, headers: corsHeaders }
      );
    }

    console.log('[DEBUG] Payment verification successful:', {
      status: data.status,
      amount: data.amount,
      currency: data.currency,
      paidAt: data.paid_at,
    });
    console.log('========== PAYMENT VERIFICATION END (SUCCESS) ==========\n');

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
    console.error('[DEBUG] CRITICAL ERROR - Payment verification exception:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });
    console.log('========== PAYMENT VERIFICATION END (EXCEPTION) ==========\n');
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}
