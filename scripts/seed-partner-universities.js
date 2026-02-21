/**
 * Seed Partner Universities
 * Uploads university logos to Vercel Blob and creates partner + media entries.
 *
 * Run: node scripts/seed-partner-universities.js
 * Requires: BLOB_READ_WRITE_TOKEN and DATABASE_URL (from .env.production)
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env.production') });
const { put } = require('@vercel/blob');
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Logo source directory (extracted from Partnership Agreement .docx)
const LOGOS_DIR = path.resolve(__dirname, '../../getfund-website/docs/extracted_logos/word/media');

// University data: [sourceFile, name, country, websiteUrl]
const UNIVERSITIES = [
  ['image1.png', 'University of Central Lancashire', 'UK', 'https://www.uclan.ac.uk'],
  ['image2.png', 'Robert Gordon University', 'UK', 'https://www.rgu.ac.uk'],
  ['image3.png', 'University of Bradford', 'UK', 'https://www.bradford.ac.uk'],
  ['image4.png', 'Coventry University', 'UK', 'https://www.coventry.ac.uk'],
  ['image5.png', 'Glasgow Caledonian University', 'UK', 'https://www.gcu.ac.uk'],
  ['image6.png', 'University for the Creative Arts', 'UK', 'https://www.uca.ac.uk'],
  ['image7.png', 'University of Manchester', 'UK', 'https://www.manchester.ac.uk'],
  ['image8.png', 'Brunel University', 'UK', 'https://www.brunel.ac.uk'],
  ['image9.png', 'University of Nottingham', 'UK', 'https://www.nottingham.ac.uk'],
  ['image11.png', 'University of Aberdeen', 'UK', 'https://www.abdn.ac.uk'],
  ['image12.jpg', 'Nottingham Trent University', 'UK', 'https://www.ntu.ac.uk'],
  ['image13.png', 'Stirling University', 'UK', 'https://www.stir.ac.uk'],
  ['image14.png', 'University of Southampton', 'UK', 'https://www.southampton.ac.uk'],
  ['image15.png', 'University of Solent', 'UK', 'https://www.solent.ac.uk'],
  ['image16.png', 'Durham University', 'UK', 'https://www.durham.ac.uk'],
  ['image17.png', 'University of East Anglia', 'UK', 'https://www.uea.ac.uk'],
  ['image18.png', 'University of Sheffield', 'UK', 'https://www.sheffield.ac.uk'],
  ['image19.png', 'University of Birmingham', 'UK', 'https://www.birmingham.ac.uk'],
  ['image20.png', 'Anglia Ruskin University', 'UK', 'https://www.aru.ac.uk'],
  ['image21.png', 'Queen\'s University Belfast', 'UK', 'https://www.qub.ac.uk'],
  ['image22.png', 'Johns Hopkins University', 'USA', 'https://www.jhu.edu'],
  ['image23.png', 'Temple University Beasley School of Law', 'USA', 'https://www.temple.edu'],
];

function getMimeType(filename) {
  const ext = path.extname(filename).toLowerCase();
  const map = {
    '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
    '.png': 'image/png', '.gif': 'image/gif', '.webp': 'image/webp',
  };
  return map[ext] || 'image/png';
}

async function main() {
  console.log('=== Seed Partner Universities ===\n');

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error('ERROR: BLOB_READ_WRITE_TOKEN not set');
    process.exit(1);
  }

  if (!fs.existsSync(LOGOS_DIR)) {
    console.error(`ERROR: Logos directory not found: ${LOGOS_DIR}`);
    console.error('Run the logo extraction step first.');
    process.exit(1);
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  console.log('Connected to database\n');

  let uploaded = 0;
  let skipped = 0;

  for (let i = 0; i < UNIVERSITIES.length; i++) {
    const [sourceFile, name, country, websiteUrl] = UNIVERSITIES[i];
    const filePath = path.join(LOGOS_DIR, sourceFile);

    if (!fs.existsSync(filePath)) {
      console.log(`  SKIP: ${sourceFile} not found`);
      skipped++;
      continue;
    }

    // Check if partner already exists
    const existing = await client.query(
      'SELECT id FROM partners WHERE name = $1 AND category = $2',
      [name, 'university']
    );
    if (existing.rows.length > 0) {
      console.log(`  SKIP: "${name}" already exists`);
      skipped++;
      continue;
    }

    const fileBuffer = fs.readFileSync(filePath);
    const mimeType = getMimeType(sourceFile);
    const sanitized = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '');
    const blobPath = `uploads/partners/${sanitized}${path.extname(sourceFile)}`;

    console.log(`  [${i + 1}/${UNIVERSITIES.length}] Uploading ${name}...`);

    // Upload to Vercel Blob
    const blob = await put(blobPath, fileBuffer, {
      access: 'public',
      contentType: mimeType,
    });

    // Insert into media table
    await client.query(`
      INSERT INTO media (filename, original_name, mime_type, size_bytes, file_path, url, alt_text)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [
      `${sanitized}${path.extname(sourceFile)}`,
      sourceFile,
      mimeType,
      fileBuffer.length,
      blob.pathname,
      blob.url,
      `${name} logo`,
    ]);

    // Insert into partners table
    await client.query(`
      INSERT INTO partners (name, logo_url, website_url, description, category, display_order, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [
      name,
      blob.url,
      websiteUrl,
      country,
      'university',
      i + 1,
      true,
    ]);

    uploaded++;
    console.log(`    → ${blob.url}`);
  }

  await client.end();

  console.log(`\n=== Done ===`);
  console.log(`Uploaded: ${uploaded}`);
  console.log(`Skipped:  ${skipped}`);
  console.log(`Total:    ${UNIVERSITIES.length}`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
