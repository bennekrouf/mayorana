'use client';

// The product-email switch on the pricing page, for anyone signed in. It is
// also the notice the law asks for before someone buys: a paying subscriber
// gets these emails unless they say no, and the hint says so while they are
// still choosing a plan. The rule is api0's, see src/lib/email-consent.ts.

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Loader2 } from 'lucide-react';
import { getEmailConsent, setEmailConsent, type EmailConsent } from '@/lib/email-consent';

type Load = { kind: 'loading' } | { kind: 'ready'; consent: EmailConsent } | { kind: 'error' };

export function EmailOptIn({ uid }: { uid: string }) {
  const t = useTranslations('pricing');
  const locale = useLocale();
  const [load, setLoad] = useState<Load>({ kind: 'loading' });
  const [saving, setSaving] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getEmailConsent()
      .then((consent) => !cancelled && setLoad({ kind: 'ready', consent }))
      .catch(() => !cancelled && setLoad({ kind: 'error' }));
    return () => {
      cancelled = true;
      setLoad({ kind: 'loading' });
    };
  }, [uid]);

  // Without their choice the box would show a guess and saving could
  // overwrite it, so it is left out rather than shown wrong.
  if (load.kind === 'error') return null;

  const consent = load.kind === 'ready' ? load.consent : null;

  async function toggle(next: boolean) {
    setSaving(true);
    setFailed(false);
    try {
      setLoad({ kind: 'ready', consent: await setEmailConsent(next, 'pricing', locale) });
    } catch {
      setFailed(true);
    } finally {
      setSaving(false);
    }
  }

  // Not chosen yet and receiving them: a customer, on by default.
  const hint =
    consent?.opt_in != null
      ? t('emails_hint_chosen')
      : consent?.receives
        ? t('emails_hint_subscriber')
        : t('emails_hint_default');

  return (
    <div className="max-w-2xl rounded-xl border border-border bg-card p-4">
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={consent?.receives ?? false}
          disabled={load.kind === 'loading' || saving}
          onChange={(e) => toggle(e.target.checked)}
          className="mt-1 h-4 w-4 flex-shrink-0 accent-primary disabled:opacity-60"
        />
        <span className="text-sm">
          <span className="font-medium">{t('emails_label')}</span>
          {(load.kind === 'loading' || saving) && (
            <Loader2 className="inline-block ml-2 h-3.5 w-3.5 animate-spin text-muted-foreground" />
          )}
          <span className="block mt-1 text-muted-foreground">{hint}</span>
        </span>
      </label>
      {failed && <p className="mt-2 text-sm text-red-600">{t('emails_error')}</p>}
    </div>
  );
}
