/**
 * Loads the EFPI site's bundled copy into the CMS so there is something to edit.
 *
 *   node scripts/seed-efpi-content.js --content ../../EFPI-Website/src/content --dry-run
 *   node scripts/seed-efpi-content.js --content ../../EFPI-Website/src/content
 *
 * EFPI is a React port of an Elementor build: each page is fixed markup with
 * strings injected by key, and every string lives in one JSON file per page.
 * Those files are the source of truth until this runs; afterwards the CMS is,
 * and the files stay as the fallback the site renders when the CMS cannot be
 * reached.
 *
 * Each page becomes one `pages` row (site = 'efpi') plus one `page_sections`
 * row holding the whole key/value map as JSONB. No new tables: EFPI shares the
 * model GETFund already uses, and so shares its revisions, permissions, media
 * and editor.
 *
 * Re-runnable: pages are matched on (site, slug) and content is replaced, so
 * running it again re-syncs from the files. That also means it overwrites
 * edits made in the CMS — hence --dry-run, and the prompt when rows exist.
 *
 * REQUIRES migration 053 (adds pages.site). It checks first and stops if absent.
 */

require('dotenv').config({ path: '.env' });

const fs = require('node:fs');
const path = require('node:path');
const readline = require('node:readline');
const { neon } = require('@neondatabase/serverless');

const DATABASE_URL = process.env.DATABASE_URL || process.env.POSTGRES_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL or POSTGRES_URL is required (put it in .env).');
  process.exit(1);
}
const sql = neon(DATABASE_URL);

function parseArgs(argv) {
  const args = { dryRun: false, force: false, contentDir: null };
  for (let i = 2; i < argv.length; i += 1) {
    if (argv[i] === '--dry-run') args.dryRun = true;
    else if (argv[i] === '--force') args.force = true;
    else if (argv[i] === '--content') args.contentDir = argv[i + 1];
  }
  return args;
}

function confirm(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(/^y(es)?$/i.test(answer.trim()));
    });
  });
}

/** A readable name for the CMS page list. */
function titleFor(slug) {
  if (slug === 'home') return 'Home';
  if (slug.startsWith('popup-')) return `Popup ${slug.slice(6)}`;
  return slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' ');
}

async function main() {
  const args = parseArgs(process.argv);
  const dir = args.contentDir && path.resolve(args.contentDir);

  if (!dir || !fs.existsSync(dir)) {
    console.error("Pass --content <dir> pointing at the EFPI site's src/content directory.");
    process.exit(64);
  }

  const pages = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .map((file) => {
      const slug = file.replace(/\.json$/, '');
      const parsed = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
      const values = {};
      for (const [key, value] of Object.entries(parsed)) {
        if (typeof value === 'string') values[key] = value;
      }
      return { slug, title: titleFor(slug), values, total: Object.keys(parsed).length };
    });

  console.log(`\nFound ${pages.length} content files in ${dir}:\n`);
  for (const p of pages) {
    const kept = Object.keys(p.values).length;
    const skipped = p.total - kept;
    console.log(
      `  ${p.slug.padEnd(14)} ${String(kept).padStart(3)} strings` +
        (skipped ? `  (${skipped} non-string values skipped)` : '')
    );
  }

  // Before any database work, so a dry run needs no credentials and can be used
  // to check what would be seeded from a machine that cannot reach the CMS.
  if (args.dryRun) {
    console.log('\n--dry-run: nothing written.\n');
    return;
  }

  // Without the column every insert below fails, so check before writing anything.
  const column = await sql`
    SELECT 1 FROM information_schema.columns
     WHERE table_name = 'pages' AND column_name = 'site'
  `;
  if (column.length === 0) {
    console.error('pages.site is missing — run migration 053_add_site_to_pages.sql first.');
    process.exit(1);
  }

  const existing = await sql`SELECT COUNT(*)::int AS n FROM pages WHERE site = 'efpi'`;
  if (existing[0].n > 0 && !args.force) {
    console.log(`\n${existing[0].n} EFPI pages already exist in the CMS.`);
    console.log('Continuing REPLACES their content, discarding any edits made there.');
    if (!(await confirm('Continue? [y/N] '))) {
      console.log('Nothing written.\n');
      return;
    }
  }

  let written = 0;
  for (const page of pages) {
    // One page at a time rather than one transaction for all: a failure partway
    // leaves the earlier pages seeded, and re-running finishes the job.
    const pageRow = await sql`
      INSERT INTO pages (slug, title, site, is_active, layout_template)
           VALUES (${page.slug}, ${page.title}, 'efpi', true, 'efpi')
      ON CONFLICT (site, slug)
        DO UPDATE SET title = EXCLUDED.title, updated_at = CURRENT_TIMESTAMP
        RETURNING id
    `;
    const pageId = pageRow[0].id;

    await sql`
      INSERT INTO page_sections (page_id, section_key, section_type, title, content, order_index, is_active)
           VALUES (${pageId}, 'content', 'keyvalue', ${page.title}, ${JSON.stringify(page.values)}::jsonb, 0, true)
      ON CONFLICT (page_id, section_key)
        DO UPDATE SET content = EXCLUDED.content, updated_at = CURRENT_TIMESTAMP
    `;

    written += 1;
    console.log(`  seeded ${page.slug}`);
  }

  console.log(`\n${written} EFPI pages now in the CMS.`);
  console.log('Check with: GET /api/site-content?site=efpi\n');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\nSeed failed:', error.message);
    process.exit(1);
  });
