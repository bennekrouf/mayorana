'use client';

import Link from 'next/link';
import { ExternalLink, ArrowRight, Check } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { getLocalizedPath } from '@/lib/i18n-utils';
import { desktopToolsConfig, appI18nKey, type Status } from '@/data/tools';
import { StatusBadge } from '@/components/ui/ToolVisuals';
import { FeaturedPromo } from '@/components/ui/FeaturedPromo';

const API0_URL = 'https://api0.ai';

// The tool given the promotion strip under the hero. Changing this id is the
// whole edit needed to promote a different one — the copy and the per-OS
// downloads both come from the shared tool data.
const PROMOTED_TOOL_ID = 'gitagent';

// The 3–4 primary tools surfaced on the home page. Desktop tools take their
// one-liner from the shared `apps` namespace; API0.AI is hosted rather than
// downloaded, so it carries its own line and an external link.
const SELECTED_TOOL_IDS = ['ais-runner', 'ais-monitor', 'gitagent'] as const;

export default function ClientHomeSection() {
  const t = useTranslations('home');
  const tApps = useTranslations('apps');
  const tAzure = useTranslations('solutions_azure');
  const locale = useLocale();

  const azureHref = getLocalizedPath(locale, '/solutions/azure');
  const contactHref = getLocalizedPath(locale, '/contact');

  const promoted = desktopToolsConfig.find((tool) => tool.id === PROMOTED_TOOL_ID);

  const selectedTools = SELECTED_TOOL_IDS.map((id) => {
    const tool = desktopToolsConfig.find((candidate) => candidate.id === id);
    if (!tool) throw new Error(`Selected tool "${id}" missing from desktopToolsConfig`);
    return {
      id: tool.id,
      name: tool.name,
      line: tApps(`${appI18nKey[tool.id]}_tagline`),
      status: tool.status,
      // The Apps page gives every card an id, so this lands on the tool itself.
      href: getLocalizedPath(locale, `/apps#${tool.id}`),
      external: false,
    };
  });

  const tools = [
    ...selectedTools,
    {
      id: 'api0',
      name: 'API0.AI',
      line: t('tool_api0_line'),
      status: 'live' as Status,
      href: API0_URL,
      external: true,
    },
  ];

  return (
    <>
      {/* Hero */}
      <section className="py-20 md:py-32 bg-gradient-to-b from-secondary to-background">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <div className="eyebrow text-primary mb-3">{t('hero_eyebrow')}</div>

            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-[1.1]">
              {t('hero_h1')}
            </h1>

            <p className="lead-marketing text-foreground mb-2 max-w-2xl mx-auto md:text-lg font-medium">
              {t('hero_lead')}
            </p>
            <p className="text-muted-foreground mb-10 max-w-2xl mx-auto">
              {t('hero_subtitle')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href={azureHref}
                className="btn-cap inline-flex items-center px-6 py-3 rounded-lg bg-primary text-white hover:bg-primary/90 transform transition duration-200 hover:-translate-y-1 shadow-xl shadow-primary/20"
              >
                {t('cta_explore_azure')}
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
              <a
                href={API0_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-cap-light inline-flex items-center px-6 py-3 rounded-lg border border-foreground/20 text-foreground hover:bg-foreground/5 transition duration-200"
              >
                {t('cta_try_api0')}
                <ExternalLink className="ml-2 w-4 h-4" />
              </a>
              <Link
                href={contactHref}
                className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
              >
                {t('cta_book_consult')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Promoted tool — directly under the hero, before the solutions pitch,
          so the one thing being pushed right now is the first thing after the
          positioning statement. */}
      {promoted && (
        <FeaturedPromo
          name={promoted.name}
          tagline={tApps(`${appI18nKey[PROMOTED_TOOL_ID]}_tagline`)}
          description={tApps(`${appI18nKey[PROMOTED_TOOL_ID]}_description`)}
          downloads={promoted.downloads}
          detailsHref={`${getLocalizedPath(locale, '/apps')}#${PROMOTED_TOOL_ID}`}
        />
      )}

      {/* Featured solutions — exactly two */}
      <section className="py-20 bg-secondary/30">
        <div className="container max-w-6xl">
          <div className="eyebrow text-primary mb-8">{t('solutions_eyebrow')}</div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Azure Integration Suite */}
            <div className="flex flex-col rounded-2xl border border-border bg-background p-8">
              <div className="flex items-start justify-between gap-3 mb-4">
                <h2 className="text-2xl font-bold">{t('solution_azure_title')}</h2>
                <div className="flex gap-1.5 shrink-0">
                  <StatusBadge status="live" />
                  <StatusBadge status="beta" />
                </div>
              </div>
              <p className="text-muted-foreground mb-8">{t('solution_azure_description')}</p>
              <Link
                href={azureHref}
                className="btn-cap mt-auto self-start inline-flex items-center px-6 py-3 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors"
              >
                {t('solution_azure_cta')}
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </div>

            {/* API0.AI */}
            <div className="flex flex-col rounded-2xl border border-border bg-background p-8">
              <div className="flex items-start justify-between gap-3 mb-4">
                <h2 className="text-2xl font-bold">{t('solution_api0_title')}</h2>
                <div className="shrink-0">
                  <StatusBadge status="live" />
                </div>
              </div>
              <p className="text-muted-foreground mb-8">{t('solution_api0_description')}</p>
              <a
                href={API0_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-cap-light mt-auto self-start inline-flex items-center px-6 py-3 rounded-lg border border-primary text-primary hover:bg-primary/10 transition-colors"
              >
                {t('solution_api0_cta')}
                <ExternalLink className="ml-2 w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Why Rust / why Mayorana — proof */}
      <section className="py-20 bg-background">
        <div className="container max-w-5xl">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="text-3xl font-bold mb-6">{t('why_heading')}</h2>
              <p className="lead-marketing text-muted-foreground">{t('why_body')}</p>
            </div>
            {/* Same four proof points as the Azure page, kept in one place. */}
            <ul className="space-y-4">
              {['1', '2', '3', '4'].map((n) => (
                <li key={n} className="flex items-start gap-3">
                  <Check className="w-5 h-5 mt-0.5 shrink-0 text-primary" />
                  <span>{tAzure(`stack_point_${n}`)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Selected tools */}
      <section className="py-20 bg-secondary/30">
        <div className="container max-w-6xl">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
            <h2 className="text-3xl font-bold">{t('selected_tools_heading')}</h2>
            <Link
              href={getLocalizedPath(locale, '/apps')}
              className="inline-flex items-center text-primary font-medium hover:underline"
            >
              {t('selected_tools_view_all')}
              <ArrowRight className="ml-1.5 w-4 h-4" />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {tools.map((tool) => {
              const body = (
                <>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <h3 className="text-lg font-bold text-primary">{tool.name}</h3>
                    <StatusBadge status={tool.status} />
                  </div>
                  <p className="text-sm text-muted-foreground">{tool.line}</p>
                </>
              );

              const className =
                'flex flex-col rounded-2xl border border-border bg-background p-6 hover:border-primary/50 hover:shadow-lg transition-all';

              return tool.external ? (
                <a
                  key={tool.id}
                  href={tool.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={className}
                >
                  {body}
                </a>
              ) : (
                <Link key={tool.id} href={tool.href} className={className}>
                  {body}
                </Link>
              );
            })}
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
          </div>
        </div>
      </section>
    </>
  );
}
