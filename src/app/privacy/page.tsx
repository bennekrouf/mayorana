// File: src/app/privacy/page.tsx
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

export default async function PrivacyRedirect() {
  // Get headers to detect language
  const headersList = await headers();
  const acceptLanguage = headersList.get('accept-language') || '';

  // Determine locale
  const userLocale = acceptLanguage.toLowerCase().includes('fr') ? 'fr' : 'en';

  // Redirect to the localized version
  redirect(`/${userLocale}/privacy`);
}
