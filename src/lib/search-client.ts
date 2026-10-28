// Browser side of src/lib/search-index.ts: fetches the index once per page
// load, on first use, and ranks it against a query. No library: the index is a
// couple of hundred entries, and a few rules rank them well enough.

import type { SearchIndex, SearchItem } from './search-index';

export type { SearchIndex, SearchItem };

const cache = new Map<string, Promise<SearchIndex>>();

export function loadSearchIndex(locale: string): Promise<SearchIndex> {
  let pending = cache.get(locale);
  if (!pending) {
    pending = fetch(`/${locale}/search-index.json`).then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json() as Promise<SearchIndex>;
    });
    // A failed fetch is not cached, so the next open tries again.
    pending.catch(() => cache.delete(locale));
    cache.set(locale, pending);
  }
  return pending;
}

/** Lowercase, accents stripped: "mémoire" matches "memoire". */
export function normalize(text: string): string {
  return text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

const TYPE_BOOST: Record<SearchItem['type'], number> = { app: 3, track: 2, page: 1, post: 0 };

// Every word of the query has to match somewhere; where it matches sets the
// score. A word starting a title word beats one inside it, and a title beats
// tags, which beat the description.
function score(item: SearchItem, words: string[]): number {
  const title = normalize(item.title);
  const titleWords = title.split(/[^a-z0-9]+/);
  const tags = (item.tags ?? []).map(normalize);
  const text = normalize(item.text);
  let total = 0;
  for (const word of words) {
    if (titleWords.includes(word)) total += 14;
    else if (titleWords.some((w) => w.startsWith(word))) total += 10;
    else if (title.includes(word)) total += 6;
    else if (tags.some((tag) => tag.startsWith(word))) total += 5;
    else if (text.includes(word)) total += 2;
    else return 0;
  }
  return total + TYPE_BOOST[item.type];
}

export function search(index: SearchIndex, query: string, limit = 10): SearchItem[] {
  const words = normalize(query).split(/[^a-z0-9]+/).filter(Boolean);
  if (words.length === 0) return [];
  return index.items
    .map((item) => ({ item, score: score(item, words) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.item);
}
