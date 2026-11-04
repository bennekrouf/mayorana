// swissrust.ch: the Rust half of the blog under its own name. The middleware
// rewrites every swissrust.ch request into this segment, which is how the
// navbar and footer know which site they are on. Knowing it from the route,
// rather than from the Host header, keeps every page here prerenderable.
//
// The pages below share mayorana.ch's blog pages, filtered to posts tagged
// `rust` (rustOnly in src/lib/blog.ts): listing, posts and tags. Canonicals still
// point at mayorana.ch, so the two sites never compete in search.

import type { Metadata } from 'next';
import { HostProvider } from '@/providers/HostProvider';

// The crab-and-knife logo as the tab icon and home-screen icon. /favicon.ico
// and /site.webmanifest are swapped for Swiss Rust's in src/middleware.ts.
export const metadata: Metadata = {
  icons: {
    icon: [{ url: '/swissrust/icon.svg', type: 'image/svg+xml' }],
    apple: [{ url: '/swissrust/apple-touch-icon.png', sizes: '180x180' }],
  },
};

export default function SwissRustLayout({ children }: { children: React.ReactNode }) {
  return <HostProvider isSwissRust>{children}</HostProvider>;
}
