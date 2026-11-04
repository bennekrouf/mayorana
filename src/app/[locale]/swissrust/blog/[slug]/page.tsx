// A Swiss Rust post: only posts tagged `rust`; any other slug is a 404 here.
import { postStaticParams, renderPostPage, type PostPageProps } from '@/app/[locale]/blog/[slug]/post-page';

export async function generateStaticParams() {
  return postStaticParams(true);
}

export default function SwissRustPostPage(props: PostPageProps) {
  return renderPostPage(props, true);
}
