import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Build output directory. Deploys set NEXT_DIST_DIR to build into a staging
  // directory so the live `.next` is never rewritten while the server is still
  // serving from it — doing that invalidates the chunk hashes the running
  // process holds and returns 500s until the restart lands.
  // See scripts/deploy-mayorana.sh.
  distDir: process.env.NEXT_DIST_DIR || '.next',

  // Common configuration
  trailingSlash: false,
  reactStrictMode: true,

  // Fixed image configuration - use remotePatterns instead of domains
  images: {
    remotePatterns: [
      {
        protocol: 'https' as const,
        hostname: 'mayorana.ch',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https' as const,
        hostname: 'swissrust.ch',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https' as const,
        hostname: 'www.swissrust.ch',
        port: '',
        pathname: '/**',
      },
    ],
  },

  // Remove problematic headers that might cause conflicts
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
        ],
      },
    ];
  },

  // Simplified redirects
  async redirects() {
    return [];
  },

  // Simplified rewrites
  async rewrites() {
    return [];
  },

  // Rewrite `react-icons/*` barrel imports to per-icon imports so a page that
  // uses 4 icons doesn't pull in the whole set (the `fa` barrel alone is ~446KB).
  experimental: {
    optimizePackageImports: ['react-icons/fa', 'react-icons/fi', 'react-icons/tfi'],
  },

  // Additional production optimizations
  poweredByHeader: false,
  compress: true,
};

export default withNextIntl(nextConfig);
