// Fixed not-found page with locale awareness
// File: src/app/[locale]/not-found.tsx

'use client';

import Link from 'next/link';
import LayoutTemplate from '@/components/layout/LayoutTemplate';
import { useTranslations, useLocale } from 'next-intl';

// Define supported locales
type SupportedLocale = 'en' | 'fr';

export default function NotFound() {
  const t = useTranslations('common');
  const locale = useLocale() as SupportedLocale;

  console.log('🔍 404 Page - Current locale:', locale);

  return (
    <LayoutTemplate>
      <div className="min-h-[50vh] flex flex-col items-center justify-center py-20">
        <div className="container text-center">
          <h1 className="text-6xl font-bold mb-6">404</h1>
          <h2 className="text-2xl font-semibold mb-6">{t('page_not_found')}</h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            {t('not_found_description')}
          </p>
          <Link
            href={`/${locale}`}
            className="inline-flex items-center px-6 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition-colors"
          >
            {t('return_home')}
          </Link>

          {/* Debug info in development */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 text-xs text-muted-foreground">
              Debug: Will redirect to /{locale} (current locale: {locale})
            </div>
          )}
        </div>
      </div>
    </LayoutTemplate>
  );
}
