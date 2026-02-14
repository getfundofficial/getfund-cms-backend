/**
 * Phase 3: Update all article references to use media library URLs.
 * - Updates featured_image_url to blob/media URLs
 * - Updates meta_data.images for carousel
 * - Rewrites inline <img> tags in body HTML
 * - Remaps internal getfund.gov.gh links to local routes
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const { Client } = require('pg');
const { urlMappings } = require('../article-url-mapping');

// Build reverse map: source URL slug -> local route slug
function buildLinkMap() {
  const map = new Map();
  for (const [slug, url] of Object.entries(urlMappings)) {
    // Extract the URL path after the date portion
    const match = url.match(/getfund\.gov\.gh\/\d{4}\/\d{2}\/\d{2}\/([^/]+)/);
    if (match) {
      map.set(match[1].replace(/\/$/, ''), slug);
    }
    map.set(url, `/news/${slug}`);
  }
  return map;
}

function remapInternalLinks(html, linkMap) {
  if (!html) return html;
  return html.replace(
    /href=["'](https?:\/\/(?:www\.)?getfund\.gov\.gh\/[^"']+)["']/gi,
    (match, url) => {
      // Check if this URL maps to a local article
      const localRoute = linkMap.get(url);
      if (localRoute) return `href="${localRoute}"`;
      // Try matching by slug portion
      const slugMatch = url.match(/getfund\.gov\.gh\/\d{4}\/\d{2}\/\d{2}\/([^/"']+)/);
      if (slugMatch) {
        const slug = slugMatch[1].replace(/\/$/, '');
        for (const [key, route] of linkMap.entries()) {
          if (key === slug || key.includes(slug) || slug.includes(key)) {
            return `href="${route}"`;
          }
        }
      }
      return match;
    }
  );
}

function rewriteBodyImages(html, urlMap) {
  if (!html) return html;
  return html.replace(
    /<img([^>]*)src=["']([^"']+)["']([^>]*)>/gi,
    (match, before, src, after) => {
      // If it's an external getfund.gov.gh URL, try to find the media library URL
      if (src.includes('getfund.gov.gh')) {
        const mediaUrl = urlMap.get(src);
        if (mediaUrl) {
          return `<img${before}src="${mediaUrl}"${after}>`;
        }
      }
      // If it's a local path, try to find the blob URL
      if (src.startsWith('/images/news/')) {
        const mediaUrl = urlMap.get(src);
        if (mediaUrl) {
          return `<img${before}src="${mediaUrl}"${after}>`;
        }
      }
      return match;
    }
  );
}

async function fixReferences(client, urlMap, articlesWithImages) {
  console.log('=== PHASE 3: Fixing article references ===\n');
  const linkMap = buildLinkMap();
  let updatedFeatured = 0, updatedCarousel = 0, updatedBody = 0;

  // If urlMap is empty, rebuild it from the media table
  if (!urlMap || urlMap.size === 0) {
    console.log('Building URL map from media table...');
    urlMap = new Map();
    const media = await client.query('SELECT url, filename FROM media WHERE deleted_at IS NULL');
    for (const row of media.rows) {
      // Map /images/news/file.jpg -> media URL (which may be blob URL or same local path)
      if (row.filename && row.filename.startsWith('news/')) {
        urlMap.set(`/images/${row.filename}`, row.url);
      }
    }
    console.log(`  Built URL map with ${urlMap.size} entries.\n`);
  }

  // If articlesWithImages is empty, rebuild from local carousel files
  if (!articlesWithImages || articlesWithImages.length === 0) {
    console.log('Scanning for articles with carousel images...');
    const fs = require('fs');
    const { NEWS_IMAGES_DIR } = require('./utils');
    const allFiles = fs.readdirSync(NEWS_IMAGES_DIR).filter(f => /carousel/i.test(f));
    // Group by article slug (everything before -carousel-)
    const slugFiles = new Map();
    for (const f of allFiles) {
      const match = f.match(/^(.+)-carousel-(\d+)\.\w+$/);
      if (match) {
        const slug = match[1];
        const index = parseInt(match[2]);
        if (!slugFiles.has(slug)) slugFiles.set(slug, []);
        slugFiles.get(slug).push({ path: `/images/news/${f}`, index });
      }
    }

    // Match to articles in DB
    const articles = await client.query(`
      SELECT id, slug FROM content
      WHERE type = 'news' AND deleted_at IS NULL
    `);
    const slugToId = new Map(articles.rows.map(r => [r.slug, r.id]));

    articlesWithImages = [];
    for (const [slug, entries] of slugFiles.entries()) {
      const id = slugToId.get(slug);
      if (!id) continue;
      // Sort numerically by carousel index
      entries.sort((a, b) => a.index - b.index);
      // Deduplicate: keep only one file per carousel index (prefer .jpg)
      const seen = new Map();
      for (const entry of entries) {
        if (!seen.has(entry.index)) {
          seen.set(entry.index, entry.path);
        } else if (entry.path.endsWith('.jpg') || entry.path.endsWith('.jpeg')) {
          seen.set(entry.index, entry.path);
        }
      }
      const images = [...seen.entries()].sort((a, b) => a[0] - b[0]).map(e => e[1]);
      if (images.length >= 1) {
        articlesWithImages.push({ id, slug, images });
      }
    }
    console.log(`  Found ${articlesWithImages.length} articles with images.\n`);
  }

  // Track which article IDs got carousel images
  const carouselUpdatedIds = new Set();

  // Update meta_data.images for articles with carousel files
  if (articlesWithImages && articlesWithImages.length > 0) {
    for (const article of articlesWithImages) {
      const sorted = article.images.slice().sort((a, b) => {
        const numA = parseInt((a.match(/-carousel-(\d+)/) || [])[1] || '0');
        const numB = parseInt((b.match(/-carousel-(\d+)/) || [])[1] || '0');
        return numA - numB;
      });
      const mediaImages = sorted.map(localPath => urlMap.get(localPath) || localPath);

      const existing = await client.query('SELECT meta_data FROM content WHERE id = $1', [article.id]);
      const metaData = existing.rows[0]?.meta_data || {};
      metaData.images = mediaImages;

      // Set featured_image_url to first carousel image (media library URL)
      if (mediaImages.length > 0) {
        await client.query(
          'UPDATE content SET meta_data = $1, featured_image_url = $2 WHERE id = $3',
          [JSON.stringify(metaData), mediaImages[0], article.id]
        );
      } else {
        await client.query('UPDATE content SET meta_data = $1 WHERE id = $2', [JSON.stringify(metaData), article.id]);
      }
      carouselUpdatedIds.add(article.id);
      updatedCarousel++;
      console.log(`  IMAGES: ${article.slug} (${mediaImages.length} images)`);
    }
  }

  // Update all articles: featured image, body HTML, internal links
  // Also populate meta_data.images with featured image for articles that had no carousel files
  const allArticles = await client.query(`
    SELECT id, slug, featured_image_url, body, meta_data
    FROM content WHERE type = 'news' AND deleted_at IS NULL
  `);

  for (const article of allArticles.rows) {
    let needsUpdate = false;
    const updates = {};

    // Fix featured image URL
    if (article.featured_image_url) {
      const newUrl = urlMap.get(article.featured_image_url);
      if (newUrl && newUrl !== article.featured_image_url) {
        updates.featured_image_url = newUrl;
        updatedFeatured++;
        needsUpdate = true;
      }
    }

    // Populate meta_data.images with featured image if no carousel images were set
    if (!carouselUpdatedIds.has(article.id) && article.featured_image_url) {
      const metaData = article.meta_data || {};
      if (!metaData.images || metaData.images.length === 0) {
        const featuredUrl = updates.featured_image_url || article.featured_image_url;
        metaData.images = [featuredUrl];
        updates.meta_data = JSON.stringify(metaData);
        updatedCarousel++;
        needsUpdate = true;
        console.log(`  FEATURED-ONLY: ${article.slug} (1 image)`);
      }
    }

    // Fix body HTML
    if (article.body) {
      let newBody = rewriteBodyImages(article.body, urlMap);
      newBody = remapInternalLinks(newBody, linkMap);
      if (newBody !== article.body) {
        updates.body = newBody;
        updatedBody++;
        needsUpdate = true;
      }
    }

    if (needsUpdate) {
      const setClauses = Object.keys(updates).map((k, i) => `${k} = $${i + 1}`);
      const values = [...Object.values(updates), article.id];
      await client.query(
        `UPDATE content SET ${setClauses.join(', ')} WHERE id = $${values.length}`,
        values
      );
    }
  }

  console.log(`\n--- Phase 3 Summary ---`);
  console.log(`meta_data.images populated: ${updatedCarousel}`);
  console.log(`Featured images updated: ${updatedFeatured}`);
  console.log(`Body HTML updated: ${updatedBody}\n`);
}

module.exports = { fixReferences, remapInternalLinks, rewriteBodyImages };

if (require.main === module) {
  (async () => {
    const client = new Client({
      connectionString: process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });
    await client.connect();
    await fixReferences(client, new Map(), []);
    await client.end();
  })().catch(err => { console.error(err); process.exit(1); });
}
