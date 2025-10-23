'use client';

import React from 'react';
import Link from 'next/link';
import { Code, Zap, Shield, Brain, ExternalLink, ArrowRight } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { getLocalizedPath } from '@/lib/i18n-utils';

interface PortfolioTool {
  name: string;
  slug: string;
  description: string;
  tech: string;
  url: string;
  status: 'live' | 'mvp' | 'coming_soon';
  cta: string;
  icon: React.ReactNode;
}

export default function ClientHomeSection() {
  // Use next-intl hooks like your original component
  const t = useTranslations('home');
  const tPortfolio = useTranslations('portfolio');
  const tCommon = useTranslations('common');
  const locale = useLocale();

  // Portfolio tools data
  const portfolioTools: PortfolioTool[] = [
    {
      name: "API0.AI",
      slug: "api0",
      description: tPortfolio('api0_description'),
      tech: tPortfolio('api0_tech'),
      url: "https://api0.ai",
      status: "live",
      cta: tPortfolio('api0_cta'),
      icon: <Brain className="w-8 h-8" />
    },
    {
      name: "CVENOM",
      slug: "cvenom",
      description: tPortfolio('cvenom_description'),
      tech: tPortfolio('cvenom_tech'),
      url: "https://cvenom.com",
      status: "live",
      cta: tPortfolio('cvenom_cta'),
      icon: <Shield className="w-8 h-8" />
    },
    {
      name: "SOLANIZE",
      slug: "solanize",
      description: tPortfolio('solanize_description'),
      tech: tPortfolio('solanize_tech'),
      url: "https://ribh.io",
      status: "mvp",
      cta: tPortfolio('solanize_cta'),
      icon: <Zap className="w-8 h-8" />
    }
  ];

  const consulting = {
    name: tPortfolio('consulting_title'),
    description: tPortfolio('consulting_description'),
    tech: tPortfolio('consulting_tech'),
    cta: tPortfolio('consulting_cta'),
    icon: <Code className="w-8 h-8" />
  };

  return (
    <>
      {/* Hero Section - exactly like live site: large text, no buttons above */}
      <section className="py-20 md:py-32 bg-gradient-to-b from-secondary to-background">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">

            {/* Main Hero Text - LARGE like live site, no buttons above */}
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              {t('hero_title')}
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground mb-10">
              {t('hero_subtitle')}
            </p>

            {/* Single CTA like live site */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="https://api0.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-8 py-4 rounded-lg bg-primary text-white text-lg font-semibold hover:bg-primary/90 transform transition duration-200 hover:-translate-y-1 shadow-xl shadow-primary/20"
              >
                {t('discover_api0')}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link
                href={getLocalizedPath(locale, "/contact")}
                className="inline-flex items-center px-8 py-4 rounded-lg bg-foreground text-background text-lg font-semibold hover:bg-foreground/90 transform transition duration-200 hover:-translate-y-1"
              >
                {t('book_rust_training')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* What I Offer Section - like live site */}
      <section id="portfolio" className="py-20 bg-background">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">
              {t('what_i_offer')}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('services_subtitle')}
            </p>
          </div>

          {/* Services Grid - like live site layout */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {portfolioTools.map((tool) => (
              <div
                key={tool.name}
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-secondary/50 to-secondary/20 border border-border p-6 hover:shadow-2xl transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-primary/10 rounded-full text-primary">
                    {tool.icon}
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${tool.status === 'live'
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                    : tool.status === 'mvp'
                      ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300'
                    }`}>
                    {tool.status === 'live' ? 'LIVE' : tool.status === 'mvp' ? 'MVP' : 'COMING SOON'}
                  </div>
                </div>

                <h3 className="text-xl font-bold mb-2 text-primary">{tool.name}</h3>
                <p className="text-sm font-medium mb-2">{tool.description}</p>
                <p className="text-xs text-muted-foreground mb-4">{tool.tech}</p>

                <div className="mt-auto">
                  {tool.status === 'live' || tool.status === 'mvp' ? (
                    <a
                      href={tool.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center px-4 py-2 rounded-lg font-medium text-sm hover:bg-primary/90 transform transition duration-200 hover:-translate-y-1 shadow-lg group-hover:shadow-primary/25 ${tool.status === 'live'
                        ? 'bg-primary text-white'
                        : 'bg-yellow-500 text-white hover:bg-yellow-600'
                        }`}
                    >
                      {tool.cta}
                      <ExternalLink className="ml-1 w-3 h-3" />
                    </a>
                  ) : (
                    <div className="inline-flex items-center px-4 py-2 rounded-lg bg-secondary text-muted-foreground font-medium text-sm cursor-not-allowed">
                      {tool.cta}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Consulting - Fourth Card */}
            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 p-6 hover:shadow-2xl transition-all duration-300">
              <div className="text-center">
                <div className="p-3 bg-primary/10 rounded-full text-primary mb-4 inline-block">
                  {consulting.icon}
                </div>
                <h3 className="text-xl font-bold mb-2 text-primary">{consulting.name}</h3>
                <p className="text-sm font-medium mb-2">{consulting.description}</p>
                <p className="text-xs text-muted-foreground mb-4">{consulting.tech}</p>
                <Link
                  href={getLocalizedPath(locale, "/contact")}
                  className="inline-flex items-center px-4 py-2 rounded-lg bg-primary text-white font-medium text-sm hover:bg-primary/90 transform transition duration-200 hover:-translate-y-1 shadow-lg group-hover:shadow-primary/25"
                >
                  {consulting.cta}
                  <ArrowRight className="ml-1 w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* API0.AI Spotlight - like live site */}
      <section className="py-20 bg-secondary/30">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <div>
              <h2 className="text-3xl font-bold mb-6">{t('discover_api0_title')}</h2>
              <p className="text-lg text-muted-foreground mb-6">
                {t('api0_description')}
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <div className="mr-3 text-primary">✓</div>
                  <span>{t('api0_feature1')}</span>
                </li>
                <li className="flex items-start">
                  <div className="mr-3 text-primary">✓</div>
                  <span>{t('api0_feature2')}</span>
                </li>
                <li className="flex items-start">
                  <div className="mr-3 text-primary">✓</div>
                  <span>{t('api0_feature3')}</span>
                </li>
                <li className="flex items-start">
                  <div className="mr-3 text-primary">✓</div>
                  <span>{t('api0_feature4')}</span>
                </li>
              </ul>
              <div className="flex gap-4">
                <Link
                  href="https://api0.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-6 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transform transition duration-200 hover:-translate-y-1 shadow-lg shadow-primary/20"
                >
                  {t('explore_api0')}
                  <ExternalLink className="ml-2 w-4 h-4" />
                </Link>
                <Link
                  href={getLocalizedPath(locale, "/contact")}
                  className="inline-flex items-center px-6 py-3 rounded-lg border border-primary text-primary font-medium hover:bg-primary/10 transition duration-200"
                >
                  {tCommon('book_consultation')}
                </Link>
              </div>
            </div>

            <div className="relative h-80 w-full rounded-xl overflow-hidden shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 backdrop-blur-sm flex items-center justify-center">
                <div className="bg-background/90 backdrop-blur-sm p-6 rounded-xl border border-border max-w-md">
                  <code className="text-sm block font-mono">
                    <span className="text-blue-600">const</span> <span className="text-green-600">api0</span> = <span className="text-blue-600">await</span> Api0.<span className="text-purple-600">initialize</span>({`{`}
                    <br />
                    &nbsp;&nbsp;apiKey: <span className="text-orange-600">&quot;your-api-key&quot;</span>,
                    <br />
                    &nbsp;&nbsp;domain: <span className="text-orange-600">&quot;yourcompany.com&quot;</span>
                    <br />
                    {`}`});
                    <br />
                    <br />
                    {/* Powers all my tools comment */}
                    <span className="text-green-600">// Powers all my tools</span>
                  </code>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - like live site */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">
              {t('ready_elevate')}
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              {t('cta_description')}
            </p>
            <Link
              href={getLocalizedPath(locale, "/contact")}
              className="inline-flex items-center px-8 py-4 rounded-lg bg-primary text-white text-lg font-semibold hover:bg-primary/90 transform transition duration-200 hover:-translate-y-1 shadow-xl shadow-primary/20"
            >
              {t('get_in_touch')}
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
