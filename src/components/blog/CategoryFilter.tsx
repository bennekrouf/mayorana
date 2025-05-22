'use client';

import React from 'react';
import Link from 'next/link';
import { BlogCategory } from '../../lib/blog';

interface CategoryFilterProps {
  categories: BlogCategory[];
  currentCategory?: string;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({ categories, currentCategory }) => {
  return (
    <div className="mb-10">
      <h3 className="text-lg font-medium mb-4">Categories</h3>
      <div className="flex flex-wrap gap-2">
        <Link
          href="/blog"
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            !currentCategory
              ? 'bg-primary text-white'
              : 'bg-secondary hover:bg-secondary/80 text-foreground'
          }`}
        >
          All
        </Link>
        
        {categories.map((category) => (
          <Link
            key={category.slug}
            href={`/blog/category/${category.slug}`}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              currentCategory === category.slug
                ? 'bg-primary text-white'
                : 'bg-secondary hover:bg-secondary/80 text-foreground'
            }`}
          >
            {category.name}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;
