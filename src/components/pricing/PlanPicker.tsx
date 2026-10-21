'use client';

// The plans on sale, an email field and a Subscribe button on each plan. No
// sign-in: the email is where the licence goes.

import { useEffect, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Check, Loader2, Sparkles, Star } from 'lucide-react';
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

  // Every app any plan buys uses of, so the same app sits on the same row in
  // every card (blank where a plan's credits buy none).
  const useRows = Array.from(
    new Set(load.plans.flatMap((plan) => creditUses(plan.monthly_credits, load.appUses).map((u) => u.tool))),
  );
  // Name, price, description, highlights, then the uses heading and one row per
  // app, then the button.
  const cardRows = 5 + (useRows.length > 0 ? 1 + useRows.length : 0);
  // The middle plan is the one we point people to.
  const featuredIndex = load.plans.length > 1 ? Math.floor(load.plans.length / 2) : -1;

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

      {/* Each card is a subgrid spanning the same rows, so price, lists and
          button sit at the same height in every card whatever wraps. */}
      <div className="grid gap-x-6 gap-y-0 md:grid-cols-2 lg:grid-cols-3">
        {load.plans.map((plan, index) => {
          const tools = toolsForPlanProducts(plan.products);
          const uses = new Map(creditUses(plan.monthly_credits, load.appUses).map((u) => [u.tool, u.count]));
          const featured = index === featuredIndex;
          return (
            <div
              key={plan.id}
              style={{ gridRow: `span ${cardRows}` }}
              className={`relative mb-8 grid grid-rows-subgrid rounded-xl border p-6 ${
                featured
                  ? 'border-primary bg-primary/5 ring-1 ring-primary shadow-lg shadow-primary/10'
                  : 'border-border bg-background'
              }`}
            >
              {featured && (
                <span className="absolute -top-3 left-6 inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                  <Star className="w-3 h-3 fill-current" />
                  {t('most_popular')}
                </span>
              )}
              <h2 className="text-xl font-bold">{plan.name}</h2>
              <p className="pt-2">
                <span className="text-3xl font-semibold">{formatPlanPrice(plan, locale)}</span>
                <span className="text-muted-foreground"> {t('per_month')}</span>
              </p>
              <p className="text-sm text-muted-foreground pt-3">{plan.description}</p>
              <ul className="pt-5 space-y-2 text-sm">
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
              {useRows.length > 0 && (
                <p className="mt-5 border-t border-border pt-4 pb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {t('uses_heading')}
                </p>
              )}
              {useRows.map((tool) => {
                const count = uses.get(tool);
                return (
                  <p key={tool} className="flex items-start gap-2 pt-1.5 text-sm text-muted-foreground">
                    {count !== undefined && (
                      <>
                        <span className="w-4 shrink-0 text-center text-primary">~</span>
                        {t(`uses.${appI18nKey[tool]}`, { count })}
                      </>
                    )}
                  </p>
                );
              })}
              <div className="flex items-end pt-6">
                <button
                  type="button"
                  onClick={() => subscribe(plan)}
                  disabled={busyPlan !== null}
                  className={`w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg font-medium text-sm disabled:opacity-70 transition-colors ${
                    featured
                      ? 'bg-primary text-white hover:bg-primary/90'
                      : 'border border-primary text-primary hover:bg-primary/10'
                  }`}
                >
                  {busyPlan === plan.id && <Loader2 className="w-4 h-4 animate-spin" />}
                  {t('subscribe')}
                </button>
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground max-w-2xl">{t('fine_print')}</p>
    </div>
  );
}
