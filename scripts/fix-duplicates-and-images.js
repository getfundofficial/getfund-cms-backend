#!/usr/bin/env node

/**
 * Script to:
 * 1. Find and remove duplicate news articles
 * 2. Import all news images into the media gallery
 */

require('dotenv').config({ path: '.env' });
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

// Helper to check if an image URL is a logo/placeholder
function isLogoOrPlaceholder(url) {
  if (!url) return true;
  const lowerUrl = url.toLowerCase();
  return (
    lowerUrl.includes('logo-light') ||
    lowerUrl.includes('logo-dark') ||
    lowerUrl.includes('logo.png') ||
    lowerUrl.includes('site-icon') ||
    lowerUrl.includes('getfund-site-icon') ||
    lowerUrl.includes('getfund-cropped') ||
    lowerUrl.includes('cropped-getfund') ||
    lowerUrl.includes('placeholder') ||
    lowerUrl.includes('favicon') ||
    lowerUrl.includes('icon.png')
  );
}

async function findAndRemoveDuplicates() {
  console.log('\n=== FINDING DUPLICATE NEWS ARTICLES ===\n');

  // Find duplicates based on title (case-insensitive)
  const duplicates = await sql`
    SELECT
      LOWER(TRIM(title)) as normalized_title,
      COUNT(*) as count,
      array_agg(id ORDER BY created_at ASC) as ids,
      array_agg(slug ORDER BY created_at ASC) as slugs,
      array_agg(created_at ORDER BY created_at ASC) as created_dates
    FROM content
    WHERE type = 'news' AND deleted_at IS NULL
    GROUP BY LOWER(TRIM(title))
    HAVING COUNT(*) > 1
    ORDER BY count DESC
  `;

  if (duplicates.length === 0) {
    console.log('No duplicate articles found.');
    return 0;
  }

  console.log(`Found ${duplicates.length} sets of duplicate articles:\n`);

  let deletedCount = 0;

  for (const dup of duplicates) {
    console.log(`Title: "${dup.normalized_title}"`);
    console.log(`  Count: ${dup.count}`);
    console.log(`  IDs: ${dup.ids.join(', ')}`);
    console.log(`  Slugs: ${dup.slugs.join(', ')}`);

    // Keep the first one (oldest), soft delete the rest
    const idsToDelete = dup.ids.slice(1);

    for (const id of idsToDelete) {
      console.log(`  Soft deleting ID: ${id}`);
      await sql`
        UPDATE content
        SET deleted_at = NOW()
        WHERE id = ${id}
      `;
      deletedCount++;
    }
    console.log('');
  }

  console.log(`\nSoft deleted ${deletedCount} duplicate articles.`);
  return deletedCount;
}

async function importImagesToMediaGallery() {
  console.log('\n=== IMPORTING NEWS IMAGES TO MEDIA GALLERY ===\n');

  // First, check if media table exists and what columns it has
  const tableCheck = await sql`
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_name = 'media'
    ORDER BY ordinal_position
  `;

  if (tableCheck.length === 0) {
    console.log('Media table not found. Skipping media import.');
    return 0;
  }

  const columns = tableCheck.map(c => c.column_name);
  console.log('Media table columns:', columns.join(', '));

  // Determine which column name to use for URL
  const urlColumn = columns.includes('url') ? 'url' : 'file_url';
  console.log(`Using URL column: ${urlColumn}`);

  // Get all news articles with images
  const articles = await sql`
    SELECT
      id,
      title,
      featured_image_url,
      meta_data
    FROM content
    WHERE type = 'news'
      AND deleted_at IS NULL
      AND (
        featured_image_url IS NOT NULL
        OR meta_data::text LIKE '%images%'
      )
  `;

  console.log(`Found ${articles.length} articles with potential images.`);

  let importedCount = 0;
  const importedUrls = new Set();

  // Get existing media URLs to avoid duplicates (handle both column names)
  let existingMedia;
  try {
    existingMedia = await sql`SELECT url FROM media WHERE deleted_at IS NULL`;
  } catch {
    try {
      existingMedia = await sql`SELECT file_url as url FROM media WHERE deleted_at IS NULL`;
    } catch {
      existingMedia = [];
    }
  }
  const existingUrls = new Set(existingMedia.map(m => m.url));
  console.log(`Found ${existingUrls.size} existing media files.`);

  for (const article of articles) {
    const imagesToImport = [];

    // Add featured image if valid
    if (article.featured_image_url && !isLogoOrPlaceholder(article.featured_image_url)) {
      imagesToImport.push({
        url: article.featured_image_url,
        type: 'featured',
        title: article.title
      });
    }

    // Add images from meta_data
    if (article.meta_data && article.meta_data.images) {
      for (const img of article.meta_data.images) {
        const imgUrl = typeof img === 'string' ? img : img.url;
        if (imgUrl && !isLogoOrPlaceholder(imgUrl)) {
          imagesToImport.push({
            url: imgUrl,
            type: 'content',
            title: article.title
          });
        }
      }
    }

    for (const img of imagesToImport) {
      // Skip if already imported or exists
      if (importedUrls.has(img.url) || existingUrls.has(img.url)) {
        continue;
      }

      // Extract filename from URL
      const urlParts = img.url.split('/');
      const filename = urlParts[urlParts.length - 1] || 'image.jpg';

      // Determine file type
      const extension = filename.split('.').pop()?.toLowerCase() || 'jpg';
      const mimeTypes = {
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
        'webp': 'image/webp',
        'svg': 'image/svg+xml'
      };
      const mimeType = mimeTypes[extension] || 'image/jpeg';

      try {
        // Use dynamic SQL based on table structure
        // Note: uploaded_by is a UUID reference, so we pass null for system imports
        await sql`
          INSERT INTO media (
            filename,
            original_name,
            url,
            file_path,
            mime_type,
            alt_text
          ) VALUES (
            ${filename},
            ${filename},
            ${img.url},
            ${img.url},
            ${mimeType},
            ${img.title.substring(0, 500)}
          )
          ON CONFLICT DO NOTHING
        `;

        importedUrls.add(img.url);
        importedCount++;

        if (importedCount % 10 === 0) {
          console.log(`Imported ${importedCount} images...`);
        }
      } catch (err) {
        console.error(`Error importing image ${img.url}:`, err.message);
      }
    }
  }

  console.log(`\nImported ${importedCount} new images to media gallery.`);
  return importedCount;
}

