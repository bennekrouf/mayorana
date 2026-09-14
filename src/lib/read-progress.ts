// Reading progress for blog posts.
//
// YouTube puts a red bar under a thumbnail you have already watched, and a
// partial bar under one you left halfway. The same idea reads well on a list
// of articles: at a glance, what is left to read.
//
// Two tiers, one behaviour. Everyone gets the bar from localStorage — no
// account, no network, nothing to wait for. Signing in only changes where the
// map is kept: it is mirrored into the user's prefs document so progress
// follows the person to another browser. The local copy stays authoritative
// while the tab is open; the gateway is a backup, never a dependency.
//
// Posts are keyed by slug alone, so reading an article in French marks the
// English one too — same article, either language.

export interface ReadEntry {
  /** Fraction of the post scrolled through, 0..1. */
  pct: number;
  /** ISO timestamp of the furthest read. */
  at: string;
}

export type ReadMap = Record<string, ReadEntry>;

const STORAGE_KEY = 'mayorana.readProgress';

/** At or above this, the post counts as read and the bar is drawn full. */
export const READ_THRESHOLD = 0.85;

/** Below this, a visit is a bounce and leaves no trace. */
const MIN_RECORDED = 0.05;

/** Progress is monotonic, so a write is only worth making if it moves. */
const MIN_DELTA = 0.02;

export function isRead(entry: ReadEntry | undefined): boolean {
  return (entry?.pct ?? 0) >= READ_THRESHOLD;
}

export function loadLocal(): ReadMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ReadMap) : {};
  } catch {
    // Private mode, disabled storage, or a corrupt value: start clean.
    return {};
  }
}

export function saveLocal(map: ReadMap): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch { /* nothing to do; the bar is a nicety, not state we owe anyone */ }
}

/**
 * Union of two maps. Progress only ever moves forward, so the furthest read
 * wins per post and the timestamps track the same way. This is what makes
 * signing in on a second device additive rather than destructive: neither
 * side's history is thrown away.
 */
export function mergeProgress(a: ReadMap, b: ReadMap): ReadMap {
  const merged: ReadMap = { ...a };
  for (const [slug, entry] of Object.entries(b)) {
    const mine = merged[slug];
    if (!mine || entry.pct > mine.pct) {
      merged[slug] = entry;
    } else if (entry.at > mine.at) {
      // Same or lower depth, but read more recently — keep the later date.
      merged[slug] = { pct: mine.pct, at: entry.at };
    }
  }
  return merged;
}

/** The map as it should be after recording `pct` for `slug`, or null if that
 *  would not change anything worth persisting. */
export function applyProgress(map: ReadMap, slug: string, pct: number): ReadMap | null {
  const clamped = Math.max(0, Math.min(1, pct));
  if (clamped < MIN_RECORDED) return null;
  const current = map[slug];
  if (current && clamped - current.pct < MIN_DELTA) return null;
  return { ...map, [slug]: { pct: clamped, at: new Date().toISOString() } };
}

/** Shape check on whatever came back from the gateway — that document is
 *  user-writable in principle, and a bad value must not break the listing. */
export function sanitize(value: unknown): ReadMap {
  if (!value || typeof value !== 'object') return {};
  const out: ReadMap = {};
  for (const [slug, entry] of Object.entries(value as Record<string, unknown>)) {
    const e = entry as Partial<ReadEntry> | null;
    if (!e || typeof e.pct !== 'number' || !Number.isFinite(e.pct)) continue;
    out[slug] = {
      pct: Math.max(0, Math.min(1, e.pct)),
      at: typeof e.at === 'string' ? e.at : new Date(0).toISOString(),
    };
  }
  return out;
}
