/** @type {import('next').NextConfig} */
const nextConfig = {
  // CORS is handled in individual route handlers via lib/cors.ts
  // This allows for dynamic origin checking based on environment
  output: 'standalone'
};

module.exports = nextConfig;
