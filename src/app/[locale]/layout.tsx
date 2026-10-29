// Fixed locale layout for Next.js 15
// File: src/app/[locale]/layout.tsx

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { ThemeProvider } from "../providers";
import { NextIntlClientProvider } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { locales } from '../../../i18n';
import { notFound } from 'next/navigation';
import { buildMetadata } from '@/lib/seo';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata' });

  // This is the home page's own metadata as well as the fallback for any
  // segment below that does not set its own. buildMetadata sets titles
  // absolutely, so there is no '%s | Mayorana' template to inherit — every
  // page builds its full title through the same helper instead.
  return buildMetadata({
    locale,
    path: '',
    title: t('site_title'),
    description: t('site_description'),
  });
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

import { AuthProvider } from '@/providers/AuthProvider';
import { DownloadGateProvider } from '@/providers/DownloadGateProvider';
import { ReadProgressProvider } from '@/providers/ReadProgressProvider';

export default async function LocaleLayout({
  children,
  params
}: Props) {
  // No headers() here: reading the request would make every page below
  // dynamic. swissrust.ch is told apart by its own route segment instead
  // (see swissrust/layout.tsx); everywhere else HostProvider's default is
  // mayorana.ch.
  const { locale } = await params;

  // Validate locale
  if (!locales.includes(locale as (typeof locales)[number])) {
    notFound();
  }

  // Lets next-intl calls below that pass no locale find it without reading
  // the request, which would make the page dynamic.
  setRequestLocale(locale);

  // MANUAL: Load messages for the specific locale from the route
  let messages;
  try {
    if (locale === 'fr') {
      messages = (await import('../../../messages/fr.json')).default;
    } else {
      messages = (await import('../../../messages/en.json')).default;
    }
  } catch (error) {
    console.error('❌ Error loading messages manually:', error);
    // Fallback to English
    messages = (await import('../../../messages/en.json')).default;
  }

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* Plain script tag rather than next/script: next/script pushes its
            content into a client-side queue, so the JSON-LD never appears in
            the served HTML as structured data a crawler can read. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              '@id': 'https://mayorana.ch/#organization',
              name: 'Mayorana',
              alternateName: 'Mayorana Sàrl',
              url: 'https://mayorana.ch',
              logo: 'https://mayorana.ch/image/logo.png',
              description: 'Swiss company building api0, the Rust MCP gateway for AI agents, and native Rust developer tools.',
              foundingLocation: {
                '@type': 'Place',
                address: {
                  '@type': 'PostalAddress',
                  addressCountry: 'CH',
                },
              },
              // sameAs is for profiles on *other* sites — pointing it back at
              // mayorana.ch told search engines nothing. The company page on
              // LinkedIn, and the GitHub account that hosts every tool's source.
              sameAs: ['https://www.linkedin.com/company/mayorana', 'https://github.com/bennekrouf'],
            }),
          }}
        />
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <AuthProvider>
              <DownloadGateProvider>
                <ReadProgressProvider>
                  {children}
                </ReadProgressProvider>
              </DownloadGateProvider>
            </AuthProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
