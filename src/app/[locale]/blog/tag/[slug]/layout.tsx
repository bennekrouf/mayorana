// File: src/app/[locale]/blog/tag/[slug]/layout.tsx
import { Metadata } from 'next';
import { getTagBySlug } from '@/lib/blog';
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

  // Tag pages outnumber posts (188 across both locales for 139 posts), so many
  // list a single post and largely duplicate it. `noindex: true` is the usual
  // remedy and buildMetadata supports it — but these are deliberately left
  // indexed: the pages already exist and rank on their own, and dropping live
  // URLs out of the index costs weeks to undo if they were earning anything.
  return buildMetadata({
    locale,
    path: `/blog/tag/${slug}`,
    title: `${tag} - Blog`,
    description: `Articles about ${tag}`,
  });
}

export default function TagLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
