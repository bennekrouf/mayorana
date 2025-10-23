import React from 'react';
import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import Navbar from './Navbar';
import Footer from './Footer';
import { ThemeProvider } from '@/components/ThemeProvider';

// Dynamic imports for performance
const WhatsAppButton = dynamic(() => import('@/components/ui/WhatsAppButton'), {
  ssr: false
});

interface LayoutProps {
  children: React.ReactNode;
  locale: string;
  t: (key: string) => string;
  metadata?: {
    title?: string;
    description?: string;
    openGraph?: {
      title?: string;
      description?: string;
      url?: string;
      siteName?: string;
      images?: Array<{
        url: string;
        width: number;
        height: number;
        alt: string;
      }>;
      locale?: string;
      type?: string;
    };
    twitter?: {
      card?: string;
      title?: string;
      description?: string;
      images?: string[];
    };
  };
}

export default function Layout({ children }: LayoutProps) {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background text-foreground">
        {/* Navigation */}
        <Navbar />

        {/* Main Content */}
        <main className="pt-16">
          {children}
        </main>

        {/* Footer */}
        <Footer />

        {/* WhatsApp Button */}
        <WhatsAppButton />
      </div>
    </ThemeProvider>
  );
}

// Helper function to generate metadata for portfolio-focused pages
export function generatePortfolioMetadata(
  locale: string,
  // t: (key: string) => string,
  overrides: Partial<LayoutProps['metadata']> = {}
): Metadata {
  const defaultTitle = "AI Tools That Actually Work—Built Solo";
  const defaultDescription = "Live AI tools powered by Rust + AI tech. Portfolio: api0.ai | cVenom | Solanize";
  const siteUrl = 'https://mayorana.ch';

  return {
    title: overrides.title || defaultTitle,
    description: overrides.description || defaultDescription,
    keywords: [
      'AI tools',
      'Rust development',
      'API automation',
      'Solanize',
      'api0.ai',
      'cVenom',
      'NLP routing',
      'Solana DeFi',
      'resume optimization',
      'AI consulting',
      'solo developer',
      'live portfolio'
    ],
    authors: [{ name: 'Mayorana' }],
    creator: 'Mayorana',
    publisher: 'Mayorana',
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      type: 'website',
      locale: locale,
      url: siteUrl,
      siteName: 'Mayorana - AI Tools Portfolio',
      title: overrides.openGraph?.title || defaultTitle,
      description: overrides.openGraph?.description || defaultDescription,
      images: [
        {
          url: `${siteUrl}/portfolio-preview.jpg`,
          width: 1200,
          height: 630,
          alt: 'Mayorana AI Tools Portfolio - Solanize, API0.AI, cVenom',
        },
        ...(overrides.openGraph?.images || [])
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: overrides.twitter?.title || defaultTitle,
      description: overrides.twitter?.description || defaultDescription,
      images: [`${siteUrl}/portfolio-preview.jpg`],
      creator: '@mayorana_dev',
    },
    alternates: {
      canonical: siteUrl,
      languages: {
        'en': `${siteUrl}/en`,
        'fr': `${siteUrl}/fr`,
      },
    },
    verification: {
      google: 'your-google-site-verification-code',
    },
    ...overrides
  };
}

// Portfolio-specific layout variants
export function PortfolioLayout({
  children,
  locale,
  t,
  tool
}: LayoutProps & {
  tool?: 'solanize' | 'api0' | 'cvenom'
}) {
  // Add tool-specific metadata and styling
  const toolMetadata = tool ? {
    title: `${tool.toUpperCase()} - AI Tools That Actually Work—Built Solo`,
    description: `${tool.toUpperCase()} - Live AI tool powered by Rust + AI tech`
  } : {};

  return (
    <Layout locale={locale} t={t} metadata={toolMetadata}>
      {tool && (
        <div className="bg-primary/5 border-b border-primary/10">
          <div className="container mx-auto px-4 py-2">
            <div className="flex items-center justify-center gap-2 text-sm">
              <span className="text-primary font-medium">
                🚀 Live Tool:
              </span>
              <span className="text-foreground">
                {tool.toUpperCase()} - Portfolio AI tool powered by Rust
              </span>
            </div>
          </div>
        </div>
      )}
      {children}
    </Layout>
  );
}
