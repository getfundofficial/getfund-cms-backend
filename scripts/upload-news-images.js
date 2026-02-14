/**
 * Upload news article images to Vercel Blob Storage
 * and update content.featured_image_url in the database.
 *
 * Usage: node scripts/upload-news-images.js
 * Requires: BLOB_READ_WRITE_TOKEN and DATABASE_URL in .env
 */

require('dotenv').config();
const { put } = require('@vercel/blob');
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Map each image filename to the old getfund.gov.gh URL used in the content table
const IMAGE_MAP = [
  { file: 'Dept-770x417.png', oldUrl: 'https://www.getfund.gov.gh/wp-content/uploads/2026/02/Dept-770x417.png', alt: 'GETFund Deputy Administrator visits fire-affected schools' },
  { file: 'IMG_1149-770x417.jpg', oldUrl: 'https://www.getfund.gov.gh/wp-content/uploads/2026/02/IMG_1149-770x417.jpg', alt: 'Investigation into recurrent fires at NOBISCO and Tolon SHS' },
  { file: 'CJ-770x417.png', oldUrl: 'https://www.getfund.gov.gh/wp-content/uploads/2026/01/CJ-770x417.png', alt: 'Chief Justice calls on GETFund for judicial reforms' },
  { file: 'WhatsApp-Image-2026-01-23-at-07.30.17-1-770x417.jpeg', oldUrl: 'https://www.getfund.gov.gh/wp-content/uploads/2026/01/WhatsApp-Image-2026-01-23-at-07.30.17-1-770x417.jpeg', alt: 'CHASS Leadership engages GETFund Administrator' },
  { file: 'UVI-770x417.jpg', oldUrl: 'https://www.getfund.gov.gh/wp-content/uploads/2025/12/UVI-770x417.jpg', alt: 'University of Virgin Islands delegation at GETFund' },
  { file: 'Fuel-Trade-770x417.jpg', oldUrl: 'https://www.getfund.gov.gh/wp-content/uploads/2025/12/Fuel-Trade-770x417.jpg', alt: 'FuelTrade supports GETFund' },
  { file: 'Admin@Stembox-770x417.png', oldUrl: 'https://www.getfund.gov.gh/wp-content/uploads/2025/12/Admin@Stembox-770x417.png', alt: 'GETFund STEMBox initiative for science education' },
  { file: 'Research-2-770x417.png', oldUrl: 'https://www.getfund.gov.gh/wp-content/uploads/2025/11/Research-2-770x417.png', alt: 'Ghana National Research Fund office complex' },
  { file: 'Ato-Forson-770x417.jpg', oldUrl: 'https://www.getfund.gov.gh/wp-content/uploads/2025/11/Ato-Forson-770x417.jpg', alt: '2026 Budget educational infrastructure expansion' },
  { file: 'AdminPresident-770x417.png', oldUrl: 'https://www.getfund.gov.gh/wp-content/uploads/2025/10/AdminPresident-770x417.png', alt: 'GETFund commits GHC 50 million for disability education' },
  { file: 'Grp-Pix-770x417.jpg', oldUrl: 'https://www.getfund.gov.gh/wp-content/uploads/2025/10/Grp-Pix-770x417.jpg', alt: 'Students Loan Trust Fund CEO visits GETFund' },
  { file: 'AMbariya-2-770x417.png', oldUrl: 'https://www.getfund.gov.gh/wp-content/uploads/2025/10/AMbariya-2-770x417.png', alt: 'Infrastructure program at Ambariya Schools' },
  { file: 'Nobisco-1-770x417.png', oldUrl: 'https://www.getfund.gov.gh/wp-content/uploads/2025/10/Nobisco-1-770x417.png', alt: 'Multi-project construction in Northern Region' },
  { file: 'GHANASCO-770x417.png', oldUrl: 'https://www.getfund.gov.gh/wp-content/uploads/2025/10/GHANASCO-770x417.png', alt: 'Infrastructure expansion at Ghana Senior High School' },
  { file: 'Karaga-blk-770x417.png', oldUrl: 'https://www.getfund.gov.gh/wp-content/uploads/2025/10/Karaga-blk-770x417.png', alt: 'Ultra-modern facilities at Karaga SHS' },
  { file: '1-770x417.png', oldUrl: 'https://www.getfund.gov.gh/wp-content/uploads/2025/10/1-770x417.png', alt: 'Facility upgrade at Pishigu SHS' },
  { file: 'SD1-770x417.jpg', oldUrl: 'https://www.getfund.gov.gh/wp-content/uploads/2025/10/SD1-770x417.jpg', alt: 'GETFund Administrator meets with staff' },
  { file: 'GETPrison-770x417.jpg', oldUrl: 'https://www.getfund.gov.gh/wp-content/uploads/2025/10/GETPrison-770x417.jpg', alt: 'Prisons Director General engages GETFund' },
  { file: '1v-770x417.jpg', oldUrl: 'https://www.getfund.gov.gh/wp-content/uploads/2025/10/1v-770x417.jpg', alt: 'GETFund engages Voorhees University and ATTRACO' },
  { file: 'WhatsApp-Image-2025-10-17-at-12.06.03_7eee427d-770x417.jpg', oldUrl: 'https://www.getfund.gov.gh/wp-content/uploads/2025/10/WhatsApp-Image-2025-10-17-at-12.06.03_7eee427d-770x417.jpg', alt: 'GETFund tours UK universities' },
  { file: 'WhatsApp-Image-2025-10-17-at-12.06.14_c80190aa-770x417.jpg', oldUrl: 'https://www.getfund.gov.gh/wp-content/uploads/2025/10/WhatsApp-Image-2025-10-17-at-12.06.14_c80190aa-770x417.jpg', alt: 'GETFund monitors scholars in UK' },
  { file: 'S8509226-770x417.jpg', oldUrl: 'https://www.getfund.gov.gh/wp-content/uploads/2025/06/S8509226-770x417.jpg', alt: 'Orientation workshop for 7th Board of Trustees' },
  { file: 'Scholars.png', oldUrl: 'https://www.getfund.gov.gh/wp-content/uploads/2025/10/Scholars.png', alt: 'Scholarship unit engages UCC students' },
  { file: 'CDS-565x417.png', oldUrl: 'https://www.getfund.gov.gh/wp-content/uploads/2025/05/CDS-565x417.png', alt: 'GAF Chief of Defence Staff meets GETFund' },
  { file: 'S8507439-770x417.jpg', oldUrl: 'https://www.getfund.gov.gh/wp-content/uploads/2025/04/S8507439-770x417.jpg', alt: 'Minister inaugurates 7th GETFund Board' },
  { file: 'ST856505-770x417.jpg', oldUrl: 'https://www.getfund.gov.gh/wp-content/uploads/2025/03/ST856505-770x417.jpg', alt: 'GETFund Administrator engages CHASS leadership' },
  { file: 'S8502069-770x417.jpg', oldUrl: 'https://www.getfund.gov.gh/wp-content/uploads/2025/02/S8502069-770x417.jpg', alt: 'Private sector-led school infrastructure development' },
  { file: 'ST852075-770x417.jpg', oldUrl: 'https://www.getfund.gov.gh/wp-content/uploads/2025/02/ST852075-770x417.jpg', alt: 'Paul Adjei assumes office as GETFund Administrator' },
  { file: 'ST850255-714x417.jpg', oldUrl: 'https://www.getfund.gov.gh/wp-content/uploads/2024/12/ST850255-714x417.jpg', alt: 'State award for outstanding public service' },
  { file: 'IMGG_9999_244-770x417.jpg', oldUrl: 'https://www.getfund.gov.gh/wp-content/uploads/2025/01/IMGG_9999_244-770x417.jpg', alt: 'GETFund four-storey headquarters building' },
  { file: '1Z0A7382-770x417.jpg', oldUrl: 'https://www.getfund.gov.gh/wp-content/uploads/2024/11/1Z0A7382-770x417.jpg', alt: 'Trinity Theological Seminary graduation 2024' },
  { file: '86B6195-770x417.jpg', oldUrl: 'https://www.getfund.gov.gh/wp-content/uploads/2024/10/86B6195-770x417.jpg', alt: 'GETFund grants scholarships to GTP finalists' },
  { file: 'ST857443-770x417.jpg', oldUrl: 'https://www.getfund.gov.gh/wp-content/uploads/2024/04/ST857443-770x417.jpg', alt: 'Administrator counsels tertiary institutions on financing' },
  { file: '9CCC830E-CBF2-4AFA-B485-AAE9B0B623D4-770x417.jpg', oldUrl: 'https://www.getfund.gov.gh/wp-content/uploads/2024/04/9CCC830E-CBF2-4AFA-B485-AAE9B0B623D4-770x417.jpg', alt: 'Administrator engages media in Kumasi' },
  { file: 'GETFund-Press-Release-Cover-770x417.jpg', oldUrl: 'https://www.getfund.gov.gh/wp-content/uploads/2023/09/GETFund-Press-Release-Cover-770x417.jpg', alt: 'Scholarship processes at GETFund improved' },
  { file: 'S8503168-770x417.jpg', oldUrl: 'https://www.getfund.gov.gh/wp-content/uploads/2023/09/S8503168-770x417.jpg', alt: 'Administrator urges universities on alternative revenue' },
  { file: 'Unknown-1-770x417.jpeg', oldUrl: 'https://www.getfund.gov.gh/wp-content/uploads/2023/08/Unknown-1-770x417.jpeg', alt: 'Government grants scholarships to 4279 students' },
  { file: 'S8500045-1-770x417.jpg', oldUrl: 'https://www.getfund.gov.gh/wp-content/uploads/2023/07/S8500045-1-770x417.jpg', alt: 'GETFund receivables clarification' },
  { file: 'DSC_03245-770x417.jpg', oldUrl: 'https://www.getfund.gov.gh/wp-content/uploads/2023/04/DSC_03245-770x417.jpg', alt: 'Voorhees University delegation visits GETFund' },
  { file: '5H8A3236-770x417.jpg', oldUrl: 'https://www.getfund.gov.gh/wp-content/uploads/2023/03/5H8A3236-770x417.jpg', alt: 'Carleton University courtesy call on GETFund' },
  { file: '1Z0A9913-770x417.jpg', oldUrl: 'https://www.getfund.gov.gh/wp-content/uploads/2023/02/1Z0A9913-770x417.jpg', alt: 'Military High Command visits GETFund' },
  { file: '1Z0A0148-770x417.jpg', oldUrl: 'https://www.getfund.gov.gh/wp-content/uploads/2023/03/1Z0A0148-770x417.jpg', alt: 'HESLB Tanzania delegation visits GETFund' },
  { file: 'S8509378-770x417.jpg', oldUrl: 'https://www.getfund.gov.gh/wp-content/uploads/2023/02/S8509378-770x417.jpg', alt: 'Administrator interacts with NUGS leadership' },
  { file: 'Home-background-with-Dark-Cover-copywrite-770x417.jpg', oldUrl: 'https://www.getfund.gov.gh/wp-content/uploads/2022/12/Home-background-with-Dark-Cover-copywrite-770x417.jpg', alt: 'GETFund 2022/23 local scholarship application' },
  { file: 'S8507486-770x417.jpg', oldUrl: 'https://www.getfund.gov.gh/wp-content/uploads/2022/10/S8507486-770x417.jpg', alt: 'Universities Fund Kenya understudies GETFund' },
  { file: '5H8A0438-770x417.jpg', oldUrl: 'https://www.getfund.gov.gh/wp-content/uploads/2022/11/5H8A0438-770x417.jpg', alt: 'GETFund stakeholder forum' },
  { file: 'IMG_6526-770x417.jpg', oldUrl: 'https://www.getfund.gov.gh/wp-content/uploads/2022/09/IMG_6526-770x417.jpg', alt: 'Administrator inspects UDS project' },
  { file: 'IMG_6421-770x417.jpg', oldUrl: 'https://www.getfund.gov.gh/wp-content/uploads/2022/05/IMG_6421-770x417.jpg', alt: 'Administrator visits Northern Sector office' },
  { file: 'MG_9824-770x417.jpg', oldUrl: 'https://www.getfund.gov.gh/wp-content/uploads/2022/09/MG_9824-770x417.jpg', alt: 'Board of Trustees tours Eastern Region projects' },
  { file: 'blog-1-1-770x417-1.jpg', oldUrl: 'https://www.getfund.gov.gh/wp-content/uploads/2022/06/blog-1-1-770x417-1.jpg', alt: 'Vice President hands over buses to schools' },
  { file: 'GETFund-News-2-2-1024x683-1-770x417.jpg', oldUrl: 'https://www.getfund.gov.gh/wp-content/uploads/2022/01/GETFund-News-2-2-1024x683-1-770x417.jpg', alt: 'GETFund bold march on educational infrastructure' },
  { file: 'Screenshot-2022-06-24-at-11.14.12-PM-770x417.png', oldUrl: 'https://www.getfund.gov.gh/wp-content/uploads/2022/05/Screenshot-2022-06-24-at-11.14.12-PM-770x417.png', alt: 'Press update on infrastructure projects' },
  { file: 'GETFund-News-1-1-1024x683-1-770x417.jpg', oldUrl: 'https://www.getfund.gov.gh/wp-content/uploads/2021/12/GETFund-News-1-1-1024x683-1-770x417.jpg', alt: 'GETFund obtains parliamentary nod' },
  { file: 'Volt-Monitoring-1-770x417-1.jpg', oldUrl: 'https://www.getfund.gov.gh/wp-content/uploads/2022/03/Volt-Monitoring-1-770x417-1.jpg', alt: 'Project monitoring in Volta Region' },
  { file: 'GETFund-News-3-3-1024x683-1-770x417.jpg', oldUrl: 'https://www.getfund.gov.gh/wp-content/uploads/2022/01/GETFund-News-3-3-1024x683-1-770x417.jpg', alt: '2021 Scholarship monitoring programme' },
  { file: 'SONA-GETFund-1-770x417-1.jpg', oldUrl: 'https://www.getfund.gov.gh/wp-content/uploads/2022/01/SONA-GETFund-1-770x417-1.jpg', alt: 'SONA 2020 on educational infrastructure' },
];

