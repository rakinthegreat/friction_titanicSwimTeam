import { useState } from 'react';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, signInWithCredential } from 'firebase/auth';
import { app } from '@/lib/firebase';
import { useUserStore } from '@/store/userStore';
import { Capacitor } from '@capacitor/core';
import { SocialLogin } from '@capgo/capacitor-social-login';

export function useFirebaseAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signInWithGoogle = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const auth = getAuth(app);
      let user;

      if (Capacitor.isNativePlatform()) {
        // Native Google Sign-In
        await SocialLogin.initialize({
          google: {
            webClientId: process.env.NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID || '',
            mode: 'online',
          },
        });

        const result = await SocialLogin.login({
          provider: 'google',
          options: {},
        });

        if (result.result.responseType === 'online') {
          const { idToken } = result.result;
          if (!idToken) throw new Error('No ID token returned from Google');
          
          const credential = GoogleAuthProvider.credential(idToken);
          const userCredential = await signInWithCredential(auth, credential);
          user = userCredential.user;
        } else {
          throw new Error('Native login failed or cancelled');
        }
      } else {
        // Web Google Sign-In
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        user = result.user;
      }

      if (!user) throw new Error('Authentication failed');

      // 2. ID Token for server session
      const idToken = await user.getIdToken();

      // 3. POST -> /api/auth/session
      const response = await fetch('/api/auth/session', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to establish secure server session');
      }

      // Update Zustand store
      useUserStore.setState({ uid: user.uid });

      return user;
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
