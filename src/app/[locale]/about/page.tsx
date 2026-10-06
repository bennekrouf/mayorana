'use client';

import React from 'react';
import Link from 'next/link';
import LayoutTemplate from '@/components/layout/LayoutTemplate';
import { ArrowRight, Check, ExternalLink } from 'lucide-react';
import { motion } from '@/components/ui/Motion';
import { useTranslations, useLocale } from 'next-intl';
import { getLocalizedPath } from '@/lib/i18n-utils';
import { Api0FlowDiagram } from '@/components/diagrams/Api0FlowDiagram';

const API0_URL = 'https://api0.ai';
const API0_ARCHITECTURE_URL = 'https://api0.ai/blog/how-api0-works';

const FACTS = ['product', 'stack', 'tools', 'base'] as const;
const PRINCIPLES = ['1', '2', '3', '4'] as const;
const API0_POINTS = ['1', '2', '3'] as const;

export default function AboutPage() {
  const t = useTranslations('about');
  const locale = useLocale();

  return (
    <LayoutTemplate>
      {/* Hero */}
      <section className="py-20 bg-gradient-to-b from-secondary to-background">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <motion.h1
              className="text-4xl md:text-5xl font-bold mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {t('hero_title')}
            </motion.h1>
            <motion.p
              className="text-xl text-muted-foreground"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {t('hero_subtitle')}
            </motion.p>
          </div>
        </div>
      </section>

      {/* Who we are + facts */}
      <section className="py-16 bg-background">
        <div className="container max-w-5xl">
          <div className="grid md:grid-cols-5 gap-12 items-start">
            <div className="md:col-span-3 space-y-4 text-lg">
              <h2 className="text-3xl font-bold mb-6">{t('who_heading')}</h2>
              <p>{t('who_1')}</p>
              <p>{t('who_2')}</p>
              <p className="text-muted-foreground">{t('who_3')}</p>
            </div>

            <dl className="md:col-span-2 rounded-2xl border border-border bg-secondary/40 p-6 space-y-5">
              {FACTS.map((key) => (
                <div key={key}>
                  <dt className="text-xs font-semibold uppercase tracking-wider text-primary mb-1">
                    {t(`fact_${key}_label`)}
                  </dt>
                  <dd>{t(`fact_${key}_value`)}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* api0 */}
      <section className="py-20 bg-secondary">
        <div className="container max-w-5xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="eyebrow text-primary mb-3">{t('api0_eyebrow')}</div>
              <h2 className="text-3xl font-bold mb-6">{t('api0_heading')}</h2>
              <p className="text-lg text-muted-foreground mb-6">{t('api0_body')}</p>
              <ul className="space-y-3 mb-8">
                {API0_POINTS.map((n) => (
                  <li key={n} className="flex items-start gap-3">
                    <Check className="w-5 h-5 mt-0.5 shrink-0 text-primary" />
                    <span>{t(`api0_point_${n}`)}</span>
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap items-center gap-6">
                <a
                  href={API0_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-6 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition-colors"
                >
                  {t('visit_api0')} <ExternalLink className="ml-2 w-4 h-4" />
                </a>
                <a
                  href={API0_ARCHITECTURE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-primary font-medium hover:underline"
                >
                  {t('architecture_link')} <ArrowRight className="ml-1.5 w-4 h-4" />
                </a>
              </div>
            </div>
            <div className="flex items-center justify-center rounded-xl border border-border bg-background p-6">
              <Api0FlowDiagram />
            </div>
          </div>
        </div>
      </section>

      {/* How we work */}
      <section className="py-20 bg-background">
        <div className="container max-w-6xl">
          <h2 className="text-3xl font-bold mb-10 text-center">{t('principles_heading')}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {PRINCIPLES.map((n) => (
              <div key={n} className="p-6 rounded-xl bg-secondary/50 border border-border">
                <h3 className="text-lg font-semibold mb-3">{t(`principle_${n}_title`)}</h3>
                <p className="text-muted-foreground">{t(`principle_${n}_body`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-secondary/30">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">{t('cta_heading')}</h2>
            <p className="text-lg text-muted-foreground mb-8">{t('cta_body')}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a
                href={API0_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-8 py-4 rounded-lg bg-primary text-white text-lg font-semibold hover:bg-primary/90 transform transition duration-200 hover:-translate-y-1 shadow-xl shadow-primary/20"
              >
                {t('cta_primary')} <ExternalLink className="ml-2 w-5 h-5" />
              </a>
              <Link
                href={getLocalizedPath(locale, '/contact')}
                className="text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
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
