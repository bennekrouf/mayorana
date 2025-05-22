import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Services',
  description: 'Expert services in Rust training, LLM integration, AI agent development, and api0.ai solutions.',
};

export default function ServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
