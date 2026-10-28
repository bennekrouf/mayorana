'use client';

// One learning-path track as a checklist: where the reader stands, a button to
// the next unread step, and every step with its read state. The read state
// comes from the same store as the bars on the blog listing; it is empty on
// the server and through hydration, so the page renders as "not started" and
// the marks appear once the browser has read the stored map. Only the text of
// the button and the marks change then, never the layout.

import React from 'react';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import type { PathEntry } from '@/lib/blog-shared';
import { getLocalizedPath } from '@/lib/i18n-utils';
import { isRead } from '@/lib/read-progress';
import { useReadProgress } from '@/providers/ReadProgressProvider';

export interface TrackSection {
  id: string;
  posts: PathEntry[];
}

export function useTrackProgress(entries: PathEntry[]) {
  const { progress } = useReadProgress();
  const read = entries.filter((entry) => isRead(progress[entry.progressKey])).length;
  const next = entries.find((entry) => !isRead(progress[entry.progressKey])) ?? null;
  return { progress, read, next };
}

export function TrackSummary({ entries }: { entries: PathEntry[] }) {
  const t = useTranslations('learn');
  const { read } = useTrackProgress(entries);
  const pct = entries.length ? Math.round((read / entries.length) * 100) : 0;
  return (
    <div>
      <p className="text-sm text-muted-foreground mb-1.5">{t('progress', { read, total: entries.length })}</p>
      <div className="h-1.5 rounded-full bg-secondary overflow-hidden" aria-hidden="true">
        <div className="h-full bg-primary transition-[width] duration-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function TrackSteps({ sections }: { sections: TrackSection[] }) {
  const t = useTranslations('learn');
  const locale = useLocale();
  const entries = sections.flatMap((section) => section.posts);
  const { progress, read, next } = useTrackProgress(entries);

  return (
    <div>
      <div className="rounded-xl border border-border bg-secondary/40 p-5 mb-12 flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between">
        <div className="sm:w-1/2">
          <TrackSummary entries={entries} />
        </div>
        {next ? (
          <Link
            href={getLocalizedPath(locale, `/blog/${next.slug}`)}
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
          >
            {read === 0 ? t('start') : t('continue', { step: next.step })}
          </Link>
        ) : (
          <p className="font-medium text-primary">{t('complete')}</p>
        )}
      </div>

      <div className="space-y-12">
        {sections.map((section) => (
          <section key={section.id} aria-labelledby={`section-${section.id}`}>
            <h2 id={`section-${section.id}`} className="text-2xl font-bold mb-5">
              {t(`sections.${section.id}`)}
            </h2>
            <ol className="space-y-3">
              {section.posts.map((entry) => {
                const entryProgress = progress[entry.progressKey];
                const done = isRead(entryProgress);
                return (
                  <li key={entry.slug}>
                    <Link
                      href={getLocalizedPath(locale, `/blog/${entry.slug}`)}
                      className="group flex gap-4 rounded-xl border border-border p-4 hover:border-primary/40 hover:bg-secondary/40 transition-colors"
                    >
                      <span
                        className={`shrink-0 mt-0.5 flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                          done ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground'
                        }`}
                        aria-hidden="true"
                      >
                        {done ? <Check className="h-4 w-4" /> : entry.step}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-semibold group-hover:text-primary transition-colors">
                          <span className="sr-only">{t('step', { step: entry.step })}: </span>
                          {entry.title}
                          {done && <span className="sr-only"> ({t('read')})</span>}
                        </span>
                        <span className="block text-sm text-muted-foreground mt-1 line-clamp-2">{entry.excerpt}</span>
                        <span className="block text-xs text-muted-foreground mt-2">{entry.readingTime}</span>
                        {!done && entryProgress && (
                          <span className="block mt-2 h-1 w-32 rounded-full bg-secondary overflow-hidden" aria-hidden="true">
                            <span className="block h-full bg-primary/70" style={{ width: `${Math.round(entryProgress.pct * 100)}%` }} />
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ol>
          </section>
        ))}
      </div>
    </div>
  );
}
