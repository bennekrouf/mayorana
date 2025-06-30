// Clean BlogPost component without categories
// File: src/components/blog/BlogPost.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { BlogPost as BlogPostType, formatDate } from '../../lib/blog';
import { motion } from '@/components/ui/Motion';

interface BlogPostProps {
  post: BlogPostType;
}

const BlogPost: React.FC<BlogPostProps> = ({ post }) => {
  return (
    <article className="w-full max-w-3xl mx-auto blog-content">
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-4">
          {/* Show main tags instead of category */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {post.tags.slice(0, 3).map((tag) => (
                <Link
                  key={tag}
                  href={`/blog/tag/${tag.toLowerCase().replace(/\s+/g, '-')}`}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}
          
          <div className="flex items-center text-sm text-muted-foreground">
            <span>{formatDate(post.date)}</span>
            {post.readingTime && (
              <>
                <span className="mx-2">•</span>
                <span>{post.readingTime}</span>
              </>
            )}
          </div>
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold mb-4">{post.title}</h1>
        
        <div className="flex items-center mb-8">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
            <span className="text-primary font-medium">{post.author.charAt(0)}</span>
          </div>
          <span className="font-medium">{post.author}</span>
        </div>
      </motion.div>
      
      {post.headings && post.headings.length > 0 && (
        <motion.div
          className="mb-8 p-4 bg-secondary rounded-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h2 className="text-lg font-medium mb-3">Table of Contents</h2>
          <nav>
            <ul className="space-y-2">
              {post.headings.map(heading => (
                <li 
                  key={heading.id}
                  className="ml-[calc(1rem*var(--level))]"
                  style={{ '--level': heading.level - 1 } as React.CSSProperties}
                >
                  <a 
                    href={`#${heading.id}`}
                    className="text-primary hover:underline"
                  >
                    {heading.text}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </motion.div>
      )}
      
      <motion.div
        className="prose prose-lg dark:prose-invert max-w-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        dangerouslySetInnerHTML={{ __html: post.contentHtml }}
      />
      
      {post.tags && post.tags.length > 0 && (
        <motion.div
          className="mt-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h3 className="text-lg font-medium mb-4">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {post.tags.map(tag => (
              <Link
                key={tag}
                href={`/blog/tag/${tag.toLowerCase().replace(/\s+/g, '-')}`}
                className="bg-secondary px-3 py-1 rounded-full text-sm hover:bg-secondary/80 transition-colors"
              >
                #{tag}
              </Link>
            ))}
          </div>
        </motion.div>
      )}
      
      <motion.div
        className="mt-12 pt-8 border-t border-border"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <div className="flex flex-col sm:flex-row sm:justify-between items-center">
          <Link
            href="/blog"
            className="mb-4 sm:mb-0 inline-flex items-center text-primary font-medium hover:underline"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-4 w-4 mr-1" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M15 19l-7-7 7-7" 
              />
            </svg>
            Back to Blog
          </Link>
          
          <div className="flex space-x-4">
            <button
              className="p-2 rounded-full bg-secondary text-foreground hover:bg-secondary/80 transition-colors"
              aria-label="Share on Twitter"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" 
                />
              </svg>
            </button>
            
            <button
              className="p-2 rounded-full bg-secondary text-foreground hover:bg-secondary/80 transition-colors"
              aria-label="Copy link"
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                // You could add a toast notification here
              }}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" 
                />
              </svg>
            </button>
          </div>
        </div>
      </motion.div>
    </article>
  );
};

export default BlogPost;
