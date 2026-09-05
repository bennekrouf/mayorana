// Clean blog library - proper imports, no TypeScript errors
// File: src/lib/blog.ts

import blogPostsEn from '../data/blog-posts-en.json';
import blogPostsFr from '../data/blog-posts-fr.json';
import type { BlogPost, PaginatedPosts } from './blog-shared';

// Types and data-free helpers live in ./blog-shared so that client components
// can import them without dragging the blog-posts-*.json payloads into the
// browser bundle. Re-exported here to keep this module's public API unchanged.
export type { BlogPost, PaginatedPosts };
export { formatDate } from './blog-shared';

const POSTS_PER_PAGE = 6;

// Slugs of the permanently pinned "Why Rust?" series, per locale
const PINNED_SLUGS: Record<string, string[]> = {
  en: ['why-garbage-collector', 'c-low-level-cost', 'why-rust-memory-safe'],
  fr: ['why-garbage-collector-fr', 'c-low-level-cost-fr', 'why-rust-memory-safe-fr'],
};

// Define supported locales
type SupportedLocale = 'en' | 'fr';

// Type guard to check if a string is a supported locale
function isSupportedLocale(locale: string): locale is SupportedLocale {
  return locale === 'en' || locale === 'fr';
}

// Get blog data for specific locale - clean and simple
function getBlogDataSync(locale: string): BlogPost[] {
  if (isSupportedLocale(locale) && locale === 'fr') {
    return (blogPostsFr as BlogPost[]).filter(post => post.locale === 'fr');
  }

  return (blogPostsEn as BlogPost[]).filter(post => post.locale === 'en');
}

// Get all blog posts for a specific locale (ONLY that locale)
export function getAllPosts(locale: string = 'en'): BlogPost[] {
  return getBlogDataSync(locale);
}

// Get the permanently pinned "Why Rust?" posts for a locale
export function getPinnedPosts(locale: string = 'en'): BlogPost[] {
  const all = getAllPosts(locale);
  const slugs = PINNED_SLUGS[locale] ?? PINNED_SLUGS['en'];
  // Preserve the intended order of the series
  return slugs
    .map(slug => all.find(p => p.slug === slug))
    .filter((p): p is BlogPost => p !== undefined);
}

// Get paginated posts for a specific locale
// Pinned posts are excluded from pagination — they are returned separately
// and always displayed on every page.
export function getPaginatedPosts(page: number = 1, locale: string = 'en'): PaginatedPosts {
  const allPosts = getAllPosts(locale);
  const pinnedPosts = getPinnedPosts(locale);
  const pinnedSlugs = new Set(pinnedPosts.map(p => p.slug));

  const regularPosts = allPosts.filter(p => !pinnedSlugs.has(p.slug));
  const totalPosts = regularPosts.length;
  const totalPages = Math.max(1, Math.ceil(totalPosts / POSTS_PER_PAGE));
  const currentPage = Math.max(1, Math.min(page, totalPages));

  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const endIndex = startIndex + POSTS_PER_PAGE;
  const posts = regularPosts.slice(startIndex, endIndex);

  return {
    posts,
    pinnedPosts,
    currentPage,
    totalPages,
    totalPosts,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
  };
}

// Get all unique tags from posts in a specific locale only
// A tag slug reaches a route handler percent-encoded when the tag carries
// accents ("mémoire" arrives as "m%C3%A9moire"), so decode before comparing —
// otherwise every accented tag page 404s.
function normalizeTagSlug(tagSlug: string): string {
  try {
    return decodeURIComponent(tagSlug);
  } catch {
    return tagSlug;
  }
}

export function getAllTags(locale: string = 'en'): string[] {
  const posts = getAllPosts(locale);
  const allTags = posts.flatMap(post => post.tags || []);
  const uniqueTags = Array.from(new Set(allTags));
  return uniqueTags.sort();
}

// Get posts by tag for a specific locale only
export function getPostsByTag(tagSlug: string, locale: string = 'en'): BlogPost[] {
  const posts = getAllPosts(locale);
  const wanted = normalizeTagSlug(tagSlug);
  return posts.filter(post =>
    post.tags && post.tags.some(tag =>
      tag.toLowerCase().replace(/\s+/g, '-') === wanted
    )
  );
}

// Get a single post by slug for a specific locale only
export function getPostBySlug(slug: string, locale: string = 'en'): BlogPost | null {
  const posts = getAllPosts(locale);
  return posts.find(post => post.slug === slug) || null;
}

// Get recent posts for a specific locale only
// Returns the pinned "Why Rust?" series so the home page always shows them.
export function getRecentPosts(count: number = 3, locale: string = 'en'): BlogPost[] {
  return getPinnedPosts(locale).slice(0, count);
}

// Get tag display name from slug for a specific locale only
export function getTagBySlug(tagSlug: string, locale: string = 'en'): string | null {
  const posts = getAllPosts(locale);
  const wanted = normalizeTagSlug(tagSlug);
  for (const post of posts) {
    if (post.tags) {
      const tag = post.tags.find(tag =>
        tag.toLowerCase().replace(/\s+/g, '-') === wanted
      );
      if (tag) return tag;
    }
  }
  return null;
}

// Search posts by title, excerpt, or tags for a specific locale only
export function searchPosts(query: string, locale: string = 'en'): BlogPost[] {
  const posts = getAllPosts(locale);
  const lowercaseQuery = query.toLowerCase();

  return posts.filter(post =>
    post.title.toLowerCase().includes(lowercaseQuery) ||
    post.excerpt.toLowerCase().includes(lowercaseQuery) ||
    (post.tags && post.tags.some(tag =>
      tag.toLowerCase().includes(lowercaseQuery)
    ))
  );
}

/**
 * The counterpart of a post in the other locale, or null when it has none.
 *
 * Mirrors the pairing rule in scripts/generate-sitemap.js: French posts either
 * reuse the English id/slug or suffix it with '-fr'. The two must agree —
 * the sitemap declaring /en/blog/x and /fr/blog/x-fr to be alternates while
 * the pages themselves emit no hreflang is a contradictory signal, and a pair
 * is only ever returned once both sides are known to exist.
 */
export function getPostCounterpart(slug: string, locale: string): BlogPost | null {
  if (locale === 'en') {
    const post = getPostBySlug(slug, 'en');
    if (!post) return null;
    const fr = getAllPosts('fr');
    return (
      fr.find((p) => p.id === `${post.id}-fr`) ||
      fr.find((p) => p.id === post.id) ||
      fr.find((p) => p.slug === `${post.slug}-fr`) ||
      fr.find((p) => p.slug === post.slug) ||
      null
    );
  }

  if (locale === 'fr') {
    const post = getPostBySlug(slug, 'fr');
    if (!post) return null;
    const strip = (value: string) => (value.endsWith('-fr') ? value.slice(0, -3) : value);
    const en = getAllPosts('en');
    return (
      en.find((p) => p.id === strip(post.id)) ||
      en.find((p) => p.id === post.id) ||
      en.find((p) => p.slug === strip(post.slug)) ||
      en.find((p) => p.slug === post.slug) ||
      null
    );
  }

  return null;
}
