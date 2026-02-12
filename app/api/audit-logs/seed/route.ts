import { NextRequest, NextResponse } from 'next/server';
import { corsResponse, corsOptionsResponse } from '@/lib/cors';
import { verifyAuth, isAdminRole } from '@/lib/auth-middleware';
import { query } from '@/lib/db';

export async function OPTIONS(request: NextRequest) {
  return corsOptionsResponse(request.headers.get('origin'));
}

// POST /api/audit-logs/seed - Seed audit logs (Admin only)
export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.authenticated || !isAdminRole(authResult.user?.role)) {
      const errorResponse = NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
      corsResponse(errorResponse, request.headers.get('origin'));
      return errorResponse;
    }

    const userId = authResult.user.id;

    // Get all users
    const usersResult = await query('SELECT id, email, full_name, role FROM users');
    const users = usersResult.rows;

    // Get all content
    const contentResult = await query('SELECT id, title, type, status FROM content');
    const contents = contentResult.rows;

    let logsCreated = 0;

    // Create login audit logs for all users
    for (const user of users) {
      await query(
        `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, changes, ip_address, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          user.id,
          'login',
          'user',
          user.id,
          JSON.stringify({ email: user.email }),
          '127.0.0.1',
          new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000)
        ]
      );
      logsCreated++;
    }

    // Create content audit logs
    for (const content of contents) {
      // Create action
      await query(
        `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, changes, ip_address, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          userId,
          'create',
          'content',
          content.id,
          JSON.stringify({ title: content.title, type: content.type, status: 'draft' }),
          '127.0.0.1',
          new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
        ]
      );
      logsCreated++;

      // Update action
      await query(
        `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, changes, ip_address, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          userId,
          'update',
          'content',
          content.id,
          JSON.stringify({ title: content.title, type: content.type, status: 'in_review' }),
          '127.0.0.1',
          new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000)
        ]
      );
      logsCreated++;

      // Publish action if published
      if (content.status === 'published') {
        await query(
          `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, changes, ip_address, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            userId,
            'publish',
            'content',
            content.id,
            JSON.stringify({ title: content.title, type: content.type, status: 'published' }),
            '127.0.0.1',
            new Date(Date.now() - Math.random() * 2 * 24 * 60 * 60 * 1000)
          ]
        );
        logsCreated++;
      }
    }

    const response = NextResponse.json({
      success: true,
      message: `Created ${logsCreated} audit logs`,
      logsCreated
    });
    corsResponse(response, request.headers.get('origin'));
    return response;
  } catch (error: any) {
    console.error('Error seeding audit logs:', error);
    const errorResponse = NextResponse.json(
      { error: 'Failed to seed audit logs', details: error.message },
      { status: 500 }
    );
    corsResponse(errorResponse, request.headers.get('origin'));
    return errorResponse;
  }
}
