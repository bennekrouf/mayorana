// Where Stripe Checkout sends a buyer back to, with ?session_id=cs_…
//
// Only tools sold with a paid edition (`pro` in src/data/tools.ts) have one.
// The page itself is static; the key is fetched in the browser, because it
// depends on the session id in the query string and must never be cached.

import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { ArrowLeft } from 'lucide-react';
import LayoutTemplate from '@/components/layout/LayoutTemplate';
import { LicenceReveal } from '@/components/ui/LicenceReveal';
import { appI18nKey, getToolBySlug, toolSlugs } from '@/data/tools';
import { locales } from '../../../../../../i18n';

type Props = { params: Promise<{ locale: string; slug: string }> };

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    toolSlugs.filter((slug) => getToolBySlug(slug)?.pro).map((slug) => ({ locale, slug })),
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const tool = getToolBySlug(slug);
  const t = await getTranslations({ locale, namespace: 'app_detail' });
  return {
    title: tool ? t('thanks_title', { name: tool.name }) : 'Not found',
    // A receipt, not a page to find: nothing here is useful without a session id.
    robots: { index: false, follow: false },
  };
}

export default async function ThanksPage({ params }: Props) {
  const { locale, slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool?.pro) notFound();
  const t = await getTranslations({ locale, namespace: 'app_detail' });

  return (
    <LayoutTemplate>
      <section className="py-16 bg-gradient-to-b from-secondary to-background min-h-[60vh]">
        <div className="container max-w-3xl">
          <Link
            href={`/${locale}/apps/${slug}`}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            {tool.name}
          </Link>
          <h1 className="text-3xl font-bold mb-6">{t('thanks_title', { name: tool.name })}</h1>
          <Suspense fallback={null}>
            <LicenceReveal
              contactHref={`/${locale}/contact`}
              how={t(`apps.${appI18nKey[tool.id]}.pro_how`)}
            />
          </Suspense>
        </div>
      </section>
    </LayoutTemplate>
  );
}
