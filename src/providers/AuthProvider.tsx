'use client';

import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  type User,
} from 'firebase/auth';
import { getFirebaseAuth, isAuthConfigured } from '@/lib/firebase';

interface AuthContextType {
  /** False when Firebase keys are missing from the build; nothing auth-related renders. */
  enabled: boolean;
  user: User | null;
  /** True until Firebase has restored (or ruled out) a persisted session. */
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  enabled: false,
  user: null,
  loading: true,
  signInWithGoogle: async () => {},
  signOut: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

/**
 * Sign-in state for the whole site. Unlike the api0 dashboard this never
 * withholds children while Firebase boots: mayorana is a public site and every
 * page must render (and be crawlable) whether or not anyone is signed in.
 * Components that need the user read `loading` and decide for themselves.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthConfigured) return;
    return onAuthStateChanged(getFirebaseAuth(), (u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(getFirebaseAuth(), new GoogleAuthProvider());
    } catch (error) {
      // Closing the popup rejects too; nothing to report for that.
      const code = (error as { code?: string }).code;
      if (code === 'auth/popup-blocked') {
        await signInWithRedirect(getFirebaseAuth(), new GoogleAuthProvider());
        return;
      }
      if (code !== 'auth/popup-closed-by-user' && code !== 'auth/cancelled-popup-request') {
        console.error('Error signing in with Google:', error);
      }
    }
  };

  const signOut = async () => {
    try {
      await getFirebaseAuth().signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ enabled: isAuthConfigured, user, loading, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
