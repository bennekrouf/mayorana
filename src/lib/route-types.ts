// Define params types for dynamic routes (Next.js 15)
export type PageParams = Promise<{ slug: string }>;
export type SearchParams = Promise<Record<string, string | string[] | undefined>>;

// Define props interfaces for components
export interface PageProps {
  params: PageParams;
  searchParams?: SearchParams;
}

export interface MetadataProps {
  params: PageParams;
  searchParams?: SearchParams;
}

// More specific types for different route patterns
export type BlogPostParams = Promise<{ slug: string }>;

export interface BlogPostProps {
  params: BlogPostParams;
  searchParams?: SearchParams;
}

