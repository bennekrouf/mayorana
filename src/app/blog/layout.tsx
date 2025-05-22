import { Metadata } from 'next';

// Static metadata for the blog section - no params needed
export const metadata: Metadata = {
  title: 'Blog - Mayorana',
  description: 'Insights and articles about Rust, AI, and modern software development.',
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
