// One blog post, prerendered for every post in both locales.
// File: src/app/[locale]/blog/[slug]/page.tsx
import { postStaticParams, renderPostPage, type PostPageProps } from './post-page';

export async function generateStaticParams() {
  return postStaticParams(false);
}

export default function PostPage(props: PostPageProps) {
  return renderPostPage(props, false);
}
