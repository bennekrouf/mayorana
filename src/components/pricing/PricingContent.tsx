'use client';

// /pricing reads its query string: ?checkout=success&session_id=cs_… is the
// thank-you view Stripe returns to, and anything else is the plans.
//
// ?from=cvenom is a visitor sent by CVenom's studio to get credits. It is kept
// for the tab (Stripe's return URL is fixed and drops it), so they are told to
// subscribe with the email they use there, and the thank-you view takes them
// back to the studio, where the plan's credits now count.
//
// The query is read with useQuery (src/lib/use-query.ts), not
// useSearchParams: the page is prerendered with the plans in it, and
// useSearchParams would have React replace them all on hydration. The server
// and hydration render the plans; the thank-you view takes over right after,
// when the query asks for it.

import { useEffect, useSyncExternalStore } from 'react';
import { useQuery } from '@/lib/use-query';
import { useTranslations } from 'next-intl';
import { ArrowRight } from 'lucide-react';
import { PlanLicenceReveal } from './PlanLicenceReveal';
import { PlanPicker } from './PlanPicker';
import type { PlanCatalogue } from '@/lib/plans';

const FROM_KEY = 'mayorana_pricing_from';
const CVENOM_CREDITS_URL = 'https://studio.cvenom.com/credits?subscribed=1';

const subscribeNever = () => () => {};

function readStoredFrom(): string | null {
  try {
    return sessionStorage.getItem(FROM_KEY);
  } catch {
    return null; // storage blocked: the query alone decides
  }
}

// Remembered for the tab: the query says "from=cvenom" on arrival, the stored
// value carries it past Stripe's fixed return URL. Read through
// useSyncExternalStore (null on the server and in hydration) rather than
// copied into state from an effect.
function useFromCvenom(from: string | null): boolean {
  useEffect(() => {
    if (from !== 'cvenom') return;
    try {
      sessionStorage.setItem(FROM_KEY, 'cvenom');
    } catch {
      // storage blocked: the query still says it on this page
    }
  }, [from]);
  const stored = useSyncExternalStore(subscribeNever, readStoredFrom, () => null);
  return from === 'cvenom' || stored === 'cvenom';
}

type PricingProps = {
  contactHref: string;
  /** The plans fetched on the server, or null to fetch them in the browser. */
  plans: PlanCatalogue | null;
};

export function PricingContent(props: PricingProps) {
  return <PricingView {...props} query={useQuery()} />;
}

export function PricingView({
  contactHref,
  plans,
  query,
}: PricingProps & { query: Pick<URLSearchParams, 'get'> | null }) {
  const t = useTranslations('pricing');
  const fromCvenom = useFromCvenom(query?.get('from') ?? null);

  if (query?.get('checkout') === 'success') {
    return (
      <div className="max-w-3xl">
        <h1 className="text-3xl font-bold mb-6">{t('thanks_title')}</h1>
        {fromCvenom && (
          <a
            href={CVENOM_CREDITS_URL}
            className="mb-8 inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
          >
            {t('back_to_cvenom')}
            <ArrowRight className="w-4 h-4" />
          </a>
        )}
        <PlanLicenceReveal sessionId={query.get('session_id')} contactHref={contactHref} />
      </div>
    );
  }

  return (
    <>
      <div className="max-w-3xl mb-10">
        <div className="eyebrow text-primary mb-3">{t('eyebrow')}</div>
        <h1 className="text-4xl font-bold mb-4 text-balance">{t('title')}</h1>
        <p className="text-lg text-muted-foreground">{t('intro')}</p>
        {fromCvenom && (
          <p className="mt-4 rounded-lg border border-primary/40 bg-primary/5 p-4 text-sm">{t('from_cvenom_note')}</p>
        )}
      </div>
      <PlanPicker initial={plans} />
    </>
  );
}
