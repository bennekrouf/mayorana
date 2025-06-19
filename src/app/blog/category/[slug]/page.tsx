import { notFound } from 'next/navigation';
import LayoutTemplate from '@/components/layout/LayoutTemplate';
import BlogList from '@/components/blog/BlogList';
import CategoryFilter from '@/components/blog/CategoryFilter';
import {
  getAllCategories,
  getPostsByCategory,
  getCategoryBySlug,
} from '@/lib/blog';

// Next.js 15: params is now a Promise
type Props = {
  params: Promise<{ slug: string }>;
}

// Generate static parameters for categories
export async function generateStaticParams() {
  try {
    const categories = getAllCategories();
    return categories.map((category) => ({
      slug: category.slug,
    }));
  } catch (error) {
    console.error('Error generating static params for categories:', error);
    return [];
  }
}

export default async function CategoryPage({ params }: Props) {
  try {
    // Await the params since they're now a Promise in Next.js 15
    const { slug } = await params;

    // Validate slug
    if (!slug || typeof slug !== 'string') {
      notFound();
    }

    const currentCategory = getCategoryBySlug(slug);

    if (!currentCategory) {
      notFound();
    }

    const posts = getPostsByCategory(slug);
    const categories = getAllCategories();

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
  } catch (error) {
    console.error('Error in CategoryPage:', error);
    notFound();
  }
}
