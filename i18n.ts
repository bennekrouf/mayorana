// Simplified i18n - bypass automatic detection, handle manually
// File: i18n.ts

import { getRequestConfig } from 'next-intl/server';

export const locales = ['en', 'fr'] as const;
export const defaultLocale = 'en' as const;

export default getRequestConfig(async ({ requestLocale }) => {
  // Since we don't have middleware, requestLocale will always be undefined
  // We'll handle locale detection manually in our components
  let locale = await requestLocale;

  console.log('🌍 i18n - requestLocale (will be undefined):', locale);

  // Always default to English for i18n config
  // The actual locale will be handled by our components directly
  locale = defaultLocale;

  console.log('🔄 Using default locale for i18n config:', locale);

  try {
    const messages = (await import(`./messages/${locale}.json`)).default;
    console.log('✅ Messages loaded for default locale:', locale);

    return {
      locale,
      messages
    };
  } catch (error) {
    console.error('❌ Error loading messages:', error);
    return {
      locale: 'en',
      messages: {}
    };
  }
});
