import { getPostBySlug } from '@/lib/blog';
import type { Metadata, ResolvingMetadata } from 'next'

// Next.js 15: params is now a Promise
type Props = {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  // Await the params since they're now a Promise in Next.js 15
  const { slug } = await params;
  
  // Get post
  const post = getPostBySlug(slug);
  
  // Use parent metadata
  const previousImages = (await parent).openGraph?.images || [];
  
  if (!post) {
    return {
      title: 'Post Not Found | Mayorana',
    };
  }
  
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      images: post.seo?.ogImage 
        ? [{ url: post.seo.ogImage }, ...previousImages]
        : previousImages,
    },
  };
}

export default function PostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
