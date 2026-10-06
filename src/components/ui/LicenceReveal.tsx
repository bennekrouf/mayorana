'use client';

// The thank-you page's licence key. Stripe sends the buyer back with
// ?session_id=cs_…; the gateway turns that into the key, issuing it if Stripe's
// webhook has not arrived yet. While the payment is still settling the gateway
// answers 409, and this asks again for a while before giving up.

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Check, Copy, Loader2 } from 'lucide-react';
import { GATEWAY_URL } from '@/lib/gateway';

type Licence = { key: string; email: string; updates_until: string; product_name: string };
type State =
  | { kind: 'loading' }
  | { kind: 'pending' }
  | { kind: 'ready'; licence: Licence }
  | { kind: 'missing' }
  | { kind: 'error' };

const RETRY_MS = 2000;
const MAX_TRIES = 45; // 90 s: card payments settle in seconds

/** `how`: where the key goes in this app, from the app's own copy. */
export function LicenceReveal({ contactHref, how }: { contactHref: string; how: string }) {
  const t = useTranslations('app_detail');
  const sessionId = useSearchParams().get('session_id');
  const validSession = !!sessionId && sessionId.startsWith('cs_');
  const [fetched, setState] = useState<State>({ kind: 'loading' });
  // A missing or malformed session id needs no request: it is known on render.
  const state: State = validSession ? fetched : { kind: 'missing' };
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!validSession) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    async function attempt(tries: number) {
      try {
        const response = await fetch(`${GATEWAY_URL}/api/licenses/session/${encodeURIComponent(sessionId!)}`);
        const body = await response.json().catch(() => ({}));
        if (cancelled) return;
        if (response.ok && typeof body.key === 'string') {
          setState({ kind: 'ready', licence: body as Licence });
        } else if (response.status === 409 && tries < MAX_TRIES) {
          setState({ kind: 'pending' });
          timer = setTimeout(() => attempt(tries + 1), RETRY_MS);
        } else if (response.status === 404) {
          setState({ kind: 'missing' });
        } else {
          setState({ kind: 'error' });
        }
      } catch {
        if (cancelled) return;
        if (tries < MAX_TRIES) timer = setTimeout(() => attempt(tries + 1), RETRY_MS);
        else setState({ kind: 'error' });
      }
    }

    attempt(0);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [sessionId, validSession]);

  async function copy(key: string) {
    await navigator.clipboard.writeText(key);
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
  return (
    <div className="space-y-5">
      <p className="text-muted-foreground leading-relaxed">
        {t('thanks_intro', { name: licence.product_name, email: licence.email })}
      </p>
      <div className="rounded-xl border border-border bg-secondary/40 p-4">
        <code className="block font-mono text-xs break-all select-all">{licence.key}</code>
        <button
          type="button"
          onClick={() => copy(licence.key)}
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? t('thanks_copied') : t('thanks_copy')}
        </button>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">{how}</p>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {t('thanks_updates', { date: licence.updates_until })}
      </p>
    </div>
  );
}
