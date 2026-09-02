'use client';

import React, { useEffect, useState } from 'react';
import { FaApple, FaLinux, FaWindows } from 'react-icons/fa';
import { Sparkles, ArrowRight, Download } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { motion } from '@/components/ui/Motion';
import type { DownloadLink, OS } from '@/data/tools';

const osIcons: Record<OS, React.ReactNode> = {
  mac: <FaApple className="w-4 h-4" />,
  linux: <FaLinux className="w-4 h-4" />,
  windows: <FaWindows className="w-4 h-4" />,
};

/// Best-effort read of the visitor's platform. Only ever narrows the CTA from
/// "pick your OS" to "here is your build" — an unrecognised agent keeps the
/// full list, so a wrong guess costs nothing.
function detectOS(): OS | null {
  if (typeof navigator === 'undefined') return null;
  const ua = navigator.userAgent;
  // Phones and tablets run none of these builds, so they get the full list
  // rather than a desktop installer they cannot open. Checked before the
  // desktop patterns because both iPadOS and Android carry a desktop-looking
  // token ("Mac OS X" and "Linux" respectively).
  if (/iPhone|iPod|iPad|Android/i.test(ua)) return null;
  if (/Mac/i.test(ua)) return 'mac';
  if (/Win/i.test(ua)) return 'windows';
  if (/Linux|X11|CrOS/i.test(ua)) return 'linux';
  return null;
}

interface FeaturedPromoProps {
  name: string;
  tagline: string;
  description: string;
  downloads: DownloadLink[];
  /** Anchor of the tool's own card further down the page. */
  detailsHref: string;
}

/**
 * Promotion strip for one tool, sitting above the grid. Deliberately a single
 * band rather than a card: it should read as an announcement, not as the first
 * item of the list it precedes.
 */
export function FeaturedPromo({
  name,
  tagline,
  description,
  downloads,
  detailsHref,
}: FeaturedPromoProps) {
  const tApps = useTranslations('apps');

  // Resolved after mount so the server and first client render agree; until
  // then every platform is offered, which is also the no-JS outcome.
  const [os, setOS] = useState<OS | null>(null);
  useEffect(() => setOS(detectOS()), []);

  const primary = os ? downloads.find((d) => d.os === os) : undefined;
  const rest = primary ? downloads.filter((d) => d.os !== primary.os) : downloads;

  return (
    <section className="pt-10 bg-background">
      <div className="container max-w-6xl">
        <motion.div
          className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-secondary/40 to-background p-6 sm:p-8"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Soft wash behind the copy; purely decorative. */}
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-primary/20 blur-3xl"
          />

          <div className="relative flex flex-col lg:flex-row lg:items-center gap-6">
            <div className="flex-1 min-w-0">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide bg-primary text-white mb-3">
                <Sparkles className="w-3 h-3" />
                {tApps('promo_badge')}
              </span>

              <h2 className="text-2xl sm:text-3xl font-bold mb-2">{name}</h2>
              <p className="text-base font-medium mb-2">{tagline}</p>
              <p className="text-sm text-muted-foreground max-w-2xl">{description}</p>
            </div>

            <div className="flex flex-col gap-3 lg:items-end shrink-0">
              {primary ? (
                <>
                  <a
                    href={primary.href}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-primary text-white font-medium text-sm hover:bg-primary/90 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    {tApps('promo_cta')} — {primary.label}
                  </a>
                  {rest.length > 0 && (
                    <div className="flex items-center gap-2 lg:justify-end">
                      <span className="text-xs text-muted-foreground">
                        {tApps('promo_other_platforms')}
                      </span>
                      {rest.map((dl) => (
                        <a
                          key={dl.os}
                          href={dl.href}
                          title={dl.label}
                          aria-label={dl.label}
                          className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-border bg-background hover:bg-secondary transition-colors"
                        >
                          {osIcons[dl.os]}
                        </a>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-wrap gap-2 lg:justify-end">
                  {downloads.map((dl) => (
                    <a
                      key={dl.os}
                      href={dl.href}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-white font-medium text-sm hover:bg-primary/90 transition-colors"
                    >
                      {osIcons[dl.os]}
                      {dl.label}
                    </a>
                  ))}
                </div>
              )}

              <a
                href={detailsHref}
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {tApps('promo_details')}
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
