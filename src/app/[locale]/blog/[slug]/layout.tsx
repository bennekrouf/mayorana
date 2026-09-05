import { getPostBySlug } from '@/lib/blog';
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

  return buildMetadata({
    locale,
    path: `/blog/${slug}`,
    title: post.title,
    description: post.excerpt,
    ogType: 'article',
    // French posts carry their own slugs, so there is no locale-swapped URL
    // for a post to point at. See the note in src/lib/seo.ts.
    crossLocale: false,
  });
}

export default function PostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
