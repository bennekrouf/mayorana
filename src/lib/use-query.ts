'use client';

// The page's query string, for client components on prerendered pages.
//
// useSearchParams() on a static page makes React render that part of the tree
// only in the browser: the server HTML is a Suspense fallback that React
// throws away and replaces on hydration. Even with the full content as the
// fallback, the replacement repaints the page's main text after the JS has
// loaded — Largest Contentful Paint around 3 s on a throttled phone.
//
// This reads location.search through useSyncExternalStore instead: the
// server and the hydration pass see no query (null), so the prerendered DOM is
// kept as is, and the component re-renders in place with the real one right
// after. Same-page query changes made through the router are picked up on the
// next render; back/forward through popstate.

import { useMemo, useSyncExternalStore } from 'react';

function subscribe(onChange: () => void) {
  window.addEventListener('popstate', onChange);
  return () => window.removeEventListener('popstate', onChange);
}

export type Query = Pick<URLSearchParams, 'get'>;

export function useQuery(): Query | null {
  const search = useSyncExternalStore(
    subscribe,
    () => window.location.search,
    () => null,
  );
  return useMemo(() => (search === null ? null : new URLSearchParams(search)), [search]);
}
