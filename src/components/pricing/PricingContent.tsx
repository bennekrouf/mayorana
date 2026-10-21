'use client';

// /pricing reads its query string: ?checkout=success&session_id=cs_… is the
// thank-you view Stripe returns to, ?app=<tool id> highlights the plans that
// make that tool Pro, and anything else is the plans.

import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { getToolBySlug } from '@/data/tools';
import { PlanLicenceReveal } from './PlanLicenceReveal';
import { PlanPicker } from './PlanPicker';

export function PricingContent({ contactHref }: { contactHref: string }) {
  const t = useTranslations('pricing');
  const params = useSearchParams();

  if (params.get('checkout') === 'success') {
    return (
      <div className="max-w-3xl">
        <h1 className="text-3xl font-bold mb-6">{t('thanks_title')}</h1>
        <PlanLicenceReveal sessionId={params.get('session_id')} contactHref={contactHref} />
      </div>
    );
  }

  const app = getToolBySlug(params.get('app') ?? '');
  const highlight = app?.pro ? app : undefined;
  return (
    <>
      <div className="max-w-3xl mb-10">
        <div className="eyebrow text-primary mb-3">{t('eyebrow')}</div>
        <h1 className="text-4xl font-bold mb-4">{t('title')}</h1>
        <p className="text-lg text-muted-foreground">
          {highlight ? t('intro_app', { name: highlight.name }) : t('intro')}
        </p>
      </div>
      <PlanPicker highlight={highlight} />
    </>
  );
}
