// File: src/app/stats/layout.tsx
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import '../globals.css';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

// Unlisted rather than secret — the page still asks for the admin key — but
// there is no reason for it to appear in search results, and the site already
// attracts crawlers that fetch download URLs.
export const metadata: Metadata = {
  title: 'Download statistics',
  robots: { index: false, follow: false, nocache: true },
};

// Outside [locale], so it renders its own document (see src/app/layout.tsx).
export default function StatsLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
