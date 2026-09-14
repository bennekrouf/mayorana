// The api0 gateway is the only backend mayorana talks to.
import { getFirebaseAuth, isAuthConfigured } from './firebase';

export const GATEWAY_URL =
  process.env.NEXT_PUBLIC_GATEWAY_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'https://gateway.api0.ai'
    : 'http://0.0.0.0:5009');

export class GatewayError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'GatewayError';
  }
}

/**
 * fetch() against the gateway with the signed-in user's Firebase ID token in
 * `X-Google-Auth` — the header the gateway's GoogleAuth fairing reads. The
 * Firebase SDK caches the token and refreshes it before expiry, so calling
 * getIdToken() per request is cheap.
 *
 * With no user signed in the request goes out anonymously; the gateway answers
 * 401 on routes that need an identity, which surfaces here as a GatewayError.
 */
export async function gatewayFetch<T = unknown>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const user = isAuthConfigured ? getFirebaseAuth().currentUser : null;
  if (user) {
    headers.set('X-Google-Auth', await user.getIdToken());
  }

  const response = await fetch(`${GATEWAY_URL}${path}`, { ...init, headers });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new GatewayError(response.status, body.message || body.error || `HTTP ${response.status}`);
  }

  return response.json() as Promise<T>;
}

// ── User preferences ──────────────────────────────────────────────────────────
//
// A JSON document the gateway keeps per signed-in person, scoped to this site
// (keyed by the Firebase project that issued the token, so it never collides
// with the same person's app.api0.ai state). Extend this type as features
// need state; unknown keys are kept by the gateway, so old builds and new
// builds can coexist.

export interface UserPrefs {
  [key: string]: unknown;
}

interface PrefsResponse {
  success: boolean;
  prefs: UserPrefs;
  updated_at: string | null;
}

export async function getUserPrefs(): Promise<UserPrefs> {
  const res = await gatewayFetch<PrefsResponse>('/api/user/prefs');
  return res.prefs ?? {};
}

/** Replace the whole document. */
export async function setUserPrefs(prefs: UserPrefs): Promise<UserPrefs> {
  const res = await gatewayFetch<PrefsResponse>('/api/user/prefs', {
    method: 'PUT',
    body: JSON.stringify(prefs),
  });
  return res.prefs;
}

/** Shallow-merge top-level keys into the document; other keys are kept. */
export async function updateUserPrefs(patch: UserPrefs): Promise<UserPrefs> {
  const res = await gatewayFetch<PrefsResponse>('/api/user/prefs', {
    method: 'PATCH',
    body: JSON.stringify(patch),
  });
  return res.prefs;
}
