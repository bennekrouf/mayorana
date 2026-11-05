// The api0 gateway is the only backend mayorana talks to.
import { currentUser, firebaseConfig } from './firebase';
import { emailSessionToken, endEmailSession, type EmailSession } from './email-session';

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
 * fetch() against the gateway with the signed-in user's token in
 * `X-Google-Auth` — the header the gateway's GoogleAuth fairing reads: the
 * token of an email-code sign-in (src/lib/email-session.ts) or else the
 * Firebase ID token. The Firebase SDK caches its token and refreshes it before
 * expiry, so calling getIdToken() per request is cheap.
 *
 * With no user signed in the request goes out anonymously; the gateway answers
 * 401 on routes that need an identity, which surfaces here as a GatewayError.
 */
export async function gatewayFetch<T = unknown>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  // Null when Firebase is not loaded: nobody has signed in with it on this page.
  const emailToken = emailSessionToken();
  const user = emailToken ? null : currentUser();
  if (emailToken) {
    headers.set('X-Google-Auth', emailToken);
  } else if (user) {
    headers.set('X-Google-Auth', await user.getIdToken());
  }

  const response = await fetch(`${GATEWAY_URL}${path}`, { ...init, headers });

  // The gateway no longer takes the email token (its key changed, say): sign
  // out rather than keep showing someone signed in whom every call refuses.
  if (response.status === 401 && emailToken) endEmailSession();

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

/** Whether anyone is signed in on this page, by Firebase or by email code. */
export function isSignedIn(): boolean {
  return Boolean(emailSessionToken() || currentUser());
}

// ── Sign-in by email code ─────────────────────────────────────────────────────
//
// The site is named by its Firebase project id, so a code sign-in lands on the
// same preferences and plan as a Google sign-in with the same address.

/** Emails a 6-digit code to `email`. */
export async function startEmailSignIn(email: string, locale: string): Promise<void> {
  await gatewayFetch('/api/auth/email/start', {
    method: 'POST',
    body: JSON.stringify({ email, app: firebaseConfig.projectId, locale }),
  });
}

/** Trades the code for a session. Throws GatewayError (400 wrong code, 429 too many). */
export async function verifyEmailSignIn(email: string, code: string): Promise<EmailSession> {
  const res = await gatewayFetch<{ token: string; email: string; expires_at: number }>('/api/auth/email/verify', {
    method: 'POST',
    body: JSON.stringify({ email, app: firebaseConfig.projectId, code }),
  });
  return { token: res.token, email: res.email, expiresAt: res.expires_at };
}
