'use client';

// The plans on sale, an email field and a Subscribe button on each plan. No
// sign-in: the email is where the licence goes.

import { useEffect, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Check, Loader2, Sparkles } from 'lucide-react';
import { appI18nKey, toolsForPlanProducts } from '@/data/tools';
import {
  creditUses,
  fetchPlans,
  formatPlanPrice,
  plausibleEmail,
  startCheckout,
  type Plan,
  type PlanCatalogue,
} from '@/lib/plans';

type Load = { kind: 'loading' } | ({ kind: 'ready' } & PlanCatalogue) | { kind: 'error' };
type Problem = 'email' | 'taken' | 'error' | null;

export function PlanPicker() {
  const t = useTranslations('pricing');
  const locale = useLocale();
  const [load, setLoad] = useState<Load>({ kind: 'loading' });
  const [email, setEmail] = useState('');
  const [busyPlan, setBusyPlan] = useState<string | null>(null);
  const [problem, setProblem] = useState<Problem>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    fetchPlans()
      .then((catalogue) => !cancelled && setLoad({ kind: 'ready', ...catalogue }))
      .catch(() => !cancelled && setLoad({ kind: 'error' }));
    return () => {
      cancelled = true;
    };
  }, []);

  async function subscribe(plan: Plan) {
    if (!plausibleEmail(email)) {
      setProblem('email');
      emailRef.current?.focus();
      return;
    }
    setBusyPlan(plan.id);
    setProblem(null);
    const result = await startCheckout(plan.id, email.trim());
    if (result.kind === 'redirect') {
      // Stays busy: the page is being left.
      window.location.assign(result.url);
      return;
    }
    setBusyPlan(null);
    setProblem(result.kind === 'taken' ? 'taken' : 'error');
  }

  if (load.kind === 'loading') {
    return (
      <p className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="w-4 h-4 animate-spin" />
        {t('loading')}
      </p>
    );
  }
  if (load.kind === 'error' || load.plans.length === 0) {
    return <p className="text-muted-foreground">{t('unavailable')}</p>;
  }

  return (
    <div className="space-y-8">
      <div className="max-w-md">
        <label htmlFor="plan-email" className="block text-sm font-medium mb-2">
          {t('email_label')}
        </label>
        <input
          id="plan-email"
          ref={emailRef}
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (problem === 'email' || problem === 'taken') setProblem(null);
          }}
          placeholder={t('email_placeholder')}
          aria-invalid={problem === 'email'}
          className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <p className="text-xs text-muted-foreground mt-2">{t('email_note')}</p>
        {problem === 'email' && <p className="text-sm text-red-600 mt-2">{t('email_invalid')}</p>}
      </div>

      {problem === 'taken' && (
        <p className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-4 text-sm">
          {t('already_subscribed', { email: email.trim() })}
        </p>
      )}
      {problem === 'error' && <p className="text-sm text-red-600">{t('checkout_error')}</p>}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {load.plans.map((plan) => {
          const tools = toolsForPlanProducts(plan.products);
          const uses = creditUses(plan.monthly_credits, load.appUses);
          return (
            <div key={plan.id} className="flex flex-col rounded-xl border border-border p-6 bg-background">
              <h2 className="text-xl font-bold">{plan.name}</h2>
              <p className="mt-2">
                <span className="text-3xl font-semibold">{formatPlanPrice(plan, locale)}</span>
                <span className="text-muted-foreground"> {t('per_month')}</span>
              </p>
              {plan.description && <p className="text-sm text-muted-foreground mt-3">{plan.description}</p>}
              <ul className="mt-5 space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <Sparkles className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
                  {t('credits', { count: plan.monthly_credits })}
                </li>
                {plan.products.includes('*') ? (
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
                    {t('all_apps')}
                  </li>
                ) : (
                  tools.map((tool) => (
                    <li key={tool.id} className="flex items-start gap-2">
                      <Check className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
                      {t('app_pro', { name: tool.name })}
                    </li>
                  ))
                )}
              </ul>
              {uses.length > 0 && (
                <div className="mt-5 flex-1 border-t border-border pt-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">
                    {t('uses_heading')}
                  </p>
                  <ul className="space-y-1.5 text-sm">
                    {uses.map(({ tool, count }) => (
                      <li key={tool} className="flex items-start gap-2 text-muted-foreground">
                        <span className="w-4 shrink-0 text-center text-primary">~</span>
                        {t(`uses.${appI18nKey[tool]}`, { count })}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <button
                type="button"
                onClick={() => subscribe(plan)}
                disabled={busyPlan !== null}
                className="mt-6 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-primary text-white font-medium text-sm hover:bg-primary/90 disabled:opacity-70 transition-colors"
              >
                {busyPlan === plan.id && <Loader2 className="w-4 h-4 animate-spin" />}
                {t('subscribe')}
              </button>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground max-w-2xl">{t('fine_print')}</p>
    </div>
  );
}
