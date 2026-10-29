// The post cards of a listing. Rendered through BlogList, which hands it only
// the fields a card shows.
// File: src/components/blog/BlogListClient.tsx

'use client';

import React, { ViewTransition } from 'react';
import Link from 'next/link';
import { type PostCard, formatDate } from '../../lib/blog-shared';
import { useTranslations, useLocale } from 'next-intl';
import { getLocalizedPath } from '@/lib/i18n-utils';
import { useReadProgress } from '@/providers/ReadProgressProvider';
import { isRead, progressKey } from '@/lib/read-progress';

interface BlogListProps {
  posts: PostCard[];
  title?: string;
  description?: string;
  /** Show each post's step in the learning path (path view only). */
  showSteps?: boolean;
}

const BlogListClient: React.FC<BlogListProps> = ({
  posts,
  title,
  description,
  showSteps = false
}) => {
  const t = useTranslations('blog');
  const locale = useLocale();
  const { progress } = useReadProgress();

  // The links prefetch (Next's default): posts are prerendered, so fetching
  // the ones in view costs a static file each, and opening one is instant.
  // They used to opt out, when every post was rendered on request.

  // Only show title/description if explicitly provided
  const showHeader = title || description;

  return (
    <div className="w-full">
      {showHeader && (
        <div className="mb-12 text-center">
          {title && <h2 className="text-3xl font-bold mb-4">{title}</h2>}
          {description && <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{description}</p>}
        </div>
      )}

      {posts.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post, index) => {
            const postUrl = getLocalizedPath(locale, `/blog/${post.slug}`);
            // Empty on the server and through hydration, so no bar appears
            // until the browser has read the stored map.
            const entry = progress[progressKey(post)];
            const read = isRead(entry);

            return (
              <div
                key={post.slug}
                className="relative flex flex-col h-full rounded-xl border border-border overflow-hidden bg-secondary/50 rise"
                style={{ '--rise-delay': `${index * 0.1}s` } as React.CSSProperties}
              >
                <div className="p-6 flex flex-col h-full">
                  <div className="mb-2">
                    {showSteps && post.step !== undefined && (
                      <span className="text-sm text-muted-foreground mr-2">
                        {t('step', { step: post.step })}
                      </span>
                    )}
                    <span className="text-sm font-medium text-primary">
                      {post.tags?.[0] || t('article')}
                    </span>
                    <span className="text-sm text-muted-foreground ml-2">
                      {formatDate(post.date, locale)}
                    </span>
                  </div>

                  <h3 className="text-xl font-semibold mb-3">
                    <Link
                      href={postUrl}
                      className="hover:text-primary transition-colors"
                    >
                      {/* Morphs into the article's heading on the way in. */}
                      <ViewTransition name={`post-title-${post.slug}`}>
                        <span>{post.title}</span>
                      </ViewTransition>
                    </Link>
                  </h3>

                  <p className="text-muted-foreground mb-6 flex-grow">
                    {post.excerpt}
                  </p>

                  <div className="mt-auto">
                    <Link
                      href={postUrl}
                      className="text-primary font-medium hover:underline inline-flex items-center"
                    >
                      {t('read_more')}
                      {/* "Read more" alone says nothing out of context, to a
                          screen reader or a search engine; the title does. */}
                      <span className="sr-only">: {post.title}</span>
                      <svg
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 ml-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </Link>
                  </div>
                </div>

                {/* How far into this article the reader got. A full bar means
                    read; a partial one is where they stopped. */}
                {entry && (
                  <div
                    className="absolute bottom-0 inset-x-0 h-[3px] bg-border/40"
                    role="img"
                    aria-label={read ? t('progress_read') : t('progress_partial')}
                  >
                    <div
                      className={`h-full transition-[width] duration-300 ${read ? 'bg-primary' : 'bg-primary/60'}`}
                      style={{ width: `${Math.round((read ? 1 : entry.pct) * 100)}%` }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 border border-border rounded-xl bg-secondary/50">
          <p className="text-lg text-muted-foreground">{t('no_posts')}</p>
        </div>
      )}
    </div>
  );
};

export default BlogListClient;
