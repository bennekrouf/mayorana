// The site in one small JSON file per locale, for the ⌘K search palette and the
// "continue reading" prompt. Built at deploy time (the route is force-static)
// and fetched by the browser only when one of those needs it, so a visitor who
// never searches never downloads it.

import { getTranslations } from 'next-intl/server';
import { getAllPosts, getTracks } from './blog';
import { progressKey } from './read-progress';
import { appI18nKey, desktopToolsConfig } from '@/data/tools';

export type SearchItemType = 'page' | 'track' | 'app' | 'post';

export interface SearchItem {
  type: SearchItemType;
  title: string;
  /** Site-relative, with the locale. */
  url: string;
  /** One line under the title: an excerpt, a tagline, a description. */
  text: string;
  tags?: string[];
  /** Posts only: where its reading progress is stored, and its place on the path. */
  key?: string;
  track?: string;
  step?: number;
}

export interface SearchIndex {
  items: SearchItem[];
  /** Track id → title, for "Next in <track>". */
  tracks: Record<string, string>;
  /** Whether the palette offers Ask Mayorana (src/lib/ask.ts): its licence is
   *  set on the server. Decided at build time, like the rest of the file. */
  ask: boolean;
}

// Pages worth jumping to, with the metadata key their title and description
// come from.
const PAGES: { path: string; key: string }[] = [
  { path: '/apps', key: 'apps' },
  { path: '/pricing', key: 'pricing' },
  { path: '/solutions/ai-agents', key: 'ai_agents' },
  { path: '/solutions/azure', key: 'azure' },
  { path: '/blog', key: 'blog' },
  { path: '/founding', key: 'founding' },
  { path: '/about', key: 'about' },
  { path: '/contact', key: 'contact' },
  { path: '/privacy', key: 'privacy' },
  { path: '/terms', key: 'terms' },
];

export async function buildSearchIndex(locale: string): Promise<SearchIndex> {
  const tMeta = await getTranslations({ locale, namespace: 'metadata' });
  const tApps = await getTranslations({ locale, namespace: 'apps' });
  const tLearn = await getTranslations({ locale, namespace: 'learn' });
  const tracks = getTracks(locale);

  const items: SearchItem[] = [
    ...PAGES.map(({ path, key }) => ({
      type: 'page' as const,
      title: tMeta(`${key}_title`),
      url: `/${locale}${path}`,
      text: tMeta(`${key}_description`),
    })),
    { type: 'page', title: tLearn('title'), url: `/${locale}/learn`, text: tLearn('meta_description') },
    ...tracks.map((track) => ({
      type: 'track' as const,
      title: tLearn(`tracks.${track.id}.title`),
      url: `/${locale}/learn/${track.id}`,
      text: tLearn(`tracks.${track.id}.intro`),
    })),
    ...desktopToolsConfig.map((tool) => ({
      type: 'app' as const,
      title: tool.name,
      url: `/${locale}/apps/${tool.id}`,
      text: tApps(`${appI18nKey[tool.id]}_tagline`),
      tags: tool.tags,
    })),
    ...getAllPosts(locale).map((post) => ({
      type: 'post' as const,
      title: post.title,
      url: `/${locale}/blog/${post.slug}`,
      text: post.excerpt.replace(/\s+/g, ' ').trim(),
      tags: post.tags,
      key: progressKey(post),
      ...(post.track && post.step !== undefined ? { track: post.track, step: post.step } : {}),
    })),
  ];

  return {
    items,
    tracks: Object.fromEntries(tracks.map((track) => [track.id, tLearn(`tracks.${track.id}.title`)])),
    ask: Boolean(process.env.ASK_API0_LICENCE),
  };
}
