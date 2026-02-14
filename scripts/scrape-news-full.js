/**
 * Full GETFund News Scraper
 * Scrapes ALL articles from https://www.getfund.gov.gh/getfund-news/
 * Extracts: title, date, full body text, and all images per article.
 * Outputs results to scraped-news-output.json
 *
 * Run: node scripts/scrape-news-full.js
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://www.getfund.gov.gh/getfund-news/';
const OUTPUT_FILE = path.join(__dirname, 'scraped-news-output.json');
const DELAY_MS = 1500;

// --- HTTP helpers ---

function fetch(url, retries = 3) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const request = protocol.get(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        Accept: 'text/html,application/xhtml+xml',
      },
    }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        const redirect = res.headers.location;
        if (redirect) return fetch(redirect, retries).then(resolve, reject);
        return reject(new Error('Redirect with no location header'));
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      }
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve(data));
      res.on('error', reject);
    });
    request.on('error', (err) => {
      if (retries > 1) {
        setTimeout(() => fetch(url, retries - 1).then(resolve, reject), 2000);
      } else {
        reject(err);
      }
    });
    request.setTimeout(30000, () => {
      request.destroy();
      reject(new Error(`Timeout fetching ${url}`));
    });
  });
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// --- Listing page parser ---

function extractArticleLinks(html) {
  const links = [];
  // Match <a> tags whose href points to a getfund.gov.gh article
  const regex = /<a[^>]+href="(https?:\/\/www\.getfund\.gov\.gh\/\d{4}\/\d{2}\/\d{2}\/[^"]+)"[^>]*>/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    const url = match[1].replace(/\/$/, '') + '/';
    if (!links.includes(url)) links.push(url);
  }
  return links;
}

function extractNextPage(html, currentPage) {
  const nextPage = currentPage + 1;
  const pattern = new RegExp(
    `href="(https?://www\\.getfund\\.gov\\.gh/getfund-news/page/${nextPage}/[^"]*)"`,
    'i'
  );
  const match = html.match(pattern);
  return match ? match[1] : null;
}

// --- Article page parser ---

function extractTitle(html) {
  const patterns = [
    /<h1[^>]*class="[^"]*entry-title[^"]*"[^>]*>([\s\S]*?)<\/h1>/i,
    /<h2[^>]*class="[^"]*entry-title[^"]*"[^>]*>([\s\S]*?)<\/h2>/i,
    /<h1[^>]*class="[^"]*news-details__title[^"]*"[^>]*>([\s\S]*?)<\/h1>/i,
    /<h2[^>]*class="[^"]*news-details__title[^"]*"[^>]*>([\s\S]*?)<\/h2>/i,
    /<h1[^>]*>([\s\S]*?)<\/h1>/i,
  ];
  for (const p of patterns) {
    const m = html.match(p);
    if (m) {
      const t = stripTags(m[1]).trim();
      if (t.length > 5 && !t.toLowerCase().includes('getfund.gov.gh')) return t;
    }
  }
  const og = html.match(/<meta[^>]*property="og:title"[^>]*content="([^"]*)"/i);
  if (og) return og[1].trim();
  return null;
}

function extractDate(html) {
  // Try meta published_time
  const og = html.match(
    /<meta[^>]*property="article:published_time"[^>]*content="([^"]*)"/i
  );
  if (og) return og[1].trim();
  // Try visible date in the page
  const datePatterns = [
    /<time[^>]*datetime="([^"]*)"[^>]*>/i,
    /(\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4})/i,
    /(\d{4}-\d{2}-\d{2})/,
  ];
  for (const p of datePatterns) {
    const m = html.match(p);
    if (m) return m[1].trim();
  }
  return null;
}

function extractBodyText(html) {
  // Strategy 1: news-details__content after the meta <ul>
  let idx = html.indexOf('news-details__content');
  if (idx !== -1) {
    let section = html.slice(idx);
    const ulEnd = section.indexOf('</ul>');
    if (ulEnd !== -1) section = section.slice(ulEnd + 5);
    const bottomIdx = section.indexOf('news-details__bottom');
    if (bottomIdx > 0) section = section.slice(0, bottomIdx);
    const text = htmlToText(section);
    if (text.length > 50) return text;
  }

  // Strategy 2: entry-content div
  const entryMatch = html.match(
    /<div[^>]*class="[^"]*entry-content[^"]*"[^>]*>([\s\S]*?)<\/div>\s*(?:<div[^>]*class="[^"]*(?:sharedaddy|post-navigation|comments)|<\/article|<footer)/i
  );
  if (entryMatch) {
    const text = htmlToText(entryMatch[1]);
    if (text.length > 50) return text;
  }

  // Strategy 3: broader entry-content grab
  const broad = html.match(
    /<div[^>]*class="[^"]*entry-content[^"]*"[^>]*>([\s\S]*?)<\/div>/i
  );
  if (broad) {
    const text = htmlToText(broad[1]);
    if (text.length > 30) return text;
  }

  return null;
}

function extractImages(html) {
  const images = [];
  // Extract from the article content area
  let contentHtml = html;
  const entryStart = html.indexOf('entry-content');
  if (entryStart !== -1) {
    contentHtml = html.slice(entryStart);
    const entryEnd = contentHtml.indexOf('</article');
    if (entryEnd > 0) contentHtml = contentHtml.slice(0, entryEnd);
  }

  // Also grab featured image / og:image
  const ogImg = html.match(
    /<meta[^>]*property="og:image"[^>]*content="([^"]*)"/i
  );
  if (ogImg && ogImg[1]) {
    images.push({ url: ogImg[1], type: 'featured' });
  }

  // Grab all img tags in article body
  const imgRegex = /<img[^>]+src="([^"]+)"[^>]*>/gi;
  let m;
  while ((m = imgRegex.exec(contentHtml)) !== null) {
    const src = m[1];
    if (
      src.includes('getfund.gov.gh/wp-content/uploads') &&
      !src.includes('logo') &&
      !src.includes('icon') &&
      !src.includes('150x150')
    ) {
      // Avoid duplicates
      if (!images.some((img) => img.url === src)) {
        images.push({ url: src, type: 'body' });
      }
    }
  }

  return images;
}

// --- Text utilities ---

function stripTags(html) {
  return html.replace(/<[^>]+>/g, '');
}

function htmlToText(html) {
  // Remove scripts, styles
  let text = html.replace(/<script[\s\S]*?<\/script>/gi, '');
  text = text.replace(/<style[\s\S]*?<\/style>/gi, '');
  // Convert <br> and block-level tags to newlines
  text = text.replace(/<br\s*\/?>/gi, '\n');
  text = text.replace(/<\/(?:p|div|h[1-6]|li|tr|blockquote)>/gi, '\n');
  text = text.replace(/<(?:p|div|h[1-6]|li|tr|blockquote)[^>]*>/gi, '\n');
  // Strip remaining tags
  text = stripTags(text);
  // Decode common entities
  text = text.replace(/&amp;/g, '&');
  text = text.replace(/&lt;/g, '<');
  text = text.replace(/&gt;/g, '>');
  text = text.replace(/&quot;/g, '"');
  text = text.replace(/&#8217;/g, "'");
  text = text.replace(/&#8216;/g, "'");
  text = text.replace(/&#8220;/g, '"');
  text = text.replace(/&#8221;/g, '"');
  text = text.replace(/&#8211;/g, '–');
  text = text.replace(/&#8212;/g, '—');
  text = text.replace(/&nbsp;/g, ' ');
  text = text.replace(/\u200B/g, '');
  // Clean up whitespace
  text = text.replace(/[ \t]+/g, ' ');
  text = text.replace(/\n[ \t]+/g, '\n');
  text = text.replace(/\n{3,}/g, '\n\n');
  return text.trim();
}

// --- Main ---

async function scrapeAllNews() {
  console.log('=== GETFund News Scraper ===\n');

  // Step 1: Collect all article URLs from listing pages
  const allUrls = [];
  let pageNum = 1;
  let nextPageUrl = BASE_URL;

  console.log('Step 1: Collecting article URLs from listing pages...\n');

  while (nextPageUrl) {
    console.log(`  Fetching page ${pageNum}: ${nextPageUrl}`);
    try {
      const html = await fetch(nextPageUrl);
      const links = extractArticleLinks(html);
      console.log(`    Found ${links.length} article links`);

      for (const link of links) {
        if (!allUrls.includes(link)) allUrls.push(link);
      }

      nextPageUrl = extractNextPage(html, pageNum);
      pageNum++;
      await sleep(DELAY_MS);
    } catch (err) {
      console.log(`    ERROR on page ${pageNum}: ${err.message}`);
      break;
    }
  }

  console.log(`\n  Total unique article URLs: ${allUrls.length}\n`);

  // Step 2: Visit each article and extract content + images
  console.log('Step 2: Scraping each article...\n');

  const articles = [];

  for (let i = 0; i < allUrls.length; i++) {
    const url = allUrls[i];
    console.log(`  [${i + 1}/${allUrls.length}] ${url}`);

    try {
      const html = await fetch(url);

      const title = extractTitle(html);
      const date = extractDate(html);
      const body = extractBodyText(html);
      const images = extractImages(html);

      const article = {
        url,
        title: title || 'Unknown Title',
        date: date || 'Unknown Date',
        body: body || 'Could not extract body content',
        images,
      };

      articles.push(article);

      const bodyPreview = body
        ? body.substring(0, 80).replace(/\n/g, ' ') + '...'
        : 'NO BODY';
      console.log(`    Title: ${title || 'N/A'}`);
      console.log(`    Date: ${date || 'N/A'}`);
      console.log(`    Images: ${images.length}`);
      console.log(`    Body: ${bodyPreview}`);
    } catch (err) {
      console.log(`    ERROR: ${err.message}`);
      articles.push({
        url,
        title: 'FETCH ERROR',
        date: null,
        body: null,
        images: [],
        error: err.message,
      });
    }

    await sleep(DELAY_MS);
  }

  // Step 3: Save output
  console.log(`\n=== Saving ${articles.length} articles to ${OUTPUT_FILE} ===\n`);

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(articles, null, 2), 'utf-8');

  // Summary
  const withBody = articles.filter((a) => a.body && a.body.length > 50).length;
  const withImages = articles.filter((a) => a.images.length > 0).length;
  const totalImages = articles.reduce((sum, a) => sum + a.images.length, 0);

  console.log('=== SUMMARY ===');
  console.log(`  Total articles scraped: ${articles.length}`);
  console.log(`  Articles with body text: ${withBody}`);
  console.log(`  Articles with images: ${withImages}`);
  console.log(`  Total images found: ${totalImages}`);
  console.log(`  Output saved to: ${OUTPUT_FILE}`);
  console.log('================\n');
}

scrapeAllNews().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
