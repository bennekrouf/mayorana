import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { headers } from 'next/headers';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata' });

  const headersList = await headers();
  const hostname = headersList.get('x-hostname') || '';
  const isSwissRust = hostname.includes('swissrust');

  return {
    title: t('blog_title'),
    description: isSwissRust ? t('blog_description_swissrust') : t('blog_description'),
  };
}

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