// Two articles share the same blog image but from different upload paths
const EXTRA_URL_MAP = [
  { oldUrl: 'https://www.getfund.gov.gh/wp-content/uploads/2022/05/blog-1-1-770x417-1.jpg', sameAs: 'blog-1-1-770x417-1.jpg' },
];

function getMimeType(filename) {
  const ext = filename.split('.').pop().toLowerCase();
  const types = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif', webp: 'image/webp' };
  return types[ext] || 'application/octet-stream';
}

async function main() {
  const imagesDir = path.resolve(__dirname, '../../public/images/news');

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error('ERROR: BLOB_READ_WRITE_TOKEN not set in .env');
    process.exit(1);
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to database\n');

    const results = [];
    let uploaded = 0;
    let failed = 0;

    for (const item of IMAGE_MAP) {
      const filePath = path.join(imagesDir, item.file);

      if (!fs.existsSync(filePath)) {
        console.log(`SKIP (not found): ${item.file}`);
        failed++;
        continue;
      }

      const fileBuffer = fs.readFileSync(filePath);
      const mimeType = getMimeType(item.file);
      const fileSize = fs.statSync(filePath).size;
      const blobPath = `news-images/${item.file}`;

      try {
        // Upload to Vercel Blob
        const blob = await put(blobPath, fileBuffer, {
          access: 'public',
          contentType: mimeType,
        });

        console.log(`Uploaded: ${item.file} -> ${blob.url}`);

        // Insert into media table
        await client.query(`
          INSERT INTO media (filename, original_name, mime_type, size_bytes, file_path, url, alt_text)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          ON CONFLICT DO NOTHING
        `, [item.file, item.file, mimeType, fileSize, blobPath, blob.url, item.alt]);

        // Update content featured_image_url
        await client.query(`
          UPDATE content SET featured_image_url = $1
          WHERE featured_image_url = $2
        `, [blob.url, item.oldUrl]);

        results.push({ file: item.file, oldUrl: item.oldUrl, newUrl: blob.url });
        uploaded++;
      } catch (err) {
        console.error(`FAIL: ${item.file} - ${err.message}`);
        failed++;
      }
    }

    // Handle the Daakye Trust article that shares the same blog image
    for (const extra of EXTRA_URL_MAP) {
      const match = results.find(r => r.file === extra.sameAs);
      if (match) {
        await client.query(`
          UPDATE content SET featured_image_url = $1
          WHERE featured_image_url = $2
        `, [match.newUrl, extra.oldUrl]);
        console.log(`Linked shared image: ${extra.oldUrl} -> ${match.newUrl}`);
      }
    }

    console.log(`\nDone: ${uploaded} uploaded, ${failed} failed`);
    console.log('\nURL mapping:');
    for (const r of results) {
      console.log(`  ${r.file}: ${r.newUrl}`);
    }

    await client.end();
    process.exit(0);
  } catch (error) {
    console.error('Script failed:', error);
    await client.end();
    process.exit(1);
  }
}

main();
