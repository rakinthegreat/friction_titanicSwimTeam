import { useState } from 'react';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { app } from '@/lib/firebase';
import { useUserStore } from '@/store/userStore';

export function useFirebaseAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signInWithGoogle = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const auth = getAuth(app);
      const provider = new GoogleAuthProvider();

      // 1. Client Google Popup
      const result = await signInWithPopup(auth, provider);

      // 2. ID Token
      const idToken = await result.user.getIdToken();

      // 3. POST -> /api/auth/session
      const response = await fetch('/api/auth/session', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });

      if (!response.ok) {
        console.log(response)
        throw new Error('Failed to establish secure server session');
      }

      // Update Zustand store
      useUserStore.setState({ uid: result.user.uid });

      return result.user;
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(err.message || 'Authentication failed');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      const auth = getAuth(app);
      await signOut(auth);
      await fetch('/api/auth/logout', { method: 'POST' });
      useUserStore.setState({ uid: null });
      window.location.href = '/';
    } catch (err: any) {
      console.error('Logout error:', err);
      setError(err.message || 'Logout failed');
    } finally {
      setIsLoading(false);
    }
  };

  return { signInWithGoogle, logout, isLoading, error };
}
