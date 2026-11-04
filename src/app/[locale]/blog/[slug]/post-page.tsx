// One blog post, shared by mayorana.ch's /[locale]/blog/[slug] and Swiss Rust's
// /[locale]/swissrust/blog/[slug]. Swiss Rust passes rustOnly: its posts are
// only those tagged `rust`, and any other slug is a 404 there.
// File: src/app/[locale]/blog/[slug]/post-page.tsx

import { notFound, permanentRedirect } from 'next/navigation';
import LayoutTemplate from '@/components/layout/LayoutTemplate';
import BlogPost from '@/components/blog/BlogPost';
import { getPostBySlug, getAllPosts, getLearningPath } from '@/lib/blog';
import { SITE_URL, SITE_NAME } from '@/lib/seo';
import { authorPageUrl, getAuthor } from '@/lib/authors';

export type PostPageProps = {
  params: Promise<{ slug: string; locale: string }>;
}

export function postStaticParams(rustOnly: boolean) {
  try {
    return ['en', 'fr'].flatMap((locale) => getAllPosts(locale, rustOnly).map((post) => ({ locale, slug: post.slug })));
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
async function loadPost({ params }: PostPageProps, rustOnly: boolean) {
  try {
    const { slug, locale } = await params;
    if (!slug || !locale) notFound();

    const post = getPostBySlug(slug, locale, rustOnly);
    if (!post) {
      // A post that exists but is not tagged `rust` lives on mayorana.ch only.
      // Rust posts link to such posts in their text, so on Swiss Rust send the
      // reader to the same article there rather than to a 404.
      if (rustOnly && getPostBySlug(slug, locale)) {
        permanentRedirect(`${SITE_URL}/${locale}/blog/${slug}`);
      }
      notFound();
    }

    return { post, path: getLearningPath(post.track, locale, rustOnly) };
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

export async function renderPostPage(props: PostPageProps, rustOnly: boolean) {
  const { post, path } = await loadPost(props, rustOnly);
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
