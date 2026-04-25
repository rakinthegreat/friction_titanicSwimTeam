'use client';

import { useUserStore } from "@/store/userStore";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { X, Hourglass } from "lucide-react";

export function SessionTimer() {
  const sessionEndTime = useUserStore((state) => state.sessionEndTime);
  const endSession = useUserStore((state) => state.endSession);
  const _hasHydrated = useUserStore((state) => state._hasHydrated);
  const pathname = usePathname();
  const router = useRouter();

  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    if (!sessionEndTime) return;

    const interval = setInterval(() => {
      const remaining = Math.max(0, sessionEndTime - Date.now());
      setTimeLeft(remaining);
    }, 1000);

    // Initial calculation
    setTimeLeft(Math.max(0, sessionEndTime - Date.now()));

    return () => clearInterval(interval);
  }, [sessionEndTime]);

  if (!_hasHydrated || !sessionEndTime || pathname === '/') return null;

  const minutes = Math.floor(timeLeft / 60000);
  const seconds = Math.floor((timeLeft % 60000) / 1000);

  const isTimeUp = timeLeft === 0;

  return (
    <>
      <div className="h-16 w-full shrink-0" />
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-10 duration-500">
        <div className={`flex items-center gap-4 px-5 py-2.5 rounded-full shadow-neo-out border transition-colors ${isTimeUp
          ? 'bg-red-500/10 border-red-500/20 text-red-500'
          : 'bg-card border-white/5 text-foreground'
          }`}>
          <div className="flex items-center gap-2 font-mono font-black text-lg">
            <Hourglass className={`w-5 h-5 ${!isTimeUp ? 'animate-pulse text-accent' : ''}`} />
            <span>
              {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
            </span>
          </div>

          <div className="w-px h-6 bg-foreground/10 mx-1" />

          <button
            onClick={() => {
              endSession();
              router.push('/');
            }}
            className="p-1.5 rounded-full hover:bg-foreground/10 transition-colors flex items-center justify-center text-foreground/50 hover:text-foreground"
            aria-label="End Session"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  );
}
