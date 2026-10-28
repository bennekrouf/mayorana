// Plans: the only thing on sale. Each unlocks the apps it lists and brings
// a monthly allowance of AI credits. The gateway knows them all; this site
// shows them, starts a Stripe Checkout for one, and lets a subscriber see and
// cancel theirs. Subscribing needs a sign-in: the plan is kept under the email
// of that sign-in, and the same sign-in manages it later.
//
//   GET  /api/plans                the plans on sale, and what one use of each
//                                  app's AI costs in credits (both set by the
//                                  super admin in the api0 dashboard)
//   GET  /api/plans/session/<cs>   the licence a finished Checkout bought:
//                                  200 { licence }, or 202 while Stripe settles
//
// Signed in (the Firebase token, via gatewayFetch):
//   POST /api/plans/checkout       { plan_id } → { url } of Stripe Checkout
//   GET  /api/plans/subscription   their plan, licence and credits, or null
//   POST /api/plans/portal         → { url } of Stripe's page for card and invoices
//   POST /api/plans/cancel|resume  cancel at the end of the paid month, or take
//                                  that back → { subscription }
//
// Stripe sends the buyer back to /pricing?checkout=success&session_id=cs_…,
// which is what the store's PLANS_SITE_URL points at (https://mayorana.ch/pricing;
// the middleware adds the visitor's locale and keeps the query).

import { GATEWAY_URL, GatewayError, gatewayFetch } from './gateway';
import { desktopToolsConfig } from '@/data/tools';

export interface Plan {
  id: string;
  name: string;
  description: string;
  price_cents: number;
  currency: string;
  monthly_credits: number;
  /** The apps it unlocks, by the id each app checks for; "*" is every app. */
  products: string[];
  sort_order: number;
}

export interface PlanLicence {
  licence: string;
  email: string;
  plan_name: string;
  products: string[];
  credits_left: number;
  period_end: string;
}

/** The signed-in person's plan: the live one, else the latest they had. */
export interface Subscription {
  plan_id: string;
  plan_name: string;
  /** Stripe's status: active, trialing, past_due, canceled, … */
  status: string;
  /** Paid up: apps unlocked and credits usable. */
  live: boolean;
  /** Cancelled, but still on until period_end. */
  cancel_at_period_end: boolean;
  period_end: string;
  credits_granted: number;
  credits_left: number;
  licence: string | null;
  products: string[];
  /** The free allowance some apps hand out: nothing to pay or cancel. */
  is_free: boolean;
}

/** What one use of an app's AI costs, by the product id plans use. */
export interface AppUse {
  app: string;
  credits: number;
}

export interface PlanCatalogue {
  plans: Plan[];
  appUses: AppUse[];
}

/**
 * How many uses of each app a monthly allowance buys, spent on that app alone,
 * by tool id (what the "uses" wording is keyed by). Apps the site has no
 * wording for are left out, in the order api0 lists them.
 */
export function creditUses(monthlyCredits: number, appUses: AppUse[]) {
  return appUses.flatMap(({ app, credits }) => {
    // Apps without a Pro edition (ShipScreen) still spend credits.
    const tool = desktopToolsConfig.find((t) => (t.pro?.product ?? t.id) === app);
    // A plan sets JobScout's searches outright; credits don't buy them.
    if (tool?.pro?.monthlySearches) return [];
    const count = credits > 0 ? Math.floor(monthlyCredits / credits) : 0;
    return tool && count > 0 ? [{ tool: tool.id, count }] : [];
  });
}

/**
 * The apps on a plan card, in three sections of related tools, each in the
 * order shown. Every card lists every app, so the same app sits on the same
 * row in every card.
 */
export const PLAN_GROUPS = [
  { key: 'build', tools: ['gitagent', 'shipscreen', 'surfacewatch'] },
  { key: 'create', tools: ['polishcast', 'trackcut', 'publishkit'] },
  // CVenom is a web app, not a desktop one: it spends the same plan's credits
  // when its account has the plan's email. Next to JobScout, which finds the jobs
  // it tailors CVs for.
  { key: 'track', tools: ['jobscout', 'cvenom', 'spreadradar'] },
] as const;

