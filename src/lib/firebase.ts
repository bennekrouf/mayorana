// Firebase client for sign-in. mayorana has its own Firebase project
// (mayorana-7922a); the api0 gateway lists it as a trusted project
// (API0__GOOGLE_AUTH__EXTRA_FIREBASE_PROJECT_IDS) and verifies its ID tokens
// the same way it verifies app.api0.ai's. Everything in this config is public
// web config (it identifies the project, it is not a secret); the env
// overrides exist for pointing a dev build at another project.
//
// Firebase itself is not imported here. It lives in ./firebase-kit, a chunk of
// its own (~51 KB gzipped), loaded by loadFirebase() only when it can matter:
//   - at page start, for someone who has signed in on this browser before
//     (hasSessionHint) or is coming back from a redirect sign-in, so their
//     session is restored as it always was;
//   - as soon as anyone shows an intent to sign in (pointing at, focusing or
//     pressing a Sign in button, or a sign-in panel opening), so it is ready
//     by the click and the popup opens straight away.
// Everyone else never downloads it. Until it is loaded, nobody is signed in,
// which is what currentUser() reports.

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyA8OaC_m27FnQFFi3pq6c8pF0b0mZyh8Fw',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'mayorana.ch',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'mayorana-7922a',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:454981824324:web:92f65f850fd45452383111',
};

/** False only when a build blanks the keys out; then nothing auth-related renders. */
export const isAuthConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.appId);

export type FirebaseKit = typeof import('./firebase-kit');

let kit: FirebaseKit | null = null;
let loading: Promise<FirebaseKit> | null = null;

/** Loads Firebase once; every later call gets the same promise. Browser only. */
export function loadFirebase(): Promise<FirebaseKit> {
  if (!loading) {
    loading = import('./firebase-kit').then((loaded) => (kit = loaded));
    // A failed chunk load (offline, a deploy in between) can be retried.
    loading.catch(() => {
      loading = null;
    });
  }
  return loading;
}

/** Firebase if it has loaded, else null — never triggers a download. */
export const loadedFirebase = (): FirebaseKit | null => kit;

/** The signed-in user, or null — including when Firebase is not loaded. */
export const currentUser = () => kit?.auth.currentUser ?? null;

// ── Who gets Firebase at page start ──────────────────────────────────────────

const HINT_KEY = 'mayorana.auth.signedIn';

/** Remembered on sign-in, forgotten on sign-out (AuthProvider). */
export function rememberSignedIn(signedIn: boolean) {
  try {
    if (signedIn) localStorage.setItem(HINT_KEY, '1');
    else localStorage.removeItem(HINT_KEY);
  } catch {
    // storage blocked: the IndexedDB check below still finds the session
  }
}

/**
 * Whether this browser may hold a Firebase session to restore: our own flag,
 * or Firebase's own IndexedDB store — which also covers anyone signed in
 * before the flag existed. A false positive only costs loading Firebase.
 */
export async function hasSessionHint(): Promise<boolean> {
  try {
    if (localStorage.getItem(HINT_KEY)) return true;
    // Firebase's fallback persistence, where IndexedDB is unavailable.
    for (let i = 0; i < localStorage.length; i++) {
      if (localStorage.key(i)?.startsWith('firebase:authUser:')) return true;
    }
  } catch {
    // fall through to IndexedDB
  }
  try {
    if (typeof indexedDB?.databases === 'function') {
      const databases = await indexedDB.databases();
      return databases.some((db) => db.name === 'firebaseLocalStorageDb');
    }
  } catch {
    // no IndexedDB listing (an older Firefox): assume no session
  }
  return false;
}
