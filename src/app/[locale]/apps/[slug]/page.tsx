// One page per desktop tool.
//
// The catalogue page at /apps has to fit eleven products on one screen, which
// leaves each of them two sentences and no URL of its own. This route gives
// every tool the thing a search engine can actually rank: a page that is about
// one product, with its own title, its own copy and its own structured data.
//
// Route params come from src/data/tools.ts and the copy from the "app_detail"
// namespace in messages/{en,fr}.json, so adding a tool to the catalogue adds
// its page as soon as the copy exists.

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { ArrowLeft, ArrowRight, Check, Github, Scale } from 'lucide-react';
import LayoutTemplate from '@/components/layout/LayoutTemplate';
import {
  DataSourceBadge,
  DownloadButtonsLarge,
  StatusBadge,
} from '@/components/ui/ToolVisuals';
import {
  appI18nKey,
  getRelatedTools,
  getToolBySlug,
  LICENCE_URL,
  toolSlugs,
  type DesktopToolConfig,
} from '@/data/tools';
import { getPostBySlug } from '@/lib/blog';
import { buildMetadata, SITE_URL } from '@/lib/seo';
import { locales } from '../../../../../i18n';

type Props = { params: Promise<{ locale: string; slug: string }> };

// Shapes of the array-valued copy, read with t.raw() because next-intl only
// returns strings from t().
type Feature = { title: string; body: string };
type FaqEntry = { q: string; a: string };

export function generateStaticParams() {
  return locales.flatMap((locale) => toolSlugs.map((slug) => ({ locale, slug })));
}

// Everything the page needs from the copy, resolved once so generateMetadata
// and the component agree on what they are rendering.
async function loadContent(locale: string, tool: DesktopToolConfig) {
  const t = await getTranslations({ locale, namespace: 'app_detail' });
  const tApps = await getTranslations({ locale, namespace: 'apps' });
  const key = appI18nKey[tool.id];

  return {
    t,
    tagline: tApps(`${key}_tagline`),
    shortDescription: tApps(`${key}_description`),
    seoTitle: t(`apps.${key}.seo_title`),
    seoDescription: t(`apps.${key}.seo_description`),
    overview: t.raw(`apps.${key}.overview`) as string[],
    features: t.raw(`apps.${key}.features`) as Feature[],
    requirements: t.raw(`apps.${key}.requirements`) as string[],
    faq: t.raw(`apps.${key}.faq`) as FaqEntry[],
    articleSlug: t(`apps.${key}.article_slug`),
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) return { title: 'Not found' };

  const { seoTitle, seoDescription } = await loadContent(locale, tool);

  return buildMetadata({
    locale,
    path: `/apps/${slug}`,
    title: seoTitle,
    description: seoDescription,
    ogImagePath: `/apps/${slug}/opengraph-image`,
  });
}

