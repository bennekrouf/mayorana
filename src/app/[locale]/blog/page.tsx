// SIMPLEST FIX: Update your blog page to pass locale directly
// File: src/app/[locale]/blog/page.tsx

import LayoutTemplate from '@/components/layout/LayoutTemplate';
import BlogList from '@/components/blog/BlogList';
import TagFilter from '@/components/blog/TagFilter';
import Pagination from '@/components/blog/Pagination';
import {
  getPaginatedPosts,
  getAllTags,
} from '@/lib/blog';
import { getTranslations } from 'next-intl/server';

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function BlogPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const searchParamsData = await searchParams;
  const page = parseInt(searchParamsData.page as string) || 1;

  // DEBUG: What we're getting
  console.log('🔍 BlogPage Debug:');
  console.log('   - Received locale:', locale);
  console.log('   - Page:', page);

  // DIRECT LOCALE USAGE: Pass locale directly to functions
  const paginatedData = getPaginatedPosts(page, locale);
  const tags = getAllTags(locale);

  // Use the locale directly with getTranslations
  const t = await getTranslations({ locale, namespace: 'blog' });

  // DEBUG: Blog data
  console.log('📊 Blog Data:');
  console.log('   - Posts found:', paginatedData.posts.length);
  console.log('   - Total posts:', paginatedData.totalPosts);
  console.log('   - Tags:', tags.length);

  if (paginatedData.posts.length > 0) {
    console.log('   - First post locale:', paginatedData.posts[0].locale);
    console.log('   - First post title:', paginatedData.posts[0].title);
  }

  return (
    <LayoutTemplate>
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-secondary to-background">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-6">{t('hero_title')}</h1>
            <p className="text-xl text-muted-foreground">
              {t('hero_subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* Blog Content */}
      <section className="py-16 bg-background">
        <div className="container">
          <div className="grid md:grid-cols-12 gap-12">
            {/* Sidebar */}
            <div className="md:col-span-3">
              <TagFilter
                tags={tags}
                currentTag={undefined}
              />
            </div>

            {/* Main Content */}
            <div className="md:col-span-9">
              <div className="mb-6">
                <p className="text-sm text-muted-foreground">
                  {paginatedData.totalPosts > 0 ? (
                    <>
                      Showing {paginatedData.posts.length} of {paginatedData.totalPosts} {paginatedData.totalPosts === 1 ? t('article') : 'articles'}
                      {paginatedData.totalPages > 1 && (
                        <span> • Page {paginatedData.currentPage} of {paginatedData.totalPages}</span>
                      )}
                    </>
                  ) : (
                    <span>{t('no_posts')}</span>
                  )}
                </p>
              </div>

              <BlogList
                posts={paginatedData.posts}
                title=""
                description=""
              />

              <Pagination
                currentPage={paginatedData.currentPage}
                totalPages={paginatedData.totalPages}
                baseUrl={`/${locale}/blog`}
              />
            </div>
          </div>
        </div>
      </section>
    </LayoutTemplate>
  );
}
