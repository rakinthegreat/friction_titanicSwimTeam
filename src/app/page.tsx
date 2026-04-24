'use client';

import { useUserStore } from "@/store/userStore";
import Onboarding from "@/components/Onboarding";
import { WordLess } from "@/components/games/WordLess";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { WeatherWidget } from "@/components/dashboard/WeatherWidget";
import { useEffect, useState } from "react";
import { Gamepad2, User, ShieldCheck, ChevronRight, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ACTIVITIES } from "@/lib/activities";
import { VideoRecommendation } from "@/components/recreation/VideoRecommendation";

export default function Home() {
  const router = useRouter();
  const interests = useUserStore((state) => state.interests);
  const videoGenres = useUserStore((state) => state.videoGenres);
  const stats = useUserStore((state) => state.stats);
  const [activeActivity, setActiveActivity] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const updateStats = useUserStore((state) => state.updateStats);
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null);
  const [suggestions, setSuggestions] = useState<typeof ACTIVITIES>([]);
  const [suggestionLock, setSuggestionLock] = useState<Record<number, typeof ACTIVITIES>>({});
  const setNavigationSource = useUserStore((state) => state.setNavigationSource);
  
  const dailyCompleted = useUserStore(state => state.dailyCompletedActivities);
  const lastDate = useUserStore(state => state.lastCompletedDate);

  useEffect(() => {
    setMounted(true);
    setNavigationSource('home');
    const savedDuration = localStorage.getItem('selectedDuration');
    const savedSuggestions = localStorage.getItem('suggestions');
    const savedLock = localStorage.getItem('suggestionLock');
    if (savedDuration) setSelectedDuration(parseInt(savedDuration));
    if (savedSuggestions) setSuggestions(JSON.parse(savedSuggestions));
    if (savedLock) setSuggestionLock(JSON.parse(savedLock));

    const today = new Date().toISOString().split('T')[0];
    if (lastDate !== today) {
      setSuggestions([]);
      setSelectedDuration(null);
      setSuggestionLock({});
      localStorage.removeItem('selectedDuration');
      localStorage.removeItem('suggestions');
      localStorage.removeItem('suggestionLock');
    }
  }, [lastDate, setNavigationSource]);

  useEffect(() => {
    if (selectedDuration) localStorage.setItem('selectedDuration', selectedDuration.toString());
    if (suggestions.length > 0) localStorage.setItem('suggestions', JSON.stringify(suggestions));
    if (Object.keys(suggestionLock).length > 0) localStorage.setItem('suggestionLock', JSON.stringify(suggestionLock));
  }, [selectedDuration, suggestions, suggestionLock]);

  const anySuggestionCompleted = suggestions.length > 0 && suggestions.some(a => dailyCompleted.includes(a.id));
  const allSuggestionsCompleted = suggestions.length > 0 && suggestions.every(a => dailyCompleted.includes(a.id));

  useEffect(() => {
    setMounted(true);
  }, [videoGenres]);

  const handleActivityComplete = (xp: number) => {
    updateStats(5);
    setActiveActivity(null);
  };

  if (!mounted) return null;

  if (interests.length === 0 || !videoGenres || videoGenres.length === 0) {
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

        <WeatherWidget />

        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-accent rounded-[2.5rem] p-8 text-white space-y-6 shadow-neo-out ring-1 ring-white/10 col-span-1 md:col-span-2 overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
              <Gamepad2 size={120} />
            </div>
            <div className="space-y-2 relative z-10">
              <h2 className="text-3xl font-black">Ready to reclaim time?</h2>
              <p className="opacity-80 font-medium">Choose a wait duration to see activity options.</p>
            </div>
            <div className="flex flex-wrap gap-4 pt-2 relative z-10">
              {[1, 5, 10, 15, 20, 25].map((mins) => (
                <button
                  key={mins}
                  onClick={() => {
                    const pool = ACTIVITIES.filter(a => 
                      a.minTime <= mins && 
                      a.maxTime >= mins &&
                      (a.interests.some(i => interests.includes(i)) || interests.length === 0)
                    );
                    
                    const availablePool = pool.filter(a => !dailyCompleted.includes(a.id));
                    const finalPool = availablePool.length >= 3 ? availablePool : pool;

                    const shuffled = [...finalPool].sort(() => 0.5 - Math.random());
                    const newSuggestions = shuffled.slice(0, 3);
                    
                    setSuggestions(newSuggestions);
                    setSelectedDuration(mins);

                    setSuggestionLock(prev => ({ ...prev, [mins]: newSuggestions }));
                  }}
                  className={`rounded-2xl px-6 py-4 font-black transition-all ${
                    selectedDuration === mins 
                    ? "bg-white text-accent shadow-neo-in scale-95" 
                    : "bg-accent shadow-[6px_6px_12px_rgba(0,0,0,0.2),-6px_-6px_12px_rgba(255,255,255,0.1)] hover:scale-105"
                  }`}
                >
                  {mins}m
                </button>
              ))}
            </div>

            {selectedDuration && suggestions.length > 0 && (
              <div className="pt-6 space-y-4 animate-in slide-in-from-top-4 duration-500 relative z-10">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Curated for {selectedDuration}m</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {suggestions.map((activity) => (
                    <Link 
                      key={activity.id} 
                      href={`${activity.href}?time=${selectedDuration}`}
                      className="group"
                    >
                      <div className="h-full p-4 bg-white/10 rounded-3xl border border-white/5 hover:bg-white/20 transition-all hover:-translate-y-1 relative">
                        {dailyCompleted.includes(activity.id) && (
                          <div className="absolute top-3 right-3 bg-white text-accent rounded-full p-1 shadow-lg z-20">
                            <ShieldCheck className="w-4 h-4" />
                          </div>
                        )}
                        <div className={`w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-3 ${activity.color.replace('text-', 'text-white')}`}>
                          {(() => {
                            const original = ACTIVITIES.find(a => a.id === activity.id);
                            const Icon = original?.icon;
                            return Icon ? <Icon className="w-5 h-5 text-white" /> : null;
                          })()}
                        </div>
                        <h3 className="text-sm font-black leading-tight mb-1">{activity.title}</h3>
                        <p className="text-[10px] opacity-60 line-clamp-2 font-medium">{activity.description}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="bg-card rounded-[2.5rem] p-8 space-y-3 shadow-neo-out border border-white/5">
            <p className="text-foreground/40 font-bold uppercase tracking-widest text-xs">Time Reclaimed</p>
            <p className="text-5xl font-black text-accent">{stats.totalMinutesSaved}<span className="text-xl font-bold text-foreground/20 ml-2 italic">mins</span></p>
          </div>

          <div className="bg-card rounded-[2.5rem] p-8 space-y-3 shadow-neo-out border border-white/5">
            <p className="text-foreground/40 font-bold uppercase tracking-widest text-xs">Daily Streak</p>
            <p className="text-5xl font-black text-accent-secondary">{stats.streakDays}<span className="text-xl font-bold text-foreground/20 ml-2 italic">days</span></p>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/learn" className="group">
            <div className="bg-card rounded-[2.5rem] p-8 space-y-4 shadow-neo-out border border-transparent group-hover:border-accent/20 transition-all group-hover:-translate-y-1 h-full">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-black">Learning</h3>
                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center text-accent group-hover:scale-110 transition-transform">
                  <ArrowRight className="w-6 h-6" />
                </div>
              </div>
              <p className="text-foreground/80 font-medium">Interactive lessons</p>
            </div>
          </Link>
          <Link href="/activities" className="group">
            <div className="bg-card rounded-[2.5rem] p-8 space-y-4 shadow-neo-out border border-transparent group-hover:border-accent-secondary/20 transition-all group-hover:-translate-y-1 h-full">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-black">Activities</h3>
                <div className="w-12 h-12 bg-accent-secondary/10 rounded-full flex items-center justify-center text-accent-secondary group-hover:scale-110 transition-transform">
                  <Sparkles className="w-6 h-6" />
                </div>
              </div>
              <p className="text-foreground/80 font-medium">Real-world practices</p>
            </div>
          </Link>
          <Link href="/games" className="group">
            <div className="bg-card rounded-[2.5rem] p-8 space-y-4 shadow-neo-out border border-transparent group-hover:border-accent/20 transition-all group-hover:-translate-y-1 h-full">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-black">Games</h3>
                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center text-accent group-hover:scale-110 transition-transform">
                  <Gamepad2 className="w-6 h-6" />
                </div>
              </div>
              <p className="text-foreground/80 font-medium">Offline puzzles</p>
            </div>
          </Link>
        </section>

        <VideoRecommendation 
          interests={interests}
          videoGenres={videoGenres}
          dailyCompleted={dailyCompleted}
          updateStats={updateStats}
        />
      </div>

    </main>
  );
}
