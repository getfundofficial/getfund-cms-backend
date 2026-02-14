require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { Client } = require('pg');

(async () => {
  const client = new Client({
    connectionString: process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();

  const res = await client.query(`
    SELECT slug, meta_data
    FROM content
    WHERE type = 'news' AND deleted_at IS NULL
    AND meta_data IS NOT NULL
    ORDER BY slug
  `);

  let mismatchCount = 0;
  let totalArticles = 0;
  let orderIssues = 0;
  let shown = 0;

  for (const row of res.rows) {
    const meta = typeof row.meta_data === 'string' ? JSON.parse(row.meta_data) : row.meta_data;
    const images = meta?.images;
    if (!images || !Array.isArray(images) || images.length <= 1) continue;

    totalArticles++;
    const hasMismatch = images.some(img => !img.includes(row.slug));

    // Check numeric order
    const nums = images.map(img => {
      const m = img.match(/-carousel-(\d+)/);
      return m ? parseInt(m[1]) : 0;
    });
    const isOrdered = nums.every((n, i) => i === 0 || n >= nums[i - 1]);

    if (shown < 3) {
      console.log(`\n=== ${row.slug} (${images.length} images) ===`);
      images.forEach((img, i) => {
        const num = nums[i];
        console.log(`  ${i + 1}: [#${num}] ${img.split('/').pop()}`);
      });
      shown++;
    }

    if (!isOrdered) {
      orderIssues++;
      console.log(`\nORDER ISSUE: ${row.slug} - ${nums.join(',')}`);
    }

    if (hasMismatch) {
      mismatchCount++;
      console.log(`\nMISMATCH: ${row.slug}`);
      images.filter(img => !img.includes(row.slug)).forEach(img => {
        console.log(`  WRONG: ${img}`);
      });
    }
  }

  console.log(`\n\n=== SUMMARY ===`);
  console.log(`Total articles with carousel: ${totalArticles}`);
  console.log(`Articles with mismatched images: ${mismatchCount}`);
  console.log(`Articles with order issues: ${orderIssues}`);

  await client.end();
})().catch(console.error);
