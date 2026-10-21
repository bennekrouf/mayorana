// The plans, and the page Stripe Checkout returns to: the store's
// PLANS_SITE_URL is https://mayorana.ch/pricing, so a finished checkout lands
// on /<locale>/pricing?checkout=success&session_id=cs_… and shows the licence
// number; a cancelled one lands back on the plans.
//
// The page itself is static; the plans and the licence are fetched in the
// browser, because the licence depends on the query string and must never be
// cached.

import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import LayoutTemplate from '@/components/layout/LayoutTemplate';
import { PricingContent } from '@/components/pricing/PricingContent';
import { buildMetadata } from '@/lib/seo';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata' });
  return buildMetadata({
    locale,
    path: '/pricing',
    title: t('pricing_title'),
    description: t('pricing_description'),
  });
}

export default async function PricingPage({ params }: Props) {
  const { locale } = await params;
  return (
    <LayoutTemplate>
      <section className="py-16 bg-gradient-to-b from-secondary to-background min-h-[60vh]">
        <div className="container max-w-6xl">
          <Suspense fallback={null}>
            <PricingContent contactHref={`/${locale}/contact`} />
          </Suspense>
        </div>
      </section>
    </LayoutTemplate>
  );
}
