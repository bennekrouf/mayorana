'use client';

// The founding-users offer, at the moment it matters: when someone clicks a
// download button.
//
// The builds are free. What we want back is the ability to talk to the people
// who use them — a download in the nginx log is an IP address, not a person.
// So a download by someone not signed in first opens a short explanation and
// a Google sign-in; a download by someone signed in is recorded against their
// account (which apps, which OS, when) and goes straight through.
//
// Signing in is optional. The link to skip it is there, and it is honest — no
// delay, no trick — but it is deliberately the quiet option: the one thing on
// the panel that looks like a button is the sign-in.

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useTranslations } from 'next-intl';
import { FiX } from 'react-icons/fi';
import { onAuthStateChanged } from 'firebase/auth';
import { useAuth } from '@/providers/AuthProvider';
import { getFirebaseAuth, isAuthConfigured } from '@/lib/firebase';
import { getUserPrefs, updateUserPrefs } from '@/lib/gateway';
import type { OS } from '@/data/tools';

export interface DownloadRequest {
  /** Tool id as in src/data/tools.ts, e.g. "ais-monitor". */
  app: string;
  /** Display name for the panel copy. */
  appName: string;
  os: OS;
  href: string;
}

interface DownloadGateContextType {
  requestDownload: (request: DownloadRequest) => void;
}

const DownloadGateContext = createContext<DownloadGateContextType>({
  requestDownload: (request) => {
    // No provider mounted (a page outside the locale layout): plain download.
    window.location.href = request.href;
  },
});

export function useDownloadGate() {
  return useContext(DownloadGateContext);
}

// A sign-in that fell back to a full-page redirect loses the React state, so
// the download that triggered it is parked here and resumed once the person
// is back and signed in.
const PENDING_KEY = 'mayorana.pendingDownload';

function stashPending(request: DownloadRequest) {
  try { sessionStorage.setItem(PENDING_KEY, JSON.stringify(request)); } catch { /* private mode */ }
}

