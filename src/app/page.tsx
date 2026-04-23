'use client';

import { useUserStore } from "@/store/userStore";
import Onboarding from "@/components/Onboarding";
import { WordLess } from "@/components/games/WordLess";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useEffect, useState } from "react";
import { Gamepad2, User, ShieldCheck, ChevronRight, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const interests = useUserStore((state) => state.interests);
  const stats = useUserStore((state) => state.stats);
  const [activeActivity, setActiveActivity] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const updateStats = useUserStore((state) => state.updateStats);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleActivityComplete = (xp: number) => {
    // XP could be used for leveling, but for now we update time reclaimed
    updateStats(5); // Defaulting to 5 minutes for WordLess session
    setActiveActivity(null);
  };

  if (!mounted) return null;

  if (interests.length === 0) {
    return <Onboarding />;
  }

  if (activeActivity === 'WordLess') {
    return (
      <div className="min-h-screen bg-background">
        <header className="p-6 flex items-center border-b border-foreground/5">
          <button 
            onClick={() => setActiveActivity(null)}
            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors mr-4"
          >
            <ChevronRight className="w-6 h-6 rotate-180" />
          </button>
          <h1 className="text-xl font-bold">WordLess</h1>
        </header>
        <WordLess onComplete={handleActivityComplete} />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground pb-32 animate-in fade-in duration-1000">
      <div className="max-w-4xl mx-auto p-8 space-y-12">
        <header className="flex justify-between items-start">
          <div className="space-y-2">
            <p className="text-accent font-medium uppercase tracking-widest text-sm">Dashboard</p>
            <h1 className="text-5xl font-extrabold tracking-tight">WaitLess</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex gap-2 mr-2">
              {interests.map(i => (
                <span key={i} className="px-3 py-1 bg-accent/10 text-accent rounded-full text-xs font-bold capitalize">
                  {i}
                </span>
              ))}
            </div>
            <Link 
              href="/permissions"
              className="p-3 rounded-2xl bg-card shadow-neo-out hover:scale-105 active:shadow-neo-in transition-all text-accent"
              aria-label="Manage Permissions"
            >
              <ShieldCheck size={20} />
            </Link>
            <Link 
              href="/profile"
              className="p-3 rounded-2xl bg-card shadow-neo-out hover:scale-105 active:shadow-neo-in transition-all text-accent"
              aria-label="Profile"
            >
              <User size={20} />
            </Link>
            <ThemeToggle />
          </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-accent rounded-[2.5rem] p-8 text-white space-y-6 shadow-neo-out ring-1 ring-white/10 col-span-1 md:col-span-2 overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
              <Gamepad2 size={120} />
            </div>
            <div className="space-y-2 relative z-10">
              <h2 className="text-3xl font-black">Ready to reclaim time?</h2>
              <p className="opacity-80 font-medium">Choose a wait duration to start a curated activity.</p>
            </div>
            <div className="flex flex-wrap gap-4 pt-2 relative z-10">
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
            <p className="text-5xl font-black text-accent">{stats.totalMinutesSaved}<span className="text-xl font-bold text-foreground/20 ml-2 italic">mins</span></p>
          </div>

          <div className="bg-card rounded-[2.5rem] p-8 space-y-3 shadow-neo-out border border-white/5">
            <p className="text-foreground/40 font-bold uppercase tracking-widest text-xs">Daily Streak</p>
            <p className="text-5xl font-black text-accent-secondary">{stats.totalMinutesSaved > 0 ? 1 : 0}<span className="text-xl font-bold text-foreground/20 ml-2 italic">days</span></p>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/learn" className="group">
            <div className="bg-card rounded-[2.5rem] p-8 space-y-4 shadow-neo-out border border-transparent group-hover:border-accent/20 transition-all group-hover:-translate-y-1">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-black">Learning</h3>
                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center text-accent group-hover:scale-110 transition-transform">
                  <ArrowRight className="w-6 h-6" />
                </div>
              </div>
              <p className="text-foreground/80 font-medium">Short Interactive lessons</p>
            </div>
          </Link>
          <Link href="/games" className="group">
            <div className="bg-card rounded-[2.5rem] p-8 space-y-4 shadow-neo-out border border-transparent group-hover:border-accent-secondary/20 transition-all group-hover:-translate-y-1">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-black">Mini-Games</h3>
                <div className="w-12 h-12 bg-accent-secondary/10 rounded-full flex items-center justify-center text-accent-secondary group-hover:scale-110 transition-transform">
                  <Gamepad2 className="w-6 h-6" />
                </div>
              </div>
              <p className="text-foreground/80 font-medium">Play offline puzzles</p>
            </div>
          </Link>
        </section>
      </div>
    </main>
  );
}
