// File: src/app/stats/layout.tsx
import type { Metadata } from 'next';

// Unlisted rather than secret — the page still asks for the admin key — but
// there is no reason for it to appear in search results, and the site already
// attracts crawlers that fetch download URLs.
export const metadata: Metadata = {
  title: 'Download statistics',
  robots: { index: false, follow: false, nocache: true },
};

export default function StatsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
