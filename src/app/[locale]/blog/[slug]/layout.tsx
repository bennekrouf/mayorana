import { getPostBySlug, getPostCounterpart } from '@/lib/blog';
import { buildMetadata } from '@/lib/seo';
import type { Metadata } from 'next'

type Props = {
  params: Promise<{ slug: string; locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale } = await params;

  // getPostBySlug defaults to 'en' when no locale is passed, so omitting it
  // here looked up French posts in the English set and fell through to the
  // "Post Not Found" title on every /fr/blog/* page.
  const post = getPostBySlug(slug, locale);

  if (!post) {
    return {
      title: 'Post Not Found | Mayorana',
      robots: { index: false, follow: false },
    };
  }

  // French posts carry their own slugs, so the alternate cannot be derived by
  // swapping the locale segment — it has to be looked up. This uses the same
  // pairing rule as scripts/generate-sitemap.js so the page head and the
  // sitemap agree; a post with no counterpart gets a canonical and no hreflang.
  const counterpart = getPostCounterpart(slug, locale);
  const alternatePaths = counterpart
    ? {
        [locale]: `/blog/${slug}`,
        [locale === 'en' ? 'fr' : 'en']: `/blog/${counterpart.slug}`,
      }
    : undefined;

  return buildMetadata({
    locale,
    path: `/blog/${slug}`,
    title: post.title,
    description: post.excerpt,
    ogType: 'article',
    crossLocale: false,
    alternatePaths,
  });
}

export default function PostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
