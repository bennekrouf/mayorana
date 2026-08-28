'use client';

import React from 'react';
import Link from 'next/link';
import LayoutTemplate from '@/components/layout/LayoutTemplate';
import { motion } from '@/components/ui/Motion';
import { ArrowRight, Check, Bot, Cloud, Cpu } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { getLocalizedPath } from '@/lib/i18n-utils';

// `id` doubles as the ?service= value the contact form preselects — keep these
// in sync with the dropdown in src/app/[locale]/contact/page.tsx.
const OFFERS = [
  { id: 'ai-agents', key: 'ai_agents', icon: Bot },
  { id: 'azure', key: 'azure', icon: Cloud },
  { id: 'rust', key: 'rust', icon: Cpu },
] as const;

const DELIVERABLES = ['deliver1', 'deliver2', 'deliver3', 'deliver4'] as const;
const PROCESS_STEPS = ['1', '2', '3'] as const;

export default function ServicesPage() {
  const t = useTranslations('services');
  const locale = useLocale();

  return (
    <LayoutTemplate>
      {/* Page header */}
      <section className="py-20 bg-gradient-to-b from-secondary to-background">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <motion.h1
              className="text-4xl font-bold mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {t('page_title')}
            </motion.h1>
            <motion.p
              className="text-xl text-muted-foreground"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {t('page_subtitle')}
            </motion.p>
          </div>
        </div>
      </section>

      {/* Three equal offers */}
      <section className="py-16 bg-background">
        <div className="container max-w-6xl">
          <div className="grid md:grid-cols-3 gap-6 items-stretch">
            {OFFERS.map(({ id, key, icon: Icon }, i) => (
              <motion.div
                key={id}
                id={id}
                className="scroll-mt-24 flex flex-col rounded-2xl border border-border bg-gradient-to-br from-secondary/50 to-secondary/20 p-8"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <div className="mb-6 p-3 inline-flex self-start bg-primary/10 rounded-full text-primary">
                  <Icon className="w-6 h-6" />
                </div>

                <h2 className="text-xl font-bold mb-4">{t(`${key}.title`)}</h2>
                <p className="text-sm text-muted-foreground mb-6">{t(`${key}.description`)}</p>

                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                  {t('deliver_label')}
                </p>
                <ul className="space-y-3 mb-8">
                  {DELIVERABLES.map((d) => (
                    <li key={d} className="flex items-start gap-2.5 text-sm">
                      <Check className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
                      <span>{t(`${key}.${d}`)}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={getLocalizedPath(locale, `/contact?service=${id}`)}
                  className="mt-auto inline-flex items-center justify-center px-5 py-3 rounded-lg bg-primary text-white font-medium text-sm hover:bg-primary/90 transition-colors"
                >
                  {t(`${key}.cta`)}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How we work */}
      <section className="py-16 bg-secondary">
        <div className="container max-w-5xl">
          <h2 className="text-3xl font-bold mb-12">{t('process_heading')}</h2>

          <div className="grid md:grid-cols-3 gap-8">
            {PROCESS_STEPS.map((n, i) => (
              <motion.div
                key={n}
                className="flex flex-col"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white text-sm font-bold shrink-0">
                    {n}
                  </span>
                  <h3 className="text-lg font-bold">{t(`process_${n}_title`)}</h3>
                </div>
                <p className="text-sm text-muted-foreground">{t(`process_${n}_body`)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">{t('cta_heading')}</h2>
            <p className="text-lg text-muted-foreground mb-8">{t('cta_body')}</p>
            <Link
              href={getLocalizedPath(locale, '/contact')}
              className="inline-flex items-center px-8 py-4 rounded-lg bg-primary text-white text-lg font-semibold hover:bg-primary/90 transform transition duration-200 hover:-translate-y-1 shadow-xl shadow-primary/20"
            >
              {t('cta_primary')}
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </LayoutTemplate>
  );
}
