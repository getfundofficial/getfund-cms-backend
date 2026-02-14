/**
 * Comprehensive script to sync ALL news from GETFund official website
 * This will add missing articles and update images for all articles
 * Run with: node scripts/sync-all-news.js
 */

const { Pool } = require('pg');
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Target directory for news images
const NEWS_IMAGES_DIR = path.join(__dirname, '../../../getfund-website/public/images/news');

// Ensure the directory exists
if (!fs.existsSync(NEWS_IMAGES_DIR)) {
  fs.mkdirSync(NEWS_IMAGES_DIR, { recursive: true });
}

// ALL news articles from GETFund official website (scraped from all pages)
const ALL_GETFUND_NEWS = [
  // Page 1 - Newest 2026 articles
  {
    title: "GETFund Deputy Administrator Visits Schools Affected by Fire in the Northern Region",
    date: "2026-02-04",
    image: "https://www.getfund.gov.gh/wp-content/uploads/2026/02/Dept-770x417.png",
    excerpt: "The Deputy Administrator of the Ghana Education Trust Fund (GETFund) Hon. Sualihu Dandaawa has paid an emergency working visit to the Northern Business Senior High School (NOBISCO) and Tolon SHS following devastating fire outbreaks."
  },
  {
    title: "GETFund Deputy Administrator Calls for Investigation into Causes of Recurrent Fires at NOBISCO and Tolon SHS",
    date: "2026-02-04",
    image: "https://www.getfund.gov.gh/wp-content/uploads/2026/02/IMG_1149-770x417.jpg",
    excerpt: "The Deputy Administrator for the Ghana Education Trust Fund (GETFund), Hon. Sualihu Dandaawa has called for an intensive investigation into the recurring fire outbreaks at Northern Business School (NOBISCO) and Tolon Senior High School."
  },
  {
    title: "His Lordship the Chief Justice Calls on GETFund for Judicial Service Reforms",
    date: "2026-01-26",
    image: "https://www.getfund.gov.gh/wp-content/uploads/2026/01/CJ-770x417.png",
    excerpt: "The Chief Justice, His Lordship Paul Baffoe Bonnie has recently called on the administrator of the Ghana Education Trust Fund (GETFund) Mr. Paul Adjei in a historic visit to solicit support for critical infrastructure and resources."
  },
  {
    title: "CHASS Leadership Engages GETFund Administrator",
    date: "2026-01-23",
    image: "https://www.getfund.gov.gh/wp-content/uploads/2026/01/WhatsApp-Image-2026-01-23-at-07.30.17-1-770x417.jpeg",
    excerpt: "Executives of the Conference of Heads of Assisted Secondary Schools (CHASS) in Ghana paid a courtesy call on the Administrator of the Ghana Education Trust Fund (GETFund) Mr. Paul Adjei at his office in Accra."
  },
  // Existing articles
  {
    title: "GETFund Receives Delegation from University of Virgin Islands",
    date: "2025-12-18",
    image: "https://www.getfund.gov.gh/wp-content/uploads/2025/12/UVI-770x417.jpg",
    excerpt: "GETFund receives delegation from University of Virgin Islands to discuss educational partnerships and collaboration opportunities."
  },
  {
    title: "FuelTrade Supports GETFund",
    date: "2025-12-17",
    image: "https://www.getfund.gov.gh/wp-content/uploads/2025/12/Fuel-Trade-770x417.jpg",
    excerpt: "FuelTrade demonstrates commitment to education by supporting GETFund initiatives."
  },
  {
    title: "GETFund Accelerates Practical Science Education with Strategic Funding for STEMBox Initiative",
    date: "2025-12-06",
    image: "https://www.getfund.gov.gh/wp-content/uploads/2025/12/Admin@Stembox-770x417.png",
    excerpt: "GETFund accelerates practical science education across Ghana with strategic funding for the innovative STEMBox Initiative."
  },
  {
    title: "GETFund Supports Ghana National Research Fund with Office Complex",
    date: "2025-11-29",
    image: "https://www.getfund.gov.gh/wp-content/uploads/2025/11/Research-2-770x417.png",
    excerpt: "GETFund supports Ghana National Research Fund with a modern office complex to boost research development."
  },
  {
    title: "2026 Budget: GETFund Drives Historic Expansion in Educational Infrastructure and Learning Resources",
    date: "2025-11-17",
    image: "https://www.getfund.gov.gh/wp-content/uploads/2025/11/Ato-Forson-770x417.jpg",
    excerpt: "The 2026 budget marks a historic expansion in educational infrastructure and learning resources driven by GETFund."
  },
  {
    title: "GETFund to Commit GHC 50 million yearly to Free Tertiary Education for Persons with Disabilities",
    date: "2025-10-27",
    image: "https://www.getfund.gov.gh/wp-content/uploads/2025/10/AdminPresident-770x417.png",
    excerpt: "GETFund commits GHC 50 million yearly to provide free tertiary education for persons with disabilities in Ghana."
  },
  {
    title: "CEO of Students Loan Trust Fund Visits GETFund Administrator",
    date: "2025-10-23",
    image: "https://www.getfund.gov.gh/wp-content/uploads/2025/10/Grp-Pix-770x417.jpg",
    excerpt: "CEO of Students Loan Trust Fund visits GETFund Administrator ahead of 'No-Fee Stress' Policy Launch for Persons With Disabilities."
  },
  {
    title: "GETFund Commences Accelerated Infrastructure Program at Ambariya Schools",
    date: "2025-10-14",
    image: "https://www.getfund.gov.gh/wp-content/uploads/2025/10/AMbariya-2-770x417.png",
    excerpt: "GETFund commences accelerated infrastructure program at Ambariya Schools, targeting 18-month completion."
  },
  {
    title: "GETFund Kicks Off Multi-Project Construction in Northern Region",
    date: "2025-10-14",
    image: "https://www.getfund.gov.gh/wp-content/uploads/2025/10/Nobisco-1-770x417.png",
    excerpt: "GETFund kicks off multi-project construction to boost education in the Northern Region."
  },
  // Page 2
  {
    title: "N/R: GETFund Launches Major Infrastructure Expansion at Ghana Senior High School",
    date: "2025-10-14",
    image: "https://www.getfund.gov.gh/wp-content/uploads/2025/10/GHANASCO-770x417.png",
    excerpt: "GETFund launches major infrastructure expansion at Ghana Senior High School in the Northern Region."
  },
  {
    title: "GETFund Gives Greenlight for the Construction of Ultra-Modern Infrastructure at Karaga SHS",
    date: "2025-10-14",
    image: "https://www.getfund.gov.gh/wp-content/uploads/2025/10/Karaga-blk-770x417.png",
    excerpt: "GETFund gives greenlight for construction of ultra-modern infrastructure facilities at Karaga SHS."
  },
  {
    title: "N/R: GETFund Commences Major Facility Upgrade at Pishigu SHS",
    date: "2025-10-10",
    image: "https://www.getfund.gov.gh/wp-content/uploads/2025/10/1-770x417.png",
    excerpt: "GETFund commences major facility upgrade at Pishigu Senior High School in the Northern Region."
  },
  {
    title: "GETFund Administrator Meets With Staff",
    date: "2025-08-11",
    image: "https://www.getfund.gov.gh/wp-content/uploads/2025/10/SD1-770x417.jpg",
    excerpt: "GETFund Administrator holds important meeting with staff to discuss organizational priorities."
  },
  {
    title: "Director General of Prisons Engages GETFund on Inmate Rehabilitation Partnership",
    date: "2025-08-06",
    image: "https://www.getfund.gov.gh/wp-content/uploads/2025/10/GETPrison-770x417.jpg",
    excerpt: "Director General of Prisons engages GETFund on inmate rehabilitation partnership opportunities."
  },
  {
    title: "GETFund Engages with Voorhees University and ATTRACO to Deepen Educational Collaboration",
    date: "2025-07-17",
    image: "https://www.getfund.gov.gh/wp-content/uploads/2025/10/1v-770x417.jpg",
    excerpt: "GETFund engages with Voorhees University and ATTRACO to deepen educational collaboration."
  },
  {
    title: "Photo Gallery: GETFund Tours UK Universities to Engage Ghanaian Scholars",
    date: "2025-07-03",
    image: "https://www.getfund.gov.gh/wp-content/uploads/2025/10/WhatsApp-Image-2025-10-17-at-12.06.03_7eee427d-770x417.jpg",
    excerpt: "Photo gallery from GETFund's tour of UK universities to engage Ghanaian scholars."
  },
  {
    title: "Strengthening Educational Ties: GETFund Monitors Scholars in UK",
    date: "2025-07-03",
    image: "https://www.getfund.gov.gh/wp-content/uploads/2025/10/WhatsApp-Image-2025-10-17-at-12.06.14_c80190aa-770x417.jpg",
    excerpt: "GETFund strengthens educational ties by monitoring scholars in the United Kingdom."
  },
  {
    title: "GETFund Holds Orientation Workshop for 7th Board of Trustees",
    date: "2025-06-25",
    image: "https://www.getfund.gov.gh/wp-content/uploads/2025/06/S8509226-770x417.jpg",
    excerpt: "GETFund holds orientation workshop for the newly inaugurated 7th Board of Trustees."
  },
  {
    title: "GETFund Scholarship Unit Engages with University of Cape Coast Students",
    date: "2025-06-21",
    image: "https://www.getfund.gov.gh/wp-content/uploads/2025/10/Scholars.png",
    excerpt: "GETFund Scholarship Unit engages with University of Cape Coast students to provide guidance and support."
  },
  // Page 3
  {
    title: "GAF CDS Interacts with GETFund Administrator",
    date: "2025-05-16",
    image: "https://www.getfund.gov.gh/wp-content/uploads/2025/05/CDS-565x417.png",
    excerpt: "Ghana Armed Forces Chief of Defence Staff interacts with GETFund Administrator."
  },
  {
    title: "Minister of Education Inaugurates 7th GETFund Board",
    date: "2025-04-11",
    image: "https://www.getfund.gov.gh/wp-content/uploads/2025/04/S8507439-770x417.jpg",
    excerpt: "Minister of Education officially inaugurates the 7th GETFund Board of Trustees."
  },
  {
    title: "GETFund Administrator Engages CHASS Leadership",
    date: "2025-03-25",
    image: "https://www.getfund.gov.gh/wp-content/uploads/2025/03/ST856505-770x417.jpg",
    excerpt: "GETFund Administrator engages with Conference of Heads of Assisted Secondary Schools leadership."
  },
  {
    title: "Advocacy For Private Sector-Led School Infrastructure Development",
    date: "2025-02-21",
    image: "https://www.getfund.gov.gh/wp-content/uploads/2025/02/S8502069-770x417.jpg",
    excerpt: "GETFund advocates for private sector-led school infrastructure development initiatives."
  },
  {
    title: "Mr. Paul Adjei Assumes Office as GETFund Administrator",
    date: "2025-02-03",
    image: "https://www.getfund.gov.gh/wp-content/uploads/2025/02/ST852075-770x417.jpg",
    excerpt: "Mr. Paul Adjei officially assumes office as the new GETFund Administrator."
  },
  {
    title: "State Award for Outstanding Public Service",
    date: "2024-12-30",
    image: "https://www.getfund.gov.gh/wp-content/uploads/2024/12/ST850255-714x417.jpg",
    excerpt: "GETFund Administrator receives state award for outstanding public service."
  },
  {
    title: "GETFund Inaugurates a Four-Storey Headquarters Building",
    date: "2024-12-23",
    image: "https://www.getfund.gov.gh/wp-content/uploads/2025/01/IMGG_9999_244-770x417.jpg",
    excerpt: "GETFund inaugurates a modern four-storey headquarters building in Accra."
  },
  {
    title: "2024 Trinity Theological Seminary Graduation",
    date: "2024-11-09",
    image: "https://www.getfund.gov.gh/wp-content/uploads/2024/11/1Z0A7382-770x417.jpg",
    excerpt: "GETFund participates in the 2024 graduating class ceremony of Trinity Theological Seminary."
  },
  {
    title: "GETFund Grants Scholarships to GTP Finalists",
    date: "2024-10-14",
    image: "https://www.getfund.gov.gh/wp-content/uploads/2024/10/86B6195-770x417.jpg",
    excerpt: "GETFund grants scholarships to Ghana's Talent Project finalists to support their education."
  },
  {
    title: "GETFund Administrator Counsels Tertiary Institutions on Financing Options",
    date: "2024-04-03",
    image: "https://www.getfund.gov.gh/wp-content/uploads/2024/04/ST857443-770x417.jpg",
    excerpt: "GETFund Administrator counsels tertiary institutions on various financing options available."
  },
  // Page 4
  {
    title: "GETFund Administrator Engages Media in Kumasi",
    date: "2024-01-15",
    image: "https://www.getfund.gov.gh/wp-content/uploads/2024/04/9CCC830E-CBF2-4AFA-B485-AAE9B0B623D4-770x417.jpg",
    excerpt: "GETFund Administrator engages media in Kumasi to discuss ongoing projects and initiatives."
  },
  {
    title: "Scholarship Processes at GETFund have improved",
    date: "2023-09-25",
    image: "https://www.getfund.gov.gh/wp-content/uploads/2023/09/GETFund-Press-Release-Cover-770x417.jpg",
    excerpt: "Press release announcing improvements in scholarship processes at GETFund."
  },
  {
    title: "The Administrator urges universities to be innovative",
    date: "2023-09-11",
    image: "https://www.getfund.gov.gh/wp-content/uploads/2023/09/S8503168-770x417.jpg",
    excerpt: "GETFund Administrator urges universities to be innovative in their approach to education."
  },
  {
    title: "Government Grants New Scholarships to 4,279 Local Tertiary Students",
    date: "2023-08-08",
    image: "https://www.getfund.gov.gh/wp-content/uploads/2023/08/Unknown-1-770x417.jpeg",
    excerpt: "Government grants new scholarships to 4,279 local tertiary students through GETFund."
  },
  {
    title: "GETFund has NOT used its receivables to borrow $1.5 billion",
    date: "2023-07-19",
    image: "https://www.getfund.gov.gh/wp-content/uploads/2023/07/S8500045-1-770x417.jpg",
    excerpt: "GETFund clarifies that it has not used its receivables to borrow $1.5 billion."
  },
  {
    title: "Voorhees University delegation calls on GETFund",
    date: "2023-05-23",
    image: "https://www.getfund.gov.gh/wp-content/uploads/2023/04/DSC_03245-770x417.jpg",
    excerpt: "Delegation from Voorhees University pays courtesy call on GETFund to discuss partnerships."
  },
  {
    title: "Carleton University Pays Courtesy Call on GETFund",
    date: "2023-02-23",
    image: "https://www.getfund.gov.gh/wp-content/uploads/2023/03/5H8A3236-770x417.jpg",
    excerpt: "Carleton University pays courtesy call on GETFund to explore collaboration opportunities."
  },
  {
    title: "Military High Command Pays Courtesy Call on GETFund Administrator",
    date: "2023-02-22",
    image: "https://www.getfund.gov.gh/wp-content/uploads/2023/02/1Z0A9913-770x417.jpg",
    excerpt: "Military High Command pays courtesy call on GETFund Administrator."
  },
  {
    title: "Delegation from HESLB Tanzania visits GETFund",
    date: "2023-02-21",
    image: "https://www.getfund.gov.gh/wp-content/uploads/2023/03/1Z0A0148-770x417.jpg",
    excerpt: "Delegation from Higher Education Students Loans Board (HESLB) Tanzania visits GETFund."
  },
  {
    title: "GETFund Administrator interacts with NUGS Leadership",
    date: "2023-02-02",
    image: "https://www.getfund.gov.gh/wp-content/uploads/2023/02/S8509378-770x417.jpg",
    excerpt: "GETFund Administrator interacts with National Union of Ghana Students leadership."
  },
  // Page 5
  {
    title: "GETFund 2022/23 Local Scholarship Application",
    date: "2022-12-12",
    image: "https://www.getfund.gov.gh/wp-content/uploads/2022/12/Home-background-with-Dark-Cover-copywrite-770x417.jpg",
    excerpt: "Announcement of GETFund 2022/23 local scholarship application opening."
  },
  {
    title: "Universities Fund Kenya understudies GETFund",
    date: "2022-12-08",
    image: "https://www.getfund.gov.gh/wp-content/uploads/2022/10/S8507486-770x417.jpg",
    excerpt: "Universities Fund Kenya visits GETFund to understudy operations and best practices."
  },
  {
    title: "GETFund Accounts To The Public - Stakeholder Forum",
    date: "2022-11-08",
    image: "https://www.getfund.gov.gh/wp-content/uploads/2022/11/5H8A0438-770x417.jpg",
    excerpt: "GETFund accounts to the public through stakeholder forum engagement."
  },
  {
    title: "GETFund Administrator Inspects UDS Project",
    date: "2022-10-05",
    image: "https://www.getfund.gov.gh/wp-content/uploads/2022/09/IMG_6526-770x417.jpg",
    excerpt: "GETFund Administrator inspects ongoing projects at University for Development Studies."
  },
  {
    title: "GETFund Administrator pays working visit",
    date: "2022-10-03",
    image: "https://www.getfund.gov.gh/wp-content/uploads/2022/05/IMG_6421-770x417.jpg",
    excerpt: "GETFund Administrator pays working visit to educational institutions."
  },
  {
    title: "GETFund Board of Trustees tour project",
    date: "2022-09-06",
    image: "https://www.getfund.gov.gh/wp-content/uploads/2022/09/MG_9824-770x417.jpg",
    excerpt: "GETFund Board of Trustees conducts project inspection tour."
  },
  {
    title: "Vice President hands over buses and pickups",
    date: "2022-05-26",
    image: "https://www.getfund.gov.gh/wp-content/uploads/2022/06/blog-1-1-770x417-1.jpg",
    excerpt: "Vice President hands over buses and pickups to educational institutions through GETFund."
  },
  {
    title: "Daakye Trust PLC holds Inaugural AGM in Accra",
    date: "2022-05-25",
    image: "https://www.getfund.gov.gh/wp-content/uploads/2022/05/blog-1-1-770x417-1.jpg",
    excerpt: "Daakye Trust PLC holds its inaugural Annual General Meeting in Accra."
  },
  {
    title: "GETFund's Bold March on Educational Infrastructure",
    date: "2022-05-18",
    image: "https://www.getfund.gov.gh/wp-content/uploads/2022/01/GETFund-News-2-2-1024x683-1-770x417.jpg",
    excerpt: "GETFund continues its bold march on educational infrastructural development across Ghana."
  },
  {
    title: "Press Update: Infrastructure Projects",
    date: "2022-05-17",
    image: "https://www.getfund.gov.gh/wp-content/uploads/2022/05/Screenshot-2022-06-24-at-11.14.12-PM-770x417.png",
    excerpt: "Press update on GETFund infrastructure projects across the country."
  },
  // Page 6
  {
    title: "GETFund Obtains Parliamentary nod",
    date: "2022-05-17",
    image: "https://www.getfund.gov.gh/wp-content/uploads/2021/12/GETFund-News-1-1-1024x683-1-770x417.jpg",
    excerpt: "GETFund obtains parliamentary approval for project financing initiatives."
  },
  {
    title: "GETFund Completes 1st Quarter Project Monitoring in Volta Region",
    date: "2022-03-25",
    image: "https://www.getfund.gov.gh/wp-content/uploads/2022/03/Volt-Monitoring-1-770x417-1.jpg",
    excerpt: "GETFund completes first quarter project monitoring in Volta Region."
  },
  {
    title: "2021 Scholarship Monitoring Programme",
    date: "2021-12-20",
    image: "https://www.getfund.gov.gh/wp-content/uploads/2022/01/GETFund-News-3-3-1024x683-1-770x417.jpg",
    excerpt: "GETFund conducts 2021 scholarship monitoring programme in the UK."
  },
  {
    title: "SONA 2020 on Educational Infrastructure",
    date: "2020-02-21",
    image: "https://www.getfund.gov.gh/wp-content/uploads/2022/01/SONA-GETFund-1-770x417-1.jpg",
    excerpt: "State of the Nation Address 2020 highlights on educational infrastructure."
  }
];

