'use client';

// "Buy <name> Pro": asks the gateway for a Stripe Checkout page and sends the
// buyer there. The price lives in Stripe, not here: the one shown next to the
// button is read from the same Stripe price the checkout charges, so the two
// cannot disagree. If it can't be read, the button shows without it.

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Loader2, Sparkles } from 'lucide-react';
import { GATEWAY_URL } from '@/lib/gateway';

type Props = { product: string; edition: string; name: string };

type Price = { amount: number; currency: string; vat_added: boolean };

// Stripe amounts are in the currency's smallest unit (cents, Rappen).
function formatPrice({ amount, currency }: Price, locale: string) {
  const digits = new Intl.NumberFormat(locale, { style: 'currency', currency }).resolvedOptions()
    .maximumFractionDigits ?? 2;
  const value = amount / 10 ** digits;
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: Number.isInteger(value) ? 0 : digits,
  }).format(value);
}

export function BuyProButton({ product, edition, name }: Props) {
  const t = useTranslations('app_detail');
  const locale = useLocale();
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const [price, setPrice] = useState<Price | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`${GATEWAY_URL}/api/licenses/price/${product}/${edition}`)
      .then((response) => (response.ok ? response.json() : null))
      .then((body) => {
        if (!cancelled && body && typeof body.amount === 'number' && typeof body.currency === 'string') {
          setPrice({ amount: body.amount, currency: body.currency.toUpperCase(), vat_added: !!body.vat_added });
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [product, edition]);

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
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <button
          type="button"
          onClick={buy}
          disabled={busy}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-primary text-white font-medium text-sm hover:bg-primary/90 disabled:opacity-70 transition-colors"
        >
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {t('buy_pro_button', { name })}
        </button>
        {price && (
          <p className="text-sm">
            <span className="text-lg font-semibold">{formatPrice(price, locale)}</span>
            <span className="text-muted-foreground">
              {' '}
              {t(price.vat_added ? 'buy_pro_price_vat' : 'buy_pro_price_once')}
            </span>
          </p>
        )}
      </div>
      {failed && <p className="text-sm text-red-600 mt-2">{t('buy_pro_error')}</p>}
    </div>
  );
}
