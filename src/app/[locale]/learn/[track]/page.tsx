// One learning-path track: the blog's articles on a subject, in the order they
// are meant to be read (content/learning-path.json), with the reader's
// progress through them. Public and indexable: the order is the content.

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import LayoutTemplate from '@/components/layout/LayoutTemplate';
import { TrackSteps } from '@/components/learn/TrackSteps';
import { getTrack, trackMinutes, TRACK_IDS } from '@/lib/blog';
import { buildMetadata, SITE_URL } from '@/lib/seo';
import { locales } from '../../../../../i18n';

type Props = { params: Promise<{ locale: string; track: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    TRACK_IDS.filter((track) => getTrack(track, locale)).map((track) => ({ locale, track })),
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, track: id } = await params;
  const track = getTrack(id, locale);
  if (!track) return { title: 'Not found' };
  const t = await getTranslations({ locale, namespace: 'learn' });
  // hreflang only to the locales that have this track.
  const alternatePaths = Object.fromEntries(
    locales.filter((l) => getTrack(id, l)).map((l) => [l, `/learn/${id}`]),
  );
  return buildMetadata({
    locale,
    path: `/learn/${id}`,
    title: `${t(`tracks.${id}.title`)} — ${t('title')}`,
    description: t(`tracks.${id}.intro`),
    alternatePaths,
  });
}

export default async function TrackPage({ params }: Props) {
  const { locale, track: id } = await params;
  const track = getTrack(id, locale);
  if (!track) notFound();
  const t = await getTranslations({ locale, namespace: 'learn' });
  const url = `${SITE_URL}/${locale}/learn/${id}`;
  const posts = track.sections.flatMap((section) => section.posts);

  // The path as an ordered list of articles: what it is, said in markup.
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: t(`tracks.${id}.title`),
      description: t(`tracks.${id}.intro`),
      url,
      numberOfItems: posts.length,
      itemListOrder: 'https://schema.org/ItemListOrderAscending',
      itemListElement: posts.map((post, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: post.title,
        url: `${SITE_URL}/${locale}/blog/${post.slug}`,
      })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Mayorana', item: `${SITE_URL}/${locale}` },
        { '@type': 'ListItem', position: 2, name: t('title'), item: `${SITE_URL}/${locale}/learn` },
        { '@type': 'ListItem', position: 3, name: t(`tracks.${id}.title`), item: url },
      ],
    },
  ];

  return (
    <LayoutTemplate>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <section className="py-16 bg-gradient-to-b from-secondary to-background">
        <div className="container max-w-3xl">
          <Link
            href={`/${locale}/learn`}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
            {t('all_tracks')}
          </Link>
          <h1 className="text-4xl font-bold mb-4">{t(`tracks.${id}.title`)}</h1>
          <p className="text-lg text-muted-foreground mb-4">{t(`tracks.${id}.intro`)}</p>
          <p className="text-sm text-muted-foreground">
            {t('articles', { count: posts.length })} · {t('minutes', { minutes: trackMinutes(track) })}
          </p>
        </div>
      </section>
      <section className="py-12 bg-background">
        <div className="container max-w-3xl">
          <TrackSteps sections={track.sections} />
        </div>
      </section>
    </LayoutTemplate>
  );
}
