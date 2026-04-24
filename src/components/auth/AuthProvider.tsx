'use client';

import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useUserStore } from '@/store/userStore';

import { useRouter, usePathname } from 'next/navigation';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const uid = useUserStore((state) => state.uid);
  const _hasHydrated = useUserStore((state) => state._hasHydrated);

  useEffect(() => {
    // Listen for auth state changes to keep Zustand in sync with Firebase
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const currentUid = useUserStore.getState().uid;
        if (currentUid !== user.uid) {
          useUserStore.setState({ uid: user.uid });
        }
      } else {
        useUserStore.setState({ uid: null });
      }
    });

    return () => unsubscribe();
  }, []);

  // Client-side AuthGuard for Capacitor
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).Capacitor && _hasHydrated) {
      const isAuthRoute = pathname.startsWith('/login');
      const isProtectedRoute = pathname === '/' || pathname.startsWith('/profile');

      if (isProtectedRoute && !uid) {
        router.push('/login');
      } else if (isAuthRoute && uid) {
        router.push('/');
      }
    }
  }, [uid, pathname, router, _hasHydrated]);

  return <>{children}</>;
}
