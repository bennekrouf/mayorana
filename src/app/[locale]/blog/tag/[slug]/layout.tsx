// File: src/app/blog/tag/[slug]/layout.tsx
import { Metadata } from 'next';
import { getTagBySlug } from '@/lib/blog';

type Props = {
  params: Promise<{ slug: string; locale: string }>; // Add locale
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale } = await params; // Get both
  const tag = getTagBySlug(slug, locale); // Add locale

  if (!tag) {
    return {
      title: 'Tag Not Found',
    };
  }

  return {
    title: `${tag} - Blog`,
    description: `Articles about ${tag}`,
  };
}

export default function TagLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
