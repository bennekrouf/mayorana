// A listing of post cards. A server component, so the posts it is given stay
// on the server: only the card fields (toPostCard) reach the browser.
// File: src/components/blog/BlogList.tsx

import BlogListClient from './BlogListClient';
import { type BlogPost, toPostCard } from '@/lib/blog-shared';

type Props = {
  posts: BlogPost[];
  title?: string;
  description?: string;
  /** Show each post's step in the learning path (path view only). */
  showSteps?: boolean;
};

export default function BlogList({ posts, ...rest }: Props) {
  return <BlogListClient posts={posts.map(toPostCard)} {...rest} />;
}
