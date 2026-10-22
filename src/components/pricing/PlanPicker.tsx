'use client';

// The plans on sale, each with a Subscribe button. Subscribing needs a
// sign-in: the plan is kept under that sign-in's email, which is where the
// licence goes and how the subscriber later sees and cancels it, in the panel
// above the plans. A signed-out Subscribe asks them to sign in first, then
// carries on to Checkout.

import { Fragment, useEffect, useState } from 'react';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { FaGithub } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import { Check, Loader2, Sparkles, Star } from 'lucide-react';
import { appI18nKey, desktopToolsConfig, toolsForPlanProducts } from '@/data/tools';
import { useAuth, type SignInProvider } from '@/providers/AuthProvider';
import { ManageSubscription } from './ManageSubscription';
import {
  creditUses,
  fetchPlans,
  fetchSubscription,
  formatPlanPrice,
  openPortal,
  PLAN_GROUPS,
  planLogo,
  TRANSLATED_PLAN_DESCRIPTIONS,
  startCheckout,
  type Plan,
  type PlanCatalogue,
  type Subscription,
} from '@/lib/plans';

type Load = { kind: 'loading' } | ({ kind: 'ready' } & PlanCatalogue) | { kind: 'error' };
type SubLoad = { kind: 'loading' } | { kind: 'ready'; sub: Subscription | null } | { kind: 'error' };
type Problem = 'taken' | 'error' | null;

export function PlanPicker() {
  const t = useTranslations('pricing');
  const tAuth = useTranslations('auth');
  const locale = useLocale();
  const { enabled: authEnabled, user, loading: authLoading, signIn } = useAuth();
  const [load, setLoad] = useState<Load>({ kind: 'loading' });
  const [subLoad, setSubLoad] = useState<SubLoad>({ kind: 'loading' });
  const [busyPlan, setBusyPlan] = useState<string | null>(null);
  const [problem, setProblem] = useState<Problem>(null);
  /** The plan a signed-out visitor chose: they sign in, then it goes to Checkout. */
  const [signInFor, setSignInFor] = useState<Plan | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchPlans()
      .then((catalogue) => !cancelled && setLoad({ kind: 'ready', ...catalogue }))
      .catch(() => !cancelled && setLoad({ kind: 'error' }));
    return () => {
      cancelled = true;
    };
  }, []);

  // Whoever signs in sees their plan; signing out hides it.
  const uid = user?.uid ?? null;
  useEffect(() => {
    if (!uid) return;
    let cancelled = false;
    fetchSubscription()
      .then((sub) => !cancelled && setSubLoad({ kind: 'ready', sub }))
      .catch(() => !cancelled && setSubLoad({ kind: 'error' }));
    return () => {
      cancelled = true;
      setSubLoad({ kind: 'loading' });
    };
  }, [uid]);

  const sub = uid && subLoad.kind === 'ready' ? subLoad.sub : null;
  // A paid plan running now: the others are switched to on Stripe's portal,
  // as a second subscription would be refused.
  const runningPlan = sub && sub.live && !sub.is_free ? sub.plan_id : null;

  useEffect(() => {
    if (!signInFor) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSignInFor(null);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [signInFor]);

  async function subscribe(plan: Plan) {
    if (!user) {
      setSignInFor(plan);
      return;
    }
    setBusyPlan(plan.id);
    setProblem(null);
    const result = await startCheckout(plan.id);
    if (result.kind === 'redirect') {
      // Stays busy: the page is being left.
      window.location.assign(result.url);
      return;
    }
    setBusyPlan(null);
    if (result.kind === 'signed-out') {
      setSignInFor(plan);
      return;
    }
    setProblem(result.kind === 'taken' ? 'taken' : 'error');
  }

  async function signInThenSubscribe(provider: SignInProvider) {
    const plan = signInFor;
    if (!plan) return;
    const outcome = await signIn(provider);
    if (outcome !== 'signed-in') return;
    setSignInFor(null);
    // Already subscribed under this sign-in: show that rather than a refused Checkout.
    const current = await fetchSubscription().catch(() => null);
    if (current && current.live && !current.is_free) {
      setSubLoad({ kind: 'ready', sub: current });
      setProblem('taken');
      return;
    }
    await subscribe(plan);
  }

  async function switchPlan(plan: Plan) {
    setBusyPlan(plan.id);
    setProblem(null);
    try {
      window.location.assign(await openPortal());
    } catch {
      setBusyPlan(null);
      setProblem('error');
    }
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

  // Name, price, description, highlights, then each section's heading and
  // its apps, then the button.
  const cardRows = 5 + PLAN_GROUPS.reduce((n, group) => n + 1 + group.tools.length, 0);
  // The middle plan is the one we point people to.
  const featuredIndex = load.plans.length > 1 ? Math.floor(load.plans.length / 2) : -1;

  return (
    <div className="space-y-8">
      {sub && <ManageSubscription subscription={sub} onChange={(next) => setSubLoad({ kind: 'ready', sub: next })} />}
      {uid && subLoad.kind === 'error' && <p className="text-sm text-red-600">{t('sub_unavailable')}</p>}

      {!authLoading && (
        <p className="text-sm text-muted-foreground max-w-2xl">
          {user ? t('signed_in_note', { email: user.email ?? '' }) : t('sign_in_note')}
        </p>
      )}

      {signInFor && !user && (
        // Above the navbar; the account-linking dialog (z-70) can open on top of it.
        <div
          className="fixed inset-0 z-[65] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => setSignInFor(null)}
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="plan-sign-in"
            className="w-full max-w-md rounded-2xl border border-border bg-background shadow-2xl p-6 sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="plan-sign-in" className="text-xl font-bold leading-tight">
              {t('sign_in_title', { plan: signInFor.name })}
            </h2>
            <p className="mt-3 mb-6 text-sm text-muted-foreground leading-relaxed">{t('sign_in_body')}</p>
            {authEnabled ? (
              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => signInThenSubscribe('google')}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-border bg-background font-medium hover:bg-secondary transition-colors"
                >
                  <FcGoogle className="h-5 w-5" />
                  {tAuth('sign_in_google')}
                </button>
                <button
                  type="button"
                  onClick={() => signInThenSubscribe('github')}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-border bg-background font-medium hover:bg-secondary transition-colors"
                >
                  <FaGithub className="h-5 w-5" />
                  {tAuth('sign_in_github')}
                </button>
              </div>
            ) : (
              <p className="text-sm text-red-600">{t('checkout_error')}</p>
            )}
            <div className="mt-5 text-center">
              <button
                type="button"
                onClick={() => setSignInFor(null)}
                className="text-xs text-muted-foreground/80 hover:text-foreground underline underline-offset-2 transition-colors"
              >
                {tAuth('link_cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {problem === 'taken' && (
        <p className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-4 text-sm max-w-2xl">
          {t('already_subscribed')}
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
          const current = plan.id === runningPlan;
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
              <h2 className="flex items-center gap-3 text-xl font-bold">
                {planLogo(plan.id) && (
                  <Image src={planLogo(plan.id)!} alt="" width={36} height={36} unoptimized className="h-9 w-9" />
                )}
                {plan.name}
              </h2>
              <p className="pt-2">
                <span className="text-3xl font-semibold">{formatPlanPrice(plan, locale)}</span>
                <span className="text-muted-foreground"> {t('per_month')}</span>
              </p>
              <p className="text-sm text-muted-foreground pt-3">
                {TRANSLATED_PLAN_DESCRIPTIONS.has(plan.id) ? t(`plan_descriptions.${plan.id}`) : plan.description}
              </p>
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
                      {t('app_included', { name: tool.name })}
                    </li>
                  ))
                )}
              </ul>
              {PLAN_GROUPS.map((group, g) => (
                <Fragment key={group.key}>
                  <p
                    className={`${g === 0 ? 'mt-5' : 'mt-3'} border-t border-border pt-4 pb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground`}
                  >
                    {t(`groups.${group.key}`)}
                  </p>
                  {group.tools.map((id) => (
                    <AppRow
                      key={id}
                      toolId={id}
                      included={tools.some((tool) => tool.id === id) || id === 'publishkit'}
                      searches={desktopToolsConfig.find((tool) => tool.id === id)?.pro?.monthlySearches?.[plan.id]}
                      uses={uses.get(id)}
                    />
                  ))}
                </Fragment>
              ))}
              <div className="flex items-end pt-6">
                <button
                  type="button"
                  onClick={() => (runningPlan ? switchPlan(plan) : subscribe(plan))}
                  disabled={busyPlan !== null || current}
                  className={`w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg font-medium text-sm disabled:opacity-70 transition-colors ${
                    featured
                      ? 'bg-primary text-white hover:bg-primary/90'
                      : 'border border-primary text-primary hover:bg-primary/10'
                  }`}
                >
                  {busyPlan === plan.id && <Loader2 className="w-4 h-4 animate-spin" />}
                  {current ? t('current_plan') : runningPlan ? t('switch_plan') : t('subscribe')}
                </button>
              </div>
            </div>
          );
        })}
      </div>
      <div className="space-y-2 text-xs text-muted-foreground max-w-2xl">
        <p>{t('uses_note')}</p>
        <p>{t('fine_print')}</p>
      </div>
    </div>
  );
}

