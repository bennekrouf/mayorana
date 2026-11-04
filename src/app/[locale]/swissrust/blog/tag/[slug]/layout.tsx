import type { Metadata } from 'next';
import { tagMetadata, type TagPageProps } from '@/app/[locale]/blog/tag/[slug]/tag-page';

export { default } from '@/app/[locale]/blog/tag/[slug]/layout';

export async function generateMetadata(props: TagPageProps): Promise<Metadata> {
  return tagMetadata(props, true);
}
