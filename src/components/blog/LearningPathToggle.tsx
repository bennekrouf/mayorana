'use client';

// The switch between the two listing orders: newest first, which everyone
// gets, and the learning path (content/learning-path.json), which is for
// signed-in readers. Choosing the path is remembered in the user's prefs
// document, so a follower lands on it from any browser.
//
// Signing in happens on the click, like the download gate: the choice is
// parked in sessionStorage first in case the popup is blocked and sign-in
// falls back to a redirect, which leaves this page before the click finishes.

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { FaGithub } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import { useAuth, type SignInProvider } from '@/providers/AuthProvider';
import { getFirebaseAuth } from '@/lib/firebase';
import { getUserPrefs, updateUserPrefs } from '@/lib/gateway';

const PENDING_KEY = 'mayorana.followPathPending';

function stashPending(): void {
  try { sessionStorage.setItem(PENDING_KEY, '1'); } catch { /* the redirect path just won't resume */ }
}

function takePending(): boolean {
  try {
    const parked = sessionStorage.getItem(PENDING_KEY) === '1';
    sessionStorage.removeItem(PENDING_KEY);
    return parked;
  } catch {
    return false;
  }
}

interface LearningPathToggleProps {
  /** Whether the listing is currently in path order. */
  active: boolean;
}

const LearningPathToggle: React.FC<LearningPathToggleProps> = ({ active }) => {
  const t = useTranslations('blog');
  const locale = useLocale();
  const router = useRouter();
  const { enabled, user, loading, signIn } = useAuth();
  const tAuth = useTranslations('auth');
  const [busy, setBusy] = useState(false);
  // Signed out, the first click offers the providers instead of picking one.
  const [choosing, setChoosing] = useState(false);
  const checkedPrefsFor = useRef<string | null>(null);

  const blogUrl = `/${locale}/blog`;
  const pathUrl = `${blogUrl}?view=path`;

  // The pref is written before navigating: the listing reads it on arrival,
  // and a stale "true" would send a reader who just left the path back onto it.
  const follow = useCallback(async (on: boolean) => {
    try {
      await updateUserPrefs({ learningPath: on });
    } catch (error) {
      console.warn('[LearningPath] could not save the choice:', error);
    }
    router.push(on ? pathUrl : blogUrl);
  }, [router, pathUrl, blogUrl]);

  useEffect(() => {
    if (!user) return;
    // Back from a redirect sign-in that a click on "follow" started.
    if (takePending()) {
      void follow(true);
      return;
    }
    // A reader who chose the path lands on it. Checked once per user, so
    // leaving the path within the session is not undone.
    if (active || checkedPrefsFor.current === user.uid) return;
    checkedPrefsFor.current = user.uid;
    let cancelled = false;
    getUserPrefs()
      .then((prefs) => {
        if (!cancelled && prefs.learningPath === true) router.replace(pathUrl);
      })
      .catch(() => { /* default order it is */ });
    return () => { cancelled = true; };
  }, [user, active, follow, router, pathUrl]);

  // The path view is for signed-in readers: anyone else is sent to the
  // default order, including someone who signs out while on it.
  useEffect(() => {
    if (active && (!enabled || (!loading && !user))) router.replace(blogUrl);
  }, [active, enabled, loading, user, router, blogUrl]);

  if (!enabled) return null;

  const onClick = async () => {
    if (!user) {
      setChoosing((c) => !c);
      return;
    }
    setBusy(true);
    await follow(!active);
    setBusy(false);
  };

  const onSignIn = async (provider: SignInProvider) => {
    setBusy(true);
    stashPending();
    await signIn(provider);
    // Popup path: finish here, so the effect above does not do it twice.
    // If the popup was closed without signing in, just drop the choice.
    const parked = takePending();
    if (parked && getFirebaseAuth().currentUser) await follow(true);
    setChoosing(false);
    setBusy(false);
  };

  return (
    <div className="mb-8 flex flex-col sm:flex-row sm:items-center gap-3">
      <button
        type="button"
        onClick={onClick}
        disabled={busy || loading}
        aria-pressed={active}
        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors disabled:opacity-60 ${
          active
            ? 'border border-primary text-primary hover:bg-primary/10'
            : 'bg-primary text-white hover:bg-primary/90'
        }`}
      >
        {active ? t('leave_path') : `🧭 ${t('follow_path')}`}
      </button>
      {!active && !user && choosing && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onSignIn('google')}
            disabled={busy}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm border border-border hover:bg-secondary disabled:opacity-60 transition-colors"
          >
            <FcGoogle className="h-4 w-4" aria-hidden />
            {tAuth('sign_in_google')}
          </button>
          <button
            type="button"
            onClick={() => onSignIn('github')}
            disabled={busy}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm border border-border hover:bg-secondary disabled:opacity-60 transition-colors"
          >
            <FaGithub className="h-4 w-4" aria-hidden />
            {tAuth('sign_in_github')}
          </button>
        </div>
      )}
      {!active && !user && !choosing && (
        <span className="text-sm text-muted-foreground">{t('follow_path_hint')}</span>
      )}
    </div>
  );
};

export default LearningPathToggle;
