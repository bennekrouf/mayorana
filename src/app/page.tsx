import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

export default async function RootRedirectPage() {
  // console.log('🏠 ROOT PAGE RUNNING - Middleware failed, using page redirect');

  let targetLocale = 'en';

  try {
    // Get headers to detect language
    const headersList = await headers();
    const acceptLanguage = headersList.get('accept-language') || '';

    // console.log('🌐 Detected Accept-Language:', acceptLanguage);

    // Determine locale
    if (acceptLanguage.toLowerCase().includes('fr')) {
      targetLocale = 'fr';
    }

    // console.log('🎯 Redirecting to locale:', targetLocale);

  } catch (error) {
    console.error('❌ Root redirect error:', error);
    // Fallback to English if anything goes wrong
    targetLocale = 'en';
  }

  // Server-side redirect to the locale-specific home page
  // This must be outside the try/catch block to avoid catching NEXT_REDIRECT error
  redirect(`/${targetLocale}`);
}
