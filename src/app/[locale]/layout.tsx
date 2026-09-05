// Fixed locale layout for Next.js 15
// File: src/app/[locale]/layout.tsx

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import Script from "next/script";
import { ThemeProvider } from "../providers";
import { NextIntlClientProvider } from 'next-intl';
import { getTranslations } from 'next-intl/server';
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
  // console.log('🔍 generateStaticParams called with locales:', locales);
  return locales.map((locale) => ({ locale }));
}

import { headers } from 'next/headers';
import { HostProvider } from '@/providers/HostProvider';

export default async function LocaleLayout({
  children,
  params
}: Props) {
  const { locale } = await params;
  const headersList = await headers();
  const hostname = headersList.get('x-hostname') || '';
  const isSwissRust = hostname.includes('swissrust');

  // console.log('🔍 LocaleLayout - received locale:', locale);

  // Validate locale
  if (!locales.includes(locale as (typeof locales)[number])) {
    console.log('❌ LocaleLayout - Invalid locale');
    notFound();
  }

  // console.log('✅ LocaleLayout - Valid locale confirmed:', locale);

  // MANUAL: Load messages for the specific locale from the route
  let messages;
  try {
    if (locale === 'fr') {
      messages = (await import('../../../messages/fr.json')).default;
    } else {
      messages = (await import('../../../messages/en.json')).default;
    }
    // console.log('✅ LocaleLayout - Messages loaded manually for:', locale);
  } catch (error) {
    console.error('❌ Error loading messages manually:', error);
    // Fallback to English
    messages = (await import('../../../messages/en.json')).default;
  }

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Script
          src="https://plausible.io/js/script.outbound-links.js"
          data-domain="mayorana.ch"
          strategy="afterInteractive"
        />
        <Script id="plausible-setup" strategy="afterInteractive">
          {`
            window.plausible = window.plausible || function() { 
              (window.plausible.q = window.plausible.q || []).push(arguments) 
            }
          `}
        </Script>
        {/* Plain script tag rather than next/script: next/script pushes its
            content into a client-side queue, so the JSON-LD never appears in
            the served HTML as structured data a crawler can read. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Mayorana',
              alternateName: 'Mayorana Sàrl',
              url: 'https://mayorana.ch',
              logo: 'https://mayorana.ch/image/logo.png',
              description: 'Swiss consultancy specializing in Rust, AI agents, and API solutions.',
              foundingLocation: {
                '@type': 'Place',
                address: {
                  '@type': 'PostalAddress',
                  addressCountry: 'CH',
                },
              },
              // sameAs is for profiles on *other* sites — pointing it back at
              // mayorana.ch told search engines nothing. The GitHub org hosts
              // the source for every tool, which is a real entity link.
              sameAs: ['https://github.com/bennekrouf'],
            }),
          }}
        />
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <HostProvider isSwissRust={isSwissRust}>
              {children}
            </HostProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
