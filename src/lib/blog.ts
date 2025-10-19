// Clean blog library - proper imports, no TypeScript errors
// File: src/lib/blog.ts

import blogPostsEn from '../data/blog-posts-en.json';
import blogPostsFr from '../data/blog-posts-fr.json';

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  date: string;
  author: string;
  excerpt: string;
  content: string;
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
}

export interface PaginatedPosts {
  posts: BlogPost[];
  currentPage: number;
  totalPages: number;
  totalPosts: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

const POSTS_PER_PAGE = 6;

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

// Get paginated posts for a specific locale
export function getPaginatedPosts(page: number = 1, locale: string = 'en'): PaginatedPosts {
  const allPosts = getAllPosts(locale);
  const totalPosts = allPosts.length;
  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);
  const currentPage = Math.max(1, Math.min(page, totalPages));

  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const endIndex = startIndex + POSTS_PER_PAGE;
  const posts = allPosts.slice(startIndex, endIndex);

  return {
    posts,
    currentPage,
    totalPages,
    totalPosts,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
  };
}

// Get all unique tags from posts in a specific locale only
export function getAllTags(locale: string = 'en'): string[] {
  const posts = getAllPosts(locale);
  const allTags = posts.flatMap(post => post.tags || []);
  const uniqueTags = Array.from(new Set(allTags));
  return uniqueTags.sort();
}

// Get posts by tag for a specific locale only
export function getPostsByTag(tagSlug: string, locale: string = 'en'): BlogPost[] {
  const posts = getAllPosts(locale);
  return posts.filter(post =>
    post.tags && post.tags.some(tag =>
      tag.toLowerCase().replace(/\s+/g, '-') === tagSlug
    )
  );
}

// Get a single post by slug for a specific locale only
export function getPostBySlug(slug: string, locale: string = 'en'): BlogPost | null {
  const posts = getAllPosts(locale);
  return posts.find(post => post.slug === slug) || null;
}

// Get recent posts for a specific locale only
export function getRecentPosts(count: number = 3, locale: string = 'en'): BlogPost[] {
  const posts = getAllPosts(locale);
  return posts.slice(0, count);
}

// Get tag display name from slug for a specific locale only
export function getTagBySlug(tagSlug: string, locale: string = 'en'): string | null {
  const posts = getAllPosts(locale);
  for (const post of posts) {
    if (post.tags) {
      const tag = post.tags.find(tag =>
        tag.toLowerCase().replace(/\s+/g, '-') === tagSlug
      );
      if (tag) return tag;
    }
  }
  return null;
}

// Format date for display
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
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
