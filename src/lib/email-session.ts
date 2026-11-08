// A sign-in by a code sent by email, kept in this browser. A Microsoft
// sign-in ends in the same kind of session (src/lib/gateway.ts).
//
// Google and GitHub sign-in go through Firebase, whose endpoints are Google's
// and are blocked in mainland China. The email code is checked by the api0
// gateway instead (POST /api/auth/email/start, /verify), which returns a token
// of its own. That token goes in X-Google-Auth like a Firebase ID token, and
// the gateway files it under the same site and email as a Google sign-in, so
// the same person gets the same preferences and plan either way.
//
// The token lasts 30 days and cannot be refreshed: after that, or if the
// gateway refuses it, the person is signed out and asks for a new code.
//
// No Firebase here, so someone who signs in by email never downloads it.

const KEY = 'mayorana.auth.emailSession';

/** Fired on window when the session ends without a sign-out (expired, refused). */
export const EMAIL_SESSION_ENDED = 'mayorana:email-session-ended';

export interface EmailSession {
  token: string;
  email: string;
  /** From a Microsoft sign-in, which also ends in this kind of session. */
  name?: string | null;
  /** Unix seconds. */
  expiresAt: number;
}

/** The session, or null when there is none or it has expired. */
export function readEmailSession(): EmailSession | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as EmailSession;
    if (!session.token || !session.email || session.expiresAt * 1000 <= Date.now()) {
      localStorage.removeItem(KEY);
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export function saveEmailSession(session: EmailSession) {
  try {
    localStorage.setItem(KEY, JSON.stringify(session));
  } catch {
    // storage blocked: signed in for this page only
  }
  memory = session;
}

export function clearEmailSession() {
  memory = null;
  try {
    localStorage.removeItem(KEY);
  } catch {
    // nothing stored
  }
}

// When localStorage is blocked the session still lasts until the page closes.
let memory: EmailSession | null = null;

/** The token to send, from storage or from this page's memory. */
export function emailSessionToken(): string | null {
  const session = readEmailSession() ?? (memory && memory.expiresAt * 1000 > Date.now() ? memory : null);
  return session?.token ?? null;
}

/** The gateway refused the token: forget it and tell the AuthProvider. */
export function endEmailSession() {
  clearEmailSession();
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(EMAIL_SESSION_ENDED));
}
