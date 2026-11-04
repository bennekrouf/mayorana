// A Swiss Rust tag page: posts and tags from the posts tagged `rust` only.
import { renderTagPage, tagStaticParams, type TagPageProps } from '@/app/[locale]/blog/tag/[slug]/tag-page';

export async function generateStaticParams() {
  return tagStaticParams(true);
}

export default function SwissRustTagPage(props: TagPageProps) {
  return renderTagPage(props, true);
}
