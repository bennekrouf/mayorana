'use client';

// "Read next" at the foot of a post: the next articles along the learning path
// that this reader has not finished yet, from the same track only — a Rust
// post never suggests an Azure one. The page passes just that track.
//
// Walks the path forward from the current post and wraps round to the start,
// so someone who began in the middle is still pointed at what they skipped.
// Read state comes from the same store that draws the bars on the listing; it
// is empty on the server and through hydration, so the first render suggests
// the plain path order and the read posts drop out once the browser takes over.

import React from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import type { PathEntry } from '@/lib/blog-shared';
import { getLocalizedPath } from '@/lib/i18n-utils';
import { useReadProgress } from '@/providers/ReadProgressProvider';
import { isRead } from '@/lib/read-progress';

/** One featured suggestion plus a couple of alternatives. */
const MAX_SUGGESTIONS = 3;

interface ReadNextProps {
  /** The current post's track, in reading order. */
  path: PathEntry[];
  /** progressKey() of the post being read. */
  currentKey: string;
}

const ReadNext: React.FC<ReadNextProps> = ({ path, currentKey }) => {
  const t = useTranslations('blog');
  const locale = useLocale();
  const { progress } = useReadProgress();

  const here = path.findIndex(entry => entry.progressKey === currentKey);
  const ordered = [...path.slice(here + 1), ...path.slice(0, here)];
  const suggestions = ordered
    .filter(entry => entry.progressKey !== currentKey && !isRead(progress[entry.progressKey]))
    .slice(0, MAX_SUGGESTIONS);

  // Outside the path, or alone in its track: nothing related to point at.
  if (here === -1 || path.length < 2) return null;

  return (
    <section className="mt-12" aria-labelledby="read-next-heading">
      <h3 id="read-next-heading" className="text-lg font-medium mb-4">
        {t('read_next')}
      </h3>

      {suggestions.length === 0 ? (
        <p className="text-muted-foreground">{t('path_complete')}</p>
      ) : (
        <ol className="space-y-3">
          {suggestions.map((entry, index) => {
            const started = progress[entry.progressKey];
            return (
              <li key={entry.slug}>
                <Link
                  href={getLocalizedPath(locale, `/blog/${entry.slug}`)}
                  prefetch={false}
                  className={`block rounded-xl border border-border p-4 transition-colors hover:border-primary ${
                    index === 0 ? 'bg-secondary' : 'bg-secondary/50'
                  }`}
                >
                  <div className="text-sm text-muted-foreground mb-1">
                    <span className="font-medium text-primary">
                      {t('path_step', { step: entry.step, total: path.length })}
                    </span>
                    <span className="mx-2">•</span>
                    <span>{entry.readingTime}</span>
                    {started && (
                      <>
                        <span className="mx-2">•</span>
                        <span>{t('progress_partial')}</span>
                      </>
                    )}
                  </div>
                  <div className={`font-semibold ${index === 0 ? 'text-xl' : ''}`}>
                    {entry.title}
                  </div>
                  {index === 0 && entry.excerpt && (
                    <p className="mt-2 text-muted-foreground">{entry.excerpt}</p>
                  )}
                </Link>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
};

export default ReadNext;
