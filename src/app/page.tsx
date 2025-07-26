import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

export default async function RootRedirectPage() {
  console.log('🏠 ROOT PAGE RUNNING - Middleware failed, using page redirect');

  try {
    // Get headers to detect language
    const headersList = await headers();
    const acceptLanguage = headersList.get('accept-language') || '';

    console.log('🌐 Detected Accept-Language:', acceptLanguage);

    // Determine locale
    const userLocale = acceptLanguage.toLowerCase().includes('fr') ? 'fr' : 'en';

    console.log('🎯 Redirecting to locale:', userLocale);

    // Server-side redirect to the locale-specific home page
    redirect(`/${userLocale}`);

  } catch (error) {
    console.error('❌ Root redirect error:', error);

    // Fallback to English if anything goes wrong
    redirect('/en');
  }

  // This should never render, but just in case:
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
        <p>Redirecting...</p>
      </div>
    </div>
  );
}
