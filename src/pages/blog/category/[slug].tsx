import React from 'react';
import { GetStaticProps, GetStaticPaths } from 'next';
import Layout from '../../../components/layout/Layout';
import BlogList from '../../../components/blog/BlogList';
import CategoryFilter from '../../../components/blog/CategoryFilter';
import { 
  getAllCategories, 
  getPostsByCategory, 
  getCategoryBySlug,
  BlogPost, 
  BlogCategory 
} from '../../../lib/blog';
import { motion } from 'framer-motion';

interface CategoryPageProps {
  posts: BlogPost[];
  categories: BlogCategory[];
  currentCategory: BlogCategory;
}

const CategoryPage: React.FC<CategoryPageProps> = ({ posts, categories, currentCategory }) => {
  return (
    <Layout 
      title={`${currentCategory.name} | Blog | Mayorana`} 
      description={currentCategory.description}
    >
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-secondary to-background">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <motion.h1 
              className="text-4xl font-bold mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {currentCategory.name}
            </motion.h1>
            <motion.p 
              className="text-xl text-muted-foreground"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {currentCategory.description}
            </motion.p>
          </div>
        </div>
      </section>

      {/* Blog Content */}
      <section className="py-16 bg-background">
        <div className="container">
          <div className="grid md:grid-cols-12 gap-12">
            {/* Sidebar */}
            <motion.div 
              className="md:col-span-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <CategoryFilter 
                categories={categories} 
                currentCategory={currentCategory.slug} 
              />
            </motion.div>
            
            {/* Main Content */}
            <div className="md:col-span-9">
              <BlogList posts={posts} title="" description="" />
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export const getStaticPaths: GetStaticPaths = async () => {
  const categories = getAllCategories();
  
  const paths = categories.map((category) => ({
    params: { slug: category.slug },
  }));
  
  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const slug = params?.slug as string;
  const currentCategory = getCategoryBySlug(slug);
  
  if (!currentCategory) {
    return {
      notFound: true,
    };
  }
  
  const posts = getPostsByCategory(slug);
  const categories = getAllCategories();
  
  return {
    props: {
      posts,
      categories,
      currentCategory,
    },
  };
};

export default CategoryPage;
