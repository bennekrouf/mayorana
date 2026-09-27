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
  /**
   * 1-based position within the post's track of the learning path
   * (content/learning-path.json), written at build time by
   * applyLearningPath(). Absent for a post the path does not mention yet.
   */
  step?: number;
  /** Position in the whole learning path, across tracks (1-based). Sorts the
   *  path view; `step` is only for display. Absent exactly when `step` is. */
  pathRank?: number;
  /** The subject the post's path section belongs to (rust, azure, ...).
   *  Suggestions stay within it. Absent exactly when `step` is. */
  track?: string;
}

/** A post as the "read next" suggestion needs it: enough for a card, without
 *  the body. */
export interface PathEntry {
  slug: string;
  title: string;
  excerpt: string;
  readingTime: string;
  step: number;
  track: string;
  /** Where its reading progress is stored — see progressKey(). */
  progressKey: string;
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

export function formatDate(dateString: string, locale: string = 'en'): string {
  const date = new Date(dateString);
  return date.toLocaleDateString(locale === 'fr' ? 'fr-CH' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    // Post dates are bare days ('2025-04-15'), which parse as UTC midnight.
    // Formatting in the reader's zone would show the day before west of UTC,
    // and differ from the server's render.
    timeZone: 'UTC'
  });
}
