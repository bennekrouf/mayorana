'use client';

// Owns the reading-progress map for the whole site: the blog listing reads it
// to draw the bar under each card, the post page writes to it as the reader
// scrolls. See src/lib/read-progress.ts for why it works the way it does.

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { getUserPrefs, updateUserPrefs } from '@/lib/gateway';
import {
  applyProgress,
  loadLocal,
  mergeProgress,
  sanitize,
  saveLocal,
  type ReadMap,
} from '@/lib/read-progress';

// ── The store ────────────────────────────────────────────────────────────────
//
// localStorage is an external store, so the map is held as one rather than in
// component state: React subscribes to it. That also gets hydration right for
// free — the server snapshot is empty, so nothing renders a bar until the
// browser has taken over and read the real value.

const EMPTY: ReadMap = {};

let snapshot: ReadMap = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

function getSnapshot(): ReadMap {
  if (!loaded) {
    snapshot = loadLocal();
    loaded = true;
  }
  return snapshot;
}

function getServerSnapshot(): ReadMap {
  return EMPTY;
}

function publish(next: ReadMap): void {
  snapshot = next;
  loaded = true;
  saveLocal(next);
  listeners.forEach((listener) => listener());
}

// ── The provider ─────────────────────────────────────────────────────────────

interface ReadProgressContextType {
  progress: ReadMap;
  record: (slug: string, pct: number) => void;
}

const ReadProgressContext = createContext<ReadProgressContextType>({
  progress: EMPTY,
  record: () => {},
});

export function useReadProgress() {
  return useContext(ReadProgressContext);
}

/** Quiet period before the map is pushed to the gateway. Reading generates a
 *  steady trickle of updates; one write per pause is plenty. */
const SYNC_DEBOUNCE_MS = 3000;

export function ReadProgressProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const progress = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const syncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const syncPending = useRef(false);
  const signedIn = useRef(false);
  // uid whose remote map has already been pulled and merged.
  const mergedFor = useRef<string | null>(null);

  const flush = useCallback(() => {
    if (syncTimer.current) {
      clearTimeout(syncTimer.current);
      syncTimer.current = null;
    }
    if (!syncPending.current || !signedIn.current) return;
    syncPending.current = false;
    // Best-effort, like the download bookkeeping: the reader never waits on
    // this and never sees it fail.
    void updateUserPrefs({ read: snapshot }).catch((error) => {
      console.warn('[ReadProgress] could not sync:', error);
    });
  }, []);

  // Signing in pulls whatever this person read elsewhere and unions it with
  // what this browser knows; the result goes back up, so both sides converge.
  useEffect(() => {
    signedIn.current = !!user;
    if (!user || mergedFor.current === user.uid) return;
    mergedFor.current = user.uid;
    let cancelled = false;
    (async () => {
      try {
        const prefs = await getUserPrefs();
        if (cancelled) return;
        const remote = sanitize(prefs.read);
        const merged = mergeProgress(getSnapshot(), remote);
        publish(merged);
        if (JSON.stringify(merged) !== JSON.stringify(remote)) {
          await updateUserPrefs({ read: merged });
        }
      } catch (error) {
        console.warn('[ReadProgress] could not load remote progress:', error);
      }
    })();
    return () => { cancelled = true; };
  }, [user]);

  // A closed tab is the most common way a read session ends, and it is the one
  // moment a debounce would lose. pagehide fires there where unload does not
  // (bfcache, mobile Safari).
  useEffect(() => {
    const onHide = () => flush();
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') flush();
    };
    window.addEventListener('pagehide', onHide);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('pagehide', onHide);
      document.removeEventListener('visibilitychange', onVisibility);
      flush();
    };
  }, [flush]);

  const record = useCallback((slug: string, pct: number) => {
    const next = applyProgress(getSnapshot(), slug, pct);
    if (!next) return;
    publish(next);
    if (!signedIn.current) return;
    syncPending.current = true;
    if (syncTimer.current) clearTimeout(syncTimer.current);
    syncTimer.current = setTimeout(flush, SYNC_DEBOUNCE_MS);
  }, [flush]);

  return (
    <ReadProgressContext.Provider value={{ progress, record }}>
      {children}
    </ReadProgressContext.Provider>
  );
}

// ── Tracking ─────────────────────────────────────────────────────────────────

/** How often the scroll position is written through to the store. The furthest
 *  point is tracked continuously; only the write is rationed. */
const RECORD_INTERVAL_MS = 1500;

/**
 * Track how far down a post the reader got. Measures the whole document rather
 * than the article element: the furthest scroll is what matters, and the
 * trailing share buttons and footer are what the 85% read threshold leaves
 * room for.
 */
export function useTrackReading(slug: string) {
  const { record } = useReadProgress();

  useEffect(() => {
    if (!slug) return;
    let furthest = 0;
    let lastRecorded = 0;

    const measure = () => {
      const height = document.documentElement.scrollHeight;
      if (height <= 0) return;
      // A post shorter than the viewport cannot be scrolled; it is read by
      // virtue of being open.
      const seen = height <= window.innerHeight
        ? 1
        : (window.scrollY + window.innerHeight) / height;
      furthest = Math.max(furthest, Math.min(1, seen));
    };

    const onScroll = () => {
      measure();
      const now = Date.now();
      if (now - lastRecorded < RECORD_INTERVAL_MS) return;
      lastRecorded = now;
      record(slug, furthest);
    };

    // The first measurement waits for layout: images and the prose block land
    // after mount, and measuring too early reports a misleadingly deep read.
    const initial = setTimeout(measure, 500);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', measure, { passive: true });

    return () => {
      clearTimeout(initial);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', measure);
      measure();
      record(slug, furthest);
    };
  }, [slug, record]);
}
