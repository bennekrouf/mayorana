// Plans: the only thing on sale. Each makes Pro the apps it lists and brings
// a monthly allowance of AI credits. The gateway knows them all; this site only
// shows them and starts a Stripe Checkout for one.
//
//   GET  /api/plans                the plans on sale, and what one use of each
//                                  app's AI costs in credits (both set by the
//                                  super admin in the api0 dashboard)
//   POST /api/plans/checkout       { plan_id, email } → { url } of Stripe Checkout
//   GET  /api/plans/session/<cs>   the licence a finished Checkout bought:
//                                  200 { licence }, or 202 while Stripe settles
//
// Stripe sends the buyer back to /pricing?checkout=success&session_id=cs_…,
// which is what the store's PLANS_SITE_URL points at (https://mayorana.ch/pricing;
// the middleware adds the visitor's locale and keeps the query).

import { GATEWAY_URL } from './gateway';
import { desktopToolsConfig } from '@/data/tools';

export interface Plan {
  id: string;
  name: string;
  description: string;
  price_cents: number;
  currency: string;
  monthly_credits: number;
  /** The apps it makes Pro, by the id each app checks for; "*" is every app. */
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
    const count = credits > 0 ? Math.floor(monthlyCredits / credits) : 0;
    return tool && count > 0 ? [{ tool: tool.id, count }] : [];
  });
}

export async function fetchPlans(): Promise<PlanCatalogue> {
  const response = await fetch(`${GATEWAY_URL}/api/plans`);
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

export type CheckoutResult = { kind: 'redirect'; url: string } | { kind: 'taken' } | { kind: 'error'; message?: string };

export async function startCheckout(planId: string, email: string): Promise<CheckoutResult> {
  try {
    const response = await fetch(`${GATEWAY_URL}/api/plans/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan_id: planId, email }),
    });
    const body = await response.json().catch(() => ({}));
    if (response.status === 409) return { kind: 'taken' };
    if (response.ok && typeof body.url === 'string') return { kind: 'redirect', url: body.url };
    return { kind: 'error', message: body.message ?? body.error };
  } catch {
    return { kind: 'error' };
  }
}

// The same check the store makes, so a typo is caught before the round trip.
export function plausibleEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
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
