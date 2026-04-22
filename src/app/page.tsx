'use client';

import { useUserStore } from "@/store/userStore";
import Onboarding from "@/components/Onboarding";
import { WordLess } from "@/components/games/WordLess";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useEffect, useState } from "react";

export default function Home() {
  const interests = useUserStore((state) => state.interests);
  const [mounted, setMounted] = useState(false);

  const updateStats = useUserStore((state) => state.updateStats);
  const [activeActivity, setActiveActivity] = useState<string | null>(null);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleActivityComplete = (xp: number) => {
    updateStats(5); // Assuming 5 mins for now
    setActiveActivity(null);
  };

  if (!mounted) return null;

  if (interests.length === 0) {
    return (
      <main className="min-h-screen flex flex-col">
        <Onboarding />
      </main>
    );
  }

  if (activeActivity === 'WordLess') {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
        <WordLess onComplete={handleActivityComplete} />
        <button 
          onClick={() => setActiveActivity(null)}
          className="mt-8 text-foreground/40 hover:text-foreground font-medium underline underline-offset-4"
        >
          Quit Session
        </button>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-8 max-w-4xl mx-auto space-y-12 animate-in fade-in duration-1000">
      <header className="flex justify-between items-start">
        <div className="space-y-2">
          <p className="text-accent font-medium uppercase tracking-widest text-sm">Dashboard</p>
          <h1 className="text-5xl font-extrabold tracking-tight">WaitLess</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
             {interests.map(i => (
               <span key={i} className="px-3 py-1 bg-accent/10 text-accent rounded-full text-xs font-bold capitalize">
                 {i}
               </span>
             ))}
          </div>
          <ThemeToggle />
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-accent rounded-[2.5rem] p-8 text-white space-y-6 shadow-neo-out ring-1 ring-white/10 col-span-1 md:col-span-2">
          <div className="space-y-2">
            <h2 className="text-3xl font-black">Ready to reclaim time?</h2>
            <p className="opacity-80 font-medium">Choose a wait duration to start a curated activity.</p>
          </div>
          <div className="flex flex-wrap gap-4 pt-2">
            {[1, 5, 10, 15, 20, 25].map((mins) => (
              <button 
                key={mins}
                onClick={() => setActiveActivity('WordLess')}
                className="bg-accent rounded-2xl px-6 py-4 font-black shadow-[6px_6px_12px_rgba(0,0,0,0.2),-6px_-6px_12px_rgba(255,255,255,0.1)] hover:scale-105 active:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.3),inset_-4px_-4px_8px_rgba(255,255,255,0.1)] active:scale-95 transition-all"
              >
                {mins}m
              </button>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-[2.5rem] p-8 space-y-3 shadow-neo-out border border-white/5">
          <p className="text-foreground/40 font-bold uppercase tracking-widest text-xs">Time Reclaimed</p>
          <p className="text-5xl font-black text-accent">{useUserStore.getState().stats.totalMinutesSaved}<span className="text-xl font-bold text-foreground/20 ml-2 italic">mins</span></p>
        </div>

        <div className="bg-card rounded-[2.5rem] p-8 space-y-3 shadow-neo-out border border-white/5">
          <p className="text-foreground/40 font-bold uppercase tracking-widest text-xs">Daily Streak</p>
          <p className="text-5xl font-black text-accent-secondary">{useUserStore.getState().stats.totalMinutesSaved > 0 ? 1 : 0}<span className="text-xl font-bold text-foreground/20 ml-2 italic">days</span></p>
        </div>
      </section>
    </main>
  );
}

