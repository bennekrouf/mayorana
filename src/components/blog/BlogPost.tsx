'use client';

import React, { useRef, useState, ViewTransition } from 'react';
import { RunnableSnippets } from './RunnableSnippets';
import Link from 'next/link';
import { type BlogPost as BlogPostType, type PathEntry, formatDate } from '../../lib/blog-shared';
import ReadNext from './ReadNext';
import { FaTwitter, FaLinkedin, FaLink, FaCheck } from 'react-icons/fa';
import { useTranslations, useLocale } from 'next-intl';
import { useHostContext } from '@/providers/HostProvider';
import { useTrackReading } from '@/providers/ReadProgressProvider';
import { progressKey } from '@/lib/read-progress';
import { authorPageUrl, getAuthor } from '@/lib/authors';

interface BlogPostProps {
  post: BlogPostType;
  /** This post's track of the learning path, for the "read next" suggestions. */
  path: PathEntry[];
}

// The article itself, memoised on its HTML. This component re-renders as the
// reader scrolls (reading progress is recorded through context), and without
// the memo React replaced the body's DOM on those re-renders: the Run panels
// added under the code blocks were wiped with it, and the whole article was
// rebuilt each time progress was saved.
const PostBody = React.memo(function PostBody({ html, ref }: { html: string; ref: React.Ref<HTMLDivElement> }) {
  return (
    <div
      ref={ref}
      className="prose prose-lg dark:prose-invert max-w-none"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
});

const BlogPost: React.FC<BlogPostProps> = ({ post, path }) => {
  const [linkCopied, setLinkCopied] = useState(false);
  const t = useTranslations('blog');
  const tLearn = useTranslations('learn');
  const bodyRef = useRef<HTMLDivElement>(null);
  const { isSwissRust } = useHostContext();
  const locale = useLocale();
  const author = getAuthor(post.author);

  // Marks this post's place in the reader's progress as they scroll.
  useTrackReading(progressKey(post));

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
    const text = `${post.title} by ${getAuthor(post.author).name}`;
    const hashtags = post.tags?.slice(0, 3).join(',') || 'rust,programming';

    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}&hashtags=${encodeURIComponent(hashtags)}`;

    window.open(twitterUrl, '_blank', 'noopener,noreferrer');
  };

  // Share on LinkedIn
  const shareOnLinkedIn = () => {
    const url = getPostUrl();
    const title = post.title;
    const summary = post.excerpt;

    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(summary)}`;

    window.open(linkedinUrl, '_blank', 'noopener,noreferrer');
  };

  // Copy link to clipboard
  const copyLink = async () => {
    const url = getPostUrl();

    try {
      await navigator.clipboard.writeText(url);
      setLinkCopied(true);

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
      <div className="mb-8">
        <div className="mb-4">
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
            <time dateTime={post.date.slice(0, 10)}>{formatDate(post.date, locale)}</time>
            {post.updated && post.updated > post.date.slice(0, 10) && (
              <>
                <span className="mx-2">•</span>
                <span>
                  {t('updated')} <time dateTime={post.updated}>{formatDate(post.updated, locale)}</time>
                </span>
              </>
            )}
            {post.readingTime && (
              <>
                <span className="mx-2">•</span>
                <span>{post.readingTime}</span>
              </>
            )}
          </div>

          {/* The track this post is a step of; swissrust.ch has no /learn. */}
          {post.track && post.step !== undefined && !isSwissRust && (
            <Link
              href={`/${locale}/learn/${post.track}`}
              className="mt-2 inline-block text-sm text-primary hover:underline underline-offset-4"
            >
              🧭 {tLearn('part_of', { track: tLearn(`tracks.${post.track}.title`) })} · {tLearn('step', { step: post.step })}
            </Link>
          )}
        </div>

        <ViewTransition name={`post-title-${post.slug}`}>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{post.title}</h1>
        </ViewTransition>

        <div className="flex items-center mb-8">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
            <span className="text-primary font-medium">{author.name.charAt(0)}</span>
          </div>
          {/* A named, linked author: who wrote it is part of what search
              engines weigh in a technical article. The About page is on
              mayorana.ch, so the link is absolute for swissrust.ch. */}
          <a href={authorPageUrl(locale)} rel="author" className="font-medium hover:text-primary transition-colors">
            {author.name}
          </a>
        </div>
      </div>

      {post.headings && post.headings.length > 0 && (
        <div className="mb-8 p-4 bg-secondary rounded-lg">
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
        </div>
      )}

      <PostBody ref={bodyRef} html={post.contentHtml} />
      <RunnableSnippets container={bodyRef} />

      {post.tags && post.tags.length > 0 && (
        <div className="mt-12">
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
        </div>
      )}

      <ReadNext path={path} currentKey={progressKey(post)} />

      <div className="mt-12 pt-8 border-t border-border">
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
          <div className="mt-4 text-center animate-in fade-in slide-in-from-bottom-2">
            <span className="text-sm text-green-600 dark:text-green-400">
              ✓ {t('link_copied')}
            </span>
          </div>
        )}
      </div>
    </article>
  );
};

export default BlogPost;
