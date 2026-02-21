export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { corsResponse, corsOptionsResponse } from '@/lib/cors';

export async function OPTIONS(request: NextRequest) {
  return corsOptionsResponse(request.headers.get('origin'));
}

// GET /api/lottery/entry/[reference] - Get lottery entry by payment reference (public)
// Used by PaymentCallback to show lottery entry confirmation after successful payment
export async function GET(
  request: NextRequest,
  { params }: { params: { reference: string } }
) {
  try {
    const { reference } = params;

    if (!reference) {
      const errorResponse = NextResponse.json(
        { error: 'Payment reference is required' },
        { status: 400 }
      );
      return corsResponse(errorResponse, request.headers.get('origin'));
    }

    const result = await query(`
      SELECT
        le.id,
        le.payment_reference,
        le.donation_amount,
        le.currency,
        le.draw_month,
        le.created_at,
        fc.title as campaign_title,
        (
          SELECT COUNT(*)
          FROM lottery_entries
          WHERE draw_month = le.draw_month AND is_valid = true
        ) as total_entries
      FROM lottery_entries le
      LEFT JOIN fundraising_campaigns fc ON le.campaign_id = fc.id
      WHERE le.payment_reference = $1 AND le.is_valid = true
    `, [reference]);

    if (result.rows.length === 0) {
      // Entry not found - could be pending or invalid
      const response = NextResponse.json({ entry: null });
      return corsResponse(response, request.headers.get('origin'));
    }

    const response = NextResponse.json({ entry: result.rows[0] });
    return corsResponse(response, request.headers.get('origin'));
  } catch (error: any) {
    console.error('Error fetching lottery entry:', error);
    const errorResponse = NextResponse.json(
      { error: 'Failed to fetch lottery entry' },
      { status: 500 }
    );
    return corsResponse(errorResponse, request.headers.get('origin'));
  }
}
