'use client';

import { useUserStore } from "@/store/userStore";
import Onboarding from "@/components/Onboarding";
import { WordLess } from "@/components/games/WordLess";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { WeatherWidget } from "@/components/dashboard/WeatherWidget";
import { useEffect, useState } from "react";
import { Gamepad2, User, ShieldCheck, ChevronRight, ArrowRight, Sparkles, Hourglass, PlayCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ACTIVITIES } from "@/lib/activities";
import { VideoRecommendation } from "@/components/recreation/VideoRecommendation";
import { INITIAL_QUOTES } from "@/lib/quotes";
import { generateQuotes } from "@/app/quotes/actions";

export default function Home() {
  const router = useRouter();
  const interests = useUserStore((state) => state.interests);
  const videoGenres = useUserStore((state) => state.videoGenres);
  const stats = useUserStore((state) => state.stats);
  const [activeActivity, setActiveActivity] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const preferences = useUserStore((state) => state.preferences);
  const updateStats = useUserStore((state) => state.updateStats);
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null);
  const [suggestions, setSuggestions] = useState<typeof ACTIVITIES>([]);
  const setNavigationSource = useUserStore((state) => state.setNavigationSource);

  const preferredLanguages = useUserStore((state) => state.preferredLanguages);
  const dailyCompleted = useUserStore(state => state.dailyCompletedActivities);
  const _hasHydrated = useUserStore(state => state._hasHydrated);
  const lastDate = useUserStore(state => state.lastCompletedDate);

  const quotePool = useUserStore(state => state.quotePool);
  const currentQuote = useUserStore(state => state.currentQuote);
  const setQuotePool = useUserStore(state => state.setQuotePool);
  const refreshQuote = useUserStore(state => state.refreshQuote);

  useEffect(() => {
    if (!_hasHydrated) return;

    setMounted(true);
    setNavigationSource('home');

    const today = new Date().toISOString().split('T')[0];
    console.log('Hydration check:', { _hasHydrated, lastDate, today });

    // TEMPORARILY DISABLED TO DEBUG:
    /*
    if (lastDate && lastDate !== today) {
      console.log('CLEARING DATA for new day');
      setSuggestions([]);
      setSelectedDuration(null);
      setSuggestionLock({});
      localStorage.removeItem('selectedDuration');
      localStorage.removeItem('suggestions');
      localStorage.removeItem('suggestionLock');
    }
    */
  }, [lastDate, setNavigationSource, _hasHydrated]);

  useEffect(() => {
    if (!_hasHydrated) return;

    const initQuotes = async () => {
      // 1. Initialize pool if empty
      if (quotePool.length === 0) {
        setQuotePool(INITIAL_QUOTES);
      }

      // 2. Always refresh on mount to cycle
      refreshQuote();

      // 3. If pool is getting low (e.g. < 5), trigger AI generation in background
      if (quotePool.length < 5) {
        const result = await generateQuotes();
        if (result.success && result.quotes) {
          // Use functional update to avoid stale closure issues with quotePool
          useUserStore.setState((state) => ({
            quotePool: [...state.quotePool, ...result.quotes]
          }));
        }
      }
    };

    initQuotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [_hasHydrated]);

  // This second effect handles replenishment if the pool runs dry while the app is open
  useEffect(() => {
    if (!_hasHydrated || quotePool.length >= 5) return;

    const replenish = async () => {
      const result = await generateQuotes();
      if (result.success && result.quotes) {
        setQuotePool([...quotePool, ...result.quotes]);
      }
    };
    replenish();
  }, [_hasHydrated, quotePool.length, setQuotePool]);

  const anySuggestionCompleted = suggestions.length > 0 && suggestions.some(a => dailyCompleted.includes(a.id));
  const allSuggestionsCompleted = suggestions.length > 0 && suggestions.every(a => dailyCompleted.includes(a.id));

  useEffect(() => {
    setMounted(true);
  }, [videoGenres]);

  const handleActivityComplete = (xp: number) => {
    updateStats(5);
    setActiveActivity(null);
  };

  if (!mounted || !_hasHydrated) return null;

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
    <main className="min-h-screen bg-background text-foreground pb-8 animate-in fade-in duration-1000">
      <div className="max-w-4xl mx-auto p-8 space-y-6">
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

        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-accent-secondary rounded-[2.5rem] p-6 text-white space-y-6 shadow-[8px_8px_20px_rgba(0,0,0,0.15),-4px_-4px_15px_rgba(0,0,0,0.05)] ring-1 ring-black/5 col-span-1 md:col-span-2 overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
              <Hourglass size={120} />
            </div>

            {!selectedDuration ? (
              <div className="animate-in fade-in zoom-in-95 duration-500">
                <div className="space-y-1 relative z-10 mb-6">
                  <h2 className="text-2xl font-black">How long do you expect to wait?</h2>
                  <p className="opacity-80 font-medium text-sm">Choose a duration to see tailored options.</p>
                </div>
                {/* Portrait: 3+2 split. Landscape: flex row of 5 via display:contents */}
                <div className="space-y-3 relative z-10 [@media(orientation:landscape)]:flex [@media(orientation:landscape)]:gap-3 [@media(orientation:landscape)]:space-y-0">
                  <div className="grid grid-cols-3 gap-3 [@media(orientation:landscape)]:contents">
                    {[5, 10, 15].map((mins) => (
                      <button
                        key={mins}
                        onClick={() => {
                          const pool = ACTIVITIES.filter(a => a.minTime <= mins && a.maxTime >= mins && (a.interests.some(i => interests.includes(i)) || interests.length === 0 || a.type === 'life'));
                          const lifePool = pool.filter(a => a.type === 'life' && !dailyCompleted.includes(a.id));
                          const gamePool = pool.filter(a => a.type === 'game' && !dailyCompleted.includes(a.id));
                          const learnPool = pool.filter(a => a.type === 'learn' && !dailyCompleted.includes(a.id));
                          const finalLife = lifePool.length > 0 ? lifePool : pool.filter(a => a.type === 'life');
                          const finalGame = gamePool.length >= 2 ? gamePool : pool.filter(a => a.type === 'game');
                          const finalLearn = learnPool.length >= 2 ? learnPool : pool.filter(a => a.type === 'learn');
                          setSuggestions([...[...finalLife].sort(() => 0.5 - Math.random()).slice(0, 1), ...[...finalGame].sort(() => 0.5 - Math.random()).slice(0, 3), ...[...finalLearn].sort(() => 0.5 - Math.random()).slice(0, 3)]);
                          setSelectedDuration(mins);
                        }}
                        className="rounded-2xl px-6 py-4 font-black transition-all bg-accent-secondary shadow-[6px_6px_12px_rgba(0,0,0,0.2),-6px_-6px_12px_rgba(255,255,255,0.1)] hover:scale-105 [@media(orientation:landscape)]:flex-1"
                      >
                        {mins}m
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-3 mx-auto max-w-[66%] [@media(orientation:landscape)]:contents [@media(orientation:landscape)]:max-w-none">
                    {[20, 25].map((mins) => (
                      <button
                        key={mins}
                        onClick={() => {
                          const pool = ACTIVITIES.filter(a => a.minTime <= mins && a.maxTime >= mins && (a.interests.some(i => interests.includes(i)) || interests.length === 0 || a.type === 'life'));
                          const lifePool = pool.filter(a => a.type === 'life' && !dailyCompleted.includes(a.id));
                          const gamePool = pool.filter(a => a.type === 'game' && !dailyCompleted.includes(a.id));
                          const learnPool = pool.filter(a => a.type === 'learn' && !dailyCompleted.includes(a.id));
                          const finalLife = lifePool.length > 0 ? lifePool : pool.filter(a => a.type === 'life');
                          const finalGame = gamePool.length >= 2 ? gamePool : pool.filter(a => a.type === 'game');
                          const finalLearn = learnPool.length >= 2 ? learnPool : pool.filter(a => a.type === 'learn');
                          setSuggestions([...[...finalLife].sort(() => 0.5 - Math.random()).slice(0, 1), ...[...finalGame].sort(() => 0.5 - Math.random()).slice(0, 3), ...[...finalLearn].sort(() => 0.5 - Math.random()).slice(0, 3)]);
                          setSelectedDuration(mins);
                        }}
                        className="rounded-2xl px-6 py-4 font-black transition-all bg-accent-secondary shadow-[6px_6px_12px_rgba(0,0,0,0.2),2px_2px_4px_rgba(0,0,0,0.1)] hover:scale-105 [@media(orientation:landscape)]:flex-1"
                      >
                        {mins}m
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 relative z-10">
                <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
                  <div>
                    <h2 className="text-3xl font-black">Your Options</h2>
                    <p className="text-[12px] font-black uppercase tracking-[0.2em] opacity-80 mt-1">Curated for {selectedDuration}m</p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedDuration(null);
                      setSuggestions([]);
                    }}
                    className="p-3 rounded-full bg-black/10 hover:bg-black/20 transition-colors shadow-lg border border-black/5"
                    aria-label="Change duration"
                  >
                    <ChevronRight className="w-6 h-6 rotate-180" />
                  </button>
                </div>

                <div className="space-y-6">
                  {['life', 'game', 'learn'].map((category) => {
                    const categorySuggestions = suggestions.filter(a => a.type === category);
                    if (categorySuggestions.length === 0) return null;

                    const categoryTitle = category === 'life' ? 'Life & Mindfulness' : category === 'game' ? 'Quick Games' : 'Bite-sized Learning';

                    return (
                      <div key={category} className="space-y-2">
                        <h3 className="text-xs font-black uppercase tracking-widest opacity-60">{categoryTitle}</h3>
                        <div className="flex flex-col gap-2">
                          {categorySuggestions.map((activity) => (
                            <Link
                              key={activity.id}
                              href={`${activity.href}?time=${selectedDuration}`}
                              className="group"
                            >
                              <div className="flex items-center gap-3 px-4 py-3 bg-white/10 rounded-2xl border border-white/5 hover:bg-white/20 transition-all hover:translate-x-1 relative">
                                {dailyCompleted.includes(activity.id) && (
                                  <div className="absolute right-3 bg-white text-accent-secondary rounded-full p-0.5 shadow-lg z-20">
                                    <ShieldCheck className="w-3 h-3" />
                                  </div>
                                )}
                                <div className={`w-8 h-8 shrink-0 rounded-xl bg-white/10 flex items-center justify-center`}>
                                  {(() => {
                                    const original = ACTIVITIES.find(a => a.id === activity.id);
                                    const Icon = original?.icon;
                                    return Icon ? <Icon className="w-4 h-4 text-white" /> : null;
                                  })()}
                                </div>
                                <h3 className="text-sm font-black leading-tight">{activity.title}</h3>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-2 border-t border-white/10 space-y-2">
                  <h3 className="text-xs font-black uppercase tracking-widest opacity-60">Recreation</h3>
                  <Link
                    href={`/watch?time=${selectedDuration}`}
                    className="flex items-center gap-3 px-4 py-3 bg-white/10 rounded-2xl border border-white/5 hover:bg-white/20 transition-all hover:translate-x-1 w-full"
                  >
                    <div className="w-8 h-8 shrink-0 rounded-xl bg-white/15 flex items-center justify-center">
                      <PlayCircle className="w-4 h-4 text-white" />
                    </div>
                    <p className="text-sm font-black text-white leading-tight">Wanna watch something interesting?</p>
                    <ChevronRight className="w-4 h-4 text-white/60 ml-auto shrink-0" />
                  </Link>
                </div>
              </div>
            )}
          </div>

          {preferences.showDevTiles && (
            <>
              <div className="bg-card rounded-[2.5rem] p-8 space-y-3 shadow-neo-out border border-white/5">
                <p className="text-foreground/40 font-bold uppercase tracking-widest text-xs">Time Reclaimed</p>
                <p className="text-5xl font-black text-accent">{stats.totalMinutesSaved}<span className="text-xl font-bold text-foreground/20 ml-2 italic">mins</span></p>
              </div>

              <div className="bg-card rounded-[2.5rem] p-8 space-y-3 shadow-neo-out border border-white/5">
                <p className="text-foreground/40 font-bold uppercase tracking-widest text-xs">Daily Streak</p>
                <p className="text-5xl font-black text-accent-secondary">{stats.streakDays}<span className="text-xl font-bold text-foreground/20 ml-2 italic">days</span></p>
              </div>
            </>
          )}
        </section>

        {currentQuote && (
          <div className="bg-[#0f0f0f] rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative overflow-hidden group animate-in fade-in slide-in-from-top-4 duration-1000">
            {/* Dynamic Background Glow */}
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-accent/20 rounded-full blur-[100px] animate-pulse pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-accent-secondary/10 rounded-full blur-[100px] animate-pulse pointer-events-none" style={{ animationDelay: '2s' }} />

            <div className="relative z-10 space-y-6">
              <div className="flex flex-wrap gap-x-3 gap-y-2 max-w-3xl">
                {currentQuote.split(' ').map((word, i) => {
                  const cleanWord = word.toLowerCase().replace(/[.,!?;:"]/g, '');
                  const isKeyword = [
                    'reclaim', 'reclaiming', 'focus', 'focused', 'time', 'productivity',
                    'productive', 'friction', 'mission', 'gaps', 'wait', 'waiting',
                    'waitless', 'power', 'future', 'curiosity', 'attention', 'growth',
                    'momentum', 'discover', 'discovery', 'victory', 'mission', 'focused'
                  ].includes(cleanWord);

                  return (
                    <span
                      key={i}
                      className={`text-2xl md:text-4xl font-black leading-tight tracking-tighter animate-in fade-in slide-in-from-bottom-2 duration-700 fill-mode-both hover:scale-110 transition-all cursor-default ${isKeyword ? 'text-accent shadow-accent/20' : 'text-white'
                        }`}
                      style={{ animationDelay: `${i * 70}ms` }}
                    >
                      {word}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {preferences.showDevTiles && (
          <>
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
              preferredLanguages={preferredLanguages}
              dailyCompleted={dailyCompleted}
              updateStats={updateStats}
            />
          </>
        )}
      </div>
    </main>
  );
}
