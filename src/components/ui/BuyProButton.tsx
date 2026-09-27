'use client';

// "Buy <name> Pro": asks the gateway for a Stripe Checkout page and sends the
// buyer there. The price lives in Stripe and the gateway, not here, so the
// button never shows a number that could disagree with the one charged.

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Loader2, Sparkles } from 'lucide-react';
import { GATEWAY_URL } from '@/lib/gateway';

type Props = { product: string; edition: string; name: string };

export function BuyProButton({ product, edition, name }: Props) {
  const t = useTranslations('app_detail');
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  async function buy() {
    setBusy(true);
    setFailed(false);
    try {
      const response = await fetch(`${GATEWAY_URL}/api/licenses/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product, edition }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok || typeof body.url !== 'string') throw new Error(body.error ?? response.statusText);
      // Stays busy: the page is being left.
      window.location.href = body.url;
    } catch {
      setBusy(false);
      setFailed(true);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={buy}
        disabled={busy}
        className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-primary text-white font-medium text-sm hover:bg-primary/90 disabled:opacity-70 transition-colors"
      >
        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
        {t('buy_pro_button', { name })}
      </button>
      {failed && <p className="text-sm text-red-600 mt-2">{t('buy_pro_error')}</p>}
    </div>
  );
}
