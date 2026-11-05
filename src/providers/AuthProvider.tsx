'use client';

import React, { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import type { AuthError, OAuthCredential, User } from 'firebase/auth';
import { useLocale, useTranslations } from 'next-intl';
import {
  hasSessionHint,
  isAuthConfigured,
  loadFirebase,
  loadedFirebase,
  rememberSignedIn,
  type FirebaseKit,
} from '@/lib/firebase';
import { GatewayError, gatewayFetch, startEmailSignIn, verifyEmailSignIn } from '@/lib/gateway';
import {
  clearEmailSession,
  EMAIL_SESSION_ENDED,
  readEmailSession,
  saveEmailSession,
  type EmailSession,
} from '@/lib/email-session';

/** The two sign-ins that go through Firebase. */
type FirebaseProvider = 'google' | 'github';

/**
 * 'email' is a code sent by email and checked by the api0 gateway, with no
 * Google service in the path: the way in from mainland China, where Firebase
 * cannot be reached (src/lib/email-session.ts).
 */
export type SignInProvider = FirebaseProvider | 'email';

/**
 * Who is signed in, whichever way. A Firebase User has these fields too; an
 * email sign-in has no name or photo, and its uid is derived from the email.
 */
export interface SiteUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

function emailUser(session: EmailSession): SiteUser {
  return { uid: `email:${session.email}`, email: session.email, displayName: null, photoURL: null };
}

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
  user: SiteUser | null;
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

const PROVIDER_NAMES: Record<FirebaseProvider, string> = { google: 'Google', github: 'GitHub' };
const PROVIDER_IDS: Record<FirebaseProvider, string> = { google: 'google.com', github: 'github.com' };

function makeProvider(kit: FirebaseKit, provider: FirebaseProvider, email?: string | null) {
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

function credentialFromError(kit: FirebaseKit, provider: FirebaseProvider, error: AuthError) {
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
  added: FirebaseProvider;
  /** The provider the account already has; they sign in with this one. */
  existing: FirebaseProvider;
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

function takeRedirectProvider(): FirebaseProvider | null {
  try {
    const value = sessionStorage.getItem(REDIRECT_KEY);
    sessionStorage.removeItem(REDIRECT_KEY);
    return value === 'google' || value === 'github' ? value : null;
  } catch {
    return null;
  }
}

async function redirectTo(kit: FirebaseKit, provider: FirebaseProvider, email?: string | null) {
  try { sessionStorage.setItem(REDIRECT_KEY, provider); } catch { /* ignore */ }
  await kit.signInWithRedirect(kit.auth, makeProvider(kit, provider, email), kit.popupRedirectResolver);
}

// ── The free allowance ────────────────────────────────────────────────────────
//
// Everyone signed in holds at least the free plan, whose licence the apps take.
// Signing in here creates no api0 account, so the gateway gives that plan when
// it is first asked for the person's subscription. Ask once per account per
// browser, right after sign-in, so it exists whether or not they ever open the
// pricing page. Remembered only once the gateway has answered, so a failed
// read is tried again on the next page.

const FREE_KEY = 'mayorana.freeAllowance';

function claimFreeAllowance(uid: string) {
  try {
    if (localStorage.getItem(FREE_KEY) === uid) return;
  } catch { /* private mode: ask every page, the gateway makes it once */ }
  gatewayFetch('/api/plans/subscription')
    .then(() => {
      try { localStorage.setItem(FREE_KEY, uid); } catch { /* ignore */ }
    })
    .catch(() => { /* tried again on the next page */ });
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
  const [user, setUser] = useState<SiteUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [emailOpen, setEmailOpen] = useState(false);
  // Settles the signIn('email') call that opened the email dialog.
  const emailSettled = useRef<((outcome: SignInOutcome) => void) | null>(null);
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
      if (u) {
        // A Google or GitHub sign-in replaces an email one.
        clearEmailSession();
        setUser(u);
      } else {
        // No Firebase session: an email sign-in may still be there.
        const session = readEmailSession();
        setUser(session ? emailUser(session) : null);
      }
      setLoading(false);
      rememberSignedIn(Boolean(u));
      if (u) claimFreeAllowance(u.uid);
    });
  }, []);

  const prepare = useCallback(() => {
    if (!isAuthConfigured) return;
    loadFirebase().then(watch).catch(() => { /* retried on signIn */ });
  }, [watch]);

  const openLink = (kit: FirebaseKit, added: FirebaseProvider, error: AuthError): boolean => {
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
    // Signed in by email code: no Firebase at all, unless a Google or GitHub
    // sign-in is coming back from a redirect and takes over.
    const session = readEmailSession();
    if (session && !redirected) {
      const signedIn = emailUser(session);
      setUser(signedIn);
      setLoading(false);
      claimFreeAllowance(signedIn.uid);
      return;
    }
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

  // The gateway refused the email token (src/lib/gateway.ts): signed out.
  useEffect(() => {
    const ended = () => setUser((current) => (current?.uid.startsWith('email:') ? null : current));
    window.addEventListener(EMAIL_SESSION_ENDED, ended);
    return () => window.removeEventListener(EMAIL_SESSION_ENDED, ended);
  }, []);

  const settleEmail = (outcome: SignInOutcome) => {
    emailSettled.current?.(outcome);
    emailSettled.current = null;
  };

  const emailSignedIn = async (session: EmailSession) => {
    saveEmailSession(session);
    // One sign-in at a time: end a Firebase one, which would otherwise come
    // back on the next page.
    const kit = loadedFirebase();
    if (kit?.auth.currentUser) {
      try {
        await kit.auth.signOut();
      } catch (error) {
        console.error('Error signing out of Firebase:', error);
      }
    }
    rememberSignedIn(false);
    const signedIn = emailUser(session);
    setUser(signedIn);
    setLoading(false);
    claimFreeAllowance(signedIn.uid);
    setEmailOpen(false);
    settleEmail('signed-in');
  };

  const cancelEmail = () => {
    setEmailOpen(false);
    settleEmail('cancelled');
  };

  const signIn = async (provider: SignInProvider): Promise<SignInOutcome> => {
    if (provider === 'email') {
      settleEmail('cancelled');
      setEmailOpen(true);
      return new Promise<SignInOutcome>((resolve) => { emailSettled.current = resolve; });
    }
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
    clearEmailSession();
    // Not loaded means nobody is signed in with Firebase.
    const kit = loadedFirebase();
    if (kit) {
      try {
        await kit.auth.signOut();
      } catch (error) {
        console.error('Error signing out:', error);
      }
    }
    setUser(null);
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
      {emailOpen && <EmailSignInDialog onSignedIn={emailSignedIn} onCancel={cancelEmail} />}
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

// ── Sign-in by email code ─────────────────────────────────────────────────────

type EmailProblem = 'invalid_email' | 'too_many' | 'send_failed' | 'wrong_code' | 'too_many_attempts' | 'failed';

/**
 * Two steps: the address, then the 6-digit code emailed to it. Opened by
 * signIn('email') from any sign-in button, and above the download panel like
 * the link dialog.
 */
function EmailSignInDialog({
  onSignedIn,
  onCancel,
}: {
  onSignedIn: (session: EmailSession) => void;
  onCancel: () => void;
}) {
  const t = useTranslations('auth');
  const locale = useLocale();
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<EmailProblem | null>(null);
  const [resent, setResent] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && !busy) onCancel(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onCancel, busy]);

  const send = async (again: boolean) => {
    setBusy(true);
    setProblem(null);
    setResent(false);
    try {
      await startEmailSignIn(email.trim(), locale);
      setStep('code');
      setCode('');
      setResent(again);
    } catch (error) {
      const status = error instanceof GatewayError ? error.status : 0;
      setProblem(status === 400 ? 'invalid_email' : status === 429 ? 'too_many' : 'send_failed');
    } finally {
      setBusy(false);
    }
  };

  const verify = async () => {
    setBusy(true);
    setProblem(null);
    setResent(false);
    try {
      onSignedIn(await verifyEmailSignIn(email.trim(), code.trim()));
    } catch (error) {
      const status = error instanceof GatewayError ? error.status : 0;
      if (status === 429) {
        // That code is spent: a new one is the only way on.
        setProblem('too_many_attempts');
        setCode('');
      } else {
        setProblem(status === 400 ? 'wrong_code' : 'failed');
      }
    } finally {
      setBusy(false);
    }
  };

  const inputClass =
    'w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50';
  const primaryClass =
    'w-full px-4 py-3 rounded-lg font-medium bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-60 transition-colors';
  const quietClass =
    'text-xs text-muted-foreground/80 hover:text-foreground underline underline-offset-2 disabled:opacity-60 transition-colors';

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={() => { if (!busy) onCancel(); }}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="email-sign-in-title"
        className="w-full max-w-md rounded-2xl border border-border bg-background shadow-2xl p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="email-sign-in-title" className="text-xl font-bold leading-tight mb-3">
          {step === 'email' ? t('email_title') : t('email_code_title')}
        </h2>

        {step === 'email' ? (
          <form
            onSubmit={(e) => { e.preventDefault(); if (email.trim()) void send(false); }}
            className="space-y-4"
          >
            <p className="text-sm text-muted-foreground leading-relaxed">{t('email_body')}</p>
            <label className="block">
              <span className="sr-only">{t('email_label')}</span>
              <input
                type="email"
                autoComplete="email"
                autoFocus
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('email_placeholder')}
                className={inputClass}
              />
            </label>
            {problem && <p className="text-sm text-red-600 dark:text-red-400" role="alert">{t(`email_problem_${problem}`)}</p>}
            <button type="submit" disabled={busy || !email.trim()} className={primaryClass}>
              {busy ? t('email_sending') : t('email_send')}
            </button>
          </form>
        ) : (
          <form
            onSubmit={(e) => { e.preventDefault(); if (code.trim().length === 6) void verify(); }}
            className="space-y-4"
          >
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t('email_code_body', { email: email.trim() })}
            </p>
            <label className="block">
              <span className="sr-only">{t('email_code_label')}</span>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                autoFocus
                pattern="[0-9]{6}"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="123456"
                className={`${inputClass} text-center text-2xl tracking-[0.4em] font-mono`}
              />
            </label>
            {problem && <p className="text-sm text-red-600 dark:text-red-400" role="alert">{t(`email_problem_${problem}`)}</p>}
            {resent && !problem && <p className="text-sm text-muted-foreground" role="status">{t('email_resent')}</p>}
            <button type="submit" disabled={busy || code.trim().length !== 6} className={primaryClass}>
              {busy ? t('email_checking') : t('email_verify')}
            </button>
            <p className="text-xs text-muted-foreground leading-relaxed">{t('email_spam_hint')}</p>
            <div className="flex items-center justify-between gap-4">
              <button type="button" onClick={() => void send(true)} disabled={busy} className={quietClass}>
                {t('email_resend')}
              </button>
              <button
                type="button"
                onClick={() => { setStep('email'); setProblem(null); setResent(false); }}
                disabled={busy}
                className={quietClass}
              >
                {t('email_change')}
              </button>
            </div>
          </form>
        )}

        <div className="mt-5 text-center">
          <button onClick={onCancel} disabled={busy} className={quietClass}>
            {t('link_cancel')}
          </button>
        </div>
      </div>
    </div>
  );
}
