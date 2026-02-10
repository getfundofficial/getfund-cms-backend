#!/usr/bin/env node

/**
 * Thorough duplicate removal script
 * Uses fuzzy matching to find and remove ALL duplicate articles
 */

require('dotenv').config({ path: '.env' });
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

// Normalize title for comparison
function normalizeTitle(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/^[\s\u00A0]+/, '') // Remove leading whitespace including non-breaking spaces
    .replace(/[^a-z0-9\s]/g, '') // Remove special characters
    .replace(/\s+/g, ' ')        // Normalize spaces
    .trim();
}

// Check if two titles are similar (fuzzy match)
function titlesAreSimilar(title1, title2) {
  const norm1 = normalizeTitle(title1);
  const norm2 = normalizeTitle(title2);

  // Exact match after normalization
  if (norm1 === norm2) return true;

  // One contains the other (for truncated titles)
  if (norm1.includes(norm2) || norm2.includes(norm1)) return true;

  // First 40 characters match
  if (norm1.substring(0, 40) === norm2.substring(0, 40) && norm1.length > 20) return true;

  // Levenshtein-like similarity (simple version)
  const words1 = norm1.split(' ');
  const words2 = norm2.split(' ');

  // If most words match, consider similar
  let matchingWords = 0;
  for (const w1 of words1) {
    if (w1.length > 2 && words2.some(w2 => w2.includes(w1) || w1.includes(w2))) {
      matchingWords++;
    }
  }

  const similarity = matchingWords / Math.max(words1.length, words2.length);
  return similarity > 0.7;
}

async function removeAllDuplicates() {
  console.log('\n=== THOROUGH DUPLICATE REMOVAL ===\n');

  // Get all articles
  const articles = await sql`
    SELECT id, title, slug, published_at, created_at
    FROM content
    WHERE type = 'news' AND deleted_at IS NULL
    ORDER BY published_at DESC NULLS LAST, created_at DESC
  `;

  console.log(`Total articles: ${articles.length}\n`);

  // Group similar articles
  const groups = [];
  const processed = new Set();

  for (let i = 0; i < articles.length; i++) {
    if (processed.has(articles[i].id)) continue;

    const group = [articles[i]];
    processed.add(articles[i].id);

    for (let j = i + 1; j < articles.length; j++) {
      if (processed.has(articles[j].id)) continue;

      if (titlesAreSimilar(articles[i].title, articles[j].title)) {
        group.push(articles[j]);
        processed.add(articles[j].id);
      }
    }

    if (group.length > 1) {
      groups.push(group);
    }
  }

  console.log(`Found ${groups.length} groups of duplicate articles:\n`);

  let totalDeleted = 0;

  for (const group of groups) {
    // Sort by published_at DESC, keep the first one
    group.sort((a, b) => {
      const dateA = new Date(a.published_at || a.created_at || 0);
      const dateB = new Date(b.published_at || b.created_at || 0);
      return dateB - dateA;
    });

    console.log(`\nGroup: "${group[0].title.substring(0, 50)}..."`);
    console.log(`  Keeping: [${group[0].id}] ${group[0].published_at || 'no date'}`);

    for (let i = 1; i < group.length; i++) {
      const article = group[i];
      console.log(`  Deleting: [${article.id}] "${article.title.substring(0, 40)}..." (${article.published_at || 'no date'})`);

      await sql`
        UPDATE content
        SET deleted_at = NOW()
        WHERE id = ${article.id}
      `;
      totalDeleted++;
    }
  }

  console.log(`\n\nTotal duplicates removed: ${totalDeleted}`);
  return totalDeleted;
}

async function fixMissingDates() {
  console.log('\n=== FIXING MISSING DATES ===\n');

  // Articles with missing published_at should use created_at
  const result = await sql`
    UPDATE content
    SET published_at = created_at
    WHERE type = 'news'
      AND deleted_at IS NULL
      AND published_at IS NULL
      AND created_at IS NOT NULL
    RETURNING id, title
  `;

  if (result.length > 0) {
    console.log(`Fixed ${result.length} articles with missing published dates:`);
    for (const r of result) {
      console.log(`  - ${r.title.substring(0, 50)}...`);
    }
  } else {
    console.log('No articles with missing dates found.');
  }

  return result.length;
}

async function listRemainingArticles() {
  console.log('\n=== REMAINING ARTICLES ===\n');

  const articles = await sql`
    SELECT id, title, slug, published_at
    FROM content
    WHERE type = 'news' AND deleted_at IS NULL
    ORDER BY published_at DESC NULLS LAST
  `;

  console.log(`Total: ${articles.length} articles\n`);

  for (let i = 0; i < articles.length; i++) {
    const a = articles[i];
    const date = a.published_at ? new Date(a.published_at).toISOString().split('T')[0] : 'NO DATE';
    console.log(`${(i + 1).toString().padStart(2)}. [${date}] ${a.title.substring(0, 60)}`);
  }
}

async function main() {
  console.log('Starting thorough duplicate removal...\n');

  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL environment variable is not set!');
    process.exit(1);
  }

  try {
    // Step 1: Remove all duplicates
    const deleted = await removeAllDuplicates();

    // Step 2: Fix missing dates
    await fixMissingDates();

    // Step 3: List remaining articles
    await listRemainingArticles();

    console.log('\n=== SUMMARY ===');
    console.log(`Duplicates removed: ${deleted}`);
    console.log('\nDone!');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
