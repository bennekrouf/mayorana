import Link from 'next/link';
import LayoutTemplate from '@/components/layout/LayoutTemplate';
import BlogList from '@/components/blog/BlogList';
import { getRecentPosts } from '@/lib/blog';
import ClientHomeSection from '@/components/home/ClientHomeSection';
import { ContinueReading } from '@/components/learn/ContinueReading';
import { getTranslations } from 'next-intl/server';
import { SITE_NAME, SITE_URL } from '@/lib/seo';

type Props = {
  params: Promise<{ locale: string }>;
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  // Always show the pinned "Why Rust?" series on the home page
  const recentPosts = getRecentPosts(3, locale);
  const t = await getTranslations({ locale, namespace: 'home' });
  const tMeta = await getTranslations({ locale, namespace: 'metadata' });
  // The site itself, tied to the Organization the locale layout declares.
  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: `${SITE_URL}/${locale}`,
    description: tMeta('site_description'),
    inLanguage: locale,
    publisher: { '@id': `${SITE_URL}/#organization` },
  };
  return (
    <LayoutTemplate>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
      {/* Hero Section */}
      <ClientHomeSection />
      <ContinueReading />

      {/* Blog Section */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">{t('latest_insights')}</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('insights_subtitle')}
            </p>
          </div>
          <BlogList posts={recentPosts} />
          <div className="text-center mt-12">
            <Link
              href={`/${locale}/blog`}
              className="inline-flex items-center px-6 py-3 rounded-lg bg-secondary text-foreground font-medium hover:bg-secondary/80 transition-colors"
            >
              {t('view_all_articles')}
            </Link>
          </div>
        </div>
      </section>
    </LayoutTemplate>
  );
}
