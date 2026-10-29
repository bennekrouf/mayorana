// The blog listing, shared by mayorana.ch's /[locale]/blog and Swiss Rust's
// /[locale]/swissrust/blog (the middleware rewrites swissrust.ch there). The
// site is a route prop, not a request header, so the posts below the listing
// can be prerendered for both.
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import LayoutTemplate from '@/components/layout/LayoutTemplate';
import { ContinueReading } from '@/components/learn/ContinueReading';
import BlogList from '@/components/blog/BlogList';
import TagFilter from '@/components/blog/TagFilter';
import Pagination from '@/components/blog/Pagination';
import LearningPathToggle from '@/components/blog/LearningPathToggle';
import {
  getPaginatedPosts,
  getAllTags,
  type BlogView,
} from '@/lib/blog';
// import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo';

export type BlogIndexProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// Metadata lives on the page rather than in a layout because the listing is
// paginated with ?page=, and only a page receives searchParams. Page 2 has to
// canonicalise to itself: pointing every page at /blog would tell Google that
// the only listing worth indexing is the first one.
export async function blogIndexMetadata(
  { params, searchParams }: BlogIndexProps,
  isSwissRust: boolean,
): Promise<Metadata> {
  const { locale } = await params;
  const page = requestedPage(await searchParams, locale, isSwissRust);
  const t = await getTranslations({ locale, namespace: 'metadata' });

  return buildMetadata({
    locale,
    path: page > 1 ? `/blog?page=${page}` : '/blog',
    title: page > 1 ? `${t('blog_title')} — ${page}` : t('blog_title'),
    description: isSwissRust ? t('blog_description_swissrust') : t('blog_description'),
    // The locales have different post counts, so page N in one may not exist
    // in the other; only the first page is a sure pair.
    crossLocale: page === 1,
  });
}

// The ?page= asked for, or a 404 for one past the last page. Clamping it
// instead served the last page under every number, each an indexable URL
// canonicalising to itself: an endless supply of duplicates for a crawler.
function requestedPage(
  searchParams: { [key: string]: string | string[] | undefined },
  locale: string,
  isSwissRust: boolean,
): number {
  const raw = searchParams.page;
  if (raw === undefined) return 1;
  const page = Number(raw);
  if (!Number.isInteger(page) || page < 1) notFound();
  if (page > getPaginatedPosts(1, locale, 'latest', !isSwissRust).totalPages) notFound();
  return page;
}

export default async function BlogIndex({
  params,
  searchParams,
  isSwissRust,
}: BlogIndexProps & { isSwissRust: boolean }) {
  const { locale } = await params;
  const searchParamsData = await searchParams;
  const page = requestedPage(searchParamsData, locale, isSwissRust);
  // Newest first unless a signed-in reader chose the learning path; the
  // toggle sends anyone else back here. Metadata ignores it, so the path view
  // canonicalises to the default listing.
  const view: BlogView = searchParamsData.view === 'path' ? 'path' : 'latest';

  const paginatedData = getPaginatedPosts(page, locale, view, !isSwissRust);
  const tags = getAllTags(locale);

  // Use the locale directly with getTranslations (server components must pass locale explicitly)
  const t = await getTranslations({ locale, namespace: 'blog' });
  const tLearn = await getTranslations({ locale, namespace: 'learn' });

  return (
    <LayoutTemplate>
      <ContinueReading />
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-secondary to-background">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-6">{t('title')}</h1>
            <p className="text-xl text-muted-foreground">
              {isSwissRust ? t('subtitle_swissrust') : t('subtitle')}
            </p>
            {/* swissrust.ch serves only the blog, so /learn is not there. */}
            {!isSwissRust && (
              <Link
                href={`/${locale}/learn`}
                className="mt-6 inline-flex items-center gap-1.5 font-medium text-primary hover:underline underline-offset-4"
              >
                🧭 {tLearn('title')}
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            )}
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
                currentTag={undefined}
              />
            </div>

            {/* Main Content */}
            <div className="md:col-span-9">
              <LearningPathToggle active={view === 'path'} />

              <div className="mb-6">
                <p className="text-sm text-muted-foreground">
                  {paginatedData.totalPosts > 0 ? (
                    <>
                      {t('showing_results', {
                        current: paginatedData.posts.length,
                        total: paginatedData.totalPosts
                      })} {paginatedData.totalPosts === 1 ? t('article_singular') : t('articles_plural')}
                      {paginatedData.totalPages > 1 && (
                        <span> • {t('page_info', {
                          current: paginatedData.currentPage,
                          total: paginatedData.totalPages
                        })}</span>
                      )}
                    </>
                  ) : (
                    <span>{t('no_articles')}</span>
                  )}
                </p>
              </div>

              {/* Featured "AI agents & integration" posts, then the api0 pointer.
                  Empty on Swiss Rust, a Rust-only site (see getPaginatedPosts). */}
              {paginatedData.featuredPosts.length > 0 && (
                <div className="mb-12">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-lg font-semibold">🤖 {t('featured_series')}</span>
                  </div>
                  <BlogList posts={paginatedData.featuredPosts} title="" description="" />
                  <a
                    href="https://api0.ai/blog"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6 flex items-center justify-between gap-4 rounded-xl border border-primary/30 bg-primary/5 p-4 text-sm hover:bg-primary/10 transition-colors"
                  >
                    <span>{t('api0_blog_callout')}</span>
                    <span className="shrink-0 font-medium text-primary">{t('api0_blog_link')} →</span>
                  </a>
                </div>
              )}

              {/* Pinned "Why Rust?" series — always shown on every page */}
              {paginatedData.pinnedPosts.length > 0 && (
                <div className="mb-12">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-lg font-semibold">📌 {t('pinned_series')}</span>
                  </div>
                  <BlogList
                    posts={paginatedData.pinnedPosts}
                    title=""
                    description=""
                  />
                </div>
              )}

              {/* Regular posts: newest first, or in learning-path order */}
              {paginatedData.posts.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-lg font-semibold">
                      {view === 'path' ? `🧭 ${t('learning_path')}` : `🗓 ${t('latest_articles')}`}
                    </span>
                  </div>
                  <BlogList
                    posts={paginatedData.posts}
                    showSteps={view === 'path'}
                    title=""
                    description=""
                  />
                </div>
              )}

              <Pagination
                currentPage={paginatedData.currentPage}
                totalPages={paginatedData.totalPages}
                baseUrl={`/${locale}/blog`}
                query={view === 'path' ? { view } : undefined}
              />
            </div>
          </div>
        </div>
      </section>
    </LayoutTemplate>
  );
}
