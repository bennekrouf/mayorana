import LayoutTemplate from '@/components/layout/LayoutTemplate';
import BlogList from '@/components/blog/BlogList';
import CategoryFilter from '@/components/blog/CategoryFilter';
import { 
  getAllCategories, 
  getAllPosts,
} from '@/lib/blog';

// Next.js 15: searchParams is now a Promise
type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function BlogPage({ }: Props) {
  // Get all posts and categories
  const posts = getAllPosts();
  const categories = getAllCategories();

  // Await searchParams if you need to use them for filtering
  // const queryParams = await searchParams;
  // const category = queryParams.category as string;

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
              <CategoryFilter 
                categories={categories} 
                currentCategory={undefined}
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
