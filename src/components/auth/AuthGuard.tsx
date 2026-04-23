'use client';

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useUserStore } from "@/store/userStore";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const uid = useUserStore((state) => state.uid);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      const isAuthRoute = pathname.startsWith('/login');
      
      if (!uid && !isAuthRoute) {
        router.replace('/login');
      } else if (uid && isAuthRoute) {
        router.replace('/');
      }
    }
  }, [mounted, uid, pathname, router]);

  if (!mounted) return null;

  const isAuthRoute = pathname.startsWith('/login');

  // Prevent rendering protected content if not logged in
  if (!uid && !isAuthRoute) {
    return null;
  }

  // Prevent rendering login page if already logged in
  if (uid && isAuthRoute) {
    return null;
  }

  return <>{children}</>;
}
