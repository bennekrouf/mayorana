import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { buildMetadata } from '@/lib/seo';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata' });

  return buildMetadata({
    locale,
    path: '/founding',
    title: t('founding_title'),
    description: t('founding_description'),
  });
}

export default function FoundingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
