import { getRequestConfig } from 'next-intl/server';

// Can be imported from a shared config
export const locales = ['en', 'fr'] as const;
export const defaultLocale = 'en' as const;

export default getRequestConfig(async ({ requestLocale }) => {
  // Ensure that the incoming `locale` is valid
  let locale = await requestLocale;

  // Debug logging for production
  // console.log('i18n config - requested locale:', locale);

  if (!locale || !locales.includes(locale as any)) {
    console.log('Invalid locale, using default:', defaultLocale);
    locale = defaultLocale;
  }

  try {
    const messages = (await import(`./messages/${locale}.json`)).default;
    // console.log('Loaded messages for locale:', locale);

    return {
      locale,
      messages
    };
  } catch (error) {
    console.error('Error loading messages for locale:', locale, error);

    // Fallback to English if the requested locale messages don't exist
    try {
      const fallbackMessages = (await import(`./messages/en.json`)).default;
      return {
        locale: 'en',
        messages: fallbackMessages
      };
    } catch (fallbackError) {
      console.error('Error loading fallback messages:', fallbackError);
      return {
        locale: 'en',
        messages: {}
      };
    }
  }
});
