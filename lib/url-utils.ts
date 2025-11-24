/**
 * URL utility functions for sanitizing and normalizing URLs
 */

/**
 * Convert absolute localhost URLs to relative paths
 * This fixes mixed content issues where images were stored with localhost URLs
 * @param url - The URL to convert (can be absolute or relative)
 * @returns Relative path without localhost domain
 */
export function toRelativePath(url: string | null | undefined): string | null {
  if (!url) return null;

  // Remove localhost URLs (both http and https, any port)
  return url.replace(/^https?:\/\/localhost(:\d+)?/, '');
}

/**
 * Recursively sanitize URLs in an object or array
 * Useful for sanitizing section content that may contain image URLs
 * @param obj - The object or array to sanitize
 * @returns Sanitized object with relative URLs
 */
export function sanitizeUrls<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'string') {
    // If it looks like a URL, sanitize it
    if (obj.startsWith('http://localhost') || obj.startsWith('https://localhost')) {
      return toRelativePath(obj) as any;
    }
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeUrls(item)) as any;
  }

  if (typeof obj === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      // Special handling for known URL fields
      if (key.includes('url') || key.includes('image') || key.includes('src')) {
        sanitized[key] = typeof value === 'string' ? toRelativePath(value) : sanitizeUrls(value);
      } else {
        sanitized[key] = sanitizeUrls(value);
      }
    }
    return sanitized;
  }

  return obj;
}
