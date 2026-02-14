/**
 * Comprehensive News Media Sync - Main Orchestrator
 *
 * Runs all phases:
 *   Phase 1: Scrape body images from source articles
 *   Phase 2: Upload all images to Vercel Blob + media library
 *   Phase 3: Fix article references (carousel, body HTML, links)
 *   Phase 4: Cleanup and deduplication
 *
 * Usage: node scripts/news-media-sync/index.js [--phase N]
 *   --phase 1  Run only Phase 1 (scrape)
 *   --phase 2  Run only Phase 2 (upload)
 *   --phase 3  Run only Phase 3 (fix references)
 *   --phase 4  Run only Phase 4 (cleanup)
 *   (no flag)  Run all phases
 *
 * Requires: DATABASE_URL in .env
 * Optional: BLOB_READ_WRITE_TOKEN for Vercel Blob uploads
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const { Client } = require('pg');
const { scrapeBodyImages } = require('./scrape-body-images');
const { uploadToBlob } = require('./upload-to-blob');
const { fixReferences } = require('./fix-references');
const { cleanup } = require('./cleanup');

async function main() {
  const args = process.argv.slice(2);
  const phaseArg = args.indexOf('--phase');
  const targetPhase = phaseArg >= 0 ? parseInt(args[phaseArg + 1]) : null;

  console.log('========================================');
  console.log(' Comprehensive News Media Sync');
  console.log('========================================\n');
  console.log(`Database: ${process.env.DATABASE_URL ? 'Connected' : 'MISSING'}`);
  console.log(`Blob Token: ${process.env.BLOB_READ_WRITE_TOKEN ? 'Available' : 'Not set (local only)'}`);
  console.log(`Target Phase: ${targetPhase || 'All'}\n`);

  const connConfig = {
    connectionString: process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    keepAlive: true,
    keepAliveInitialDelayMillis: 10000,
  };

  async function createClient() {
    const c = new Client(connConfig);
    c.on('error', (err) => console.log('DB connection error (will reconnect):', err.message));
    await c.connect();
    return c;
  }

  try {
    let articlesWithImages = [];
    let urlMap = new Map();

    // Phase 1: Scrape body images (fresh connection - long running)
    if (!targetPhase || targetPhase === 1) {
      const client = await createClient();
      console.log('Connected to database (Phase 1).\n');
      try {
        articlesWithImages = await scrapeBodyImages(client);
      } finally {
        await client.end().catch(() => {});
      }
    }

    // Phase 2: Upload to Vercel Blob + media library
    if (!targetPhase || targetPhase === 2) {
      const client = await createClient();
      console.log('Connected to database (Phase 2).\n');
      try {
        urlMap = await uploadToBlob(client);
      } finally {
        await client.end().catch(() => {});
      }
    }

    // Phase 3: Fix references
    if (!targetPhase || targetPhase === 3) {
      const client = await createClient();
      console.log('Connected to database (Phase 3).\n');
      try {
        await fixReferences(client, urlMap, articlesWithImages);
      } finally {
        await client.end().catch(() => {});
      }
    }

    // Phase 4: Cleanup
    if (!targetPhase || targetPhase === 4) {
      const client = await createClient();
      console.log('Connected to database (Phase 4).\n');
      try {
        await cleanup(client);
      } finally {
        await client.end().catch(() => {});
      }
    }

    console.log('\n========================================');
    console.log(' All phases complete!');
    console.log('========================================\n');
  } catch (err) {
    console.error('Fatal error:', err);
    process.exit(1);
  }
}

main();
