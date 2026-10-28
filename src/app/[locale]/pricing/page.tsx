// The plans, and the page Stripe Checkout returns to: the store's
// PLANS_SITE_URL is https://mayorana.ch/pricing, so a finished checkout lands
// on /<locale>/pricing?checkout=success&session_id=cs_… and shows the licence
// number; a cancelled one lands back on the plans.
//
// The page itself is static. The plans are fetched here, at build time and
// again at most hourly, so they are in the served HTML for visitors and
// crawlers alike; the licence is fetched in the browser, because it depends on
// the query string and must never be cached.

import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import LayoutTemplate from '@/components/layout/LayoutTemplate';
import { PricingContent } from '@/components/pricing/PricingContent';
import { fetchPlans } from '@/lib/plans';
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
  const contactHref = `/${locale}/contact`;
  // A gateway outage at build time must not fail the build: PlanPicker then
  // fetches the plans in the browser, as it used to.
  const plans = await fetchPlans({ next: { revalidate: 3600 } }).catch(() => null);
  return (
    <LayoutTemplate>
      <section className="py-16 bg-gradient-to-b from-secondary to-background min-h-[60vh]">
        <div className="container max-w-6xl">
          <PricingContent contactHref={contactHref} plans={plans} />
        </div>
      </section>
    </LayoutTemplate>
  );
}
