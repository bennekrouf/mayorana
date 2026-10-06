'use client';

import Link from 'next/link';
import { ExternalLink, ArrowRight, Check } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { getLocalizedPath } from '@/lib/i18n-utils';
import { desktopToolsConfig, appI18nKey } from '@/data/tools';
import { StatusBadge } from '@/components/ui/ToolVisuals';
import { Api0FlowDiagram } from '@/components/diagrams/Api0FlowDiagram';

const API0_URL = 'https://api0.ai';

// The api0 post that draws the whole platform on one page.
const API0_ARCHITECTURE_URL = 'https://api0.ai/blog/how-api0-works';

// The desktop tools shown as proof of the stack, under the api0 story. They
// take their one-liner from the shared `apps` namespace.
const SELECTED_TOOL_IDS = ['ais-runner', 'ais-monitor', 'gitagent'] as const;

export default function ClientHomeSection() {
  const t = useTranslations('home');
  const tApps = useTranslations('apps');
  const locale = useLocale();

  const azureHref = getLocalizedPath(locale, '/solutions/azure');
  const contactHref = getLocalizedPath(locale, '/contact');

  const tools = SELECTED_TOOL_IDS.map((id) => {
    const tool = desktopToolsConfig.find((candidate) => candidate.id === id);
    if (!tool) throw new Error(`Selected tool "${id}" missing from desktopToolsConfig`);
    return {
      id: tool.id,
      name: tool.name,
      line: tApps(`${appI18nKey[tool.id]}_tagline`),
      status: tool.status,
      // The Apps page gives every card an id, so this lands on the tool itself.
      href: getLocalizedPath(locale, `/apps#${tool.id}`),
    };
  });

  return (
    <>
      {/* Hero — company identity, with api0 as the thing to try */}
      <section className="py-20 md:py-32 bg-gradient-to-b from-secondary to-background">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <div className="eyebrow text-primary mb-3">{t('hero_eyebrow')}</div>

            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-[1.1]">
              {t('hero_h1')}
            </h1>

            <p className="lead-marketing text-muted-foreground mb-10 max-w-2xl mx-auto md:text-lg">
              {t('hero_lead')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a
                href={API0_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-cap inline-flex items-center px-6 py-3 rounded-lg bg-primary text-white hover:bg-primary/90 transform transition duration-200 hover:-translate-y-1 shadow-xl shadow-primary/20"
              >
                {t('cta_try_api0')}
                <ExternalLink className="ml-2 w-4 h-4" />
              </a>
              <Link
                href={contactHref}
                className="btn-cap-light inline-flex items-center px-6 py-3 rounded-lg border border-foreground/20 text-foreground hover:bg-foreground/5 transition duration-200"
              >
                {t('cta_book_consult')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* api0 — the flagship, directly under the hero */}
      <section className="py-20 bg-secondary/30">
        <div className="container max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-12">
            <div>
              <div className="eyebrow text-primary mb-3">{t('api0_eyebrow')}</div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">{t('api0_heading')}</h2>
              <p className="lead-marketing text-muted-foreground">{t('api0_body')}</p>
            </div>
            <div className="flex items-center justify-center">
              <Api0FlowDiagram />
            </div>
          </div>

          <ol className="grid md:grid-cols-3 gap-6 mb-10">
            {['1', '2', '3'].map((n) => (
              <li key={n} className="rounded-2xl border border-border bg-background p-6">
                <div className="text-primary font-bold mb-2">{n}</div>
                <h3 className="text-lg font-bold mb-2">{t(`api0_step${n}_title`)}</h3>
                <p className="text-sm text-muted-foreground">{t(`api0_step${n}_body`)}</p>
              </li>
            ))}
          </ol>

          <div className="flex flex-col sm:flex-row gap-6 items-center">
            <a
              href={API0_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-cap inline-flex items-center px-6 py-3 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors"
            >
              {t('api0_cta')}
              <ExternalLink className="ml-2 w-4 h-4" />
            </a>
            <a
              href={API0_ARCHITECTURE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-primary font-medium hover:underline"
            >
              {t('api0_architecture_link')}
              <ArrowRight className="ml-1.5 w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Why Rust / why Swiss — proof */}
      <section className="py-20 bg-background">
        <div className="container max-w-5xl">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="text-3xl font-bold mb-6">{t('why_heading')}</h2>
              <p className="lead-marketing text-muted-foreground">{t('why_body')}</p>
            </div>
            <ul className="space-y-4">
              {['1', '2', '3', '4'].map((n) => (
                <li key={n} className="flex items-start gap-3">
                  <Check className="w-5 h-5 mt-0.5 shrink-0 text-primary" />
                  <span>{t(`why_point_${n}`)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Other tools — proof of the stack, not the headline */}
      <section className="py-20 bg-secondary/30">
        <div className="container max-w-6xl">
          <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">{t('other_tools_heading')}</h2>
              <p className="text-muted-foreground">{t('other_tools_body')}</p>
            </div>
            <div className="flex flex-wrap gap-6">
              <Link href={azureHref} className="inline-flex items-center text-primary font-medium hover:underline">
                {t('solution_azure_cta')}
                <ArrowRight className="ml-1.5 w-4 h-4" />
              </Link>
              <Link
                href={getLocalizedPath(locale, '/apps')}
                className="inline-flex items-center text-primary font-medium hover:underline"
              >
                {t('selected_tools_view_all')}
                <ArrowRight className="ml-1.5 w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool) => (
              <Link
                key={tool.id}
                href={tool.href}
                className="flex flex-col rounded-2xl border border-border bg-background p-6 hover:border-primary/50 hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <h3 className="text-lg font-bold text-primary">{tool.name}</h3>
                  <StatusBadge status={tool.status} />
                </div>
                <p className="text-sm text-muted-foreground">{tool.line}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Services teaser */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">{t('services_teaser_heading')}</h2>
            <p className="lead-marketing text-muted-foreground mb-8">
              {t('services_teaser_body')}
            </p>
            <Link
              href={getLocalizedPath(locale, '/services')}
              className="btn-cap inline-flex items-center px-6 py-3 rounded-lg bg-primary text-white hover:bg-primary/90 transform transition duration-200 hover:-translate-y-1 shadow-xl shadow-primary/20"
            >
              {t('services_teaser_cta')}
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
            <div className="mt-6">
              <Link
                href={contactHref}
                className="text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
              >
                {t('services_teaser_contact')}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
