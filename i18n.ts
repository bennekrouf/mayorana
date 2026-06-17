// Simplified i18n - bypass automatic detection, handle manually
// File: i18n.ts

import { getRequestConfig } from 'next-intl/server';

export const locales = ['en', 'fr'] as const;
export const defaultLocale = 'en' as const;

type Locale = (typeof locales)[number];

function isLocale(value: string | undefined | null): value is Locale {
  return value === 'en' || value === 'fr';
}

// Server components MUST pass explicit { locale } to getTranslations({ locale, namespace }),
// because this default config can't reliably resolve locale from the URL.
// Without middleware-provided requestLocale, anything that omits the locale arg falls back to 'en'.
export default getRequestConfig(async ({ requestLocale }) => {
  const fromRequest = await requestLocale;
  const locale: Locale = isLocale(fromRequest) ? fromRequest : defaultLocale;

  try {
    const messages = (await import(`./messages/${locale}.json`)).default;
    return { locale, messages };
  } catch (error) {
    console.error('❌ Error loading messages for locale', locale, error);
    return { locale: 'en', messages: {} };
  }
});