export default async function ToolDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) notFound();

  const {
    t,
    tagline,
    shortDescription,
    seoDescription,
    overview,
    features,
    requirements,
    faq,
    articleSlug,
  } = await loadContent(locale, tool);

  // The blog post about this tool, when there is one. The post already links
  // here; this closes the loop so a crawler arriving at either one finds the
  // other. Slugs differ per locale, so the lookup is locale-scoped.
  const article = articleSlug ? getPostBySlug(articleSlug, locale) : null;

  const pageUrl = `${SITE_URL}/${locale}/apps/${slug}`;
  const related = getRelatedTools(slug);

  // The three schema blocks worth emitting here: what the product is, where the
  // page sits in the site, and the questions it answers. Google no longer draws
  // FAQ rich results for most sites, but the markup still tells answer engines
  // which question each block responds to.
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: tool.name,
      alternateName: tagline,
      description: seoDescription,
      applicationCategory: 'DeveloperApplication',
      operatingSystem: tool.downloads.map((d) => d.label).join(', '),
      url: pageUrl,
      downloadUrl: tool.downloads.map((d) => d.href),
      softwareRequirements: requirements.join('; '),
      inLanguage: locale,
      codeRepository: tool.source,
      // No `offers` block. These are dual-licensed: free for personal and
      // non-profit use, paid for commercial use. Declaring price 0 would be a
      // false claim to the majority of the people searching for them, and
      // there is no schema.org shape that says "free unless you are a company"
      // without picking one of the two and misrepresenting the other.
      license: LICENCE_URL,
      publisher: {
        '@type': 'Organization',
        name: 'Mayorana',
        url: SITE_URL,
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Mayorana', item: `${SITE_URL}/${locale}` },
        { '@type': 'ListItem', position: 2, name: 'Apps', item: `${SITE_URL}/${locale}/apps` },
        { '@type': 'ListItem', position: 3, name: tool.name, item: pageUrl },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faq.map((entry) => ({
        '@type': 'Question',
        name: entry.q,
        acceptedAnswer: { '@type': 'Answer', text: entry.a },
      })),
    },
  ];

  const statusNote =
    tool.status === 'wip'
      ? t('status_note_wip')
      : tool.status === 'beta'
        ? t('status_note_beta')
        : null;

  return (
    <LayoutTemplate>
      {/* A plain script tag, not next/script: next/script serialises its
          children into a client-side injection queue, which leaves no
          <script type="application/ld+json"> element in the served HTML for a
          crawler to parse. This renders straight into the markup. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero: name, what it is, and the download — the download is the point
          of the page, so it sits above the fold rather than after the copy. */}
      <section className="py-16 bg-gradient-to-b from-secondary to-background">
        <div className="container max-w-4xl">
          <Link
            href={`/${locale}/apps`}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            {t('back_to_apps')}
          </Link>

          <div className="flex flex-wrap items-center gap-2 mb-4">
            <StatusBadge status={tool.status} />
            {tool.dataSource && <DataSourceBadge dataSource={tool.dataSource} />}
          </div>

          <h1 className="text-4xl font-bold mb-3">{tool.name}</h1>
          <p className="text-xl text-muted-foreground mb-6">{tagline}</p>
          <p className="text-base text-muted-foreground mb-8 max-w-3xl">{shortDescription}</p>

          <DownloadButtonsLarge downloads={tool.downloads} />
          <p className="text-xs text-muted-foreground mt-3 max-w-2xl">{t('download_intro')}</p>
          <p className="text-xs text-muted-foreground mt-1.5 max-w-2xl">{t('signing_note_mac')}</p>

          {statusNote && (
            <p className="mt-6 text-sm text-muted-foreground border-l-2 border-border pl-4">
              {statusNote}
            </p>
          )}
        </div>
      </section>

      <section className="py-14 bg-background">
        <div className="container max-w-4xl">
          <h2 className="text-2xl font-bold mb-5">{t('overview_heading')}</h2>
          <div className="space-y-4">
            {overview.map((paragraph, i) => (
              <p key={i} className="text-muted-foreground leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 bg-secondary/30 border-t border-border">
        <div className="container max-w-4xl">
          <h2 className="text-2xl font-bold mb-8">{t('features_heading')}</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature) => (
              <div key={feature.title} className="rounded-xl border border-border bg-background p-5">
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 bg-background border-t border-border">
        <div className="container max-w-4xl grid md:grid-cols-2 gap-10">
          <div>
            <h2 className="text-2xl font-bold mb-5">{t('requirements_heading')}</h2>
            <ul className="space-y-2.5">
              {requirements.map((requirement) => (
                <li key={requirement} className="flex gap-2.5 text-sm text-muted-foreground">
                  <Check className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
                  {requirement}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-5">{t('tech_heading')}</h2>
            <p className="text-sm font-mono text-muted-foreground">{tool.tech}</p>
          </div>
        </div>
      </section>

      {/* Licence and source. The licence is not a footnote for these tools —
          "free" is only true for personal and non-profit use, so a visitor
          deciding whether to download at work needs it before the FAQ. */}
      <section className="py-14 bg-background border-t border-border">
        <div className="container max-w-4xl grid md:grid-cols-2 gap-10">
          <div>
            <h2 className="flex items-center gap-2 text-2xl font-bold mb-4">
              <Scale className="w-5 h-5 text-primary" />
              {t('licence_heading')}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              {t('licence_body')}
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href={LICENCE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline underline-offset-4"
              >
                {t('licence_link')}
              </a>
              <Link
                href={`/${locale}/contact`}
                className="text-sm text-primary hover:underline underline-offset-4"
              >
                {t('licence_cta')}
              </Link>
            </div>
          </div>
          <div>
            <h2 className="flex items-center gap-2 text-2xl font-bold mb-4">
              <Github className="w-5 h-5 text-primary" />
              {t('source_heading')}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              {t('source_body')}
            </p>
            <a
              href={tool.source}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline underline-offset-4"
            >
              {t('source_link')}
            </a>
          </div>
        </div>
      </section>

      <section className="py-14 bg-secondary/30 border-t border-border">
        <div className="container max-w-4xl">
          <h2 className="text-2xl font-bold mb-8">{t('faq_heading')}</h2>
          <div className="space-y-6">
            {faq.map((entry) => (
              <div key={entry.q}>
                <h3 className="font-semibold mb-1.5">{entry.q}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{entry.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {article && (
        <section className="py-14 bg-background border-t border-border">
          <div className="container max-w-4xl">
            <h2 className="text-2xl font-bold mb-6">{t('article_heading')}</h2>
            <Link
              href={`/${locale}/blog/${article.slug}`}
              className="block rounded-xl border border-border p-6 hover:border-primary/50 transition-colors"
            >
              <h3 className="text-lg font-semibold text-primary mb-2">{article.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{article.excerpt}</p>
            </Link>
          </div>
        </section>
      )}

      {/* Internal links out to the sibling tools: a new page with nothing
          pointing at it and nothing pointing out of it gets crawled slowly. */}
      {related.length > 0 && (
        <section className="py-14 bg-background border-t border-border">
          <div className="container max-w-4xl">
            <h2 className="text-2xl font-bold mb-8">{t('related_heading')}</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {related.map((other) => (
                <RelatedCard key={other.id} locale={locale} tool={other} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-16 bg-secondary border-t border-border">
        <div className="container max-w-3xl text-center">
          <h2 className="text-2xl font-bold mb-4">{t('cta_heading')}</h2>
          <p className="text-muted-foreground mb-6">{t('cta_body')}</p>
          <Link
            href={`/${locale}/contact`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition-colors"
          >
            {t('cta_button')}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </LayoutTemplate>
  );
}

async function RelatedCard({ locale, tool }: { locale: string; tool: DesktopToolConfig }) {
  const tApps = await getTranslations({ locale, namespace: 'apps' });
  const key = appI18nKey[tool.id];

  return (
    <Link
      href={`/${locale}/apps/${tool.id}`}
      className="block rounded-xl border border-border bg-background p-5 hover:border-primary/50 transition-colors"
    >
      <h3 className="font-semibold text-primary mb-1.5">{tool.name}</h3>
      <p className="text-xs text-muted-foreground leading-relaxed">{tApps(`${key}_tagline`)}</p>
    </Link>
  );
}
