// Simplified TagFilter component (tags only)
// File: src/components/blog/TagFilter.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

interface TagFilterProps {
  tags: string[];
  currentTag?: string;
}

const TagFilter: React.FC<TagFilterProps> = ({ tags, currentTag }) => {
  const locale = useLocale();
  const t = useTranslations('blog');
  return (
    <div className="mb-10">
      <h2 className="text-lg font-medium mb-4">{t('filter_by_topic')}</h2>
      <div className="flex flex-wrap gap-2">
        <Link
          href={`/${locale}/blog`} // Add locale prefix
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${!currentTag
            ? 'bg-primary text-primary-foreground'
            : 'bg-secondary hover:bg-secondary/80 text-foreground'
            }`}
        >
          {t('all')}
        </Link>

        {tags.map((tag) => (
          <Link
            key={tag}
            href={`/${locale}/blog/tag/${tag.toLowerCase().replace(/\s+/g, '-')}`}
            // Dozens of tags, each prefetched as several segment requests the
            // moment the sidebar is on screen: well over a hundred requests a
            // view for links that are rarely clicked. Fetched on click instead.
            prefetch={false}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${currentTag === tag
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground'
              }`}
          >
            #{tag}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default TagFilter;
