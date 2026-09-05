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

  // Note: there are 62 tag pages for 60 posts, so many list a single post and
  // duplicate it. Passing `noindex: true` here is the usual remedy, but it is
  // left indexed deliberately — dropping 62 live URLs out of the index is a
  // call to make against Search Console data, not by default.
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
