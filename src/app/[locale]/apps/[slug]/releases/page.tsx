// One page per tool listing every version it has shipped.
//
// A detail page is written once and then sits still. This one changes every
// time the app does, which is what makes it worth having as a page rather than
// a link to a GitHub Releases tab: it is the only URL on the site that a
// crawler has a standing reason to come back to, it carries the vocabulary of
// the actual work (connections.json, ActiveDirectoryOAuth, Event Grid
// subscription overlap) rather than the marketing summary of it, and every
// version is anchored so a support answer can link to the exact release that
// fixed something.
//
// The notes come from the tool's own CHANGELOG.md by way of releases.json —
// see src/lib/releases.ts for why they are read from the download host and not
// from the source repository.

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { ArrowLeft, ArrowRight, History, Link2, Rss } from 'lucide-react';
import LayoutTemplate from '@/components/layout/LayoutTemplate';
import { DownloadButtonsLarge, StatusBadge } from '@/components/ui/ToolVisuals';
import { appI18nKey, getRelatedTools, getToolBySlug, type DesktopToolConfig } from '@/data/tools';
import {
  formatReleaseDate,
  getReleaseFeed,
  releaseAnchor,
  releaseFeedUrl,
  toolsWithReleases,
  type Release,
  type ReleaseFeed,
} from '@/lib/releases';
import { buildMetadata, SITE_URL } from '@/lib/seo';
import { locales } from '../../../../../../i18n';

type Props = { params: Promise<{ locale: string; slug: string }> };

export function generateStaticParams() {
  return locales.flatMap((locale) => toolsWithReleases.map((slug) => ({ locale, slug })));
}

// The description has to say something a search result can use, and for a page
// like this that is the version and the date: "0.5.49, 5 September 2026" is the
// difference between a snippet that looks maintained and one that looks like a
// template. Built here so the metadata and the page agree.
async function summary(locale: string, tool: DesktopToolConfig, feed: ReleaseFeed | null) {
  const t = await getTranslations({ locale, namespace: 'app_releases' });
  const tApps = await getTranslations({ locale, namespace: 'apps' });
  const latest = feed?.releases[0];

  return {
    t,
    tagline: tApps(`${appI18nKey[tool.id]}_tagline`),
    shortDescription: tApps(`${appI18nKey[tool.id]}_description`),
    seoTitle: t('seo_title', { name: tool.name }),
    seoDescription: latest
      ? t('seo_description', {
          name: tool.name,
          version: latest.version,
          date: formatReleaseDate(latest.date, locale),
          count: feed?.releases.length ?? 0,
        })
      : t('seo_description_empty', { name: tool.name }),
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) return { title: 'Not found' };

  const feed = await getReleaseFeed(slug);
  const { seoTitle, seoDescription } = await summary(locale, tool, feed);

  return buildMetadata({
    locale,
    path: `/apps/${slug}/releases`,
    title: seoTitle,
    description: seoDescription,
    ogImagePath: `/apps/${slug}/opengraph-image`,
  });
}

