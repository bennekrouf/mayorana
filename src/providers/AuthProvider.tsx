'use client';

import React, { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import type { AuthError, OAuthCredential, User } from 'firebase/auth';
import { useTranslations } from 'next-intl';
import {
  hasSessionHint,
  isAuthConfigured,
  loadFirebase,
  loadedFirebase,
  rememberSignedIn,
  type FirebaseKit,
} from '@/lib/firebase';

export type SignInProvider = 'google' | 'github';

/**
 * How a sign-in attempt ended. When the email already has an account under
 * the other provider, signIn() waits on the link dialog and reports how that
 * ended; a link that falls back to a redirect leaves the page and never
 * resolves.
 */
export type SignInOutcome = 'signed-in' | 'cancelled' | 'redirecting' | 'failed';

interface AuthContextType {
  /** False when Firebase keys are missing from the build; nothing auth-related renders. */
  enabled: boolean;
  user: User | null;
  /** True until Firebase has restored (or ruled out) a persisted session. */
  loading: boolean;
  signIn: (provider: SignInProvider) => Promise<SignInOutcome>;
  signOut: () => Promise<void>;
  /**
   * Starts loading Firebase without signing in. Call it when someone shows an
   * intent to sign in — pointing at, focusing or pressing a Sign in button, a
   * sign-in panel opening — so it is there by the click: a popup opened after
   * a slow download can be blocked (Safari), which turns sign-in into a
   * full-page redirect. See src/lib/firebase.ts.
   */
  prepare: () => void;
}

const AuthContext = createContext<AuthContextType>({
  enabled: false,
  user: null,
  loading: true,
  signIn: async () => 'failed',
  signOut: async () => {},
  prepare: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

const PROVIDER_NAMES: Record<SignInProvider, string> = { google: 'Google', github: 'GitHub' };
const PROVIDER_IDS: Record<SignInProvider, string> = { google: 'google.com', github: 'github.com' };

function makeProvider(kit: FirebaseKit, provider: SignInProvider, email?: string | null) {
  if (provider === 'google') {
    const google = new kit.GoogleAuthProvider();
    // Preselects the right account in Google's chooser when linking.
    if (email) google.setCustomParameters({ login_hint: email });
    return google;
  }
  const github = new kit.GithubAuthProvider();
  // Without it a GitHub account with a private email signs in with no email
  // at all, and the gateway rejects every token that lacks one.
  github.addScope('user:email');
  return github;
}

function credentialFromError(kit: FirebaseKit, provider: SignInProvider, error: AuthError) {
  return provider === 'google'
    ? kit.GoogleAuthProvider.credentialFromError(error)
    : kit.GithubAuthProvider.credentialFromError(error);
}

// ── Account linking ───────────────────────────────────────────────────────────
//
// Firebase keeps one account per email. Signing in with GitHub under an email
// that already signed in with Google (or the reverse) fails with
// auth/account-exists-with-different-credential, carrying the new provider's
// credential. We park that credential, have the person sign in once with the
// provider they already used, and attach the parked one to that account with
// linkWithCredential — from then on either provider signs in to the same user,
// so the gateway sees the same email and the same prefs.
//
// With two providers the one they already used is always the other one, which
// is why nothing asks Firebase which it was (fetchSignInMethodsForEmail is off
// anyway under email-enumeration protection).

interface PendingLink {
  email: string | null;
  /** The provider they just tried, whose credential is parked. */
  added: SignInProvider;
  /** The provider the account already has; they sign in with this one. */
  existing: SignInProvider;
  credential: OAuthCredential;
}

type StashedLink = Omit<PendingLink, 'credential'> & { credential: object };

type LinkError = { kind: 'mismatch'; actual: string } | { kind: 'failed' };

// Both survive a redirect sign-in (popup blocked), which reloads the page.
const LINK_KEY = 'mayorana.auth.pendingLink';
const REDIRECT_KEY = 'mayorana.auth.redirectProvider';

function stashLink(link: PendingLink) {
  try {
    sessionStorage.setItem(
      LINK_KEY,
      JSON.stringify({ email: link.email, added: link.added, existing: link.existing, credential: link.credential.toJSON() }),
    );
  } catch { /* private mode: linking still works on the popup path */ }
}

/** The parked link, as stored: turning it back into a credential needs Firebase. */
function takeLink(): StashedLink | null {
  try {
    const raw = sessionStorage.getItem(LINK_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(LINK_KEY);
    return JSON.parse(raw) as StashedLink;
  } catch {
    return null;
  }
}

function restoreLink(kit: FirebaseKit, stashed: StashedLink | null): PendingLink | null {
  if (!stashed) return null;
  const credential = kit.OAuthCredential.fromJSON(stashed.credential);
  return credential ? { ...stashed, credential } : null;
}

function clearLink() {
  try { sessionStorage.removeItem(LINK_KEY); } catch { /* ignore */ }
}

function takeRedirectProvider(): SignInProvider | null {
  try {
    const value = sessionStorage.getItem(REDIRECT_KEY);
    sessionStorage.removeItem(REDIRECT_KEY);
    return value === 'google' || value === 'github' ? value : null;
  } catch {
    return null;
  }
}

async function redirectTo(kit: FirebaseKit, provider: SignInProvider, email?: string | null) {
  try { sessionStorage.setItem(REDIRECT_KEY, provider); } catch { /* ignore */ }
  await kit.signInWithRedirect(kit.auth, makeProvider(kit, provider, email), kit.popupRedirectResolver);
}

function isQuietCancel(code: string | undefined) {
  // Closing the popup rejects too; nothing to report for that.
  return code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request';
}

/**
 * Sign-in state for the whole site. Unlike the api0 dashboard this never
 * withholds children while Firebase boots: mayorana is a public site and every
 * page must render (and be crawlable) whether or not anyone is signed in.
 * Components that need the user read `loading` and decide for themselves.
 *
 * Firebase is loaded only when it can matter (src/lib/firebase.ts): at page
 * start for someone who has signed in here before or is back from a redirect
 * sign-in, otherwise on an intent to sign in (`prepare`) or on signIn itself.
 * Until then `user` is null and, once that is known, `loading` is false.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [link, setLink] = useState<PendingLink | null>(null);
  const [linkBusy, setLinkBusy] = useState(false);
  const [linkError, setLinkError] = useState<LinkError | null>(null);
  const started = useRef(false);
  const watching = useRef(false);
  // Settles the signIn() call that opened the link dialog, if one is waiting.
  const linkSettled = useRef<((outcome: SignInOutcome) => void) | null>(null);

  const settleLink = (outcome: SignInOutcome) => {
    linkSettled.current?.(outcome);
    linkSettled.current = null;
  };

  /** Follows the session once Firebase is loaded, whoever loaded it. */
  const watch = useCallback((kit: FirebaseKit) => {
    if (watching.current) return;
    watching.current = true;
    // Restoring the session reads IndexedDB, which can hang (a stuck delete,
    // some private modes). Show Sign in after a while rather than a blank
    // space for good; a session that turns up later still replaces it.
    const giveUp = setTimeout(() => setLoading(false), 5000);
    kit.onAuthStateChanged(kit.auth, (u) => {
      clearTimeout(giveUp);
      setUser(u);
      setLoading(false);
      rememberSignedIn(Boolean(u));
    });
  }, []);

  const prepare = useCallback(() => {
    if (!isAuthConfigured) return;
    loadFirebase().then(watch).catch(() => { /* retried on signIn */ });
  }, [watch]);

  const openLink = (kit: FirebaseKit, added: SignInProvider, error: AuthError): boolean => {
    const credential = credentialFromError(kit, added, error);
    if (!credential) return false;
    const pending: PendingLink = {
      email: (error.customData?.email as string | undefined) ?? null,
      added,
      existing: added === 'google' ? 'github' : 'google',
      credential,
    };
    stashLink(pending);
    setLinkError(null);
    setLink(pending);
    return true;
  };

  /** Signed in with the existing provider: attach the parked credential. */
  const finishLink = async (kit: FirebaseKit, signedIn: User, pending: PendingLink) => {
    const actual = signedIn.email ?? '';
    if (pending.email && actual.toLowerCase() !== pending.email.toLowerCase()) {
      // They picked a different account in the chooser. Linking would attach
      // this GitHub/Google login to someone else's account; sign back out.
      await kit.auth.signOut();
      stashLink(pending);
      setLink(pending);
      setLinkError({ kind: 'mismatch', actual });
      return;
    }
    try {
      await kit.linkWithCredential(signedIn, pending.credential);
    } catch (error) {
      // Already linked (a second tab got there first) is the outcome we wanted.
      if ((error as AuthError).code !== 'auth/provider-already-linked') {
        console.error('Error linking accounts:', error);
      }
    }
    clearLink();
    setLink(null);
    setLinkError(null);
    settleLink('signed-in');
  };

  // Page start: load Firebase only for a session that may need restoring, or
  // a redirect sign-in coming back — either a normal sign-in, the
  // existing-provider half of a link, or a sign-in that hit an existing
  // account and needs one. Anyone else is signed out, and knows it at once.
  useEffect(() => {
    if (!isAuthConfigured || started.current) return;
    started.current = true;
    const redirected = takeRedirectProvider();
    const stashed = takeLink();
    void (async () => {
      if (!redirected && !(await hasSessionHint())) {
        // Unless an intent to sign in got Firebase going meanwhile.
        if (!loadedFirebase()) setLoading(false);
        return;
      }
      let kit: FirebaseKit;
      try {
        kit = await loadFirebase();
      } catch {
        setLoading(false);
        return;
      }
      watch(kit);
      // Only after a redirect sign-in: asking costs the sign-in iframe.
      if (!redirected) return;
      const pending = restoreLink(kit, stashed);
      kit
        .getRedirectResult(kit.auth, kit.popupRedirectResolver)
        .then(async (result) => {
          if (!result || !pending) return;
          if (result.providerId === PROVIDER_IDS[pending.existing]) {
            await finishLink(kit, result.user, pending);
          }
        })
        .catch((error: AuthError) => {
          if (error.code === 'auth/account-exists-with-different-credential') {
            openLink(kit, redirected, error);
          } else {
            console.error('Error completing sign-in:', error);
          }
        });
    })();
    // Runs once on mount; the helpers it calls only touch refs and setters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signIn = async (provider: SignInProvider): Promise<SignInOutcome> => {
    let kit: FirebaseKit;
    try {
      kit = await loadFirebase();
    } catch (error) {
      console.error('Could not load sign-in:', error);
      return 'failed';
    }
    watch(kit);
    try {
      await kit.signInWithPopup(kit.auth, makeProvider(kit, provider), kit.popupRedirectResolver);
      return 'signed-in';
    } catch (error) {
      const code = (error as AuthError).code;
      if (code === 'auth/popup-blocked') {
        try {
          await redirectTo(kit, provider);
          return 'redirecting';
        } catch (redirectError) {
          console.error(`Error signing in with ${PROVIDER_NAMES[provider]} (redirect):`, redirectError);
          return 'failed';
        }
      }
      if (code === 'auth/account-exists-with-different-credential') {
        if (!openLink(kit, provider, error as AuthError)) return 'failed';
        return new Promise<SignInOutcome>((resolve) => { linkSettled.current = resolve; });
      }
      if (isQuietCancel(code)) return 'cancelled';
      console.error(`Error signing in with ${PROVIDER_NAMES[provider]}:`, error);
      return 'failed';
    }
  };

  const continueLinking = async () => {
    if (!link) return;
    setLinkBusy(true);
    setLinkError(null);
    let kit: FirebaseKit | null = null;
    try {
      kit = await loadFirebase();
      const result = await kit.signInWithPopup(
        kit.auth,
        makeProvider(kit, link.existing, link.email),
        kit.popupRedirectResolver,
      );
      await finishLink(kit, result.user, link);
    } catch (error) {
      const code = (error as AuthError).code;
      if (code === 'auth/popup-blocked' && kit) {
        // The parked link is already in sessionStorage; the mount effect
        // finishes it when the redirect comes back.
        await redirectTo(kit, link.existing, link.email);
        return;
      }
      if (!isQuietCancel(code)) {
        console.error('Error signing in to link accounts:', error);
        setLinkError({ kind: 'failed' });
      }
    } finally {
      setLinkBusy(false);
    }
  };

  const cancelLinking = () => {
    if (linkBusy) return;
    clearLink();
    setLink(null);
    setLinkError(null);
    settleLink('cancelled');
  };

  const signOut = async () => {
    // Not loaded means nobody is signed in.
    const kit = loadedFirebase();
    if (!kit) return;
    try {
      await kit.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ enabled: isAuthConfigured, user, loading, signIn, signOut, prepare }}>
      {children}
      {link && (
        <LinkAccountsDialog
          link={link}
          busy={linkBusy}
          error={linkError}
          onContinue={continueLinking}
          onCancel={cancelLinking}
        />
      )}
    </AuthContext.Provider>
  );
}

function LinkAccountsDialog({
  link,
  busy,
  error,
  onContinue,
  onCancel,
}: {
  link: PendingLink;
  busy: boolean;
  error: LinkError | null;
  onContinue: () => void;
  onCancel: () => void;
}) {
  const t = useTranslations('auth');
  const names = { existing: PROVIDER_NAMES[link.existing], added: PROVIDER_NAMES[link.added] };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onCancel]);

  return (
    // Above the download panel (z-60), which may be what started the sign-in.
    <div
      className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onCancel}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="link-accounts-title"
        className="w-full max-w-md rounded-2xl border border-border bg-background shadow-2xl p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="link-accounts-title" className="text-xl font-bold leading-tight mb-3">
          {t('link_title')}
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed mb-6">
          {link.email
            ? t('link_body', { email: link.email, ...names })
            : t('link_body_no_email', names)}
        </p>
        {error && (
          <p className="text-sm text-red-600 dark:text-red-400 mb-4" role="alert">
            {error.kind === 'mismatch'
              ? t('link_mismatch', { actual: error.actual, email: link.email ?? '', existing: names.existing })
              : t('link_failed')}
          </p>
        )}
        <button
          onClick={onContinue}
          disabled={busy}
          className="w-full px-4 py-3 rounded-lg font-medium bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-60 transition-colors"
        >
          {t('link_continue', names)}
        </button>
        <div className="mt-5 text-center">
          <button
            onClick={onCancel}
            disabled={busy}
            className="text-xs text-muted-foreground/80 hover:text-foreground underline underline-offset-2 disabled:opacity-60 transition-colors"
          >
            {t('link_cancel')}
          </button>
        </div>
      </div>
    </div>
  );
}
