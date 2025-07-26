import { notFound } from 'next/navigation';
import LayoutTemplate from '@/components/layout/LayoutTemplate';
import BlogPost from '@/components/blog/BlogPost';
import { getPostBySlug, getAllPosts } from '@/lib/blog';

// Next.js 15: params is now a Promise
type Props = {
  params: Promise<{ slug: string }>;
}

// Generate static params for better performance
export async function generateStaticParams() {
  try {
    const posts = getAllPosts();
    return posts.map((post) => ({
      slug: post.slug,
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

export default async function PostPage({ params }: Props) {
  try {
    // Await the params since they're now a Promise in Next.js 15
    const { slug } = await params;

    // Validate slug
    if (!slug || typeof slug !== 'string') {
      notFound();
    }

    const post = getPostBySlug(slug);

    if (!post) {
      notFound();
    }

    return (
      <LayoutTemplate>
        <section className="py-20 bg-background">
          <div className="container">
            <BlogPost post={post} />
          </div>
        </section>
      </LayoutTemplate>
    );
  } catch (error) {
    console.error('Error in PostPage:', error);
    notFound();
  }
}
