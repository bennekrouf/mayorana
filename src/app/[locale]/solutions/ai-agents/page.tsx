import React from 'react';
import Link from 'next/link';
import LayoutTemplate from '@/components/layout/LayoutTemplate';
import { ArrowRight, Check, ExternalLink, Puzzle, ShieldAlert, Gauge, Building2, Wrench } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { getLocalizedPath } from '@/lib/i18n-utils';
import { Api0FlowDiagram } from '@/components/diagrams/Api0FlowDiagram';

const API0_URL = 'https://api0.ai';
const API0_ARCHITECTURE_URL = 'https://api0.ai/blog/how-api0-works';

// Same shape as the Azure page's friction cards, minus the outcome line —
// the fix here is the whole product, covered by the section below.
const FRICTIONS = [
  { key: '1', icon: Puzzle },
  { key: '2', icon: ShieldAlert },
  { key: '3', icon: Gauge },
] as const;

// One card per buyer, each tied to the channel that buyer already uses. Channel
// names are brands, so they are not translated.
const USE_CASES = [
  { key: '1', icon: Building2, channel: 'Teams' },
  { key: '2', icon: Wrench, channel: 'WhatsApp' },
] as const;

const SOLUTION_POINTS = ['1', '2', '3', '4', '5'] as const;
const AUTH_POINTS = ['1', '2', '3', '4', '5'] as const;
const RUST_POINTS = ['1', '2', '3', '4'] as const;

type Props = { params: Promise<{ locale: string }> };

// A server component: the copy is rendered at build time, and only the
// interactive pieces inside it (diagrams, download buttons) ship JS.
export default async function AiAgentsSolutionsPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'solutions_ai_agents' });

  return (
    <LayoutTemplate>
      {/* Hero */}
      <section className="py-20 bg-gradient-to-b from-secondary to-background">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary mb-4 rise">
              {t('hero_eyebrow')}
            </p>
            <h1
              className="text-4xl md:text-5xl font-bold mb-6 rise"
              style={{ '--rise-delay': '0.1s' } as React.CSSProperties}
            >
              {t('hero_title')}
            </h1>
            <p
              className="text-xl text-muted-foreground mb-8 rise"
              style={{ '--rise-delay': '0.2s' } as React.CSSProperties}
            >
              {t('hero_subtitle')}
            </p>
            <div
              className="flex flex-wrap gap-4 justify-center rise"
              style={{ '--rise-delay': '0.3s' } as React.CSSProperties}
            >
              <a
                href={API0_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
              >
                {t('hero_cta_primary')} <ExternalLink className="ml-2 w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* The problem */}
      <section className="py-16 bg-background">
        <div className="container max-w-6xl">
          <h2 className="text-3xl font-bold mb-12">{t('friction_heading')}</h2>

          <div className="grid md:grid-cols-3 gap-6">
            {FRICTIONS.map(({ key, icon: Icon }) => (
              <div
                key={key}
                className="rounded-2xl border border-border bg-gradient-to-br from-secondary/50 to-secondary/20 p-6 flex flex-col rise-in-view"
              >
                <div className="mb-4 p-3 inline-flex self-start bg-primary/10 rounded-full text-primary">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold mb-3">{t(`friction_${key}_problem`)}</h3>
                <p className="text-sm text-muted-foreground">{t(`friction_${key}_body`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The solution */}
      <section className="py-16 bg-secondary">
        <div className="container max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-8">{t('solution_heading')}</h2>
              <ul className="space-y-4 mb-8">
                {SOLUTION_POINTS.map((n) => (
                  <li key={n} className="flex items-start gap-3">
                    <Check className="w-5 h-5 mt-0.5 shrink-0 text-primary" />
                    <span>{t(`solution_point_${n}`)}</span>
                  </li>
                ))}
              </ul>
              <a
                href={API0_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
              >
                {t('hero_cta_primary')} <ExternalLink className="ml-2 w-4 h-4" />
              </a>
            </div>

            <div className="flex items-center justify-center rounded-xl border border-border bg-background p-6">
              <Api0FlowDiagram />
            </div>
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section className="py-16 bg-background">
        <div className="container max-w-6xl">
          <h2 className="text-3xl font-bold mb-4">{t('use_cases_heading')}</h2>
          <p className="text-lg text-muted-foreground mb-12 max-w-2xl">{t('use_cases_subtitle')}</p>

          <div className="grid md:grid-cols-2 gap-6">
            {USE_CASES.map(({ key, icon: Icon, channel }) => (
              <div
                key={key}
                className="rounded-2xl border border-border bg-gradient-to-br from-secondary/50 to-secondary/20 p-6 flex flex-col rise-in-view"
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className="p-3 inline-flex bg-primary/10 rounded-full text-primary">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full border border-border text-muted-foreground">
                    {channel}
                  </span>
                </div>
                <p className="text-sm font-semibold uppercase tracking-wider text-primary mb-2">
                  {t(`use_case_${key}_who`)}
                </p>
                <h3 className="text-lg font-bold mb-3">{t(`use_case_${key}_action`)}</h3>
                <p className="text-sm text-muted-foreground">{t(`use_case_${key}_body`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What the backend receives */}
      <section className="py-16 bg-secondary">
        <div className="container max-w-5xl">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="text-3xl font-bold mb-6">{t('auth_heading')}</h2>
              <p className="text-lg text-muted-foreground mb-6">{t('auth_body')}</p>
              <a
                href={API0_ARCHITECTURE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-primary font-medium hover:underline"
              >
                {t('architecture_link')} <ArrowRight className="ml-1.5 w-4 h-4" />
              </a>
            </div>
            <ul className="space-y-4">
              {AUTH_POINTS.map((n) => (
                <li key={n} className="flex items-start gap-3">
                  <Check className="w-5 h-5 mt-0.5 shrink-0 text-primary" />
                  <span>{t(`auth_point_${n}`)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Rust proof */}
      <section className="py-16 bg-background">
        <div className="container max-w-5xl">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <h2 className="text-3xl font-bold">{t('rust_heading')}</h2>
            <ul className="space-y-4">
              {RUST_POINTS.map((n) => (
                <li key={n} className="flex items-start gap-3">
                  <Check className="w-5 h-5 mt-0.5 shrink-0 text-primary" />
                  <span>{t(`rust_point_${n}`)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Onward to the apps: the same stack, as products you can download. */}
      <section className="py-12 bg-secondary/30 border-t border-border">
        <div className="container max-w-5xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-muted-foreground max-w-2xl">{t('more_body')}</p>
          <Link
            href={getLocalizedPath(locale, '/apps')}
            className="inline-flex shrink-0 items-center gap-1.5 font-medium text-primary hover:underline underline-offset-4"
          >
            {t('more_link')}
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </LayoutTemplate>
  );
}
