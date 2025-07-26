'use client';

import React from 'react';
import Link from 'next/link';
import { BlogPost, formatDate } from '../../lib/blog';
import { motion } from '@/components/ui/Motion';
import { useTranslations, useLocale } from 'next-intl';

interface BlogListProps {
  posts: BlogPost[];
  title?: string;
  description?: string;
}

const BlogList: React.FC<BlogListProps> = ({
  posts,
  title,
  description
}) => {
  const t = useTranslations('blog');
  const locale = useLocale();

  // Helper function to get localized path
  const getLocalizedPath = (path: string) => {
    if (locale === 'en') return path;
    return `/${locale}${path}`;
  };

  // Use provided title/description or fall back to translations
  const displayTitle = title || t('hero_title');
  const displayDescription = description || t('hero_subtitle');

  return (
    <div className="w-full">
      {(displayTitle || displayDescription) && (
        <div className="mb-12 text-center">
          {displayTitle && <h2 className="text-3xl font-bold mb-4">{displayTitle}</h2>}
          {displayDescription && <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{displayDescription}</p>}
        </div>
      )}

      {posts.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post, index) => (
            <motion.div
              key={post.slug}
              className="flex flex-col h-full rounded-xl border border-border overflow-hidden bg-secondary/50"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="p-6 flex flex-col h-full">
                <div className="mb-2">
                  <span className="text-sm font-medium text-primary">
                    {post.tags?.[0] || t('article')}
                  </span>
                  <span className="text-sm text-muted-foreground ml-2">
                    {formatDate(post.date)}
                  </span>
                </div>

                <h3 className="text-xl font-semibold mb-3">
                  <Link
                    href={getLocalizedPath(`/blog/${post.slug}`)}
                    className="hover:text-primary transition-colors"
                    prefetch={false} // Disable prefetching to prevent unnecessary loads
                  >
                    {post.title}
                  </Link>
                </h3>

                <p className="text-muted-foreground mb-6 flex-grow">
                  {post.excerpt}
                </p>

                <div className="mt-auto">
                  <Link
                    href={getLocalizedPath(`/blog/${post.slug}`)}
                    className="text-primary font-medium hover:underline inline-flex items-center"
                    prefetch={false} // Disable prefetching to prevent unnecessary loads
                  >
                    {t('read_more')}
                    <svg
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
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border border-border rounded-xl bg-secondary/50">
          <p className="text-lg text-muted-foreground">{t('no_posts')}</p>
        </div>
      )}
    </div>
  );
};

export default BlogList;
