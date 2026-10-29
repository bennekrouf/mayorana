// One blog post, prerendered for every post in both locales.
// File: src/app/[locale]/blog/[slug]/page.tsx

import { notFound } from 'next/navigation';
import LayoutTemplate from '@/components/layout/LayoutTemplate';
import BlogPost from '@/components/blog/BlogPost';
import { getPostBySlug, getAllPosts, getLearningPath } from '@/lib/blog';
import { SITE_URL, SITE_NAME } from '@/lib/seo';
import { authorPageUrl, getAuthor } from '@/lib/authors';

type Props = {
  params: Promise<{ slug: string; locale: string }>;
}

export async function generateStaticParams() {
  try {
    return ['en', 'fr'].flatMap((locale) => getAllPosts(locale).map((post) => ({ locale, slug: post.slug })));
  } catch (error) {
    console.error('Error generating blog post params:', error);
    return [];
  }
}

// Looks the post up; rendering happens in PostPage, outside the try/catch, so
// a render error is not mistaken for a lookup failure. An unknown slug is a
// 404, not a redirect to the listing: Google reads a redirect from a dead URL
// to an unrelated page as a soft 404. Renamed posts get a 301 of their own in
// next.config.ts.
async function loadPost({ params }: Props) {
  try {
    const { slug, locale } = await params;
    if (!slug || !locale) notFound();

    const post = getPostBySlug(slug, locale);
    if (!post) notFound();

    return { post, path: getLearningPath(post.track, locale) };
  } catch (error) {
    // Next.js redirect() and notFound() work by throwing special internal errors.
    // We must re-throw them so the framework can handle them correctly.
    const digest = (error as { digest?: string })?.digest;
    if (digest?.startsWith('NEXT_')) {
      throw error;
    }
    console.error('Error loading blog post:', error);
    notFound();
  }
}

export default async function PostPage(props: Props) {
  const { post, path } = await loadPost(props);
  const { locale } = await props.params;
  const url = `${SITE_URL}/${locale}/blog/${post.slug}`;
  const author = getAuthor(post.author);

  // What the article is and where it sits, for search and answer engines. The
  // image is the post's own social card (opengraph-image.tsx beside this file).
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.seo?.description || post.excerpt,
      url,
      mainEntityOfPage: url,
      datePublished: post.date,
      dateModified: post.updated || post.date,
      inLanguage: locale,
      keywords: post.tags,
      image: `${url}/opengraph-image`,
      author: {
        '@type': author.kind,
        name: author.name,
        ...(author.kind === 'Person' ? { url: authorPageUrl(locale) } : { url: SITE_URL }),
        ...(author.sameAs ? { sameAs: author.sameAs } : {}),
      },
      publisher: {
        '@type': 'Organization',
        name: SITE_NAME,
        url: SITE_URL,
        logo: { '@type': 'ImageObject', url: `${SITE_URL}/image/logo.png` },
      },
      isPartOf: { '@type': 'Blog', name: `${SITE_NAME} Blog`, url: `${SITE_URL}/${locale}/blog` },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: SITE_NAME, item: `${SITE_URL}/${locale}` },
        { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_URL}/${locale}/blog` },
        { '@type': 'ListItem', position: 3, name: post.title, item: url },
      ],
    },
  ];

  return (
    <LayoutTemplate>
      {/* Plain script tag so the JSON-LD is in the served HTML; see the app
          detail page for why next/script will not do. */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <section className="py-20 bg-background">
        <div className="container">
          <BlogPost post={post} path={path} />
        </div>
      </section>
    </LayoutTemplate>
  );
}
