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
import { notFound } from 'next/navigation';
import LayoutTemplate from '@/components/layout/LayoutTemplate';
import { ToolDetailContent, loadContent, loadToolDetail } from '@/components/apps/ToolDetailContent';
import { getToolBySlug, LICENCE_URL, toolSlugs } from '@/data/tools';
import { buildMetadata, SITE_URL } from '@/lib/seo';
import { locales } from '../../../../../i18n';

type Props = { params: Promise<{ locale: string; slug: string }> };

export function generateStaticParams() {
  return locales.flatMap((locale) => toolSlugs.map((slug) => ({ locale, slug })));
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
    markdownUrl: `${SITE_URL}/${locale}/apps/${slug}.md`,
  });
}

export default async function ToolDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  const detail = await loadToolDetail(locale, slug);
  if (!detail) notFound();

  const { tool, content, latest } = detail;
  const { tagline, seoDescription, requirements, faq } = content;
  const pageUrl = `${SITE_URL}/${locale}/apps/${slug}`;

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
      applicationCategory: tool.applicationCategory ?? 'DeveloperApplication',
      operatingSystem: tool.downloads.map((d) => d.label).join(', '),
      url: pageUrl,
      downloadUrl: tool.downloads.map((d) => d.href),
      softwareRequirements: requirements.join('; '),
      inLanguage: locale,
      codeRepository: tool.source,
      // A version and a date are what tell an answer engine this is a live
      // product rather than a page written once, so they are stated here as
      // well as on the release-notes page they come from.
      ...(latest
        ? {
            softwareVersion: latest.version,
            datePublished: latest.date,
            releaseNotes: `${pageUrl}/releases`,
          }
        : {}),
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
      <ToolDetailContent locale={locale} slug={slug} detail={detail} variant="page" />
    </LayoutTemplate>
  );
}
