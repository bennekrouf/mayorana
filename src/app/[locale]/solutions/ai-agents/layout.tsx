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
    title: t('ai_agents_title'),
    description: t('ai_agents_description'),
  };
}

export default function AiAgentsSolutionsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
