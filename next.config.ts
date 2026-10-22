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
      // Google account avatars, shown in the navbar once signed in.
      {
        protocol: 'https' as const,
        hostname: 'lh3.googleusercontent.com',
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

  // Retired pages. Duplicate blog posts: Each of these was published twice — the
  // survivor is the fuller version — so the retired URL 301s to it rather
  // than 404ing for anyone holding the old link.
  async redirects() {
    return [
      { source: '/fr/blog/vec-new-vs-with-capacity-fr', destination: '/fr/blog/vec-new-vs-with-capacity', permanent: true },
      { source: '/fr/blog/iter-methods-rust-fr', destination: '/fr/blog/iter-methods-rust', permanent: true },
      { source: '/fr/blog/collect-method-rust-fr', destination: '/fr/blog/collect-method-rust', permanent: true },
      { source: '/fr/blog/vec-push-vs-with-capacity-performance-duplicate-fr', destination: '/fr/blog/vec-push-vs-with-capacity-performance', permanent: true },
      { source: '/fr/blog/efficient-duplicate-removal-vec-fr', destination: '/fr/blog/efficient-duplicate-removal-vec', permanent: true },
      { source: '/fr/blog/box-slice-vs-vec-differences-fr', destination: '/fr/blog/box-slice-vs-vec-differences', permanent: true },
      { source: '/fr/blog/vec-drain-vs-truncate-clear-fr', destination: '/fr/blog/vec-drain-vs-truncate-clear', permanent: true },
      { source: '/fr/blog/vec-retain-vs-filter-collect-fr', destination: '/fr/blog/vec-retain-vs-filter-collect', permanent: true },
      { source: '/fr/blog/flatten-vec-iterators-performance-fr', destination: '/fr/blog/flatten-vec-iterators-performance', permanent: true },
      { source: '/en/blog/vec-push-vs-with-capacity-performance-duplicate', destination: '/en/blog/vec-push-vs-with-capacity-performance', permanent: true },
      { source: '/fr/blog/vec-push-vs-with-capacity-performance-duplicate', destination: '/fr/blog/vec-push-vs-with-capacity-performance', permanent: true },
      // The Services page is retired: the company now leads with its products.
      { source: '/:locale(en|fr)/services', destination: '/:locale', permanent: true },
      // Renamed apps. The old ids are still the licence ids, so the gateway's
      // Stripe return URL (/apps/<product>/thanks) lands on these too.
      { source: '/:locale(en|fr)/apps/appscreens/:path*', destination: '/:locale/apps/shipscreen/:path*', permanent: true },
      { source: '/:locale(en|fr)/apps/blog-toolkit/:path*', destination: '/:locale/apps/publishkit/:path*', permanent: true },
      { source: '/:locale(en|fr)/apps/splitter/:path*', destination: '/:locale/apps/trackcut/:path*', permanent: true },
      { source: '/:locale(en|fr)/apps/small-video/:path*', destination: '/:locale/apps/polishcast/:path*', permanent: true },
      { source: '/:locale(en|fr)/apps/spreadwatch/:path*', destination: '/:locale/apps/spreadradar/:path*', permanent: true },
    ];
  },

  // Firebase's sign-in handler, served from our own domain so Google's consent
  // screen says "Sign in to mayorana.ch" rather than the project's
  // firebaseapp.com host. Pairs with authDomain in src/lib/firebase.ts.
  async rewrites() {
    return [
      { source: '/__/auth/:path*', destination: 'https://mayorana-7922a.firebaseapp.com/__/auth/:path*' },
      { source: '/__/firebase/:path*', destination: 'https://mayorana-7922a.firebaseapp.com/__/firebase/:path*' },
    ];
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
