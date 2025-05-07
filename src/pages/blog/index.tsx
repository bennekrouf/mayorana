import React from 'react';
import { GetStaticProps } from 'next';
import Layout from '../../components/layout/Layout';
import BlogList from '../../components/blog/BlogList';
import CategoryFilter from '../../components/blog/CategoryFilter';
import { getAllPosts, getAllCategories, BlogPost, BlogCategory } from '../../lib/blog';
import { motion } from 'framer-motion';

interface BlogPageProps {
  posts: BlogPost[];
  categories: BlogCategory[];
}

const BlogPage: React.FC<BlogPageProps> = ({ posts, categories }) => {
  return (
    <Layout title="Blog | Mayorana" description="Latest insights and articles on Rust, LLM integration, AI agents, and api0.ai">
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
              Blog
            </motion.h1>
            <motion.p 
              className="text-xl text-muted-foreground"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Insights, tutorials, and updates on Rust, LLM integration, AI agents, and api0.ai
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
              <CategoryFilter categories={categories} />
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

export const getStaticProps: GetStaticProps = async () => {
  const posts = getAllPosts();
  const categories = getAllCategories();
  
  return {
    props: {
      posts,
      categories,
    },
  };
};

export default BlogPage;
