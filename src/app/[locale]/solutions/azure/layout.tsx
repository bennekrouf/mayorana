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
    path: '/solutions/azure',
    title: t('azure_title'),
    description: t('azure_description'),
  });
}

export default function AzureSolutionsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
