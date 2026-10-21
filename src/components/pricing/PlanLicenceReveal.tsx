'use client';

// The thank-you view of /pricing. Stripe sends the subscriber back with
// ?checkout=success&session_id=cs_…; the gateway turns that into the plan's
// licence number. While Stripe is still confirming the payment it answers 202,
// and this asks again a few times before saying the licence will be emailed.

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Check, Copy, Loader2 } from 'lucide-react';
import { appI18nKey, toolsForPlanProducts } from '@/data/tools';
import { GATEWAY_URL } from '@/lib/gateway';
import type { PlanLicence } from '@/lib/plans';

type State =
  | { kind: 'loading' }
  | { kind: 'pending' }
  | { kind: 'emailed' }
  | { kind: 'ready'; licence: PlanLicence }
  | { kind: 'missing' }
  | { kind: 'error' };

const RETRY_MS = 2500;
const MAX_TRIES = 8; // 20 s: card payments settle in seconds; the email covers the rest

export function PlanLicenceReveal({ sessionId, contactHref }: { sessionId: string | null; contactHref: string }) {
  const t = useTranslations('pricing');
  const tApps = useTranslations('app_detail');
  const locale = useLocale();
  const validSession = !!sessionId && /^cs_[A-Za-z0-9_]+$/.test(sessionId);
  const [fetched, setState] = useState<State>({ kind: 'loading' });
  // A missing or malformed session id needs no request: it is known on render.
  const state: State = validSession ? fetched : { kind: 'missing' };
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!validSession) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    async function attempt(tries: number) {
      const again = (fallback: State) => {
        if (tries < MAX_TRIES) timer = setTimeout(() => attempt(tries + 1), RETRY_MS);
        else setState(fallback);
      };
      try {
        const response = await fetch(`${GATEWAY_URL}/api/plans/session/${encodeURIComponent(sessionId!)}`);
        const body = await response.json().catch(() => ({}));
        if (cancelled) return;
        if (response.status === 200 && typeof body.licence?.licence === 'string') {
          setState({ kind: 'ready', licence: body.licence as PlanLicence });
        } else if (response.status === 202) {
          setState({ kind: 'pending' });
          again({ kind: 'emailed' });
        } else if (response.status === 404 || response.status === 400) {
          setState({ kind: 'missing' });
        } else {
          setState({ kind: 'error' });
        }
      } catch {
        if (!cancelled) again({ kind: 'error' });
      }
    }

    attempt(0);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [sessionId, validSession]);

  async function copy(text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (state.kind === 'loading' || state.kind === 'pending') {
    return (
      <p className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="w-4 h-4 animate-spin" />
        {state.kind === 'loading' ? t('thanks_loading') : t('thanks_pending')}
      </p>
    );
  }

  if (state.kind === 'emailed') {
    return <p className="text-muted-foreground leading-relaxed">{t('thanks_emailed')}</p>;
  }

  if (state.kind !== 'ready') {
    return (
      <p className="text-muted-foreground leading-relaxed">
        {state.kind === 'missing' ? t('thanks_missing') : t('thanks_error')}{' '}
        <a href={contactHref} className="text-primary hover:underline underline-offset-4">
          {t('thanks_contact')}
        </a>
      </p>
    );
  }

  const { licence } = state;
  const tools = toolsForPlanProducts(licence.products);
  const renews = new Intl.DateTimeFormat(locale, { dateStyle: 'long' }).format(new Date(licence.period_end));
  return (
    <div className="space-y-6">
      <p className="text-muted-foreground leading-relaxed">
        {t('thanks_intro', { plan: licence.plan_name, email: licence.email })}
      </p>
      <div className="rounded-xl border border-border bg-secondary/40 p-4">
        <div className="text-xs text-muted-foreground mb-2">{t('thanks_licence_label')}</div>
        <code className="block font-mono text-sm break-all select-all">{licence.licence}</code>
        <button
          type="button"
          onClick={() => copy(licence.licence)}
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? t('thanks_copied') : t('thanks_copy')}
        </button>
      </div>
      <p className="text-sm text-muted-foreground">
        {t('thanks_credits', { count: licence.credits_left, date: renews })}
      </p>
      <div>
        <h2 className="text-lg font-semibold mb-3">{t('thanks_how_heading')}</h2>
        <ul className="space-y-3 text-sm text-muted-foreground leading-relaxed">
          {tools.map((tool) => (
            <li key={tool.id}>
              <span className="font-medium text-foreground">{tool.name}</span>
              {' — '}
              {tApps(`apps.${appI18nKey[tool.id]}.pro_how`)}
            </li>
          ))}
        </ul>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">{t('thanks_manage')}</p>
    </div>
  );
}
