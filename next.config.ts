/** @type {import('next').NextConfig} */
const nextConfig = {
 images: {
    domains: ['mayorana.ch'], // Add your domain for image optimization
  },
  async headers() {
    return [
      {
        // Apply these headers to all routes
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  // Generate OG images at build time to improve performance
  async rewrites() {
    return [
      {
        source: '/og-image/:path*',
        destination: '/api/og-image/:path*',
      },
    ];
  },
  // Add trailing slashes for better SEO
  trailingSlash: true,};

module.exports = nextConfig;
