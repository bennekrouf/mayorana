// Release notes for the desktop tools.
//
// Each app writes its notes once, in its own CHANGELOG.md, and its release CI
// publishes them as releases.json next to the builds on mayorana.ch. The site
// never reads them from the source repositories: the same reason the updater
// stopped reading latest.json from GitHub — a published page must not go blank
// because a repository's visibility changed.
//
// Two copies of the feed are in play, deliberately:
//
//   * the snapshot in src/data/releases/<tool>.json, refreshed at build time by
//     scripts/fetch-releases.js. It is what makes the build deterministic and
//     what dates the sitemap entry.
//   * the live file on the download host, re-read here on a one-hour
//     revalidate, so a release cut between two site deploys shows up without
//     one.
//
// The snapshot is the floor. A live feed only replaces it if it parses and is
// at least as complete — a truncated or error-page response must not shorten a
// tool's published history.

import { releaseNotesTools } from '@/data/tools';
import aisRunner from '@/data/releases/ais-runner.json';
import aisMonitor from '@/data/releases/ais-monitor.json';
import aisTracing from '@/data/releases/ais-tracing.json';
import aisAnalytics from '@/data/releases/ais-analytics.json';
import appscreens from '@/data/releases/appscreens.json';
import gitagent from '@/data/releases/gitagent.json';
import splitter from '@/data/releases/splitter.json';

/** One "### Added" block and its bullets. */
export interface ReleaseSection {
  heading: string;
  items: string[];
}

export interface Release {
  version: string;
  tag: string;
  /** ISO date, YYYY-MM-DD: the day the tag was pushed. */
  date: string;
  sections: ReleaseSection[];
}

export interface ReleaseFeed {
  name: string;
  product: string;
  page: string;
  generated_at: string;
  releases: Release[];
}

const snapshots: Record<string, ReleaseFeed> = {
  'ais-runner': aisRunner as ReleaseFeed,
  'ais-monitor': aisMonitor as ReleaseFeed,
  'ais-tracing': aisTracing as ReleaseFeed,
  'ais-analytics': aisAnalytics as ReleaseFeed,
  appscreens: appscreens as ReleaseFeed,
  gitagent: gitagent as ReleaseFeed,
  splitter: splitter as ReleaseFeed,
};

// The two halves of "this tool has release notes" — the id list the client
// components read, and the snapshots only the server needs — have to describe
// the same set. Checked here rather than left to be noticed as a 404 later.
const missing = releaseNotesTools.filter((id) => !(id in snapshots));
if (missing.length > 0) {
  throw new Error(
    `releaseNotesTools lists ${missing.join(', ')} with no snapshot in src/data/releases/`,
  );
}

/** Tools with a release-notes page, in catalogue order. */
export const toolsWithReleases = releaseNotesTools.filter((id) => id in snapshots);

export const releaseFeedUrl = (toolId: string) =>
  `https://mayorana.ch/downloads/${toolId}/latest/releases.json`;

function isUsable(feed: unknown): feed is ReleaseFeed {
  if (!feed || typeof feed !== 'object') return false;
  const releases = (feed as ReleaseFeed).releases;
  return (
    Array.isArray(releases) &&
    releases.length > 0 &&
    releases.every((r) => Boolean(r?.version && r?.date && Array.isArray(r.sections)))
  );
}

/**
 * The feed for one tool, newest release first, or null if it publishes none.
 * Never throws and never returns an empty history: a failed or unusable fetch
 * falls back to the snapshot the build was made with.
 */
export async function getReleaseFeed(toolId: string): Promise<ReleaseFeed | null> {
  const snapshot = snapshots[toolId];
  if (!snapshot) return null;

  try {
    const response = await fetch(releaseFeedUrl(toolId), {
      next: { revalidate: 3600 },
      headers: { accept: 'application/json' },
    });
    if (response.ok) {
      const live: unknown = await response.json();
      if (isUsable(live) && live.releases.length >= snapshot.releases.length) return live;
    }
  } catch {
    // Offline build, DNS, a 502 from the download host: the snapshot answers.
  }

  return snapshot;
}

/** The version a visitor would download today. */
export const latestRelease = (feed: ReleaseFeed): Release | undefined => feed.releases[0];

/** Anchor for one release, so a version has a URL of its own to be linked at. */
export const releaseAnchor = (version: string) => `v${version.replace(/\./g, '-')}`;

export function formatReleaseDate(date: string, locale: string): string {
  const parsed = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return date;
  return new Intl.DateTimeFormat(locale === 'fr' ? 'fr-CH' : 'en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(parsed);
}
