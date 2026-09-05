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
    path: '/apps',
    title: t('apps_title'),
    description: t('apps_description'),
  });
}

export default function AppsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
