// File: src/app/[locale]/blog/tag/[slug]/page.tsx
import { renderTagPage, tagStaticParams, type TagPageProps } from './tag-page';

export async function generateStaticParams() {
  return tagStaticParams(false);
}

export default function TagPage(props: TagPageProps) {
  return renderTagPage(props, false);
}