async function fixLogoPlaceholders() {
  console.log('\n=== FIXING LOGO PLACEHOLDER IMAGES ===\n');

  // Find ALL articles and check for logo placeholders
  const allArticles = await sql`
    SELECT id, title, featured_image_url, meta_data
    FROM content
    WHERE type = 'news'
      AND deleted_at IS NULL
  `;

  console.log(`Checking ${allArticles.length} articles for logo placeholders.`);

  let fixedCount = 0;
  let articlesWithNoValidImages = [];

  for (const article of allArticles) {
    // Check if current featured image is a logo
    if (isLogoOrPlaceholder(article.featured_image_url)) {
      // Try to find a valid image in meta_data
      let foundValidImage = false;

      if (article.meta_data && article.meta_data.images && article.meta_data.images.length > 0) {
        for (const img of article.meta_data.images) {
          const imgUrl = typeof img === 'string' ? img : img.url;
          if (imgUrl && !isLogoOrPlaceholder(imgUrl)) {
            console.log(`Fixing: ${article.title.substring(0, 50)}...`);
            console.log(`  Old: ${article.featured_image_url || 'null'}`);
            console.log(`  New: ${imgUrl}`);

            await sql`
              UPDATE content
              SET featured_image_url = ${imgUrl}
              WHERE id = ${article.id}
            `;

            fixedCount++;
            foundValidImage = true;
            break;
          }
        }
      }

      if (!foundValidImage) {
        articlesWithNoValidImages.push({
          id: article.id,
          title: article.title.substring(0, 60)
        });
      }
    }
  }

  console.log(`\nFixed ${fixedCount} articles with logo placeholders.`);

  if (articlesWithNoValidImages.length > 0) {
    console.log(`\nArticles with no valid images found (${articlesWithNoValidImages.length}):`);
    for (const a of articlesWithNoValidImages.slice(0, 10)) {
      console.log(`  - ${a.title}...`);
    }
    if (articlesWithNoValidImages.length > 10) {
      console.log(`  ... and ${articlesWithNoValidImages.length - 10} more`);
    }
  }

  return fixedCount;
}

async function main() {
  console.log('Starting duplicate removal and image import...\n');
  console.log('Database URL:', process.env.DATABASE_URL ? 'Set' : 'NOT SET');

  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL environment variable is not set!');
    process.exit(1);
  }

  try {
    // Step 1: Remove duplicates
    const duplicatesRemoved = await findAndRemoveDuplicates();

    // Step 2: Fix logo placeholders
    const logosFixed = await fixLogoPlaceholders();

    // Step 3: Import images to media gallery
    const imagesImported = await importImagesToMediaGallery();

    console.log('\n=== SUMMARY ===');
    console.log(`Duplicates removed: ${duplicatesRemoved}`);
    console.log(`Logo placeholders fixed: ${logosFixed}`);
    console.log(`Images imported to gallery: ${imagesImported}`);
    console.log('\nDone!');

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