/**
 * Download an image from URL and save locally
 */
async function downloadImage(url, filename) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;

    const request = protocol.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    }, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        const redirectUrl = response.headers.location;
        downloadImage(redirectUrl, filename).then(resolve).catch(reject);
        return;
      }

      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}`));
        return;
      }

      const filePath = path.join(NEWS_IMAGES_DIR, filename);
      const fileStream = fs.createWriteStream(filePath);

      response.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close();
        resolve(filePath);
      });

      fileStream.on('error', (err) => {
        fs.unlink(filePath, () => {});
        reject(err);
      });
    });

    request.on('error', reject);
    request.setTimeout(30000, () => {
      request.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

/**
 * Generate a safe filename from title
 */
function generateFilename(title, url) {
  const urlPath = new URL(url).pathname;
  const ext = path.extname(urlPath) || '.jpg';

  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 60);

  return `${slug}${ext}`;
}

/**
 * Generate slug from title
 */
function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 100);
}

async function main() {
  console.log('🔄 Syncing ALL news from GETFund official website...\n');
  console.log(`Found ${ALL_GETFUND_NEWS.length} articles to process\n`);

  let added = 0;
  let updated = 0;
  let imageSuccess = 0;
  let imageFailed = 0;

  try {
    for (const article of ALL_GETFUND_NEWS) {
      const slug = generateSlug(article.title);

      console.log(`Processing: ${article.title.substring(0, 50)}...`);

      // Check if article exists
      const existing = await pool.query(
        `SELECT id, featured_image_url FROM content WHERE slug = $1 AND type = 'news'`,
        [slug]
      );

      let articleId;
      let needsImage = true;

      if (existing.rows.length > 0) {
        articleId = existing.rows[0].id;
        const currentImage = existing.rows[0].featured_image_url;

        // Update article with correct date
        await pool.query(
          `UPDATE content SET
            published_at = $1,
            excerpt = COALESCE(NULLIF(excerpt, ''), $2)
          WHERE id = $3`,
          [article.date, article.excerpt, articleId]
        );

        // Check if image is already local
        if (currentImage && currentImage.startsWith('/images/news/') && currentImage !== '/images/news/news-placeholder.svg') {
          needsImage = false;
          console.log(`  ✓ Already has local image`);
        }

        updated++;
      } else {
        // Insert new article
        const result = await pool.query(
          `INSERT INTO content (type, title, slug, excerpt, body, status, published_at, author, category, created_at, updated_at)
          VALUES ('news', $1, $2, $3, $4, 'published', $5, 'GETFund', 'NEWS', NOW(), NOW())
          RETURNING id`,
          [article.title, slug, article.excerpt, article.excerpt, article.date]
        );
        articleId = result.rows[0].id;
        added++;
        console.log(`  + Added new article`);
      }

      // Download and set image if needed
      if (needsImage && article.image) {
        try {
          const filename = generateFilename(article.title, article.image);
          const localPath = `/images/news/${filename}`;
          const fullPath = path.join(NEWS_IMAGES_DIR, filename);

          // Check if file already exists
          if (!fs.existsSync(fullPath)) {
            await downloadImage(article.image, filename);
            console.log(`  📷 Downloaded image`);
          } else {
            console.log(`  📷 Image already exists locally`);
          }

          // Update database with local path
          await pool.query(
            'UPDATE content SET featured_image_url = $1 WHERE id = $2',
            [localPath, articleId]
          );

          imageSuccess++;
        } catch (error) {
          console.log(`  ⚠️ Image failed: ${error.message}`);
          // Set placeholder for failed images
          await pool.query(
            'UPDATE content SET featured_image_url = $1 WHERE id = $2',
            ['/images/news/news-placeholder.svg', articleId]
          );
          imageFailed++;
        }
      }
    }

    console.log('\n========================================');
    console.log('📊 SYNC COMPLETE');
    console.log('========================================');
    console.log(`✓ New articles added: ${added}`);
    console.log(`✓ Articles updated: ${updated}`);
    console.log(`✓ Images downloaded: ${imageSuccess}`);
    console.log(`⚠️ Images failed: ${imageFailed}`);
    console.log('========================================\n');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

main();
