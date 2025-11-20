/** @type {import('next').NextConfig} */
const nextConfig = {
  // CORS is handled in individual route handlers via lib/cors.ts
  // This allows for dynamic origin checking based on environment
  output: 'standalone',

  // Increase API route timeout for database wake-up (Neon serverless)
  experimental: {
    // Note: This is for Next.js 13/14. For Next.js 15+, maxDuration is set per route
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

module.exports = nextConfig;
