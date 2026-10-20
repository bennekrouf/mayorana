// A tool's detail, opened over the catalogue from one of its cards.
//
// This intercepts client-side navigation from /apps to /apps/[slug]: the URL
// becomes the tool's own, but the catalogue stays mounted underneath and the
// detail slides in as a side panel. A refresh, a shared link or a crawler
// still gets the full page at [slug]/page.tsx — this route only exists for
// soft navigation.

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { AppDetailPanel } from '@/components/apps/AppDetailPanel';
import { ToolDetailContent, loadContent, loadToolDetail } from '@/components/apps/ToolDetailContent';
import { getToolBySlug } from '@/data/tools';
import { getLocalizedPath } from '@/lib/i18n-utils';
import { buildMetadata } from '@/lib/seo';

type Props = { params: Promise<{ locale: string; slug: string }> };

// Same metadata as the page, so the tab title reads right while the panel is open.
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) return {};

  const { seoTitle, seoDescription } = await loadContent(locale, tool);
  return buildMetadata({
    locale,
    path: `/apps/${slug}`,
    title: seoTitle,
    description: seoDescription,
    ogImagePath: `/apps/${slug}/opengraph-image`,
  });
}

export default async function ToolDetailPanel({ params }: Props) {
  const { locale, slug } = await params;
  const detail = await loadToolDetail(locale, slug);
  if (!detail) notFound();

  const t = await getTranslations({ locale, namespace: 'app_detail' });

  return (
    <AppDetailPanel
      title={detail.tool.name}
      fullPageHref={getLocalizedPath(locale, `/apps/${slug}`)}
      labels={{ close: t('panel_close'), openPage: t('panel_open_page') }}
    >
      <ToolDetailContent locale={locale} slug={slug} detail={detail} variant="panel" />
    </AppDetailPanel>
  );
}
