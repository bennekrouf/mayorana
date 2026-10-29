// File: src/app/[locale]/blog/tag/[slug]/layout.tsx
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { getPostsByTag, getTagBySlug, isTagIndexed } from '@/lib/blog';
import { buildMetadata } from '@/lib/seo';

type Props = {
  params: Promise<{ slug: string; locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale } = await params;

  // Same decoding as the page: accented tag slugs arrive percent-encoded.
  let tagSlug = slug;
  try {
    tagSlug = decodeURIComponent(slug);
  } catch {
    // Not valid percent-encoding — fall through with the raw value.
  }

  const tag = getTagBySlug(tagSlug, locale);

  if (!tag) {
    return {
      title: 'Tag Not Found',
      robots: { index: false, follow: false },
    };
  }

  // A tag page only exists in a locale if some post there carries the tag, and
  // the tag vocabularies are not the same: 'polymorphisme' and
  // 'pointeurs-intelligents' are French-only, 'operators' English-only. So the
  // hreflang pair is emitted only when the tag is indexed in both locales — an
  // alternate pointing at a 404 or a noindex page is worse than none. Same rule
  // as scripts/generate-sitemap.js.
  const otherLocale = locale === 'en' ? 'fr' : 'en';
  const indexed = isTagIndexed(tagSlug, locale);
  const pairedIndexed = indexed && isTagIndexed(tagSlug, otherLocale);

  // Most tags carry one or two posts (140 of 212 across both locales had a
  // single one), and such a page is a near copy of the post it lists. Those
  // stay reachable for readers but out of the index; see isTagIndexed.
  const t = await getTranslations({ locale, namespace: 'metadata' });
  const count = getPostsByTag(tagSlug, locale).length;
  return buildMetadata({
    locale,
    path: `/blog/tag/${slug}`,
    title: t('tag_title', { tag }),
    description: t('tag_description', { tag, count }),
    crossLocale: pairedIndexed,
    noindex: !indexed,
  });
}

export default function TagLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
