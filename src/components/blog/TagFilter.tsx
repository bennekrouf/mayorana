// Simplified TagFilter component (tags only)
// File: src/components/blog/TagFilter.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';

interface TagFilterProps {
  tags: string[];
  currentTag?: string;
}

const TagFilter: React.FC<TagFilterProps> = ({ tags, currentTag }) => {
  const locale = useLocale();
  return (
    <div className="mb-10">
      <h3 className="text-lg font-medium mb-4">Filter by Topic</h3>
      <div className="flex flex-wrap gap-2">
        <Link
          href={`/${locale}/blog`} // Add locale prefix
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${!currentTag
            ? 'bg-primary text-white'
            : 'bg-secondary hover:bg-secondary/80 text-foreground'
            }`}
        >
          All
        </Link>

        {tags.map((tag) => (
          <Link
            key={tag}
            href={`/${locale}/blog/tag/${tag.toLowerCase().replace(/\s+/g, '-')}`}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${currentTag === tag
              ? 'bg-primary text-white'
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
