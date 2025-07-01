// Enhanced blog library with pagination support
// File: src/lib/blog.ts
import blogPostsData from '../data/blog-posts.json';

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

// Get all blog posts
export function getAllPosts(): BlogPost[] {
  return blogPostsData; 
}

// Get paginated posts
export function getPaginatedPosts(page: number = 1): PaginatedPosts {
  const allPosts = getAllPosts();
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

// Get all unique tags from all posts
export function getAllTags(): string[] {
  const posts = getAllPosts();
  const allTags = posts.flatMap(post => post.tags || []);
  const uniqueTags = Array.from(new Set(allTags));
  return uniqueTags.sort();
}

// Get posts by tag
export function getPostsByTag(tagSlug: string): BlogPost[] {
  const posts = getAllPosts();
  return posts.filter(post => 
    post.tags && post.tags.some(tag => 
      tag.toLowerCase().replace(/\s+/g, '-') === tagSlug
    )
  );
}

// Get paginated posts by tag
export function getPaginatedPostsByTag(tagSlug: string, page: number = 1): PaginatedPosts {
  const allTagPosts = getPostsByTag(tagSlug);
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

// Get a single post by slug
export function getPostBySlug(slug: string): BlogPost | null {
  const posts = getAllPosts();
  return posts.find(post => post.slug === slug) || null;
}

// Get recent posts (for homepage, etc.)
export function getRecentPosts(count: number = 3): BlogPost[] {
  const posts = getAllPosts();
  return posts.slice(0, count);
}

// Get tag display name from slug
export function getTagBySlug(tagSlug: string): string | null {
  const posts = getAllPosts();
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

// Search posts by title, excerpt, or tags
export function searchPosts(query: string): BlogPost[] {
  const posts = getAllPosts();
  const lowercaseQuery = query.toLowerCase();
  
  return posts.filter(post => 
    post.title.toLowerCase().includes(lowercaseQuery) ||
    post.excerpt.toLowerCase().includes(lowercaseQuery) ||
    (post.tags && post.tags.some(tag => 
      tag.toLowerCase().includes(lowercaseQuery)
    ))
  );
}
