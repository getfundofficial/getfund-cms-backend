/**
 * Shared utilities for news media sync scripts.
 * Downloads, retries, mime types, image optimization.
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const NEWS_IMAGES_DIR = path.resolve(__dirname, '../../../../getfund-website/public/images/news');

const PLACEHOLDER_PATTERNS = [
  'cropped-getfund', 'site-icon', 'logo-light', 'logo-dark',
  'favicon', 'getfund-cropped', 'e1655889919253', 'placeholder',
  'logo.png', 'icon.png',
];

function isPlaceholderImage(url) {
  if (!url) return true;
  const lower = url.toLowerCase();
  if (PLACEHOLDER_PATTERNS.some(p => lower.includes(p))) return true;
  // Exclude small thumbnail sizes (sidebar/widget images)
  if (/-70x70\./.test(lower)) return true;
  if (/-100x100\./.test(lower)) return true;
  if (/-150x150\./.test(lower)) return true;
  if (/-170x170\./.test(lower)) return true;
  return false;
}

function getMimeType(filename) {
  const ext = path.extname(filename).toLowerCase();
  const types = {
    '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
    '.png': 'image/png', '.gif': 'image/gif',
    '.webp': 'image/webp', '.svg': 'image/svg+xml',
  };
  return types[ext] || 'image/jpeg';
}

function fetchUrl(url, timeout = 20000) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const req = protocol.get(url, {
      timeout,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,image/*,*/*',
        'Referer': 'https://www.getfund.gov.gh/',
      },
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        let redirectUrl = res.headers.location;
        if (!redirectUrl.startsWith('http')) {
          const urlObj = new URL(url);
          redirectUrl = `${urlObj.protocol}//${urlObj.host}${redirectUrl}`;
        }
        return fetchUrl(redirectUrl, timeout).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
    req.on('error', reject);
  });
}

async function fetchWithRetry(url, retries = 3, delay = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fetchUrl(url);
    } catch (err) {
      if (i === retries - 1) throw err;
      console.log(`  Retry ${i + 1} for ${path.basename(url)}: ${err.message}`);
      await new Promise(r => setTimeout(r, delay));
    }
  }
}

function downloadImage(url, destPath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const req = protocol.get(url, {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'image/*,*/*',
        'Referer': 'https://www.getfund.gov.gh/',
      },
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadImage(res.headers.location, destPath).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        return;
      }
      const fileStream = fs.createWriteStream(destPath);
      res.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close();
        const stats = fs.statSync(destPath);
        if (stats.size < 100) {
          fs.unlinkSync(destPath);
          reject(new Error(`File too small (${stats.size} bytes)`));
        } else {
          resolve(stats.size);
        }
      });
      fileStream.on('error', (err) => {
        fs.unlinkSync(destPath);
        reject(err);
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

/**
 * Extract the article content area from full page HTML.
 * Scopes to the article body to avoid sidebar/header/footer images.
 */
function extractArticleArea(html) {
  // 1. Featured image from post-thumbnail div
  let featuredHtml = '';
  const thumbMatch = html.match(/<div[^>]*class="[^"]*post-thumbnail[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
  if (thumbMatch) featuredHtml = thumbMatch[0];

  // 2. Article body from news-details__content (GETFund-specific)
  let bodyHtml = '';
  const contentStart = html.indexOf('news-details__content');
  if (contentStart !== -1) {
    const afterStart = html.slice(contentStart);
    const endIdx = afterStart.indexOf('news-details__bottom');
    bodyHtml = endIdx !== -1 ? afterStart.slice(0, endIdx) : afterStart.slice(0, 50000);
  }

  // 3. Fallback to <article> tag
  if (!bodyHtml) {
    const articleMatch = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
    if (articleMatch) bodyHtml = articleMatch[1];
  }

  // 4. Last fallback: full page (better than nothing)
  if (!bodyHtml) bodyHtml = html;

  return featuredHtml + '\n' + bodyHtml;
}

/**
 * Score image URL by resolution preference (higher = better).
 */
function getImageSizeScore(url) {
  if (url.includes('-770x')) return 100;
  if (url.includes('-1024x')) return 90;
  if (url.includes('-768x')) return 80;
  if (url.includes('-scaled')) return 70;
  if (!/-\d+x\d+\./.test(url)) return 60; // Full size (no suffix)
  if (url.includes('-370x')) return 40;    // Elementor carousel thumb
  if (url.includes('-300x')) return 30;
  return 50;
}

/**
 * Extract ALL article images from page HTML.
 * Uses a broad URL regex to catch images in <img src>, <a href>,
 * data-thumbnail, srcset, and any other attribute.
 * Scoped to article content area only (not sidebar/footer).
 */
function extractAllBodyImages(html) {
  // Extract og:image from <head> — WordPress always sets this to the featured image
  const ogMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i)
    || html.match(/<meta\s+content=["']([^"']+)["']\s+property=["']og:image["']/i);
  const ogImageUrl = ogMatch ? ogMatch[1].split('?')[0] : null;

  const articleHtml = extractArticleArea(html);

  // Broad regex: find ALL wp-content/uploads image URLs in the article area
  const urlRegex = /https?:\/\/(?:www\.)?getfund\.gov\.gh\/wp-content\/uploads\/[^"'\s<>)]+\.(?:jpg|jpeg|png|gif|webp)/gi;
  const rawUrls = articleHtml.match(urlRegex) || [];

  // Clean and filter
  const cleaned = rawUrls
    .map(url => url.split('?')[0]) // Strip query strings
    .filter(url => !isPlaceholderImage(url));

  // Deduplicate by base URL (strip -NNNxNNN size suffix), prefer larger versions
  const baseToVersions = new Map();
  const baseOrder = []; // Track first-appearance order

  for (const url of cleaned) {
    const baseUrl = url.replace(/-\d+x\d+(\.[a-z]+)$/i, '$1');
    if (!baseToVersions.has(baseUrl)) {
      baseToVersions.set(baseUrl, []);
      baseOrder.push(baseUrl);
    }
    baseToVersions.get(baseUrl).push(url);
  }

  // For each base URL, pick the best version (highest size score)
  const result = [];
  for (const baseUrl of baseOrder) {
    const versions = baseToVersions.get(baseUrl);
    versions.sort((a, b) => getImageSizeScore(b) - getImageSizeScore(a));
    result.push(versions[0]);
  }

  // Ensure og:image (featured image) is included — prepend if not already captured
  if (ogImageUrl && !isPlaceholderImage(ogImageUrl) && /wp-content\/uploads/i.test(ogImageUrl)) {
    const ogBase = ogImageUrl.replace(/-\d+x\d+(\.[a-z]+)$/i, '$1');
    const alreadyCaptured = result.some(url => {
      const base = url.replace(/-\d+x\d+(\.[a-z]+)$/i, '$1');
      return base === ogBase;
    });
    if (!alreadyCaptured) {
      result.unshift(ogImageUrl);
    }
  }

  return result;
}

module.exports = {
  NEWS_IMAGES_DIR, fetchUrl, fetchWithRetry, downloadImage,
  extractAllBodyImages, isPlaceholderImage, getMimeType,
};
