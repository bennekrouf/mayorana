// next.config.js - Server-side optimized configuration

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Common configuration
  trailingSlash: false,
  reactStrictMode: true,

  // Image optimization (fully enabled)
  images: {
    domains: ['mayorana.ch'],
  },

  // Security headers for better performance and security
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
          // Cache control for static assets
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      // Specific cache settings for different asset types
      {
        source: '/images/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=31536000' }
        ],
      },
    ];
  },

  // URL rewrites for cleaner URLs and API proxying
  async rewrites() {
    return [
      {
        source: '/og-image/:path*',
        destination: '/api/og-image/:path*',
      },
      // Add other rewrites as needed
    ];
  },

  // Redirects for improved SEO (old URLs to new ones)
  async redirects() {
    return [
      // Example redirect (if you have any old URLs that should redirect)
      // {
      //   source: '/old-blog-path/:slug',
      //   destination: '/blog/:slug',
      //   permanent: true, // 308 status code (permanent redirect)
      // },
    ];
  },

  // Additional production optimizations
  poweredByHeader: false, // Remove X-Powered-By header
  compress: true, // Enable gzip compression

  // No static export - use full server capabilities
  // output: 'export' is removed
};

module.exports = nextConfig;
