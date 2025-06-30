// Simplified blog library (tags only)
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
  category: string;
  contentHtml: string;
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

// Get all blog posts
export function getAllPosts(): BlogPost[] {
  return blogPostsData; 
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

// Get a single post by slug
export function getPostBySlug(slug: string): BlogPost | null {
  const posts = getAllPosts();
  return posts.find(post => post.slug === slug) || null;
}

// Get recent posts
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
