// Debug version of blog post page to see what's happening
// File: src/app/[locale]/blog/[slug]/page.tsx (add debugging)

import { notFound, redirect } from 'next/navigation';
import LayoutTemplate from '@/components/layout/LayoutTemplate';
import BlogPost from '@/components/blog/BlogPost';
import { getPostBySlug, getAllPosts, getLearningPath } from '@/lib/blog';
import { SITE_URL, SITE_NAME } from '@/lib/seo';

type Props = {
  params: Promise<{ slug: string; locale: string }>;
}

// Generate static params for better performance
export async function generateStaticParams() {
  try {
    console.log('🔍 generateStaticParams for blog posts...');

    const locales = ['en', 'fr'];
    const allParams = [];

    for (const locale of locales) {
      const posts = getAllPosts(locale);
      console.log(`📊 Found ${posts.length} posts for locale ${locale}`);

      for (const post of posts) {
        console.log(`   - Adding param: locale=${locale}, slug=${post.slug}`);
        allParams.push({
          locale,
          slug: post.slug,
        });
      }
    }

    console.log(`✅ Generated ${allParams.length} static params total`);
    return allParams;
  } catch (error) {
    console.error('❌ Error generating static params:', error);
    return [];
  }
}

// Looks the post up; rendering happens in PostPage, outside the try/catch, so
// a render error is not mistaken for a lookup failure.
async function loadPost({ params }: Props) {
  try {
    const { slug, locale } = await params;

    // console.log('🔍 PostPage Debug:');
    // console.log('   - Requested slug:', slug);
    // console.log('   - Requested locale:', locale);

    // Validate slug and locale
    if (!slug || typeof slug !== 'string') {
      console.log('❌ Invalid slug:', slug);
      notFound();
    }

    if (!locale || typeof locale !== 'string') {
      console.log('❌ Invalid locale:', locale);
      notFound();
    }

    // console.log('✅ Valid slug and locale, looking for post...');

    // Try to get the post with explicit locale
    const post = getPostBySlug(slug, locale);

    // console.log('📊 Post lookup result:');
    // console.log('   - Post found:', !!post);
    // if (post) {
    //   console.log('   - Post title:', post.title);
    //   console.log('   - Post locale:', post.locale);
    //   console.log('   - Post slug:', post.slug);
    // }

    // Debug: Show all available posts for this locale
    // const allPosts = getAllPosts(locale);
    // console.log(`📋 All available posts in ${locale}:`);
    // allPosts.forEach((p, index) => {
    //   console.log(`   ${index + 1}. "${p.title}" (slug: ${p.slug}, locale: ${p.locale})`);
    // });

    if (!post) {
      console.log('❌ Post not found, redirecting to blog listing');
      redirect(`/${locale}/blog`);
    }

    // console.log('✅ Post found, rendering...');

    return { post, path: getLearningPath(post.track, locale) };
  } catch (error) {
    // Next.js redirect() and notFound() work by throwing special internal errors.
    // We must re-throw them so the framework can handle them correctly.
    const digest = (error as { digest?: string })?.digest;
    if (digest?.startsWith('NEXT_')) {
      throw error;
    }
    console.error('❌ Error in PostPage:', error);
    notFound();
  }
}

export default async function PostPage(props: Props) {
  const { post, path } = await loadPost(props);
  const { locale } = await props.params;
  const url = `${SITE_URL}/${locale}/blog/${post.slug}`;

  // What the article is and where it sits, for search and answer engines. The
  // image is the social card the page's metadata already points at.
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.excerpt,
      url,
      mainEntityOfPage: url,
      datePublished: post.date,
      inLanguage: locale,
      keywords: post.tags,
      image: `${SITE_URL}/${locale}/opengraph-image`,
      author: { '@type': 'Person', name: post.author },
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
