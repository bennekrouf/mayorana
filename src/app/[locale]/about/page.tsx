'use client';

import React from 'react';
import Link from 'next/link';
import LayoutTemplate from '@/components/layout/LayoutTemplate';
import { FiExternalLink } from 'react-icons/fi';
import { motion } from '@/components/ui/Motion';
import { useTranslations, useLocale } from 'next-intl';

export default function AboutPage() {
  const t = useTranslations('about');
  const locale = useLocale();

  const skills = [
    { category: t('programming'), items: ["Rust", "TypeScript", "Python", "WebAssembly"] },
    { category: t('ai_ml'), items: ["LLM Integration", "NLP", "AI Agent Development", "Prompt Engineering"] },
    { category: t('infrastructure'), items: ["AWS", "Docker", "Kubernetes", "gRPC"] },
    { category: t('frontend'), items: ["React", "Next.js", "Tailwind CSS", "WebSockets"] }
  ];

  const values = [
    {
      title: t('technical_excellence.title'),
      description: t('technical_excellence.description')
    },
    {
      title: t('continuous_learning.title'),
      description: t('continuous_learning.description')
    },
    {
      title: t('client_success.title'),
      description: t('client_success.description')
    },
    {
      title: t('simplicity.title'),
      description: t('simplicity.description')
    }
  ];

  return (
    <LayoutTemplate>
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-secondary to-background">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <motion.h1
              className="text-4xl font-bold mb-6"
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

      {/* About Content */}
      <section className="py-16 bg-background">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
            <motion.div
              className="relative h-96 rounded-xl overflow-hidden border border-border"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Placeholder for profile image */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary flex items-center justify-center">
                <span className="text-4xl font-bold text-foreground">Mayorana</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h2 className="text-3xl font-bold mb-6">{t('who_i_am')}</h2>
              <div className="space-y-4 text-lg">
                <p>{t('description1')}</p>
                <p>{t('description2')}</p>
                <p>{t('description3')}</p>
                <p className="font-medium text-foreground">{t('description4')}</p>
              </div>
            </motion.div>
          </div>

          {/* Skills Section */}
          <motion.div
            className="mb-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h2 className="text-3xl font-bold mb-10 text-center">{t('skills_expertise')}</h2>
            <div className="grid md:grid-cols-4 gap-6">
              {skills.map((skillGroup) => (
                <div
                  key={skillGroup.category}
                  className="p-6 bg-secondary rounded-xl border border-border"
                >
                  <h3 className="font-semibold mb-4 text-primary">{skillGroup.category}</h3>
                  <ul className="space-y-2">
                    {skillGroup.items.map((skill) => (
                      <li key={skill} className="flex items-center">
                        <span className="mr-2">•</span>
                        <span>{skill}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Values Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h2 className="text-3xl font-bold mb-10 text-center">{t('core_values')}</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value) => (
                <div
                  key={value.title}
                  className="p-6 rounded-xl bg-secondary/50 border border-border"
                >
                  <h3 className="text-xl font-semibold mb-4">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* api0.ai Section */}
      <section className="py-20 bg-secondary">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">{t('featured_project')}</h2>
              <p className="text-lg text-muted-foreground">
                {t('project_subtitle')}
              </p>
            </div>

            <div className="bg-background p-8 rounded-xl border border-border mb-10">
              <p className="mb-6">{t('project_description1')}</p>
              <p className="mb-6">{t('project_description2')}</p>
              <div className="flex justify-center">
                <Link
                  href="https://api0.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-6 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition-colors"
                >
                  {t('visit_api0')} <FiExternalLink className="ml-2" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">{t('ready_work_together')}</h2>
            <p className="text-lg text-muted-foreground mb-8">
              {t('cta_description')}
            </p>
            <Link
              href={`/${locale}/contact`}
              className="inline-flex items-center px-8 py-4 rounded-lg bg-primary text-white text-lg font-semibold hover:bg-primary/90 transform transition duration-200 hover:-translate-y-1 shadow-xl shadow-primary/20"
            >
              {t('common.get_in_touch')}
            </Link>
          </div>
        </div>
      </section>
    </LayoutTemplate>
  );
}
