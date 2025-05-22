import Link from 'next/link';
import LayoutTemplate from '@/components/layout/LayoutTemplate';
import BlogList from '@/components/blog/BlogList';
// Import icons on the client side components where needed
import { getRecentPosts } from '@/lib/blog';
import ClientHomeSection from '@/components/home/ClientHomeSection';

export default function HomePage() {
  // Fetch data directly in the server component
  const recentPosts = getRecentPosts(3);

  return (
    <LayoutTemplate>
      {/* Hero Section */}
      <ClientHomeSection />

      {/* Blog Section */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Latest Insights</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Thoughts and tutorials on Rust, LLM integration, and AI agent development.
            </p>
          </div>
          <BlogList posts={recentPosts} />
          <div className="text-center mt-12">
            <Link
              href="/blog"
              className="inline-flex items-center px-6 py-3 rounded-lg bg-secondary text-foreground font-medium hover:bg-secondary/80 transition-colors"
            >
              View All Articles
            </Link>
          </div>
        </div>
      </section>
    </LayoutTemplate>
  );
}
