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

// ── Sign-in with Microsoft ────────────────────────────────────────────────────
//
// Checked by the gateway, not Firebase: it accepts work and school accounts
// only when their tenant has verified the email's domain, which Firebase
// cannot tell (gateway src/auth/microsoft_login.rs). The page leaves for
// Microsoft and comes back with #ms_code=… (or #ms_error=…); the code is
// redeemed with a verifier only this tab holds, so a code minted for someone
// else's account is useless here. The result is the same session as an email
// code.

const MS_VERIFIER_KEY = 'mayorana.auth.msVerifier';

function base64url(bytes: Uint8Array): string {
  let binary = '';
  bytes.forEach((b) => { binary += String.fromCharCode(b); });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Leaves for Microsoft. Returns false when it cannot start (sessionStorage
 * blocked, so the verifier would not survive the round trip).
 */
export async function startMicrosoftSignIn(): Promise<boolean> {
  const verifier = base64url(crypto.getRandomValues(new Uint8Array(32)));
  try {
    sessionStorage.setItem(MS_VERIFIER_KEY, verifier);
  } catch {
    return false;
  }
  const challenge = base64url(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier))));
  const returnTo = window.location.href.split('#')[0];
  const params = new URLSearchParams({ app: firebaseConfig.projectId, return_to: returnTo, challenge });
  window.location.assign(`${GATEWAY_URL}/api/auth/microsoft/start?${params}`);
  return true;
}

/** What the gateway sent back in the fragment, if anything; removes it from the address. */
export function takeMicrosoftResult(): { code: string } | { error: string } | null {
  if (typeof window === 'undefined') return null;
  const hash = new URLSearchParams(window.location.hash.slice(1));
  const code = hash.get('ms_code');
  const error = hash.get('ms_error');
  if (!code && !error) return null;
  window.history.replaceState(window.history.state, '', window.location.pathname + window.location.search);
  return code ? { code } : { error: error ?? 'failed' };
}

/** Trades the code from the fragment for a session. Throws when it cannot. */
export async function finishMicrosoftSignIn(code: string): Promise<EmailSession> {
  let verifier: string | null = null;
  try {
    verifier = sessionStorage.getItem(MS_VERIFIER_KEY);
    sessionStorage.removeItem(MS_VERIFIER_KEY);
  } catch { /* falls through to the error below */ }
  if (!verifier) throw new GatewayError(400, 'This sign-in was not started in this tab');
  const res = await gatewayFetch<{ token: string; email: string; name: string | null; expires_at: number }>(
    '/api/auth/microsoft/redeem',
    { method: 'POST', body: JSON.stringify({ code, verifier }) },
  );
  return { token: res.token, email: res.email, name: res.name, expiresAt: res.expires_at };
}
