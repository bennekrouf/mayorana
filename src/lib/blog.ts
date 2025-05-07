// src/lib/blog.ts
import blogPostsData from '../data/blog-posts.json';
import blogCategoriesData from '../data/blog-categories.json';

// Import the JSON data types
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  date: string;
  author: string;
  excerpt: string;
  content: string;
  contentHtml: string;
  category: string;
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

// Blog category type definition
export interface BlogCategory {
  slug: string;
  name: string;
  description: string;
}

// Get all blog posts
export function getAllPosts(): BlogPost[] {
  return blogPostsData;
}

// Get all blog categories
export function getAllCategories(): BlogCategory[] {
  return blogCategoriesData;
}

// Get posts by category
export function getPostsByCategory(categorySlug: string): BlogPost[] {
  const posts = getAllPosts();
  return posts.filter(post => post.category === categorySlug);
}

// Get a single post by slug
export function getPostBySlug(slug: string): BlogPost | null {
  const posts = getAllPosts();
  return posts.find(post => post.slug === slug) || null;
}

// Get recent posts
export function getRecentPosts(count: number = 3): BlogPost[] {
  const posts = getAllPosts();
  // Already sorted by date in the generator script
  return posts.slice(0, count);
}

// Get category by slug
export function getCategoryBySlug(slug: string): BlogCategory | null {
  const categories = getAllCategories();
  return categories.find(category => category.slug === slug) || null;
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

// No need for markdownToHtml function as we now store contentHtml directly in the JSON
