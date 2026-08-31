'use client';

import React from 'react';
import Link from 'next/link';
import LayoutTemplate from '@/components/layout/LayoutTemplate';
import { motion } from '@/components/ui/Motion';
import { ArrowRight, Check, PlayCircle, Share2, Search } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { getLocalizedPath } from '@/lib/i18n-utils';
import { aisTools, appI18nKey } from '@/data/tools';
import { DataSourceBadge, DownloadButtons } from '@/components/ui/ToolVisuals';

// The three frictions, paired with the icon that stands for the fix. Order
// matches the loop a team actually walks: build it, understand it, debug it.
const FRICTIONS = [
  { key: '1', icon: PlayCircle },
  { key: '2', icon: Share2 },
  { key: '3', icon: Search },
] as const;

// "Which tool do I need?" rows — each need maps to one tool in the suite, in
// the same order as `aisTools`, so status badges stay in sync with the data.
const CHOOSER_ROWS = ['1', '2', '3', '4'] as const;

export default function AzureSolutionsPage() {
  const t = useTranslations('solutions_azure');
  const tApps = useTranslations('apps');
  const locale = useLocale();

  return (
    <LayoutTemplate>
      {/* Hero — outcome first, mechanism second */}
      <section className="py-20 bg-gradient-to-b from-secondary to-background">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <motion.p
              className="text-sm font-semibold uppercase tracking-wider text-primary mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {t('hero_eyebrow')}
            </motion.p>
            <motion.h1
              className="text-4xl md:text-5xl font-bold mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {t('hero_title')}
            </motion.h1>
            <motion.p
              className="text-xl text-muted-foreground mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {t('hero_subtitle')}
            </motion.p>
            <motion.div
              className="flex flex-wrap gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <a
                href="#tools"
                className="inline-flex items-center px-6 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition-colors"
              >
                {t('hero_cta_primary')} <ArrowRight className="ml-2 w-4 h-4" />
              </a>
              <Link
                href={getLocalizedPath(locale, '/contact')}
                className="inline-flex items-center px-6 py-3 rounded-lg border border-border bg-background font-medium hover:bg-secondary transition-colors"
              >
                {t('hero_cta_secondary')}
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* The problem, in the customer's words */}
      <section className="py-16 bg-background">
        <div className="container max-w-6xl">
          <div className="max-w-2xl mb-12">
            <h2 className="text-3xl font-bold mb-4">{t('friction_heading')}</h2>
            <p className="text-lg text-muted-foreground">{t('friction_subtitle')}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {FRICTIONS.map(({ key, icon: Icon }, i) => (
              <motion.div
                key={key}
                className="rounded-2xl border border-border bg-gradient-to-br from-secondary/50 to-secondary/20 p-6 flex flex-col"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <div className="mb-4 p-3 inline-flex self-start bg-primary/10 rounded-full text-primary">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold mb-3">{t(`friction_${key}_problem`)}</h3>
                <p className="text-sm text-muted-foreground mb-6">{t(`friction_${key}_body`)}</p>
                <p className="mt-auto flex items-start gap-2 text-sm font-medium text-primary">
                  <Check className="w-4 h-4 mt-0.5 shrink-0" />
                  {t(`friction_${key}_outcome`)}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* The suite — four tools, downloads on the card */}
      <section id="tools" className="py-16 bg-secondary scroll-mt-20">
        <div className="container max-w-6xl">
          <div className="max-w-2xl mb-12">
            <h2 className="text-3xl font-bold mb-4">{t('tools_heading')}</h2>
            <p className="text-lg text-muted-foreground">{t('tools_subtitle')}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {aisTools.map((tool, i) => (
              <motion.div
                key={tool.id}
                id={tool.id}
                className={`scroll-mt-24 rounded-2xl border border-border bg-background p-6 flex flex-col ${tool.dataSource?.borderClass ?? ''}`}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: (i % 2) * 0.1 }}
              >
                <div className="flex items-start justify-between mb-3 gap-2">
                  <h3 className="text-xl font-bold text-primary">{tool.name}</h3>
                  {tool.dataSource && <DataSourceBadge dataSource={tool.dataSource} />}
                </div>

                <p className="text-sm font-medium mb-2">
                  {tApps(`${appI18nKey[tool.id]}_tagline`)}
                </p>
                <p className="text-sm text-muted-foreground mb-3">
                  {tApps(`${appI18nKey[tool.id]}_description`)}
                </p>
                <p className="text-xs text-muted-foreground/70 font-mono mb-6">{tool.tech}</p>

                <div className="mt-auto">
                  <DownloadButtons downloads={tool.downloads} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Which tool do I need? */}
      <section className="py-16 bg-background">
        <div className="container max-w-4xl">
          <h2 className="text-3xl font-bold mb-8">{t('chooser_heading')}</h2>

          <div className="overflow-x-auto rounded-2xl border border-border">
            <table className="w-full text-left border-collapse">
              <thead className="bg-secondary">
                <tr>
                  <th className="px-5 py-3 text-sm font-semibold">{t('chooser_col_need')}</th>
                  <th className="px-5 py-3 text-sm font-semibold">{t('chooser_col_tool')}</th>
                </tr>
              </thead>
              <tbody>
                {CHOOSER_ROWS.map((key, i) => {
                  const tool = aisTools[i];
                  return (
                    <tr key={key} className="border-t border-border">
                      <td className="px-5 py-4 text-sm text-muted-foreground">
                        {t(`chooser_${key}_need`)}
                      </td>
                      <td className="px-5 py-4 text-sm font-medium whitespace-nowrap">
                        <a href={`#${tool.id}`} className="text-primary hover:underline">
                          {tool.name}
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Proof — why these are trustworthy */}
      <section className="py-16 bg-secondary">
        <div className="container max-w-5xl">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="text-3xl font-bold mb-6">{t('stack_heading')}</h2>
              <p className="text-lg text-muted-foreground">{t('stack_body')}</p>
            </div>
            <ul className="space-y-4">
              {['1', '2', '3', '4'].map((n) => (
                <li key={n} className="flex items-start gap-3">
                  <Check className="w-5 h-5 mt-0.5 shrink-0 text-primary" />
                  <span>{t(`stack_point_${n}`)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Next action */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">{t('cta_heading')}</h2>
            <p className="text-lg text-muted-foreground mb-8">{t('cta_body')}</p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                href={getLocalizedPath(locale, '/contact')}
                className="inline-flex items-center px-8 py-4 rounded-lg bg-primary text-white text-lg font-semibold hover:bg-primary/90 transform transition duration-200 hover:-translate-y-1 shadow-xl shadow-primary/20"
              >
                {t('cta_primary')}
              </Link>
              <Link
                href={getLocalizedPath(locale, '/services')}
                className="inline-flex items-center px-8 py-4 rounded-lg border border-border text-lg font-medium hover:bg-secondary transition-colors"
              >
                {t('cta_secondary')}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </LayoutTemplate>
  );
}
