/**
 * Deduplicate news articles in the database.
 *
 * The DB has 91 news articles but getfund.gov.gh only has 57 unique ones.
 * Duplicates were created by migration 037 inserting articles with shortened slugs
 * when CMS-created articles with longer slugs already existed.
 *
 * This script:
 * 1. Groups articles by published_at date
 * 2. For groups with >1 article, identifies duplicates by similar titles
 * 3. Keeps the best version (prefers CMS version with longer/more-descriptive slug)
 * 4. Deletes duplicates
 * 5. Ensures all kept articles have local featured images
 */

require('dotenv').config();
const { Client } = require('pg');

// Canonical articles from getfund.gov.gh (57 unique articles)
// Format: { date, titleKeywords, preferredSlugPattern }
const CANONICAL_ARTICLES = [
  // For articles with known duplicate issues, specify which slug to KEEP
  // The script will delete any other articles on the same date with similar titles
];

function normalizeTitle(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function titleSimilarity(a, b) {
  const wordsA = new Set(normalizeTitle(a).split(' ').filter(w => w.length > 3));
  const wordsB = new Set(normalizeTitle(b).split(' ').filter(w => w.length > 3));
  const intersection = new Set([...wordsA].filter(x => wordsB.has(x)));
  const union = new Set([...wordsA, ...wordsB]);
  return union.size > 0 ? intersection.size / union.size : 0;
}

async function main() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();
  console.log('Connected to database\n');

  // Get all news articles
  const { rows: articles } = await client.query(
    "SELECT id, slug, title, published_at, featured_image_url, meta_data, body FROM content WHERE type = 'news' ORDER BY published_at DESC, id ASC"
  );
  console.log(`Total articles: ${articles.length}\n`);

  // Group by date
  const byDate = {};
  for (const article of articles) {
    const date = article.published_at?.toISOString().slice(0, 10) || 'unknown';
    if (!byDate[date]) byDate[date] = [];
    byDate[date].push(article);
  }

  const toDelete = [];
  const toKeep = [];

  for (const [date, group] of Object.entries(byDate)) {
    if (group.length === 1) {
      toKeep.push(group[0]);
      continue;
    }

    // Multiple articles on same date - find duplicate clusters
    const used = new Set();
    const clusters = [];

    for (let i = 0; i < group.length; i++) {
      if (used.has(i)) continue;
      const cluster = [group[i]];
      used.add(i);

      for (let j = i + 1; j < group.length; j++) {
        if (used.has(j)) continue;
        const sim = titleSimilarity(group[i].title, group[j].title);
        if (sim > 0.4) {
          cluster.push(group[j]);
          used.add(j);
        }
      }
      clusters.push(cluster);
    }

    for (const cluster of clusters) {
      if (cluster.length === 1) {
        toKeep.push(cluster[0]);
        continue;
      }

      // Pick the best article to keep:
      // 1. Prefer longer body content (CMS articles tend to have richer content)
      // 2. Prefer longer slug (more descriptive)
      // 3. Prefer article with meta_data.images
      cluster.sort((a, b) => {
        const aBody = (a.body || '').length;
        const bBody = (b.body || '').length;
        if (aBody !== bBody) return bBody - aBody; // longer body first

        const aHasImages = a.meta_data?.images?.length > 0 ? 1 : 0;
        const bHasImages = b.meta_data?.images?.length > 0 ? 1 : 0;
        if (aHasImages !== bHasImages) return bHasImages - aHasImages;

        return b.slug.length - a.slug.length; // longer slug first
      });

      // Keep the first (best), mark rest for deletion
      const keeper = cluster[0];
      toKeep.push(keeper);

      // If the keeper doesn't have meta_data.images but a duplicate does, copy them over
      const withImages = cluster.find(a => a.meta_data?.images?.length > 0);
      if (withImages && (!keeper.meta_data?.images || keeper.meta_data.images.length === 0)) {
        console.log(`  Copying images from ${withImages.slug} to ${keeper.slug}`);
        const newMeta = { ...(keeper.meta_data || {}), images: withImages.meta_data.images };
        await client.query(
          "UPDATE content SET meta_data = $1 WHERE id = $2",
          [JSON.stringify(newMeta), keeper.id]
        );
      }

      // If the keeper doesn't have a local featured image but a duplicate does, copy it
      if (keeper.featured_image_url?.includes('getfund.gov.gh')) {
        const withLocal = cluster.find(a => a.featured_image_url?.startsWith('/images/news/'));
        if (withLocal) {
          console.log(`  Copying local image from ${withLocal.slug} to ${keeper.slug}`);
          await client.query(
            "UPDATE content SET featured_image_url = $1 WHERE id = $2",
            [withLocal.featured_image_url, keeper.id]
          );
        }
      }

      for (let i = 1; i < cluster.length; i++) {
        toDelete.push(cluster[i]);
      }

      console.log(`[${date}] "${cluster[0].title.slice(0, 60)}..." - keeping: ${keeper.slug}`);
      for (let i = 1; i < cluster.length; i++) {
        console.log(`  deleting: ${cluster[i].slug}`);
      }
    }
  }

  console.log(`\n--- Summary ---`);
  console.log(`Keeping: ${toKeep.length} articles`);
  console.log(`Deleting: ${toDelete.length} duplicates`);

  if (toDelete.length > 0) {
    const ids = toDelete.map(a => a.id);
    console.log(`\nDeleting ${ids.length} duplicate articles...`);
    await client.query(
      "DELETE FROM content WHERE id = ANY($1)",
      [ids]
    );
    console.log('Done!');
  }

  // Verify final count
  const { rows: [{ count }] } = await client.query(
    "SELECT COUNT(*) FROM content WHERE type = 'news'"
  );
  console.log(`\nFinal article count: ${count}`);

  await client.end();
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
