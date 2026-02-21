export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, isAdminRole } from '@/lib/auth-middleware';
import { query } from '@/lib/db';
import { getCorsHeaders } from '@/lib/cors';

// GET /api/users/:id/page-permissions - Get all pages with permission status for user
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user } = await verifyAuth(request);

    if (!user || !isAdminRole(user.role)) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403, headers: getCorsHeaders(request.headers.get('origin')) }
      );
    }

    // Verify target user exists
    const userCheck = await query('SELECT id FROM users WHERE id = $1', [params.id]);
    if (userCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404, headers: getCorsHeaders(request.headers.get('origin')) }
      );
    }

    // Get all pages with their permission status for this user
    const result = await query(`
      SELECT
        p.id as page_id,
        p.slug as page_slug,
        p.title as page_title,
        pp.id as permission_id,
        CASE WHEN pp.id IS NOT NULL THEN true ELSE false END as has_edit_permission
      FROM pages p
      LEFT JOIN page_permissions pp ON
        pp.page_id = p.id
        AND pp.user_id = $1
        AND pp.permission_type = 'edit'
      ORDER BY p.title ASC
    `, [params.id]);

    return NextResponse.json(
      { permissions: result.rows },
      { headers: getCorsHeaders(request.headers.get('origin')) }
    );
  } catch (error: any) {
    console.error('Error fetching user page permissions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: getCorsHeaders(request.headers.get('origin')) }
    );
  }
}

// PUT /api/users/:id/page-permissions - Bulk sync page permissions for user
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user } = await verifyAuth(request);

    if (!user || !isAdminRole(user.role)) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403, headers: getCorsHeaders(request.headers.get('origin')) }
      );
    }

    // Verify target user exists
    const userCheck = await query('SELECT id FROM users WHERE id = $1', [params.id]);
    if (userCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404, headers: getCorsHeaders(request.headers.get('origin')) }
      );
    }

    const body = await request.json();
    const { page_ids } = body;

    if (!Array.isArray(page_ids)) {
      return NextResponse.json(
        { error: 'page_ids must be an array' },
        { status: 400, headers: getCorsHeaders(request.headers.get('origin')) }
      );
    }

    const userId = params.id;

    // Get current 'edit' permissions for user
    const currentPerms = await query(`
      SELECT page_id FROM page_permissions
      WHERE user_id = $1 AND permission_type = 'edit'
    `, [userId]);
    const currentPageIds = currentPerms.rows.map((r: any) => r.page_id);

    // Calculate diff
    const toAdd = page_ids.filter((id: string) => !currentPageIds.includes(id));
    const toRemove = currentPageIds.filter((id: string) => !page_ids.includes(id));

    // Remove revoked permissions
    if (toRemove.length > 0) {
      await query(`
        DELETE FROM page_permissions
        WHERE user_id = $1
          AND permission_type = 'edit'
          AND page_id = ANY($2::uuid[])
      `, [userId, toRemove]);
    }

    // Add new permissions
    for (const pageId of toAdd) {
      await query(`
        INSERT INTO page_permissions (page_id, user_id, permission_type)
        VALUES ($1, $2, 'edit')
        ON CONFLICT DO NOTHING
      `, [pageId, userId]);
    }

    return NextResponse.json(
      {
        success: true,
        added: toAdd.length,
        removed: toRemove.length
      },
      { headers: getCorsHeaders(request.headers.get('origin')) }
    );
  } catch (error: any) {
    console.error('Error syncing user page permissions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: getCorsHeaders(request.headers.get('origin')) }
    );
  }
}

// OPTIONS /api/users/:id/page-permissions
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: getCorsHeaders(request.headers.get('origin')),
  });
}
