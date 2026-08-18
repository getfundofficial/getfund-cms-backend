export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { corsResponse, corsOptionsResponse } from '@/lib/cors';
import { verifyAuth, isAdminRole } from '@/lib/auth-middleware';

/**
 * One submission: mark it handled, leave a note, or delete it.
 *
 * All authenticated — these are members of the public who left their contact
 * details, and the collection endpoint guards reading for the same reason.
 */

export async function OPTIONS(request: NextRequest) {
  return corsOptionsResponse(request.headers.get('origin'));
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const origin = request.headers.get('origin');

  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return corsResponse(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }), origin);
    }
    const user = auth.user!;
    const body = await request.json().catch(() => ({}));

    const updates: string[] = [];
    const values: any[] = [];
    let n = 1;

    if (typeof body.is_handled === 'boolean') {
      updates.push(`is_handled = $${n++}`);
      values.push(body.is_handled);
      // Who dealt with it and when, so nobody chases the same enquiry twice.
      updates.push(`handled_by = $${n++}`, `handled_at = $${n++}`);
      values.push(body.is_handled ? user.id : null, body.is_handled ? new Date() : null);
    }

    if (typeof body.notes === 'string') {
      updates.push(`notes = $${n++}`);
      values.push(body.notes.slice(0, 5000));
    }

    if (updates.length === 0) {
      return corsResponse(NextResponse.json({ error: 'Nothing to update' }, { status: 400 }), origin);
    }

    values.push(params.id);
    const result = await query(
      `UPDATE efpi_submissions SET ${updates.join(', ')} WHERE id = $${n} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return corsResponse(NextResponse.json({ error: 'Not found' }, { status: 404 }), origin);
    }

    return corsResponse(NextResponse.json({ submission: result.rows[0] }), origin);
  } catch (error) {
    console.error('[efpi-submissions] PATCH failed:', error);
    return corsResponse(
      NextResponse.json({ error: 'Failed to update submission' }, { status: 500 }),
      origin
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const origin = request.headers.get('origin');

  try {
    const auth = await verifyAuth(request);
    // Deleting destroys the only record of someone's enquiry, so it is not
    // something an ordinary editor should be able to do by mis-clicking.
    if (!auth.authenticated || !isAdminRole(auth.user!.role)) {
      return corsResponse(NextResponse.json({ error: 'Forbidden' }, { status: 403 }), origin);
    }

    const result = await query(
      'DELETE FROM efpi_submissions WHERE id = $1 RETURNING id',
      [params.id]
    );
    if (result.rows.length === 0) {
      return corsResponse(NextResponse.json({ error: 'Not found' }, { status: 404 }), origin);
    }

    return corsResponse(NextResponse.json({ success: true }), origin);
  } catch (error) {
    console.error('[efpi-submissions] DELETE failed:', error);
    return corsResponse(
      NextResponse.json({ error: 'Failed to delete submission' }, { status: 500 }),
      origin
    );
  }
}
