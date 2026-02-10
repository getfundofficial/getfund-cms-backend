#!/usr/bin/env node

/**
 * Script to:
 * 1. Find and remove ALL duplicate articles
 * 2. Verify and fix article dates
 */

require('dotenv').config({ path: '.env' });
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function findAndRemoveAllDuplicates() {
  console.log('\n=== FINDING ALL DUPLICATE ARTICLES ===\n');

  // Find duplicates based on normalized title (case-insensitive, trimmed)
  const duplicates = await sql`
    SELECT
      LOWER(TRIM(title)) as normalized_title,
      COUNT(*) as count,
      array_agg(id ORDER BY published_at DESC NULLS LAST, created_at DESC) as ids,
      array_agg(slug ORDER BY published_at DESC NULLS LAST, created_at DESC) as slugs,
      array_agg(published_at ORDER BY published_at DESC NULLS LAST, created_at DESC) as publish_dates
    FROM content
    WHERE type = 'news' AND deleted_at IS NULL
    GROUP BY LOWER(TRIM(title))
    HAVING COUNT(*) > 1
    ORDER BY count DESC
  `;

  if (duplicates.length === 0) {
    console.log('No duplicate articles found based on title.');
  } else {
    console.log(`Found ${duplicates.length} sets of duplicate articles by title:\n`);

    let deletedCount = 0;

    for (const dup of duplicates) {
      console.log(`Title: "${dup.normalized_title.substring(0, 60)}..."`);
      console.log(`  Count: ${dup.count}`);
      console.log(`  IDs: ${dup.ids.join(', ')}`);

      // Keep the first one (most recent by published_at), soft delete the rest
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

    console.log(`\nSoft deleted ${deletedCount} duplicate articles by title.`);
  }

  // Also find duplicates by similar slug
  console.log('\n=== CHECKING FOR SIMILAR SLUGS ===\n');

  const allArticles = await sql`
    SELECT id, title, slug, published_at, created_at
    FROM content
    WHERE type = 'news' AND deleted_at IS NULL
    ORDER BY published_at DESC NULLS LAST, created_at DESC
  `;

  // Group articles by normalized slug (without numbers at the end)
  const slugGroups = {};
  for (const article of allArticles) {
    // Remove trailing numbers/dates from slug for comparison
    const baseSlug = article.slug
      .replace(/-\d+$/, '') // Remove trailing numbers like -2, -3
      .replace(/-\d{4}$/, '') // Remove trailing year like -2025
      .replace(/-\d{4}-\d{2}$/, ''); // Remove trailing year-month

    if (!slugGroups[baseSlug]) {
      slugGroups[baseSlug] = [];
    }
    slugGroups[baseSlug].push(article);
  }

  let slugDuplicates = 0;
  for (const [baseSlug, articles] of Object.entries(slugGroups)) {
    if (articles.length > 1) {
      // Check if titles are similar (first 30 chars match)
      const firstTitle = articles[0].title.toLowerCase().substring(0, 30);
      const similarArticles = articles.filter(a =>
        a.title.toLowerCase().substring(0, 30) === firstTitle
      );

      if (similarArticles.length > 1) {
        console.log(`Similar articles found for base slug: ${baseSlug}`);
        for (const a of similarArticles) {
          console.log(`  - [${a.id}] ${a.title.substring(0, 50)}... (${a.published_at || a.created_at})`);
        }

        // Keep the first (most recent), delete the rest
        for (let i = 1; i < similarArticles.length; i++) {
          console.log(`  Soft deleting: ${similarArticles[i].id}`);
          await sql`
            UPDATE content
            SET deleted_at = NOW()
            WHERE id = ${similarArticles[i].id}
          `;
          slugDuplicates++;
        }
        console.log('');
      }
    }
  }

  console.log(`Soft deleted ${slugDuplicates} duplicate articles by similar slug.`);
}

async function listAllArticles() {
  console.log('\n=== ALL CURRENT ARTICLES ===\n');

  const articles = await sql`
    SELECT id, title, slug, published_at, created_at, featured_image_url
    FROM content
    WHERE type = 'news' AND deleted_at IS NULL
    ORDER BY published_at DESC NULLS LAST, created_at DESC
  `;

  console.log(`Total articles: ${articles.length}\n`);

  for (let i = 0; i < articles.length; i++) {
    const a = articles[i];
    const date = a.published_at || a.created_at;
    const dateStr = date ? new Date(date).toISOString().split('T')[0] : 'NO DATE';
    const hasImage = a.featured_image_url && !a.featured_image_url.includes('logo') ? '✓' : '✗';

    console.log(`${i + 1}. [${dateStr}] ${hasImage} ${a.title.substring(0, 60)}`);
  }
}

async function checkDates() {
  console.log('\n=== CHECKING ARTICLE DATES ===\n');

  const articles = await sql`
    SELECT id, title, slug, published_at, created_at
    FROM content
    WHERE type = 'news' AND deleted_at IS NULL
    ORDER BY published_at DESC NULLS LAST, created_at DESC
  `;

  let missingDates = 0;
  let futureDates = 0;
  const now = new Date();

  for (const a of articles) {
    const pubDate = a.published_at ? new Date(a.published_at) : null;

    if (!pubDate) {
      console.log(`Missing date: ${a.title.substring(0, 50)}...`);
      missingDates++;
    } else if (pubDate > now) {
      console.log(`Future date (${pubDate.toISOString().split('T')[0]}): ${a.title.substring(0, 50)}...`);
      futureDates++;
    }
  }

  console.log(`\nMissing dates: ${missingDates}`);
  console.log(`Future dates: ${futureDates}`);
}

async function main() {
  console.log('Checking and fixing articles...\n');

  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL environment variable is not set!');
    process.exit(1);
  }

  try {
    // Step 1: Remove all duplicates
    await findAndRemoveAllDuplicates();

    // Step 2: Check dates
    await checkDates();

    // Step 3: List all remaining articles
    await listAllArticles();

    console.log('\nDone!');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
