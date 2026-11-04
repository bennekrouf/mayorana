// One tag's posts, shared by mayorana.ch's /[locale]/blog/tag/[slug] and Swiss
// Rust's /[locale]/swissrust/blog/tag/[slug]. Swiss Rust passes rustOnly, so
// both the posts and the tag sidebar come from the posts tagged `rust`.
// File: src/app/[locale]/blog/tag/[slug]/tag-page.tsx
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import LayoutTemplate from '@/components/layout/LayoutTemplate';
import BlogList from '@/components/blog/BlogList';
import TagFilter from '@/components/blog/TagFilter';
import type { Metadata } from 'next';
import {
  getAllTags,
  getPostsByTag,
  getTagBySlug,
  isTagIndexed,
} from '@/lib/blog';
import { buildMetadata } from '@/lib/seo';

export type TagPageProps = {
  params: Promise<{ slug: string; locale: string }>;
}

// A slug that is not valid percent-encoding would throw out of
// decodeURIComponent; fall back to the raw value and let the lookup miss.
function decodeSlug(slug: string): string {
  try {
    return decodeURIComponent(slug);
  } catch {
    return slug;
  }
}

// Static parameters for tags
export function tagStaticParams(rustOnly: boolean) {
  const locales = ['en', 'fr'];
  const params = [];

  for (const locale of locales) {
    const tags = getAllTags(locale, rustOnly);
    for (const tag of tags) {
      const slug = tag.toLowerCase().replace(/\s+/g, '-');
      params.push({ locale, slug });
    }
  }
  return params;
}

// Swiss Rust passes rustOnly so the tag and its post count match the page it
// describes. Indexing (noindex, hreflang) stays mayorana.ch's decision: the
// Swiss Rust pages canonicalise there.
export async function tagMetadata({ params }: TagPageProps, rustOnly: boolean): Promise<Metadata> {
  const { slug, locale } = await params;

  // Same decoding as the page: accented tag slugs arrive percent-encoded.
  let tagSlug = slug;
  try {
    tagSlug = decodeURIComponent(slug);
  } catch {
    // Not valid percent-encoding — fall through with the raw value.
  }

  const tag = getTagBySlug(tagSlug, locale, rustOnly);

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
  const count = getPostsByTag(tagSlug, locale, rustOnly).length;
  return buildMetadata({
    locale,
    path: `/blog/tag/${slug}`,
    title: t('tag_title', { tag }),
    description: t('tag_description', { tag, count }),
    crossLocale: pairedIndexed,
    noindex: !indexed,
  });
}

export async function renderTagPage({ params }: TagPageProps, rustOnly: boolean) {
  const { slug, locale } = await params;

  if (!slug || typeof slug !== 'string') {
    notFound();
  }

  // Accented tags ("mémoire", "opérateurs") reach here percent-encoded, so
  // a raw lookup misses them and the page 404s even though the tag exists.
  const tagSlug = decodeSlug(slug);

  const currentTag = getTagBySlug(tagSlug, locale, rustOnly);

  if (!currentTag) {
    notFound();
  }

  const posts = getPostsByTag(tagSlug, locale, rustOnly);
  const tags = getAllTags(locale, rustOnly);
  const t = await getTranslations({ locale, namespace: 'blog' });

  // The JSX below is deliberately outside any try/catch. React renders the
  // returned element after this function has finished, so a catch here never
  // saw a render error — what it did catch was the control-flow exception
  // notFound() throws, logging it as "Error in TagPage" on every 404 before
  // re-throwing it. Rendering failures belong to an error boundary.
  return (
    <LayoutTemplate>
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-secondary to-background">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-6">
              #{currentTag}
            </h1>
            <p className="text-xl text-muted-foreground">
              {t('tag_count', { count: posts.length, tag: currentTag })}
            </p>
          </div>
        </div>
      </section>

      {/* Blog Content */}
      <section className="py-16 bg-background">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
            {/* Sidebar */}
            <div className="md:col-span-3">
              <TagFilter
                tags={tags}
                currentTag={currentTag}
              />
            </div>

            {/* Main Content */}
            <div className="md:col-span-9">
              <BlogList posts={posts} title="" description="" />
            </div>
          </div>
        </div>
      </section>
    </LayoutTemplate>
  );
}
