import type { Metadata } from 'next';
import BlogIndex, { blogIndexMetadata, type BlogIndexProps } from '@/components/blog/BlogIndex';

export async function generateMetadata(props: BlogIndexProps): Promise<Metadata> {
  return blogIndexMetadata(props, false);
}

export default function BlogPage(props: BlogIndexProps) {
  return <BlogIndex {...props} isSwissRust={false} />;
}
