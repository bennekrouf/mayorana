'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { FiLogIn, FiLogOut, FiUser } from 'react-icons/fi';
import { FaGithub } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import { useTranslations } from 'next-intl';
import { useAuth, type SignInProvider } from '@/providers/AuthProvider';

const PROVIDERS: { id: SignInProvider; icon: React.ReactNode; label: 'sign_in_google' | 'sign_in_github' }[] = [
  { id: 'google', icon: <FcGoogle className="h-4 w-4 mr-2 flex-shrink-0" />, label: 'sign_in_google' },
  { id: 'github', icon: <FaGithub className="h-4 w-4 mr-2 flex-shrink-0" />, label: 'sign_in_github' },
];

/**
 * Sign-in button with a Google/GitHub menu, or the signed-in user's avatar
 * with a sign-out menu.
 * `compact` is the mobile-menu variant: a full-width row instead of an icon.
 */
const AuthButton: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { enabled, user, loading, signIn, signOut } = useAuth();
  const t = useTranslations('auth');
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  if (!enabled) return null;

  // Reserve the space while Firebase restores the session so the navbar does
  // not jump once it resolves.
  if (loading) {
    return <div className={compact ? 'h-9' : 'h-8 w-8'} aria-hidden />;
  }

  if (!user) {
    if (compact) {
      return (
        <div className="w-full flex flex-col gap-2">
          {PROVIDERS.map((p) => (
            <button
              key={p.id}
              onClick={() => signIn(p.id)}
              className="w-full flex items-center px-4 py-2 text-sm rounded bg-secondary hover:bg-secondary/80 transition-colors"
            >
              {p.icon}
              {t(p.label)}
            </button>
          ))}
        </div>
      );
    }

    return (
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          <FiLogIn className="h-4 w-4 mr-2 flex-shrink-0" />
          {t('sign_in')}
        </button>
        {open && (
          <div className="absolute right-0 mt-2 w-56 rounded-lg border border-border bg-background shadow-lg py-1 z-50">
            {PROVIDERS.map((p) => (
              <button
                key={p.id}
                onClick={() => { setOpen(false); signIn(p.id); }}
                className="w-full flex items-center px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                {p.icon}
                {t(p.label)}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  const avatar = user.photoURL ? (
    <Image
      src={user.photoURL}
      alt=""
      width={32}
      height={32}
      className="h-8 w-8 rounded-full"
      referrerPolicy="no-referrer"
    />
  ) : (
    <span className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
      <FiUser className="h-4 w-4" />
    </span>
  );

  if (compact) {
    return (
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-3 min-w-0">
          {avatar}
          <span className="text-sm truncate">{user.displayName || user.email}</span>
        </div>
        <button
          onClick={signOut}
          className="flex items-center px-3 py-2 text-sm rounded bg-secondary hover:bg-secondary/80 transition-colors"
        >
          <FiLogOut className="h-4 w-4 mr-2" />
          {t('sign_out')}
        </button>
      </div>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="rounded-full hover:ring-2 hover:ring-border transition-shadow"
        aria-label={t('account_menu')}
        aria-expanded={open}
      >
        {avatar}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-56 rounded-lg border border-border bg-background shadow-lg py-1 z-50">
          <div className="px-4 py-2 border-b border-border">
            <p className="text-sm font-medium truncate">{user.displayName || t('signed_in')}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
          <button
            onClick={() => { setOpen(false); signOut(); }}
            className="w-full flex items-center px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <FiLogOut className="h-4 w-4 mr-2" />
            {t('sign_out')}
          </button>
        </div>
      )}
    </div>
  );
};

export default AuthButton;
