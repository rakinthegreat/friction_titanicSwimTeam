'use client';

import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useUserStore } from '@/store/userStore';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Listen for auth state changes to keep Zustand in sync with Firebase
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // If Firebase has a user but Zustand doesn't, sync it
        const currentUid = useUserStore.getState().uid;
        if (currentUid !== user.uid) {
          useUserStore.setState({ uid: user.uid });
        }
      } else {
        // If Firebase has no user, ensure Zustand uid is null
        useUserStore.setState({ uid: null });
      }
    });

    return () => unsubscribe();
  }, []);

  return <>{children}</>;
}
