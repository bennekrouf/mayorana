// Enhanced blog library with i18n support
// File: src/lib/blog.ts

// Import English data as default
import blogPostsEn from '../data/blog-posts-en.json';

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  date: string;
  author: string;
  excerpt: string;
  content: string;
  contentHtml: string;
  category?: string;
  tags: string[];
  image?: string;
  readingTime: string;
  locale: string; // Added locale field
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

const POSTS_PER_PAGE = 6; // Adjust as needed

// Cache for loaded blog data
const blogDataCache: Record<string, BlogPost[]> = {
  'en': blogPostsEn as BlogPost[]
};

// Get blog data for specific locale with fallback
async function getBlogData(locale: string): Promise<BlogPost[]> {
  // Return cached data if available
  if (blogDataCache[locale]) {
    return blogDataCache[locale];
  }

  try {
    // Try to dynamically import locale-specific data
    let data: BlogPost[];

    switch (locale) {
      case 'fr':
        try {
          const frModule = await import('../data/blog-posts-fr.json');
          data = frModule.default as BlogPost[];
        } catch {
          console.warn(`French blog data not found, falling back to English`);
          data = blogPostsEn as BlogPost[];
        }
        break;
      default:
        data = blogPostsEn as BlogPost[];
        break;
    }

    // Cache the loaded data
    blogDataCache[locale] = data;
    return data;
  } catch {
    console.warn(`Could not load blog data for locale '${locale}', using English fallback`);
    return blogPostsEn as BlogPost[];
  }
}

// Synchronous version for when we need immediate data
function getBlogDataSync(locale: string): BlogPost[] {
  // Return cached data if available
  if (blogDataCache[locale]) {
    return blogDataCache[locale];
  }

  // For initial load, always return English data
  console.warn(`Blog data for locale '${locale}' not cached, returning English data`);
  return blogPostsEn as BlogPost[];
}

// Get all blog posts for a specific locale
export function getAllPosts(locale: string = 'en'): BlogPost[] {
  return getBlogDataSync(locale);
}

// Async version for when you can use async/await
export async function getAllPostsAsync(locale: string = 'en'): Promise<BlogPost[]> {
  return await getBlogData(locale);
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

// Async version of paginated posts
export async function getPaginatedPostsAsync(page: number = 1, locale: string = 'en'): Promise<PaginatedPosts> {
  const allPosts = await getAllPostsAsync(locale);
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

// Get all unique tags from all posts for a specific locale
export function getAllTags(locale: string = 'en'): string[] {
  const posts = getAllPosts(locale);
  const allTags = posts.flatMap(post => post.tags || []);
  const uniqueTags = Array.from(new Set(allTags));
  return uniqueTags.sort();
}

// Get posts by tag for a specific locale
export function getPostsByTag(tagSlug: string, locale: string = 'en'): BlogPost[] {
  const posts = getAllPosts(locale);
  return posts.filter(post =>
    post.tags && post.tags.some(tag =>
      tag.toLowerCase().replace(/\s+/g, '-') === tagSlug
    )
  );
}

// Get paginated posts by tag for a specific locale
export function getPaginatedPostsByTag(tagSlug: string, page: number = 1, locale: string = 'en'): PaginatedPosts {
  const allTagPosts = getPostsByTag(tagSlug, locale);
  const totalPosts = allTagPosts.length;
  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);
  const currentPage = Math.max(1, Math.min(page, totalPages));

  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const endIndex = startIndex + POSTS_PER_PAGE;
  const posts = allTagPosts.slice(startIndex, endIndex);

  return {
    posts,
    currentPage,
    totalPages,
    totalPosts,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
  };
}

// Get a single post by slug for a specific locale
export function getPostBySlug(slug: string, locale: string = 'en'): BlogPost | null {
  const posts = getAllPosts(locale);
  return posts.find(post => post.slug === slug) || null;
}

// Get recent posts for a specific locale (for homepage, etc.)
export function getRecentPosts(count: number = 3, locale: string = 'en'): BlogPost[] {
  const posts = getAllPosts(locale);
  return posts.slice(0, count);
}

// Get tag display name from slug for a specific locale
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

// Search posts by title, excerpt, or tags for a specific locale
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

// Get all available locales that have blog data
export function getAvailableLocales(): string[] {
  return Object.keys(blogDataCache);
}

// Initialize blog data for a specific locale (call this in app startup if needed)
export async function initializeBlogData(locale: string): Promise<void> {
  await getBlogData(locale);
}
