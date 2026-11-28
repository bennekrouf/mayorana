// What someone was doing when they were asked to sign in, kept while they do.
//
// A sign-in that leaves the page (Microsoft always, Google and GitHub when
// their popup is blocked) loses the React state, so what it was for is parked
// in sessionStorage before it starts and taken back once they are signed in.
// Not for long: someone who gave up there and signs in later, for something
// else, must not be taken back to what they no longer expect.

const MAX_AGE_MS = 30 * 60 * 1000;

interface Parked<T> {
  value: T;
  at: number;
}

export function park<T>(key: string, value: T) {
  const parked: Parked<T> = { value, at: Date.now() };
  try { sessionStorage.setItem(key, JSON.stringify(parked)); } catch { /* private mode: a redirect just won't resume */ }
}

/** What was parked under `key`, if still fresh. Removes it either way. */
export function takeParked<T>(key: string): T | null {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    sessionStorage.removeItem(key);
    const { value, at } = JSON.parse(raw) as Partial<Parked<T>>;
    if (value === undefined || !at || Date.now() - at > MAX_AGE_MS) return null;
    return value;
  } catch {
    return null;
  }
}
