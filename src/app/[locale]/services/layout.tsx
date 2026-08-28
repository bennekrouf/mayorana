import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Services',
  description:
    'Custom AI agent systems and MCP gateways, Azure integration tooling and consulting, and high-performance Rust development and training — Swiss-built on the same stack as our products.',
};

export default function ServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
