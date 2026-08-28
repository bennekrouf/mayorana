import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata' });

  return {
    title: t('azure_title'),
    description: t('azure_description'),
  };
}

export default function AzureSolutionsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
