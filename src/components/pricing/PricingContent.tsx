'use client';

// /pricing reads its query string: ?checkout=success&session_id=cs_… is the
// thank-you view Stripe returns to, and anything else is the plans.
//
// ?from=cvenom is a visitor sent by CVenom's studio to get credits. It is kept
// for the tab (Stripe's return URL is fixed and drops it), so they are told to
// subscribe with the email they use there, and the thank-you view takes them
// back to the studio, where the plan's credits now count.

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ArrowRight } from 'lucide-react';
import { PlanLicenceReveal } from './PlanLicenceReveal';
import { PlanPicker } from './PlanPicker';

const FROM_KEY = 'mayorana_pricing_from';
const CVENOM_CREDITS_URL = 'https://studio.cvenom.com/credits?subscribed=1';

function useFromCvenom(from: string | null): boolean {
  const [fromCvenom, setFromCvenom] = useState(false);
  useEffect(() => {
    try {
      if (from === 'cvenom') sessionStorage.setItem(FROM_KEY, 'cvenom');
      setFromCvenom(sessionStorage.getItem(FROM_KEY) === 'cvenom');
    } catch {
      setFromCvenom(from === 'cvenom');
    }
  }, [from]);
  return fromCvenom;
}

export function PricingContent({ contactHref }: { contactHref: string }) {
  const t = useTranslations('pricing');
  const params = useSearchParams();
  const fromCvenom = useFromCvenom(params.get('from'));

  if (params.get('checkout') === 'success') {
    return (
      <div className="max-w-3xl">
        <h1 className="text-3xl font-bold mb-6">{t('thanks_title')}</h1>
        {fromCvenom && (
          <a
            href={CVENOM_CREDITS_URL}
            className="mb-8 inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition-colors"
          >
            {t('back_to_cvenom')}
            <ArrowRight className="w-4 h-4" />
          </a>
        )}
        <PlanLicenceReveal sessionId={params.get('session_id')} contactHref={contactHref} />
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
      <PlanPicker />
    </>
  );
}
