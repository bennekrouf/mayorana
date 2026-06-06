'use client';

import Link from 'next/link';
import { ExternalLink, ArrowRight } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { getLocalizedPath } from '@/lib/i18n-utils';

export default function ClientHomeSection() {
  const t = useTranslations('home');
  const locale = useLocale();

  return (
    <>
      {/* Hero Section */}
      <section className="py-20 md:py-32 bg-gradient-to-b from-secondary to-background">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              {t('hero_title')}
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground mb-10">
              {t('hero_subtitle')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={getLocalizedPath(locale, "/apps")}
                className="inline-flex items-center px-8 py-4 rounded-lg bg-primary text-white text-lg font-semibold hover:bg-primary/90 transform transition duration-200 hover:-translate-y-1 shadow-xl shadow-primary/20"
              >
                {t('see_our_apps')}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link
                href={getLocalizedPath(locale, "/contact")}
                className="inline-flex items-center px-8 py-4 rounded-lg bg-foreground text-background text-lg font-semibold hover:bg-foreground/90 transform transition duration-200 hover:-translate-y-1"
              >
                {t('get_in_touch')}
              </Link>
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
                  {t('get_in_touch')}
                </Link>
              </div>
            </div>

            <div className="relative h-80 w-full rounded-xl overflow-hidden shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 backdrop-blur-sm flex items-center justify-center">
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
