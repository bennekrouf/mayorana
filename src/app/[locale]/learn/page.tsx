// The learning paths: every track of content/learning-path.json, with its size
// and the reader's progress through it.

import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import LayoutTemplate from '@/components/layout/LayoutTemplate';
import { TrackSummary } from '@/components/learn/TrackSteps';
import { ContinueReading } from '@/components/learn/ContinueReading';
import { getTracks, trackMinutes } from '@/lib/blog';
import { buildMetadata } from '@/lib/seo';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'learn' });
  return buildMetadata({ locale, path: '/learn', title: t('meta_title'), description: t('meta_description') });
}

export default async function LearnPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'learn' });
  const tracks = getTracks(locale);

  return (
    <LayoutTemplate>
      <ContinueReading />
      <section className="py-16 bg-gradient-to-b from-secondary to-background">
        <div className="container max-w-3xl">
          <h1 className="text-4xl font-bold mb-4">{t('title')}</h1>
          <p className="text-lg text-muted-foreground">{t('intro')}</p>
        </div>
      </section>
      <section className="py-12 bg-background">
        <div className="container max-w-3xl">
          <ul className="space-y-5">
            {tracks.map((track) => {
              const posts = track.sections.flatMap((section) => section.posts);
              return (
                <li key={track.id}>
                  <Link
                    href={`/${locale}/learn/${track.id}`}
                    className="group block rounded-2xl border border-border p-6 hover:border-primary/40 hover:bg-secondary/40 transition-colors"
                  >
                    <h2 className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors">
                      {t(`tracks.${track.id}.title`)}
                    </h2>
                    <p className="text-muted-foreground mb-3">{t(`tracks.${track.id}.intro`)}</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      {t('articles', { count: posts.length })} · {t('minutes', { minutes: trackMinutes(track) })}
                    </p>
                    <TrackSummary entries={posts} />
                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                      {t('open_track')}
                      <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    </LayoutTemplate>
  );
}
