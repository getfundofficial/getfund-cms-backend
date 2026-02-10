require("dotenv").config({ path: ".env" });
const { neon } = require("@neondatabase/serverless");
const https = require("https");
const sql = neon(process.env.DATABASE_URL);

async function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { timeout: 40000 }, (res) => {
      let data = "";
      res.on("data", c => data += c);
      res.on("end", () => resolve(data));
    }).on("error", reject);
  });
}

function extractImages(html) {
  const regex = /https?:\/\/www\.getfund\.gov\.gh\/wp-content\/uploads\/[^"'\s<>)]+\.(?:jpg|jpeg|png|gif|webp)/gi;
  return [...new Set(html.match(regex) || [])]
    .map(img => img.split('?')[0])
    .filter(img => {
      const l = img.toLowerCase();
      return !(l.includes("logo") || l.includes("site-icon") ||
               l.includes("cropped-getfund") || /-70x70\./.test(l) ||
               /-150x150\./.test(l) || /-170x170\./.test(l));
    });
}

async function main() {
  const fixes = [
    { pattern: "N/R: GETFund Launches Major Infrastructure", url: "https://www.getfund.gov.gh/2025/10/14/n-r-getfund-launches-major-infrastructure-expansion-at-ghana-senior-high-school/" },
    { pattern: "Trinity Theological Seminary", url: "https://www.getfund.gov.gh/2024/11/09/2024-graduating-class-of-trinity-theological-seminary/" }
  ];

  for (const fix of fixes) {
    console.log("Fixing: " + fix.pattern + "...");
    try {
      const html = await fetchUrl(fix.url);
      const images = extractImages(html);

      if (images.length > 0) {
        const featured = images.find(i => i.includes("-770x")) || images[0];

        await sql`
          UPDATE content
          SET featured_image_url = ${featured},
              meta_data = ${JSON.stringify({ images, sourceUrl: fix.url })}::jsonb
          WHERE type = 'news' AND deleted_at IS NULL
          AND title LIKE ${'%' + fix.pattern.substring(0, 30) + '%'}
        `;
        console.log("  OK - " + images.length + " images");
        console.log("  Featured: " + featured.split("/").pop());
      }
    } catch (err) {
      console.log("  Error: " + err.message);
    }
  }

  // Final count
  const count = await sql`SELECT COUNT(*) as c FROM content WHERE type = 'news' AND deleted_at IS NULL`;
  console.log("\nTotal articles: " + count[0].c);
}

main();
