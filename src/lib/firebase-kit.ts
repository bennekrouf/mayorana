// Everything that imports Firebase, in one module that src/lib/firebase.ts
// loads on demand (`import()`), so it is a chunk of its own: ~51 KB gzipped
// that no page downloads up front. See firebase.ts for when it is loaded.
//
// initializeAuth rather than getAuth: getAuth also installs the popup/redirect
// resolver, which loads Google's sign-in iframe and gapi (~135 KB, plus two
// project-config requests) as soon as auth starts. Restoring a session needs
// only the persistence below; the resolver is passed to the sign-in calls
// themselves (popupRedirectResolver).

import { getApps, initializeApp } from 'firebase/app';
import {
  browserLocalPersistence,
  browserPopupRedirectResolver,
  browserSessionPersistence,
  getAuth,
  indexedDBLocalPersistence,
  initializeAuth,
  type Auth,
} from 'firebase/auth';
import { firebaseConfig } from './firebase';

export {
  getRedirectResult,
  GithubAuthProvider,
  GoogleAuthProvider,
  linkWithCredential,
  OAuthCredential,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
} from 'firebase/auth';

function createAuth(): Auth {
  const app = getApps()[0] ?? initializeApp(firebaseConfig);
  try {
    return initializeAuth(app, {
      persistence: [indexedDBLocalPersistence, browserLocalPersistence, browserSessionPersistence],
    });
  } catch {
    // Already initialised (a hot reload in dev): take the existing instance.
    return getAuth(app);
  }
}

export const auth = createAuth();

/** For signInWithPopup, signInWithRedirect and getRedirectResult only. */
export const popupRedirectResolver = browserPopupRedirectResolver;
