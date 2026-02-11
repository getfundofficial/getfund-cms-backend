require('dotenv').config();
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { Client } = require('pg');

// All articles from GETFund website with their image URLs
const articlesWithImages = [
  // Page 1 - 2026
  { title: 'GETFund Deputy Administrator Visits Schools Affected by Fire in the Northern Region', imageUrl: 'https://www.getfund.gov.gh/wp-content/uploads/2026/02/Dept-770x417.png' },
  { title: 'GETFund Deputy Administrator Calls for Investigation into Causes of Recurrent Fires at NOBISCO and Tolon SHS', imageUrl: 'https://www.getfund.gov.gh/wp-content/uploads/2026/02/IMG_1149-770x417.jpg' },
  { title: 'His Lordship The Chief Justice Calls on GETFund for Judicial Service Reforms', imageUrl: 'https://www.getfund.gov.gh/wp-content/uploads/2026/01/CJ-770x417.png' },
  { title: 'CHASS Leadership Engages GETFund Administrator', imageUrl: 'https://www.getfund.gov.gh/wp-content/uploads/2026/01/WhatsApp-Image-2026-01-23-at-07.30.17-1-770x417.jpeg' },

  // Page 1 - 2025
  { title: 'GETFund Receives Delegation from University of Virgin Islands', imageUrl: 'https://www.getfund.gov.gh/wp-content/uploads/2025/12/UVI-770x417.jpg' },
  { title: 'FuelTrade Supports GETFund', imageUrl: 'https://www.getfund.gov.gh/wp-content/uploads/2025/12/Fuel-Trade-770x417.jpg' },
  { title: 'GETFund Accelerates Practical Science Education with Strategic Funding for STEMBox Initiative', imageUrl: 'https://www.getfund.gov.gh/wp-content/uploads/2025/12/Admin@Stembox-770x417.png' },
  { title: 'GETFund Supports Ghana National Research Fund with Office Complex', imageUrl: 'https://www.getfund.gov.gh/wp-content/uploads/2025/11/Research-2-770x417.png' },
  { title: '2026 Budget: GETFund Drives Historic Expansion in Educational Infrastructure and Learning Resources', imageUrl: 'https://www.getfund.gov.gh/wp-content/uploads/2025/11/Ato-Forson-770x417.jpg' },

  // Page 2
  { title: 'GETFund to Commit GHC 50 million yearly to Free Tertiary Education for Persons with Disabilities', imageUrl: 'https://www.getfund.gov.gh/wp-content/uploads/2025/10/AdminPresident-770x417.png' },
  { title: 'CEO of Students Loan Trust Fund Visits GETFund Administrator', imageUrl: 'https://www.getfund.gov.gh/wp-content/uploads/2025/10/Grp-Pix-770x417.jpg' },
  { title: 'GETFund Commences Accelerated Infrastructure Program at Ambariya Schools', imageUrl: 'https://www.getfund.gov.gh/wp-content/uploads/2025/10/AMbariya-2-770x417.png' },
  { title: 'GETFund Kicks Off Multi-Project Construction to Boost Education in the Northern Region', imageUrl: 'https://www.getfund.gov.gh/wp-content/uploads/2025/10/Nobisco-1-770x417.png' },
  { title: 'N/R: GETFund Launches Major Infrastructure Expansion at Ghana Senior High School', imageUrl: 'https://www.getfund.gov.gh/wp-content/uploads/2025/10/GHANASCO-770x417.png' },
  { title: 'GETFund Gives Greenlight for the Construction of Ultra-Modern Infrastructure Facilities at Karaga SHS', imageUrl: 'https://www.getfund.gov.gh/wp-content/uploads/2025/10/Karaga-blk-770x417.png' },
  { title: 'N/R: GETFund Commences Major Facility Upgrade at Pishigu SHS', imageUrl: 'https://www.getfund.gov.gh/wp-content/uploads/2025/10/1-770x417.png' },
  { title: 'GETFund Administrator Meets with Staff', imageUrl: 'https://www.getfund.gov.gh/wp-content/uploads/2025/10/SD1-770x417.jpg' },
  { title: 'Director General of Prisons Engages GETFund on Inmate Rehabilitation Partnership', imageUrl: 'https://www.getfund.gov.gh/wp-content/uploads/2025/10/GETPrison-770x417.jpg' },
  { title: 'GETFund Engages with Voorhees University and ATTRACO to Deepen Educational Collaboration', imageUrl: 'https://www.getfund.gov.gh/wp-content/uploads/2025/10/1v-770x417.jpg' },

  // Page 3
  { title: 'Photo Gallery: GETFund Tours UK Universities to Engage Ghanaian Scholars', imageUrl: 'https://www.getfund.gov.gh/wp-content/uploads/2025/10/WhatsApp-Image-2025-10-17-at-12.06.03_7eee427d-770x417.jpg' },
  { title: 'Strengthening Educational Ties: GETFund Monitors Scholars in UK', imageUrl: 'https://www.getfund.gov.gh/wp-content/uploads/2025/10/WhatsApp-Image-2025-10-17-at-12.06.14_c80190aa-770x417.jpg' },
  { title: 'GETFund Holds Orientation Workshop for 7th Board of Trustees', imageUrl: 'https://www.getfund.gov.gh/wp-content/uploads/2025/06/S8509226-770x417.jpg' },
  { title: 'GETFund Scholarship Unit Engages with University of Cape Coast Students', imageUrl: 'https://www.getfund.gov.gh/wp-content/uploads/2025/10/Scholars.png' },
  { title: 'GAF CDS Interacts with GETFund Administrator', imageUrl: 'https://www.getfund.gov.gh/wp-content/uploads/2025/05/CDS-565x417.png' },
  { title: 'Minister of Education Inaugurates 7th GETFund Board', imageUrl: 'https://www.getfund.gov.gh/wp-content/uploads/2025/04/S8507439-770x417.jpg' },
  { title: 'GETFund Administrator Engages CHASS Leadership', imageUrl: 'https://www.getfund.gov.gh/wp-content/uploads/2025/03/ST856505-770x417.jpg' },
  { title: 'Advocacy for Private Sector-Led School Infrastructure Development', imageUrl: 'https://www.getfund.gov.gh/wp-content/uploads/2025/02/S8502069-770x417.jpg' },
  { title: 'Mr. Paul Adjei Assumes Office as GETFund Administrator', imageUrl: 'https://www.getfund.gov.gh/wp-content/uploads/2025/02/ST852075-770x417.jpg' },
  { title: 'State Award for Outstanding Public Service', imageUrl: 'https://www.getfund.gov.gh/wp-content/uploads/2024/12/ST850255-714x417.jpg' },

  // Page 4
  { title: 'GETFund Inaugurates a Four-Storey Headquarters Building', imageUrl: 'https://www.getfund.gov.gh/wp-content/uploads/2025/01/IMGG_9999_244-770x417.jpg' },
  { title: '2024 Trinity Theological Seminary Graduation', imageUrl: 'https://www.getfund.gov.gh/wp-content/uploads/2024/11/1Z0A7382-770x417.jpg' },
  { title: 'GETFund grants scholarships to GTP finalists', imageUrl: 'https://www.getfund.gov.gh/wp-content/uploads/2024/10/86B6195-770x417.jpg' },
  { title: 'GETFund Administrator counsels Tertiary Institutions on Financing Options', imageUrl: 'https://www.getfund.gov.gh/wp-content/uploads/2024/04/ST857443-770x417.jpg' },
  { title: 'GETFund Administrator Engages Media in Kumasi', imageUrl: 'https://www.getfund.gov.gh/wp-content/uploads/2024/04/9CCC830E-CBF2-4AFA-B485-AAE9B0B623D4-770x417.jpg' },
  { title: 'Scholarship Processes at GETFund have improved', imageUrl: 'https://www.getfund.gov.gh/wp-content/uploads/2023/09/GETFund-Press-Release-Cover-770x417.jpg' },
  { title: 'The Administrator urges universities to be innovative', imageUrl: 'https://www.getfund.gov.gh/wp-content/uploads/2023/09/S8503168-770x417.jpg' },
  { title: 'Government Grants New Scholarships to 4,279 Local Tertiary Students', imageUrl: 'https://www.getfund.gov.gh/wp-content/uploads/2023/08/Unknown-1-770x417.jpeg' },
  { title: 'GETFund has NOT used its receivables to borrow $1.5 billion', imageUrl: 'https://www.getfund.gov.gh/wp-content/uploads/2023/07/S8500045-1-770x417.jpg' },
  { title: 'Voorhees University delegation calls on GETFund', imageUrl: 'https://www.getfund.gov.gh/wp-content/uploads/2023/04/DSC_03245-770x417.jpg' },

  // Page 5
  { title: 'Carleton University Pays Courtesy Call on GETFund', imageUrl: 'https://www.getfund.gov.gh/wp-content/uploads/2023/03/5H8A3236-770x417.jpg' },
  { title: 'Military High Command Pays Courtesy Call on GETFund Administrator', imageUrl: 'https://www.getfund.gov.gh/wp-content/uploads/2023/02/1Z0A9913-770x417.jpg' },
  { title: 'Delegation from HESLB Tanzania visits GETFund', imageUrl: 'https://www.getfund.gov.gh/wp-content/uploads/2023/03/1Z0A0148-770x417.jpg' },
  { title: 'GETFund Administrator interacts with NUGS Leadership', imageUrl: 'https://www.getfund.gov.gh/wp-content/uploads/2023/02/S8509378-770x417.jpg' },
  { title: 'GETFund 2022/23 Local Scholarship Application', imageUrl: 'https://www.getfund.gov.gh/wp-content/uploads/2022/12/Home-background-with-Dark-Cover-copywrite-770x417.jpg' },
  { title: 'Universities Fund Kenya understudies GETFund', imageUrl: 'https://www.getfund.gov.gh/wp-content/uploads/2022/10/S8507486-770x417.jpg' },
  { title: 'GETFund Accounts To The Public Stakeholder Forum', imageUrl: 'https://www.getfund.gov.gh/wp-content/uploads/2022/11/5H8A0438-770x417.jpg' },
  { title: 'GETFund Administrator Inspects UDS project', imageUrl: 'https://www.getfund.gov.gh/wp-content/uploads/2022/09/IMG_6526-770x417.jpg' },
  { title: 'GETFund Administrator pays working visit', imageUrl: 'https://www.getfund.gov.gh/wp-content/uploads/2022/05/IMG_6421-770x417.jpg' },
  { title: 'GETFund Board of Trustees tour project', imageUrl: 'https://www.getfund.gov.gh/wp-content/uploads/2022/09/MG_9824-770x417.jpg' },

  // Page 6
  { title: 'Vice President hands over buses and pickups', imageUrl: 'https://www.getfund.gov.gh/wp-content/uploads/2022/06/blog-1-1-770x417-1.jpg' },
  { title: 'Daakye Trust PLC holds Inaugural AGM in Accra', imageUrl: 'https://www.getfund.gov.gh/wp-content/uploads/2022/05/blog-1-1-770x417-1.jpg' },
  { title: 'GETFund Bold March on Educational Infrastructure', imageUrl: 'https://www.getfund.gov.gh/wp-content/uploads/2022/01/GETFund-News-2-2-1024x683-1-770x417.jpg' },
  { title: 'Press Update Infrastructure Projects', imageUrl: 'https://www.getfund.gov.gh/wp-content/uploads/2022/05/Screenshot-2022-06-24-at-11.14.12-PM-770x417.png' },
  { title: 'GETFund Obtains Parliamentary nod', imageUrl: 'https://www.getfund.gov.gh/wp-content/uploads/2021/12/GETFund-News-1-1-1024x683-1-770x417.jpg' },
  { title: 'GETFund Completes 1st Quarter Project Monitoring in Volta Region', imageUrl: 'https://www.getfund.gov.gh/wp-content/uploads/2022/03/Volt-Monitoring-1-770x417-1.jpg' },
  { title: '2021 Scholarship Monitoring Programme', imageUrl: 'https://www.getfund.gov.gh/wp-content/uploads/2022/01/GETFund-News-3-3-1024x683-1-770x417.jpg' },
  { title: 'SONA 2020 on Educational Infrastructure', imageUrl: 'https://www.getfund.gov.gh/wp-content/uploads/2022/01/SONA-GETFund-1-770x417-1.jpg' },
];

