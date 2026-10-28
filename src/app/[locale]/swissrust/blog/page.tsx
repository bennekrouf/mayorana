import type { Metadata } from 'next';
import BlogIndex, { blogIndexMetadata, type BlogIndexProps } from '@/components/blog/BlogIndex';

export async function generateMetadata(props: BlogIndexProps): Promise<Metadata> {
  return blogIndexMetadata(props, true);
}

export default function SwissRustBlogPage(props: BlogIndexProps) {
  return <BlogIndex {...props} isSwissRust />;
}
