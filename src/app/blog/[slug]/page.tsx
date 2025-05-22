import { notFound } from 'next/navigation';
import LayoutTemplate from '@/components/layout/LayoutTemplate';
import BlogPost from '@/components/blog/BlogPost';
import { getPostBySlug, getAllPosts } from '@/lib/blog';

// Next.js 15: Both params and searchParams are now Promises
type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function PostPage({ params }: Props) {
  // Await the params since they're now a Promise in Next.js 15
  const { slug } = await params;
  const post = getPostBySlug(slug);

  // Await searchParams as well (though we're not using them in this example)
  // const queryParams = await searchParams;
  // const debug = queryParams.debug === 'true';

  if (!post) {
    notFound();
  }

  return (
    <LayoutTemplate>
      {/* Post Content */}
      <section className="py-20 bg-background">
        <div className="container">
          <BlogPost post={post} />
        </div>
      </section>
    </LayoutTemplate>
  );
}