export default async function ToolReleasesPage({ params }: Props) {
  const { locale, slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) notFound();

  const feed = await getReleaseFeed(slug);
  // A tool with no feed has no page here rather than an empty one: an indexed
  // URL that says "no releases yet" is a thin page that competes with the
  // detail page it was supposed to support.
  if (!feed || feed.releases.length === 0) notFound();

  const { t, tagline, shortDescription, seoDescription } = await summary(locale, tool, feed);
  const tDetail = await getTranslations({ locale, namespace: 'app_detail' });

  const pageUrl = `${SITE_URL}/${locale}/apps/${slug}/releases`;
  const toolUrl = `${SITE_URL}/${locale}/apps/${slug}`;
  const [latest, ...history] = feed.releases;
  const related = getRelatedTools(slug);

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: tool.name,
      alternateName: tagline,
      description: seoDescription,
      applicationCategory: 'DeveloperApplication',
      operatingSystem: tool.downloads.map((d) => d.label).join(', '),
      url: toolUrl,
      // The property exists for exactly this: the page that says what changed.
      releaseNotes: pageUrl,
      softwareVersion: latest.version,
      datePublished: latest.date,
      downloadUrl: tool.downloads.map((d) => d.href),
      inLanguage: locale,
      codeRepository: tool.source,
      publisher: { '@type': 'Organization', name: 'Mayorana', url: SITE_URL },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Mayorana', item: `${SITE_URL}/${locale}` },
        { '@type': 'ListItem', position: 2, name: 'Apps', item: `${SITE_URL}/${locale}/apps` },
        { '@type': 'ListItem', position: 3, name: tool.name, item: toolUrl },
        { '@type': 'ListItem', position: 4, name: t('breadcrumb'), item: pageUrl },
      ],
    },
    // Every version as an item with its own anchor, so the history is legible
    // as a list of dated things rather than one long page of prose.
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: t('seo_title', { name: tool.name }),
      itemListOrder: 'https://schema.org/ItemListOrderDescending',
      numberOfItems: feed.releases.length,
      itemListElement: feed.releases.map((release, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: `${tool.name} ${release.version}`,
        url: `${pageUrl}#${releaseAnchor(release.version)}`,
      })),
    },
  ];

  return (
    <LayoutTemplate>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="py-16 bg-gradient-to-b from-secondary to-background">
        <div className="container max-w-4xl">
          <Link
            href={`/${locale}/apps/${slug}`}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            {t('back_to_tool', { name: tool.name })}
          </Link>

          <div className="flex flex-wrap items-center gap-2 mb-4">
            <StatusBadge status={tool.status} />
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-muted-foreground">
              <History className="w-3.5 h-3.5" />
              {t('release_count', { count: feed.releases.length })}
            </span>
          </div>

          <h1 className="text-4xl font-bold mb-3">{t('h1', { name: tool.name })}</h1>
          <p className="text-xl text-muted-foreground mb-6">{t('intro', { name: tool.name })}</p>
          <p className="text-base text-muted-foreground max-w-3xl">{shortDescription}</p>
        </div>
      </section>

      {/* The current version, with the download. Someone who arrived here from a
          search for "what changed in <app>" is one step from installing it. */}
      <section
        id={releaseAnchor(latest.version)}
        className="py-14 bg-background border-t border-border scroll-mt-24"
      >
        <div className="container max-w-4xl">
          <h2 className="text-2xl font-bold mb-2">{t('latest_heading')}</h2>
          <p className="text-sm text-muted-foreground mb-6">
            {t('latest_line', {
              version: latest.version,
              date: formatReleaseDate(latest.date, locale),
            })}
          </p>

          <ReleaseBody release={latest} />

          <div className="mt-8">
            <DownloadButtonsLarge app={tool.id} appName={tool.name} downloads={tool.downloads} />
            <p className="text-xs text-muted-foreground mt-3 max-w-2xl">
              {tDetail('download_intro')}
            </p>
          </div>
        </div>
      </section>

      {history.length > 0 && (
        <section className="py-14 bg-secondary/30 border-t border-border">
          <div className="container max-w-4xl">
            <h2 className="text-2xl font-bold mb-6">{t('history_heading')}</h2>

            {/* A row of version chips: a jump list for a reader, and a dense
                block of internal anchors for a crawler working out that this
                page is a list of many things. */}
            <nav aria-label={t('jump_label')} className="flex flex-wrap gap-2 mb-10">
              {feed.releases.map((release) => (
                <a
                  key={release.version}
                  href={`#${releaseAnchor(release.version)}`}
                  className="px-2.5 py-1 rounded-md border border-border bg-background text-xs font-mono text-muted-foreground hover:border-primary/50 hover:text-foreground transition-colors"
                >
                  {release.version}
                </a>
              ))}
            </nav>

            <div className="space-y-12">
              {history.map((release) => (
                <ReleaseEntry
                  key={release.version}
                  release={release}
                  locale={locale}
                  name={tool.name}
                  permalink={t('permalink')}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* The feed itself. Developers are the audience for these tools, and a
          machine-readable history is a reason for one of them to link here. */}
      <section className="py-14 bg-background border-t border-border">
        <div className="container max-w-4xl">
          <h2 className="flex items-center gap-2 text-2xl font-bold mb-4">
            <Rss className="w-5 h-5 text-primary" />
            {t('feed_heading')}
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4 max-w-3xl">
            {t('feed_body', { name: tool.name })}
          </p>
          <a
            href={releaseFeedUrl(slug)}
            className="text-sm font-mono text-primary hover:underline underline-offset-4 break-all"
          >
            {releaseFeedUrl(slug)}
          </a>
        </div>
      </section>

      {related.length > 0 && (
        <section className="py-14 bg-secondary/30 border-t border-border">
          <div className="container max-w-4xl">
            <h2 className="text-2xl font-bold mb-8">{tDetail('related_heading')}</h2>
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
          <h2 className="text-2xl font-bold mb-4">{tDetail('cta_heading')}</h2>
          <p className="text-muted-foreground mb-6">{tDetail('cta_body')}</p>
          <Link
            href={`/${locale}/contact`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition-colors"
          >
            {tDetail('cta_button')}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </LayoutTemplate>
  );
}

function ReleaseEntry({
  release,
  locale,
  name,
  permalink,
}: {
  release: Release;
  locale: string;
  name: string;
  permalink: string;
}) {
  const anchor = releaseAnchor(release.version);

  return (
    <article id={anchor} className="scroll-mt-24">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-4">
        <h3 className="text-xl font-bold font-mono">
          {name} {release.version}
        </h3>
        <time dateTime={release.date} className="text-sm text-muted-foreground">
          {formatReleaseDate(release.date, locale)}
        </time>
        <a
          href={`#${anchor}`}
          aria-label={`${permalink} ${release.version}`}
          className="text-muted-foreground/60 hover:text-primary transition-colors"
        >
          <Link2 className="w-3.5 h-3.5" />
        </a>
      </div>
      <ReleaseBody release={release} />
    </article>
  );
}

function ReleaseBody({ release }: { release: Release }) {
  return (
    <div className="space-y-5">
      {release.sections.map((section, index) => (
        <div key={`${section.heading}-${index}`}>
          {section.heading && (
            <h4 className="text-xs font-semibold uppercase tracking-wide text-primary mb-2">
              {section.heading}
            </h4>
          )}
          <ul className="space-y-2.5">
            {section.items.map((item, itemIndex) => (
              <li
                key={itemIndex}
                className="text-sm text-muted-foreground leading-relaxed pl-4 border-l-2 border-border"
              >
                <Inline text={item} />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

// The notes are written as markdown bullets and carry four inline constructs:
// `code`, **strong** (the name of a button or menu), *emphasis* and
// [links](url). Rendered as elements rather than pushed through a markdown
// library and dangerouslySetInnerHTML — the text comes off a network feed, and
// this way there is no HTML path for it to travel down at all. **strong** is
// matched before *emphasis*, which would otherwise take its inner pair.
const INLINE = /(`[^`]+`|\*\*[^*\n]+\*\*|\*[^*\n]+\*|\[[^\]]+\]\([^)\s]+\))/g;

function Inline({ text }: { text: string }) {
  return (
    <>
      {text.split(INLINE).map((part, index) => {
        if (part.startsWith('`') && part.endsWith('`') && part.length > 1) {
          return (
            <code
              key={index}
              className="px-1 py-0.5 rounded bg-secondary text-foreground/90 text-[0.85em] font-mono"
            >
              {part.slice(1, -1)}
            </code>
          );
        }

        if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
          return (
            <strong key={index} className="font-semibold text-foreground">
              {part.slice(2, -2)}
            </strong>
          );
        }

        if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
          return <em key={index}>{part.slice(1, -1)}</em>;
        }

        const link = /^\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)$/.exec(part);
        if (link) {
          return (
            <a
              key={index}
              href={link[2]}
              rel="noopener noreferrer"
              className="text-primary hover:underline underline-offset-4"
            >
              {link[1]}
            </a>
          );
        }

        return <span key={index}>{part}</span>;
      })}
    </>
  );
}

async function RelatedCard({ locale, tool }: { locale: string; tool: DesktopToolConfig }) {
  const tApps = await getTranslations({ locale, namespace: 'apps' });

  return (
    <Link
      href={`/${locale}/apps/${tool.id}`}
      className="block rounded-xl border border-border bg-background p-5 hover:border-primary/50 transition-colors"
    >
      <h3 className="font-semibold text-primary mb-1.5">{tool.name}</h3>
      <p className="text-xs text-muted-foreground leading-relaxed">
        {tApps(`${appI18nKey[tool.id]}_tagline`)}
      </p>
    </Link>
  );
}
