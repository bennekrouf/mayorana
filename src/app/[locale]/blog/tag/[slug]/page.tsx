// File: src/app/blog/tag/[slug]/page.tsx
import { notFound } from 'next/navigation';
import LayoutTemplate from '@/components/layout/LayoutTemplate';
import BlogList from '@/components/blog/BlogList';
import TagFilter from '@/components/blog/TagFilter';
import {
  getAllTags,
  getPostsByTag,
  getTagBySlug,
} from '@/lib/blog';

type Props = {
  params: Promise<{ slug: string }>;
}

// Generate static parameters for tags
export async function generateStaticParams() {
  try {
    const tags = getAllTags();
    return tags.map((tag) => ({
      slug: tag.toLowerCase().replace(/\s+/g, '-'),
    }));
  } catch (error) {
    console.error('Error generating static params for tags:', error);
    return [];
  }
}

export default async function TagPage({ params }: Props) {
  try {
    const { slug } = await params;

    if (!slug || typeof slug !== 'string') {
      notFound();
    }

    const currentTag = getTagBySlug(slug);

    if (!currentTag) {
      notFound();
    }

    const posts = getPostsByTag(slug);
    const tags = getAllTags();

    return (
      <LayoutTemplate>
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-b from-secondary to-background">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl font-bold mb-6">
                #{currentTag}
              </h1>
              <p className="text-xl text-muted-foreground">
                {posts.length} article{posts.length !== 1 ? 's' : ''} about {currentTag}
              </p>
            </div>
          </div>
        </section>

        {/* Blog Content */}
        <section className="py-16 bg-background">
          <div className="container">
            <div className="grid md:grid-cols-12 gap-12">
              {/* Sidebar */}
              <div className="md:col-span-3">
                <TagFilter
                  tags={tags}
                  currentTag={currentTag}
                />
              </div>

              {/* Main Content */}
              <div className="md:col-span-9">
                <BlogList posts={posts} title="" description="" />
              </div>
            </div>
          </div>
        </section>
      </LayoutTemplate>
    );
  } catch (error) {
    console.error('Error in TagPage:', error);
    notFound();
  }
}