/**
 * One app on a plan card: what the plan gives in it. JobScout's searches are
 * set by the plan; PublishKit spends no credits; for the others, roughly what
 * a month's credits buy when spent on that app alone.
 */
function AppRow({
  toolId,
  included,
  searches,
  uses,
}: {
  toolId: string;
  included: boolean;
  searches: number | undefined;
  uses: number | undefined;
}) {
  const t = useTranslations('pricing');
  const tool = desktopToolsConfig.find((candidate) => candidate.id === toolId);
  // Kept as an empty row, so the apps stay level across the cards.
  if (!tool || !included) return <p className="pt-1.5 text-sm" aria-hidden />;
  const [mark, text] =
    searches !== undefined
      ? [<Check key="m" className="w-4 h-4 mt-0.5 shrink-0 text-primary" />, t('uses.jobscout', { count: searches })]
      : toolId === 'publishkit'
        ? [<Check key="m" className="w-4 h-4 mt-0.5 shrink-0 text-primary" />, t('uses.publishkit')]
        : uses !== undefined
          ? [<span key="m" className="w-4 shrink-0 text-center text-primary">~</span>, t(`uses.${appI18nKey[toolId]}`, { count: uses })]
          : [<Check key="m" className="w-4 h-4 mt-0.5 shrink-0 text-primary" />, t('app_included', { name: tool.name })];
  return (
    <p className="flex items-start gap-2 pt-1.5 text-sm text-muted-foreground">
      {mark}
      {text}
    </p>
  );
}
