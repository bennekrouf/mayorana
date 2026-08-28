'use client';

import React from 'react';
import Link from 'next/link';
import LayoutTemplate from '@/components/layout/LayoutTemplate';
import { motion } from '@/components/ui/Motion';
import { ArrowRight, Check, ExternalLink, Puzzle, ShieldAlert, Gauge } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { getLocalizedPath } from '@/lib/i18n-utils';

const API0_URL = 'https://api0.ai';

// Same shape as the Azure page's friction cards, minus the outcome line —
// the fix here is the whole product, covered by the section below.
const FRICTIONS = [
  { key: '1', icon: Puzzle },
  { key: '2', icon: ShieldAlert },
  { key: '3', icon: Gauge },
] as const;

const SOLUTION_POINTS = ['1', '2', '3', '4', '5'] as const;
const RUST_POINTS = ['1', '2', '3', '4'] as const;

export default function AiAgentsSolutionsPage() {
  const t = useTranslations('solutions_ai_agents');
  const locale = useLocale();

  const contactHref = getLocalizedPath(locale, '/contact');
  const servicesHref = getLocalizedPath(locale, '/services');

  return (
    <LayoutTemplate>
      {/* Hero */}
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
                href={API0_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition-colors"
              >
                {t('hero_cta_primary')} <ExternalLink className="ml-2 w-4 h-4" />
              </a>
              <Link
                href={contactHref}
                className="inline-flex items-center px-6 py-3 rounded-lg border border-border bg-background font-medium hover:bg-secondary transition-colors"
              >
                {t('hero_cta_secondary')}
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* The problem */}
      <section className="py-16 bg-background">
        <div className="container max-w-6xl">
          <h2 className="text-3xl font-bold mb-12">{t('friction_heading')}</h2>

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
                <p className="text-sm text-muted-foreground">{t(`friction_${key}_body`)}</p>
              </motion.div>
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
                className="inline-flex items-center px-6 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition-colors"
              >
                {t('hero_cta_primary')} <ExternalLink className="ml-2 w-4 h-4" />
              </a>
            </div>

            <div className="relative h-80 w-full rounded-xl overflow-hidden shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-background/90 backdrop-blur-sm p-6 rounded-xl border border-border max-w-md">
                  <code className="text-sm block font-mono">
                    <span className="text-gray-500">{`// api0.ai — MCP Gateway`}</span>
                    <br />
                    <span className="text-blue-600">Your APIs</span> → <span className="text-purple-600">MCP Tools</span> → <span className="text-green-600">AI Agents</span>
                    <br />
                    <br />
                    <span className="text-gray-500">{`// Connect any endpoint`}</span>
                    <br />
                    <span className="text-blue-600">const</span> <span className="text-green-600">agent</span> = api0.<span className="text-purple-600">createAgent</span>({`{`}
                    <br />
                    &nbsp;&nbsp;tools: [<span className="text-orange-600">&quot;your-api&quot;</span>],
                    <br />
                    &nbsp;&nbsp;model: <span className="text-orange-600">&quot;claude&quot;</span>
                    <br />
                    {`}`});
                  </code>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it powers the rest of the stack */}
      <section className="py-16 bg-background">
        <div className="container max-w-3xl text-center">
          <h2 className="text-3xl font-bold mb-6">{t('powers_heading')}</h2>
          <p className="text-lg text-muted-foreground">{t('powers_body')}</p>
        </div>
      </section>

      {/* Rust proof */}
      <section className="py-16 bg-secondary">
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

      {/* Next action */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">{t('cta_heading')}</h2>
            <p className="text-lg text-muted-foreground mb-8">{t('cta_body')}</p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                href={contactHref}
                className="inline-flex items-center px-8 py-4 rounded-lg bg-primary text-white text-lg font-semibold hover:bg-primary/90 transform transition duration-200 hover:-translate-y-1 shadow-xl shadow-primary/20"
              >
                {t('cta_primary')} <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link
                href={servicesHref}
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
