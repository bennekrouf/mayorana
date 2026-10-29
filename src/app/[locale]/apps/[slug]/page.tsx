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
import { getToolBySlug, LICENCE_URL, toolSlugs, toolsForPlanProducts } from '@/data/tools';
import { fetchPlans } from '@/lib/plans';
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
    // The product name leads every app title; the site name would only push
    // the description of what it does past what a search result shows.
    titleSuffix: false,
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
  // The plans on sale, for the offers below; revalidated hourly, as on the
  // pricing page. Without them the page still states the free offer.
  const plans = (await fetchPlans({ next: { revalidate: 3600 } }).catch(() => null))?.plans ?? [];
  const paidOffers = plans
    .filter((plan) => toolsForPlanProducts(plan.products).some((t) => t.id === tool.id))
    .map((plan) => {
      const price = (plan.price_cents / 100).toFixed(2);
      const priceCurrency = plan.currency.toUpperCase();
      return {
        '@type': 'Offer',
        name: `${plan.name} plan: ${tool.name} Pro, monthly`,
        price,
        priceCurrency,
        url: `${SITE_URL}/${locale}/pricing`,
        priceSpecification: {
          '@type': 'UnitPriceSpecification',
          price,
          priceCurrency,
          billingDuration: 'P1M',
        },
      };
    });

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
      // Both ways to get it, each said for what it is: free under the
      // non-commercial licence, and the monthly plans that unlock its Pro
      // edition. A single price-0 offer would have been false for companies;
      // stating none left search engines unable to tell it is free at all.
      offers: [
        {
          '@type': 'Offer',
          name: 'Free for personal, educational and non-profit use',
          price: '0',
          priceCurrency: paidOffers[0]?.priceCurrency ?? 'CHF',
          url: pageUrl,
        },
        ...paidOffers,
      ],
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
