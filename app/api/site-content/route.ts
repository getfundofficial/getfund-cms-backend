export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { corsResponse, corsOptionsResponse } from '@/lib/cors';

/**
 * All of a site's editable copy in one response.
 *
 * GET /api/site-content?site=efpi
 *   -> { site, pages: { home: { "<key>": "<text>" }, about: { ... } } }
 *
 * The EFPI site is a React port of an Elementor build: its pages are fixed
 * markup with strings injected by key, and it ships with a copy of every
 * string. It renders those first and applies this response as an overlay, so
 * this endpoint being slow or absent costs nothing — see the EFPI repo's
 * src/runtime/content.jsx.
 *
 * That is why this is one request for the whole site rather than one per page:
 * the payload is a few tens of kilobytes, and per-page fetching would show a
 * flash of bundled copy on every navigation.
 *
 * Copy lives in a single `page_sections` row per page, `section_key = 'content'`,
 * whose JSONB is the flat key/value map the site expects. No new tables: pages
 * for both sites share the same model, and so share revisions, permissions,
 * media and the editor.
 */

const SITES = new Set(['getfund', 'efpi']);

export async function OPTIONS(request: NextRequest) {
  return corsOptionsResponse(request.headers.get('origin'));
}

export async function GET(request: NextRequest) {
  const origin = request.headers.get('origin');

  try {
    const site = request.nextUrl.searchParams.get('site') || 'getfund';
    if (!SITES.has(site)) {
      return corsResponse(
        NextResponse.json({ error: 'Unknown site' }, { status: 400 }),
        origin
      );
    }

    const result = await query(
      `SELECT p.slug, s.content
         FROM pages p
         JOIN page_sections s ON s.page_id = p.id
        WHERE p.site = $1
          AND p.is_active = true
          AND s.is_active = true
          AND s.section_key = 'content'`,
      [site]
    );

    /*
     * Only strings are returned. The column is JSONB and an editor could put
     * anything in it; the site injects these values straight into markup, so
     * the narrowing happens here as well as there rather than only there.
     */
    const pages: Record<string, Record<string, string>> = {};
    for (const row of result.rows) {
      const raw = row.content;
      if (!raw || typeof raw !== 'object') continue;
      const values: Record<string, string> = {};
      for (const [key, value] of Object.entries(raw)) {
        if (typeof value === 'string') values[key] = value;
      }
      if (Object.keys(values).length) pages[row.slug] = values;
    }

    const response = NextResponse.json({ site, pages });
    // Cheap to serve and safe to be a little stale: the site has its own copy
    // to fall back on, and an edit showing up a minute late is not a problem.
    response.headers.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=600');
    return corsResponse(response, origin);
  } catch (error) {
    console.error('[site-content] failed:', error);
    return corsResponse(
      NextResponse.json({ error: 'Failed to load site content' }, { status: 500 }),
      origin
    );
  }
}
