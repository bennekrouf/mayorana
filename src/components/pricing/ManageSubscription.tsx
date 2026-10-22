'use client';

// The signed-in subscriber's plan: what it is, whether it renews or ends and
// when, the credits left, the licence number, and the ways to cancel, resume,
// or change card and plan on Stripe's portal. Cancelling only stops the
// renewal: the plan stays on until the end of the month already paid.

import { useState } from 'react';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { Check, Copy, Loader2 } from 'lucide-react';
import { toolsForPlanProducts } from '@/data/tools';
import { openPortal, planLogo, setCancelled, type Subscription } from '@/lib/plans';

type Busy = 'portal' | 'cancel' | 'resume' | null;

export function ManageSubscription({
  subscription: sub,
  onChange,
}: {
  subscription: Subscription;
  onChange: (sub: Subscription | null) => void;
}) {
  const t = useTranslations('pricing');
  const locale = useLocale();
  const [busy, setBusy] = useState<Busy>(null);
  const [confirming, setConfirming] = useState(false);
  const [failed, setFailed] = useState(false);
  const [copied, setCopied] = useState(false);

  const date = new Intl.DateTimeFormat(locale, { dateStyle: 'long' }).format(new Date(sub.period_end));
  const paymentFailed = !sub.live && (sub.status === 'past_due' || sub.status === 'unpaid');
  const status = sub.is_free
    ? t('sub_status_free', { date })
    : sub.live
      ? sub.cancel_at_period_end
        ? t('sub_status_ending', { date })
        : t('sub_status_renews', { date })
      : paymentFailed
        ? t('sub_status_past_due')
        : t('sub_status_ended', { date });
  const tone = sub.live && !sub.cancel_at_period_end
    ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
    : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30';
  const tools = toolsForPlanProducts(sub.products);
  const used = sub.credits_granted > 0 ? 1 - sub.credits_left / sub.credits_granted : 0;

  async function portal() {
    setBusy('portal');
    setFailed(false);
    try {
      // Stays busy: the page is being left.
      window.location.assign(await openPortal());
    } catch {
      setBusy(null);
      setFailed(true);
    }
  }

  async function changeCancel(cancel: boolean) {
    setBusy(cancel ? 'cancel' : 'resume');
    setFailed(false);
    try {
      onChange(await setCancelled(cancel));
      setConfirming(false);
    } catch {
      setFailed(true);
    } finally {
      setBusy(null);
    }
  }

  async function copy(text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const secondaryButton =
    'inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-secondary disabled:opacity-60 transition-colors';

  return (
    <section id="subscription" className="rounded-xl border border-border bg-background p-6 scroll-mt-24">
      <div className="flex flex-wrap items-center gap-3">
        {planLogo(sub.plan_id) && (
          <Image src={planLogo(sub.plan_id)!} alt="" width={40} height={40} unoptimized className="h-10 w-10" />
        )}
        <h2 className="text-xl font-bold">{t('sub_title', { plan: sub.plan_name })}</h2>
        <span className={`rounded-full border px-3 py-0.5 text-xs font-medium ${tone}`}>{status}</span>
      </div>

      <div className="mt-5 grid gap-6 md:grid-cols-2">
        <div>
          <div className="text-xs text-muted-foreground mb-2">{t('sub_credits_label')}</div>
          <p className="text-sm">
            {t('sub_credits', { left: sub.credits_left, granted: sub.credits_granted })}
          </p>
          <div className="mt-2 h-2 rounded-full bg-secondary overflow-hidden" aria-hidden>
            <div className="h-full bg-primary" style={{ width: `${Math.round((1 - used) * 100)}%` }} />
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            {sub.products.includes('*')
              ? t('all_apps')
              : tools.map((tool) => tool.name).join(', ')}
          </p>
        </div>

        {sub.licence && (
          <div>
            <div className="text-xs text-muted-foreground mb-2">{t('thanks_licence_label')}</div>
            <div className="flex items-center gap-2">
              <code className="flex-1 min-w-0 rounded-lg bg-secondary/60 px-3 py-2 font-mono text-sm break-all select-all">
                {sub.licence}
              </code>
              <button
                type="button"
                onClick={() => copy(sub.licence!)}
                aria-label={t('thanks_copy')}
                className="shrink-0 rounded-lg border border-border p-2 hover:bg-secondary transition-colors"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}
      </div>

      {!sub.is_free && (
        <div className="mt-6 border-t border-border pt-5">
          {confirming ? (
            <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-4">
              <p className="text-sm">{t('sub_cancel_confirm', { date })}</p>
              <div className="mt-3 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => changeCancel(true)}
                  disabled={busy !== null}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-60 transition-colors"
                >
                  {busy === 'cancel' && <Loader2 className="w-4 h-4 animate-spin" />}
                  {t('sub_cancel_yes')}
                </button>
                <button type="button" onClick={() => setConfirming(false)} disabled={busy !== null} className={secondaryButton}>
                  {t('sub_cancel_no')}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={portal} disabled={busy !== null} className={secondaryButton}>
                {busy === 'portal' && <Loader2 className="w-4 h-4 animate-spin" />}
                {paymentFailed ? t('sub_fix_payment') : t('sub_portal')}
              </button>
              {sub.live && sub.cancel_at_period_end && (
                <button
                  type="button"
                  onClick={() => changeCancel(false)}
                  disabled={busy !== null}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-60 transition-colors"
                >
                  {busy === 'resume' && <Loader2 className="w-4 h-4 animate-spin" />}
                  {t('sub_resume')}
                </button>
              )}
              {sub.live && !sub.cancel_at_period_end && (
                <button
                  type="button"
                  onClick={() => setConfirming(true)}
                  disabled={busy !== null}
                  className="px-4 py-2 text-sm text-muted-foreground hover:text-red-600 underline underline-offset-4 disabled:opacity-60 transition-colors"
                >
                  {t('sub_cancel')}
                </button>
              )}
            </div>
          )}
          {failed && <p className="text-sm text-red-600 mt-3">{t('sub_error')}</p>}
        </div>
      )}
    </section>
  );
}
