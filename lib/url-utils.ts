/**
 * URL utility functions for sanitizing and normalizing URLs
 */

/**
 * Convert absolute localhost URLs to production URLs
 * In production, converts localhost URLs to the backend's production URL
 * In development, preserves localhost URLs so they work across different ports
 * @param url - The URL to convert (can be absolute or relative)
 * @returns Production URL or the original localhost URL in development
 */
export function toRelativePath(url: string | null | undefined): string | null {
  if (!url) return null;

  // If URL is already a relative path or production URL, return as-is
  if (!url.startsWith('http://localhost') && !url.startsWith('https://localhost')) {
    return url;
  }

  // Extract the path from the localhost URL
  const path = url.replace(/^https?:\/\/localhost(:\d+)?/, '');

  // Try to get backend URL from environment variables
  let backendUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL;

  // If not set, try VERCEL_URL (automatically set by Vercel)
  if (!backendUrl && process.env.VERCEL_URL) {
    backendUrl = `https://${process.env.VERCEL_URL}`;
  }

  // In production, return full URL with backend domain
  if (backendUrl) {
    // Ensure backendUrl has protocol
    const fullBackendUrl = backendUrl.startsWith('http') ? backendUrl : `https://${backendUrl}`;
    return `${fullBackendUrl}${path}`;
  }

  // In development, preserve the original localhost URL
  // This ensures images work when website and backend run on different ports
  return url;
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
