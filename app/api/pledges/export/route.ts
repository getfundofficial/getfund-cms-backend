import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { corsResponse, corsOptionsResponse } from '@/lib/cors';
import { verifyAuth, isAdminRole } from '@/lib/auth-middleware';

export async function OPTIONS(request: NextRequest) {
  return corsOptionsResponse(request.headers.get('origin'));
}

// GET /api/pledges/export - Export pledges to CSV (admin only)
export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.authenticated || !isAdminRole(authResult.user?.role)) {
      const errorResponse = NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
      return corsResponse(errorResponse, request.headers.get('origin'));
    }

    const { searchParams } = new URL(request.url);
    const country = searchParams.get('country');
    const status = searchParams.get('status');
    const start_date = searchParams.get('start_date');
    const end_date = searchParams.get('end_date');

    let sql = `SELECT * FROM pledge_to_support WHERE 1=1`;
    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (country) {
      params.push(country);
      conditions.push(`country = $${paramIndex++}`);
    }

    if (status) {
      params.push(status);
      conditions.push(`status = $${paramIndex++}`);
    }

    if (start_date) {
      params.push(start_date);
      conditions.push(`created_at >= $${paramIndex++}`);
    }

    if (end_date) {
      params.push(end_date);
      conditions.push(`created_at <= $${paramIndex++}`);
    }

    if (conditions.length > 0) {
      sql += ` AND ${conditions.join(' AND ')}`;
    }

    sql += ` ORDER BY created_at DESC`;

    const result = await query(sql, params);

    // Generate CSV
    const headers = [
      'ID',
      'First Name',
      'Last Name',
      'Email',
      'Phone Country Code',
      'Phone Number',
      'Country',
      'Address',
      'Donation Description',
      'Status',
      'Notes',
      'Created At',
      'Updated At'
    ];

    const escapeCSVField = (field: any): string => {
      if (field === null || field === undefined) return '';
      const str = String(field);
      // Escape double quotes and wrap in quotes if contains comma, newline, or quote
      if (str.includes(',') || str.includes('\n') || str.includes('"')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const csvRows = [
      headers.join(','),
      ...result.rows.map(row => [
        escapeCSVField(row.id),
        escapeCSVField(row.first_name),
        escapeCSVField(row.last_name),
        escapeCSVField(row.email),
        escapeCSVField(row.phone_country_code),
        escapeCSVField(row.phone_number),
        escapeCSVField(row.country),
        escapeCSVField(row.address),
        escapeCSVField(row.donation_description),
        escapeCSVField(row.status),
        escapeCSVField(row.notes),
        escapeCSVField(row.created_at ? new Date(row.created_at).toISOString() : ''),
        escapeCSVField(row.updated_at ? new Date(row.updated_at).toISOString() : '')
      ].join(','))
    ];

    const csvContent = csvRows.join('\n');
    const filename = `pledges-export-${new Date().toISOString().split('T')[0]}.csv`;

    const response = new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Access-Control-Allow-Origin': request.headers.get('origin') || '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });

    return response;
  } catch (error: any) {
    console.error('Error exporting pledges:', error);
    const errorResponse = NextResponse.json(
      { success: false, error: 'Failed to export pledges' },
      { status: 500 }
    );
    return corsResponse(errorResponse, request.headers.get('origin'));
  }
}
