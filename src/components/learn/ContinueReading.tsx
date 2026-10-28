'use client';

// "Continue reading" for a returning reader: the article they left halfway,
// or, if they finished the last one they opened, the next unread step of its
// learning path. Floats in the corner rather than sitting in the page, so
// appearing after hydration never pushes the content down.
//
// Shows nothing — and fetches nothing — for someone with no reading history.

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useReadProgress } from '@/providers/ReadProgressProvider';
import { isRead, type ReadMap } from '@/lib/read-progress';
import { loadSearchIndex, type SearchIndex, type SearchItem } from '@/lib/search-client';

const DISMISS_KEY = 'mayorana.continueDismissed';

type Suggestion = { post: SearchItem; label: 'continue' | 'next'; pct: number };

function pick(index: SearchIndex, progress: ReadMap): Suggestion | null {
  const posts = index.items.filter((item) => item.type === 'post' && item.key);
  const byKey = new Map(posts.map((post) => [post.key!, post]));
  const visits = Object.entries(progress)
    .filter(([key]) => byKey.has(key))
    .sort(([, a], [, b]) => b.at.localeCompare(a.at));
  if (visits.length === 0) return null;

  // Left halfway: the most recent unfinished article.
  const unfinished = visits.find(([, entry]) => !isRead(entry));
  const [lastKey, lastEntry] = visits[0];
  if (unfinished && unfinished[0] === lastKey) {
    return { post: byKey.get(lastKey)!, label: 'continue', pct: lastEntry.pct };
  }

  // Finished the last one: the next unread step of its track.
  const last = byKey.get(lastKey)!;
  if (last.track) {
    const next = posts
      .filter((post) => post.track === last.track && post.step !== undefined)
      .sort((a, b) => a.step! - b.step!)
      .find((post) => !isRead(progress[post.key!]));
    if (next) return { post: next, label: 'next', pct: progress[next.key!]?.pct ?? 0 };
  }
  return unfinished ? { post: byKey.get(unfinished[0])!, label: 'continue', pct: unfinished[1].pct } : null;
}

export function ContinueReading() {
  const t = useTranslations('learn');
  const locale = useLocale();
  const { progress } = useReadProgress();
  const [index, setIndex] = useState<SearchIndex | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const hasHistory = Object.keys(progress).length > 0;

  useEffect(() => {
    if (!hasHistory) return;
    try {
      if (sessionStorage.getItem(DISMISS_KEY)) return;
    } catch { /* private mode: show it */ }
    let cancelled = false;
    loadSearchIndex(locale)
      .then((loaded) => !cancelled && setIndex(loaded))
      .catch(() => { /* a nicety; nothing to show */ });
    return () => { cancelled = true; };
  }, [hasHistory, locale]);

  const suggestion = index && !dismissed ? pick(index, progress) : null;
  if (!suggestion) return null;
  const { post, label, pct } = suggestion;

  const dismiss = () => {
    setDismissed(true);
    try { sessionStorage.setItem(DISMISS_KEY, '1'); } catch { /* ignore */ }
  };

  return (
    <aside
      aria-label={t('continue_reading')}
      className="rise fixed bottom-6 left-4 z-40 w-[calc(100%-6.5rem)] max-w-sm rounded-xl border border-border bg-background shadow-lg md:bottom-6 md:left-6"
    >
      <Link href={post.url} className="block p-4 pr-10">
        <span className="block text-xs font-semibold uppercase tracking-wide text-primary mb-1">
          {label === 'continue' ? t('continue_reading') : t('next_in', { track: index!.tracks[post.track!] ?? '' })}
        </span>
        <span className="block font-medium leading-snug line-clamp-2">{post.title}</span>
        {pct > 0 && (
          <span className="mt-2 block h-1 rounded-full bg-secondary overflow-hidden" aria-hidden="true">
            <span className="block h-full bg-primary" style={{ width: `${Math.round(pct * 100)}%` }} />
          </span>
        )}
      </Link>
      <button
        type="button"
        onClick={dismiss}
        aria-label={t('dismiss')}
        className="absolute top-2 right-2 rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </aside>
  );
}
