'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { BlogPost as BlogPostType, formatDate } from '../../lib/blog';
import { motion } from '@/components/ui/Motion';
import { FaTwitter, FaLinkedin, FaLink, FaCheck } from 'react-icons/fa';
import { useTranslations, useLocale } from 'next-intl';

interface BlogPostProps {
  post: BlogPostType;
}

const BlogPost: React.FC<BlogPostProps> = ({ post }) => {
  const [linkCopied, setLinkCopied] = useState(false);
  const t = useTranslations('blog');
  const locale = useLocale();

  // Generate the full URL for the post
  const getPostUrl = () => {
    if (typeof window !== 'undefined') {
      return window.location.href;
    }
    return `https://mayorana.ch/${locale}/blog/${post.slug}`;
  };

  // Share on X (Twitter)
  const shareOnTwitter = () => {
    const url = getPostUrl();
    const text = `${post.title} by ${post.author}`;
    const hashtags = post.tags?.slice(0, 3).join(',') || 'rust,programming';

    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}&hashtags=${encodeURIComponent(hashtags)}`;

    // Track the share event
    if (typeof window !== 'undefined' && window.plausible) {
      window.plausible('Social Share', {
        props: {
          platform: 'twitter',
          post: post.slug
        }
      });
    }

    window.open(twitterUrl, '_blank', 'noopener,noreferrer');
  };

  // Share on LinkedIn
  const shareOnLinkedIn = () => {
    const url = getPostUrl();
    const title = post.title;
    const summary = post.excerpt;

    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(summary)}`;

    // Track the share event
    if (typeof window !== 'undefined' && window.plausible) {
      window.plausible('Social Share', {
        props: {
          platform: 'linkedin',
          post: post.slug
        }
      });
    }

    window.open(linkedinUrl, '_blank', 'noopener,noreferrer');
  };

  // Copy link to clipboard
  const copyLink = async () => {
    const url = getPostUrl();

    try {
      await navigator.clipboard.writeText(url);
      setLinkCopied(true);

      // Track the copy event
      if (typeof window !== 'undefined' && window.plausible) {
        window.plausible('Link Copy', {
          props: {
            post: post.slug
          }
        });
      }

      // Reset the copied state after 2 seconds
      setTimeout(() => {
        setLinkCopied(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    }
  };

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
                  href={`/${locale}/blog/tag/${tag.toLowerCase().replace(/\s+/g, '-')}`}
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
          <h2 className="text-lg font-medium mb-3">{t('table_contents')}</h2>
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
          <h3 className="text-lg font-medium mb-4">{t('tags')}</h3>
          <div className="flex flex-wrap gap-2">
            {post.tags.map(tag => (
              <Link
                key={tag}
                href={`/${locale}/blog/tag/${tag.toLowerCase().replace(/\s+/g, '-')}`}
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
          {/* FIXED: Use locale-aware back to blog link */}
          <Link
            href={`/${locale}/blog`}
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
            {t('back_to_blog')}
          </Link>

          <div className="flex items-center space-x-3">
            <span className="text-sm text-muted-foreground mr-2">{t('share')}:</span>

            {/* X (Twitter) Share Button */}
            <button
              onClick={shareOnTwitter}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors"
              aria-label={t('share_twitter')}
              title={t('share_twitter')}
            >
              <FaTwitter className="h-4 w-4" />
            </button>

            {/* LinkedIn Share Button */}
            <button
              onClick={shareOnLinkedIn}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-700 text-white hover:bg-blue-800 transition-colors"
              aria-label={t('share_linkedin')}
              title={t('share_linkedin')}
            >
              <FaLinkedin className="h-4 w-4" />
            </button>

            {/* Copy Link Button */}
            <button
              onClick={copyLink}
              className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${linkCopied
                  ? 'bg-green-500 text-white'
                  : 'bg-secondary text-foreground hover:bg-secondary/80'
                }`}
              aria-label={linkCopied ? t('link_copied') : t('copy_link')}
              title={linkCopied ? t('link_copied') : t('copy_link')}
            >
              {linkCopied ? (
                <FaCheck className="h-4 w-4" />
              ) : (
                <FaLink className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* Success message for link copy */}
        {linkCopied && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 text-center"
          >
            <span className="text-sm text-green-600 dark:text-green-400">
              ✓ {t('link_copied')}
            </span>
          </motion.div>
        )}
      </motion.div>
    </article>
  );
};

export default BlogPost;
