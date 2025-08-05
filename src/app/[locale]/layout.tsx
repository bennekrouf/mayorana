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
import CanonicalMeta from '@/components/seo/CanonicalMeta';

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

  // DEBUG: Log locale in metadata generation
  // console.log('🔍 Metadata generation - locale:', locale);

  const t = await getTranslations({ locale, namespace: 'metadata' });

  return {
    title: {
      template: '%s | Mayorana',
      default: t('site_title'),
    },
    description: t('site_description'),
  };
}

export function generateStaticParams() {
  // console.log('🔍 generateStaticParams called with locales:', locales);
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params
}: Props) {
  const { locale } = await params;

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
        {/* MANUAL: Pass the route locale directly */}
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <CanonicalMeta />
            {children}
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
