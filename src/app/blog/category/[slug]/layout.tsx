import { Metadata } from 'next';
import { getCategoryBySlug } from '@/lib/blog';

// Next.js 15: params is now a Promise
type Props = {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // Await the params since they're now a Promise in Next.js 15
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  
  if (!category) {
    return {
      title: 'Category Not Found',
    };
  }
  
  return {
    title: `${category.name} - Blog`,
    description: category.description,
  };
}

export default function CategoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
