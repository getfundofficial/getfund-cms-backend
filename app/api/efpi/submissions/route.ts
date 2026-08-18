export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { corsResponse, corsOptionsResponse } from '@/lib/cors';
import { verifyAuth } from '@/lib/auth-middleware';

/**
 * Form submissions from the EFPI site.
 *
 *   POST  — public. The contact page, partner enquiry and factsheet form.
 *   GET   — authenticated. The admin list.
 *
 * The POST is the only endpoint in this codebase that writes to the database
 * without a login, which is what most of the care below is about: anything
 * arriving here was typed by a stranger, and this is not the place to find that
 * out. Everything is bounded, nothing is trusted, and the error a submitter
 * sees never explains why.
 */

const FORMS = new Set(['contact', 'partner', 'factsheet']);

const MAX_FIELDS = 30;
const MAX_VALUE = 5000;
const MAX_BODY = 32 * 1024;

/*
 * A public write endpoint on a government site will be found by bots. This is
 * a ceiling, not a defence: serverless instances come and go, so the counter is
 * not shared and a determined flood gets through. It costs nothing and stops
 * the ordinary case — a script hammering the form in a loop.
 */
const RATE = { windowMs: 60_000, max: 5 };
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const seen = (hits.get(ip) || []).filter((t) => now - t < RATE.windowMs);
  seen.push(now);
  hits.set(ip, seen);
  if (hits.size > 5000) {
    // forEach rather than for..of: this project's tsconfig targets below ES2015
    // and iterating a Map directly needs downlevelIteration.
    hits.forEach((times, key) => {
      if (!times.some((t) => now - t < RATE.windowMs)) hits.delete(key);
    });
  }
  return seen.length > RATE.max;
}

const clean = (value: unknown, max = MAX_VALUE): string =>
  typeof value === 'string' ? value.trim().slice(0, max) : '';

/** Finds the name and email whatever the form happens to call them. */
function identify(fields: Record<string, string>) {
  const find = (...names: string[]) => {
    for (const [key, value] of Object.entries(fields)) {
      const k = key.toLowerCase().replace(/[^a-z]/g, '');
      if (names.some((n) => k.includes(n)) && value) return value;
    }
    return '';
  };
  return {
    name: clean(find('fullname', 'name'), 255),
    email: clean(find('email'), 255),
  };
}

export async function OPTIONS(request: NextRequest) {
  return corsOptionsResponse(request.headers.get('origin'));
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin');
  const ip =
    (request.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'unknown';

  try {
    if (rateLimited(ip)) {
      return corsResponse(
        NextResponse.json({ error: 'Too many submissions. Please wait a moment.' }, { status: 429 }),
        origin
      );
    }

    const raw = await request.text();
    if (raw.length > MAX_BODY) {
      return corsResponse(
        NextResponse.json({ error: 'That submission is too large.' }, { status: 413 }),
        origin
      );
    }

    let body: any;
    try {
      body = JSON.parse(raw || '{}');
    } catch {
      return corsResponse(
        NextResponse.json({ error: 'Could not read that submission.' }, { status: 400 }),
        origin
      );
    }

    const formName = clean(body.formName, 50).toLowerCase();
    if (!FORMS.has(formName)) {
      return corsResponse(
        NextResponse.json({ error: 'Unknown form.' }, { status: 400 }),
        origin
      );
    }

    // Only strings, only so many, each only so long. A form that sends
    // something else is either broken or not our form.
    const fields: Record<string, string> = {};
    for (const [key, value] of Object.entries(body.fields ?? {})) {
      if (Object.keys(fields).length >= MAX_FIELDS) break;
      const name = clean(key, 60);
      if (name && typeof value === 'string') fields[name] = clean(value);
    }

    const { name, email } = identify(fields);

    // Every one of these forms exists to be replied to.
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return corsResponse(
        NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 }),
        origin
      );
    }

    await query(
      `INSERT INTO efpi_submissions (form_name, page, name, email, fields, ip_address, user_agent)
            VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7)`,
      [
        formName,
        clean(body.page, 255),
        name || null,
        email,
        JSON.stringify(fields),
        ip.slice(0, 64),
        clean(request.headers.get('user-agent'), 500) || null,
      ]
    );

    // The submitter is told it worked and nothing else — no id, no row count.
    return corsResponse(NextResponse.json({ success: true }), origin);
  } catch (error) {
    console.error('[efpi-submissions] POST failed:', error);
    return corsResponse(
      NextResponse.json({ error: 'We could not record that. Please try again.' }, { status: 500 }),
      origin
    );
  }
}

export async function GET(request: NextRequest) {
  const origin = request.headers.get('origin');

  try {
    // These are members of the public who left their contact details.
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return corsResponse(
        NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
        origin
      );
    }

    const params = request.nextUrl.searchParams;
    const form = params.get('form');
    const limit = Math.min(Number(params.get('limit')) || 100, 500);

    const result = await query(
      `SELECT s.id, s.form_name, s.page, s.name, s.email, s.fields,
              s.is_handled, s.handled_at, s.notes, s.created_at,
              u.full_name AS handled_by_name
         FROM efpi_submissions s
         LEFT JOIN users u ON u.id = s.handled_by
        WHERE ($1::text IS NULL OR s.form_name = $1)
        ORDER BY s.created_at DESC
        LIMIT $2`,
      [form && FORMS.has(form) ? form : null, limit]
    );

    const counts = await query(
      `SELECT form_name, COUNT(*)::int AS total,
              COUNT(*) FILTER (WHERE NOT is_handled)::int AS unhandled
         FROM efpi_submissions GROUP BY form_name`
    );

    return corsResponse(
      NextResponse.json({ submissions: result.rows, counts: counts.rows }),
      origin
    );
  } catch (error) {
    console.error('[efpi-submissions] GET failed:', error);
    return corsResponse(
      NextResponse.json({ error: 'Failed to load submissions' }, { status: 500 }),
      origin
    );
  }
}
