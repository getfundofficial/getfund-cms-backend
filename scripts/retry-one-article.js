#!/usr/bin/env node
require("dotenv").config({ path: ".env" });
const { neon } = require("@neondatabase/serverless");
const https = require("https");
const sql = neon(process.env.DATABASE_URL);

function isLogo(url) {
  if (url == null) return true;
  const l = url.toLowerCase();
  return l.includes("logo") || l.includes("site-icon") || l.includes("cropped-getfund") || l.includes("favicon");
}

async function main() {
  const url = "https://www.getfund.gov.gh/2025/10/23/ceo-of-students-loan-trust-fund-visits-getfund-administrator-ahead-of-no-fee-stress-policy-launch-for-persons-with-disabilities-pwds/";

  console.log("Retrying: CEO of Students Loan Trust Fund...");

  const html = await new Promise((resolve, reject) => {
    https.get(url, { timeout: 30000 }, (res) => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => resolve(data));
    }).on("error", reject);
  });

  const regex = /https?:\/\/www\.getfund\.gov\.gh\/wp-content\/uploads\/[^"'\s<>)]+\.(?:jpg|jpeg|png|gif|webp)/gi;
  const matches = html.match(regex) || [];
  const images = [...new Set(matches)].filter(img => !isLogo(img));

  console.log("Found " + images.length + " images");

  if (images.length > 0) {
    const result = await sql`
      UPDATE content
      SET meta_data = ${JSON.stringify({ images: images, sourceUrl: url })}::jsonb
      WHERE type = 'news' AND deleted_at IS NULL
      AND title LIKE '%CEO of Students Loan%'
      RETURNING title
    `;
    console.log("Updated: " + (result[0]?.title || "none"));
  }

  // Final verification
  const count = await sql`SELECT COUNT(*) as count FROM content WHERE type = 'news' AND deleted_at IS NULL`;
  console.log("\nTotal articles: " + count[0].count);
}

main().catch(console.error);
