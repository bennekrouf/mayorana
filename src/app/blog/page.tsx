// File: src/app/blog/page.tsx
import LayoutTemplate from '@/components/layout/LayoutTemplate';
import BlogList from '@/components/blog/BlogList';
import TagFilter from '@/components/blog/TagFilter';
import { 
  getAllPosts,
  getAllTags,
} from '@/lib/blog';

export default async function BlogPage() {
  const posts = getAllPosts();
  const tags = getAllTags();

  return (
    <LayoutTemplate>
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-secondary to-background">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-6">Blog</h1>
            <p className="text-xl text-muted-foreground">
              Insights and articles about Rust, AI, and modern software development.
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
                currentTag={undefined}
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
}
