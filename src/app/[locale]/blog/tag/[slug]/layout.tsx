// File: src/app/[locale]/blog/tag/[slug]/layout.tsx
import type { Metadata } from 'next';
import { tagMetadata, type TagPageProps } from './tag-page';

export async function generateMetadata(props: TagPageProps): Promise<Metadata> {
  return tagMetadata(props, false);
}

export default function TagLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
