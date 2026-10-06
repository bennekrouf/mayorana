'use client';

import React from 'react';
import LayoutTemplate from '@/components/layout/LayoutTemplate';
import { motion } from '@/components/ui/Motion';
import { ArrowRight, Check, ExternalLink, Puzzle, ShieldAlert, Gauge } from 'lucide-react';
import { useTranslations } from 'next-intl';
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

const SOLUTION_POINTS = ['1', '2', '3', '4', '5'] as const;
const AUTH_POINTS = ['1', '2', '3', '4', '5'] as const;
const RUST_POINTS = ['1', '2', '3', '4'] as const;

export default function AiAgentsSolutionsPage() {
  const t = useTranslations('solutions_ai_agents');

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

            <div className="flex items-center justify-center rounded-xl border border-border bg-background p-6">
              <Api0FlowDiagram />
            </div>
          </div>
        </div>
      </section>

      {/* What the backend receives */}
      <section className="py-16 bg-background">
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
    </LayoutTemplate>
  );
}