function takePending(): DownloadRequest | null {
  try {
    const raw = sessionStorage.getItem(PENDING_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(PENDING_KEY);
    return JSON.parse(raw) as DownloadRequest;
  } catch {
    return null;
  }
}

/** Start the browser download. `src=member` marks it in the access log as a
 *  download we can follow up on; the stats script counts the split. */
function navigateToBuild(href: string, member: boolean) {
  const url = new URL(href);
  if (member) url.searchParams.set('src', 'member');
  window.location.href = url.toString();
}

/**
 * Record the download on the person's account. Best-effort: the download
 * must never wait on, or fail because of, the bookkeeping.
 */
async function recordDownload(request: DownloadRequest): Promise<void> {
  try {
    const prefs = await getUserPrefs();
    const downloads = (prefs.downloads as Record<string, unknown> | undefined) ?? {};
    const previous = (downloads[request.app] as { count?: number } | undefined) ?? {};
    await updateUserPrefs({
      founding_user: true,
      downloads: {
        ...downloads,
        [request.app]: {
          os: request.os,
          last_at: new Date().toISOString(),
          count: (previous.count ?? 0) + 1,
        },
      },
    });
  } catch (error) {
    console.warn('[DownloadGate] could not record download:', error);
  }
}

export function DownloadGateProvider({ children }: { children: ReactNode }) {
  const { enabled, user, signInWithGoogle } = useAuth();
  const [pending, setPending] = useState<DownloadRequest | null>(null);
  const [busy, setBusy] = useState(false);
  // Guards the resume-after-redirect path so it runs once, not on every
  // auth-state change.
  const resumed = useRef(false);
  // Mirror of `pending` readable from the auth subscription's closure: while
  // a panel is open, the popup path owns the download, not the subscription.
  const panelOpen = useRef(false);
  useEffect(() => {
    panelOpen.current = pending !== null;
  }, [pending]);

  const deliver = useCallback(async (request: DownloadRequest, member: boolean) => {
    setBusy(true);
    if (member) {
      // Bounded: the gateway may be slow or (before its deploy) absent, and
      // the person is waiting on a click.
      await Promise.race([recordDownload(request), new Promise((r) => setTimeout(r, 2500))]);
    }
    navigateToBuild(request.href, member);
    setPending(null);
    setBusy(false);
  }, []);

  const requestDownload = useCallback((request: DownloadRequest) => {
    if (!enabled) {
      navigateToBuild(request.href, false);
      return;
    }
    if (user) {
      void deliver(request, true);
      return;
    }
    setPending(request);
  }, [enabled, user, deliver]);

  // Back from a redirect sign-in: React state is gone, but the download that
  // started it is parked in sessionStorage. Firebase reports the restored
  // session through this subscription; finish the download from there.
  useEffect(() => {
    if (!isAuthConfigured) return;
    return onAuthStateChanged(getFirebaseAuth(), (signedIn) => {
      // Also fires when the popup sign-in completes; with the panel still
      // open that download is handleSignIn's to finish.
      if (!signedIn || resumed.current || panelOpen.current) return;
      resumed.current = true;
      const parked = takePending();
      if (parked) void deliver(parked, true);
    });
  }, [deliver]);

  const handleSignIn = async () => {
    if (!pending) return;
    // Parked in case the popup is blocked and sign-in falls back to a
    // redirect, which leaves this page before the next line runs.
    stashPending(pending);
    setBusy(true);
    await signInWithGoogle();
    const signedIn = getFirebaseAuth().currentUser;
    if (signedIn) {
      // Popup path: the session is in place. The parked copy is consumed
      // here so the subscription above does not deliver it a second time.
      takePending();
      resumed.current = true;
      await deliver(pending, true);
    } else {
      // Popup closed without signing in: back to the panel.
      takePending();
      setBusy(false);
    }
  };

  const handleSkip = () => {
    if (!pending) return;
    void deliver(pending, false);
  };

  return (
    <DownloadGateContext.Provider value={{ requestDownload }}>
      {children}
      {pending && (
        <DownloadGatePanel
          request={pending}
          busy={busy}
          onSignIn={handleSignIn}
          onSkip={handleSkip}
          onClose={() => { if (!busy) setPending(null); }}
        />
      )}
    </DownloadGateContext.Provider>
  );
}

function DownloadGatePanel({
  request,
  busy,
  onSignIn,
  onSkip,
  onClose,
}: {
  request: DownloadRequest;
  busy: boolean;
  onSignIn: () => void;
  onSkip: () => void;
  onClose: () => void;
}) {
  const t = useTranslations('download_gate');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="download-gate-title"
        className="w-full max-w-md rounded-2xl border border-border bg-background shadow-2xl p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 mb-3">
          <h2 id="download-gate-title" className="text-xl font-bold leading-tight">
            {t('title')}
          </h2>
          <button
            onClick={onClose}
            disabled={busy}
            className="shrink-0 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            aria-label={t('cancel')}
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed mb-6">
          {t('body', { app: request.appName })}
        </p>

        <button
          onClick={onSignIn}
          disabled={busy}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg font-medium bg-primary text-white hover:bg-primary/90 disabled:opacity-60 transition-colors"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden>
            <path fill="#EA4335" d="M12 10.2v3.9h5.4c-.2 1.3-1.6 3.8-5.4 3.8-3.3 0-5.9-2.7-5.9-6s2.6-6 5.9-6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.3 14.6 2.4 12 2.4 6.7 2.4 2.4 6.7 2.4 12s4.3 9.6 9.6 9.6c5.5 0 9.2-3.9 9.2-9.4 0-.6-.1-1.1-.2-1.6H12z" />
          </svg>
          {busy ? t('downloading') : t('signin')}
        </button>

        <div className="mt-5 text-center">
          <button
            onClick={onSkip}
            disabled={busy}
            className="text-xs text-muted-foreground/80 hover:text-foreground underline underline-offset-2 disabled:opacity-60 transition-colors"
          >
            {t('skip')}
          </button>
        </div>
      </div>
    </div>
  );
}
