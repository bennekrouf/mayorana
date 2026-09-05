// Data-free blog types and helpers.
// File: src/lib/blog-shared.ts
//
// Keep this module free of any JSON/data imports. Client components import from
// here so that bundling `formatDate` (or the BlogPost type) never pulls the
// blog-posts-*.json payloads into the browser bundle.

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  date: string;
  author: string;
  excerpt: string;
  /** Raw markdown. Not emitted into blog-posts-*.json — read the .md file if you need it. */
  content?: string;
  contentHtml: string;
  tags: string[];
  image?: string;
  readingTime: string;
  locale: string;
  seo: {
    title: string;
    description: string;
    keywords: string[] | string;
    ogImage?: string;
  };
  headings: {
    id: string;
    text: string;
    level: number;
  }[];
  /**
   * The same post in the other locale, when there is one. Written at build
   * time by linkCounterparts() in scripts/generate-blog-data.js — the single
   * place the en/fr pairing rule is defined — and read by both the page's
   * hreflang and the sitemap's, so the two cannot disagree.
   */
  counterpart?: { locale: string; slug: string };
}

export interface PaginatedPosts {
  posts: BlogPost[];
  pinnedPosts: BlogPost[];
  currentPage: number;
  totalPages: number;
  totalPosts: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}
