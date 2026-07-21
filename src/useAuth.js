import { useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider, firebaseConfigured } from './firebase';

// Wraps Firebase Auth. Exposes the current user (or null), a loading flag while
// the initial auth state resolves, and sign-in / sign-out actions.
export function useAuth() {
  const [user, setUser] = useState(null);
  // If Firebase isn't configured yet there's nothing to wait for.
  const [authLoading, setAuthLoading] = useState(firebaseConfigured);

  useEffect(() => {
    if (!firebaseConfigured) return undefined;
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });
    return unsub;
  }, []);

  const signInWithGoogle = useCallback(async () => {
    if (!firebaseConfigured) return;
    try {
      // Popup is the simplest flow for a web app on a custom domain. If popups
      // prove flaky on mobile, swap for signInWithRedirect.
      await signInWithPopup(auth, googleProvider);
    } catch (e) {
      // A user closing the popup throws; that's not an error worth surfacing.
      if (e?.code !== 'auth/popup-closed-by-user' && e?.code !== 'auth/cancelled-popup-request') {
        console.error('Google sign-in failed', e);
      }
    }
  }, []);

  const signOutUser = useCallback(async () => {
    if (!firebaseConfigured) return;
    try {
      await signOut(auth);
    } catch (e) {
      console.error('Sign-out failed', e);
    }
  }, []);

  return { user, authLoading, signInWithGoogle, signOutUser };
}
