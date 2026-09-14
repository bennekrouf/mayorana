// Firebase client for sign-in. mayorana has its own Firebase project
// (mayorana-7922a); the api0 gateway lists it as a trusted project
// (API0__GOOGLE_AUTH__EXTRA_FIREBASE_PROJECT_IDS) and verifies its ID tokens
// the same way it verifies app.api0.ai's. Everything in this config is public
// web config (it identifies the project, it is not a secret); the env
// overrides exist for pointing a dev build at another project.
import { getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyA8OaC_m27FnQFFi3pq6c8pF0b0mZyh8Fw',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'mayorana-7922a.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'mayorana-7922a',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:454981824324:web:92f65f850fd45452383111',
};

/** False only when a build blanks the keys out; then nothing auth-related renders. */
export const isAuthConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.appId);

let app: FirebaseApp | undefined;

// Lazy so that importing this module during SSR (client components are still
// rendered on the server) does not initialise Firebase in Node.
export function getFirebaseAuth(): Auth {
  if (!app) {
    app = getApps()[0] ?? initializeApp(firebaseConfig);
  }
  return getAuth(app);
}