/** What a tailored CV costs in CVenom (backend-cvenom's cv_generation). */
export const CVENOM_CV_CREDITS = 20;

/** The plan descriptions the site has wording for, by plan id; others show the gateway's text. */
export const TRANSLATED_PLAN_DESCRIPTIONS = new Set(['basic', 'pro', 'max']);

/**
 * Plans with a logo in public/image/plans (an .svg for the site, a .png that
 * the store sets on the plan's Stripe product, for Checkout and the portal).
 */
const PLAN_LOGOS = new Set(['basic', 'pro', 'max']);

export function planLogo(planId: string): string | null {
  return PLAN_LOGOS.has(planId) ? `/image/plans/${planId}.svg` : null;
}

// `init` lets the pricing page fetch on the server with a revalidate window, so
// the plans are in the served HTML; the browser calls it with none.
export async function fetchPlans(init?: RequestInit): Promise<PlanCatalogue> {
  const response = await fetch(`${GATEWAY_URL}/api/plans`, init);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const body = await response.json();
  // A plan priced at 0 is the apps' free allowance, never an offer: the
  // gateway no longer lists it, and an older one that does must not show it.
  const plans: Plan[] = (body.plans ?? [])
    .filter((p: Plan) => p.price_cents > 0)
    .map((p: Plan) => ({ ...p, products: p.products ?? [] }));
  return {
    plans: [...plans].sort((a, b) => a.sort_order - b.sort_order),
    appUses: Array.isArray(body.app_uses) ? body.app_uses : [],
  };
}

export type CheckoutResult =
  | { kind: 'redirect'; url: string }
  | { kind: 'taken' }
  | { kind: 'signed-out' }
  | { kind: 'error'; message?: string };

/** Needs a signed-in user: the plan goes to the email of their sign-in. */
export async function startCheckout(planId: string): Promise<CheckoutResult> {
  try {
    const body = await gatewayFetch<{ url?: string }>('/api/plans/checkout', {
      method: 'POST',
      body: JSON.stringify({ plan_id: planId }),
    });
    return typeof body.url === 'string' ? { kind: 'redirect', url: body.url } : { kind: 'error' };
  } catch (e) {
    if (e instanceof GatewayError && e.status === 409) return { kind: 'taken' };
    if (e instanceof GatewayError && e.status === 401) return { kind: 'signed-out' };
    return { kind: 'error', message: e instanceof Error ? e.message : undefined };
  }
}

export async function fetchSubscription(): Promise<Subscription | null> {
  const body = await gatewayFetch<{ subscription: Subscription | null }>('/api/plans/subscription');
  const sub = body.subscription;
  return sub ? { ...sub, products: sub.products ?? [] } : null;
}

/** Stripe's customer portal: card, invoices and switching plan. */
export async function openPortal(): Promise<string> {
  const body = await gatewayFetch<{ url?: string }>('/api/plans/portal', { method: 'POST' });
  if (typeof body.url !== 'string') throw new Error('No portal URL');
  return body.url;
}

/** `cancel: false` resumes a cancelled plan that has not ended yet. */
export async function setCancelled(cancel: boolean): Promise<Subscription | null> {
  const body = await gatewayFetch<{ subscription: Subscription | null }>(
    cancel ? '/api/plans/cancel' : '/api/plans/resume',
    { method: 'POST' },
  );
  return body.subscription;
}

/** `price_cents` is in the currency's smallest unit (cents, Rappen). */
export function formatPlanPrice(plan: Pick<Plan, 'price_cents' | 'currency'>, locale: string) {
  const currency = plan.currency.toUpperCase();
  const digits =
    new Intl.NumberFormat(locale, { style: 'currency', currency }).resolvedOptions().maximumFractionDigits ?? 2;
  const value = plan.price_cents / 10 ** digits;
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: Number.isInteger(value) ? 0 : digits,
  }).format(value);
}
