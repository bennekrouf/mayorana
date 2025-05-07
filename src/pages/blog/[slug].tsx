import React from 'react';
import { GetStaticProps, GetStaticPaths } from 'next';
import Layout from '../../components/layout/Layout';
import BlogPost from '../../components/blog/BlogPost';
import { getAllPosts, getPostBySlug, BlogPost as BlogPostType } from '../../lib/blog';

interface PostPageProps {
  post: BlogPostType; // Use the BlogPost type from lib/blog instead of any
}

const PostPage: React.FC<PostPageProps> = ({ post }) => {
  return (
    <Layout 
      title={post.seo?.title || `${post.title} | Mayorana`}
      description={post.seo?.description || post.excerpt}
    >
      {/* Post Content */}
      <section className="py-20 bg-background">
        <div className="container">
          <BlogPost post={post} />
        </div>
      </section>
    </Layout>
  );
};

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = getAllPosts();
  
  const paths = posts.map((post) => ({
    params: { slug: post.slug },
  }));
  
  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const slug = params?.slug as string;
  const post = getPostBySlug(slug);
  
  if (!post) {
    return {
      notFound: true,
    };
  }
  
  return {
    props: {
      post,
    },
  };
};

export default PostPage;
