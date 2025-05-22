import { notFound } from 'next/navigation';
import LayoutTemplate from '@/components/layout/LayoutTemplate';
import BlogList from '@/components/blog/BlogList';
import CategoryFilter from '@/components/blog/CategoryFilter';
import { 
  getAllCategories, 
  getPostsByCategory, 
  getCategoryBySlug,
} from '@/lib/blog';

// Next.js 15: Both params and searchParams are now Promises
type Props = {
  params: Promise<{ slug: string }>;
  // searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CategoryPage({ params }: Props) {
  // Await the params since they're now a Promise in Next.js 15
  const { slug } = await params;
  const currentCategory = getCategoryBySlug(slug);
  
  if (!currentCategory) {
    notFound();
  }
  
  const posts = getPostsByCategory(slug);
  const categories = getAllCategories();

  // You can also await searchParams if needed (though not used in this example)
  // const queryParams = await searchParams;

  return (
    <LayoutTemplate>
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-secondary to-background">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-6">
              {currentCategory.name}
            </h1>
            <p className="text-xl text-muted-foreground">
              {currentCategory.description}
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
                currentCategory={currentCategory.slug} 
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
