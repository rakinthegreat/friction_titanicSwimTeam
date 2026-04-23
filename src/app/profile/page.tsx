'use client';

import { useUserStore } from "@/store/userStore";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { LogOut, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Profile() {
  const stats = useUserStore((state) => state.stats);
  const interests = useUserStore((state) => state.interests);
  const { logout, isLoading } = useFirebaseAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <main className="min-h-screen p-8 max-w-4xl mx-auto space-y-12 animate-in fade-in duration-1000">
      <header className="flex justify-between items-start">
        <div className="space-y-2">
          <Link href="/" className="inline-flex items-center text-accent hover:text-accent/80 font-medium uppercase tracking-widest text-sm transition-colors mb-2">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Dashboard
          </Link>
          <h1 className="text-5xl font-extrabold tracking-tight">Profile</h1>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-card rounded-[2.5rem] p-8 space-y-3 shadow-neo-out border border-white/5">
          <p className="text-foreground/40 font-bold uppercase tracking-widest text-xs">Time Reclaimed</p>
          <p className="text-5xl font-black text-accent">{stats.totalMinutesSaved}<span className="text-xl font-bold text-foreground/20 ml-2 italic">mins</span></p>
        </div>

        <div className="bg-card rounded-[2.5rem] p-8 space-y-3 shadow-neo-out border border-white/5">
          <p className="text-foreground/40 font-bold uppercase tracking-widest text-xs">Activities Completed</p>
          <p className="text-5xl font-black text-accent-secondary">{stats.activitiesCompleted}</p>
        </div>
        
        <div className="bg-card rounded-[2.5rem] p-8 space-y-3 shadow-neo-out border border-white/5 md:col-span-2">
          <p className="text-foreground/40 font-bold uppercase tracking-widest text-xs mb-4">Interests</p>
          <div className="flex flex-wrap gap-2">
            {interests.length > 0 ? interests.map(i => (
              <span key={i} className="px-4 py-2 bg-accent/10 text-accent rounded-full text-sm font-bold capitalize">
                {i}
              </span>
            )) : <p className="text-foreground/40 text-sm">No interests added yet.</p>}
          </div>
        </div>
      </section>

      <section className="flex justify-center pt-8">
        <button
          onClick={logout}
          disabled={isLoading}
          className="flex items-center gap-2 px-8 py-4 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-full font-bold transition-colors"
        >
          <LogOut className="w-5 h-5" />
          {isLoading ? 'Logging out...' : 'Log Out'}
        </button>
      </section>
    </main>
  );
}