const imagesDir = path.join(__dirname, '../getfund-website/public/images/news');

// Helper to slugify title for matching
function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 80);
}

// Helper to get extension from URL
function getExtension(url) {
  const match = url.match(/\.(jpg|jpeg|png|gif|webp)(\?|$)/i);
  return match ? match[1].toLowerCase() : 'jpg';
}

// Download a single image
function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;

    const request = protocol.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    }, (response) => {
      // Handle redirects
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        downloadImage(response.headers.location, filepath).then(resolve).catch(reject);
        return;
      }

      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}`));
        return;
      }

      const file = fs.createWriteStream(filepath);
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve(filepath);
      });
      file.on('error', (err) => {
        fs.unlink(filepath, () => {});
        reject(err);
      });
    });

    request.on('error', reject);
    request.setTimeout(30000, () => {
      request.destroy();
      reject(new Error('Timeout'));
    });
  });
}

async function main() {
  console.log('🔄 Starting image download and database update...\n');

  const client = new Client({
    connectionString: process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();
  console.log('✅ Connected to database\n');

  // Get all articles from database
  const dbResult = await client.query(`
    SELECT id, slug, title, featured_image_url
    FROM content
    WHERE type = 'news' AND status = 'published'
  `);

  console.log(`📰 Found ${dbResult.rows.length} articles in database\n`);

  const updates = [];
  const downloads = [];

  for (const article of articlesWithImages) {
    const titleSlug = slugify(article.title);

    // Find matching article in database (fuzzy match on title)
    const dbArticle = dbResult.rows.find(row => {
      const dbTitleLower = row.title.toLowerCase();
      const articleTitleLower = article.title.toLowerCase();

      // Check various matching criteria
      return dbTitleLower.includes(articleTitleLower.substring(0, 30)) ||
             articleTitleLower.includes(dbTitleLower.substring(0, 30)) ||
             row.slug.includes(titleSlug.substring(0, 20)) ||
             titleSlug.includes(row.slug.substring(0, 20));
    });

    if (!dbArticle) {
      console.log(`⚠️  No DB match for: ${article.title.substring(0, 50)}...`);
      continue;
    }

    // Generate local filename
    const ext = getExtension(article.imageUrl);
    const localFilename = `${dbArticle.slug.substring(0, 60)}.${ext}`;
    const localPath = path.join(imagesDir, localFilename);
    const dbPath = `/images/news/${localFilename}`;

    // Check if file already exists
    if (!fs.existsSync(localPath)) {
      downloads.push({
        url: article.imageUrl,
        path: localPath,
        slug: dbArticle.slug,
        dbPath: dbPath
      });
    }

    // Always update database to ensure correct path
    updates.push({
      slug: dbArticle.slug,
      dbPath: dbPath
    });
  }

  // Download missing images
  console.log(`\n📥 Downloading ${downloads.length} missing images...\n`);

  for (const dl of downloads) {
    try {
      process.stdout.write(`  Downloading: ${dl.slug.substring(0, 50)}... `);
      await downloadImage(dl.url, dl.path);
      console.log('✅');
    } catch (error) {
      console.log(`❌ ${error.message}`);
    }
  }

  // Update database
  console.log(`\n📝 Updating ${updates.length} database records...\n`);

  let updated = 0;
  for (const update of updates) {
    try {
      await client.query(
        `UPDATE content SET featured_image_url = $1 WHERE slug = $2 AND type = 'news'`,
        [update.dbPath, update.slug]
      );
      updated++;
    } catch (error) {
      console.log(`❌ Failed to update ${update.slug}: ${error.message}`);
    }
  }

  console.log(`✅ Updated ${updated} records\n`);

  await client.end();
  console.log('🎉 Done!');
}

main().catch(console.error);
