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
import { getDailyWord, getEffectiveDate } from "@/lib/dailyWord";
import { getCachedData, setCachedData } from "@/lib/offline-data-manager";
import { ActivityDefinition } from '@/lib/activities';
import { Capacitor } from '@capacitor/core';
import { FrictionPoint } from "@/store/userStore";
import { FRICTION_PRESETS } from "@/lib/friction-presets";
import { generateQuotes } from "./quotes/actions";



export default function Home() {
  const router = useRouter();
  const interests = useUserStore((state) => state.interests);
  const videoGenres = useUserStore((state) => state.videoGenres);
  const stats = useUserStore((state) => state.stats);
  const [activeActivity, setActiveActivity] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const preferences = useUserStore((state) => state.preferences);
  const updateStats = useUserStore((state) => state.updateStats);
  const startSession = useUserStore((state) => state.startSession);
  const setNavigationSource = useUserStore((state) => state.setNavigationSource);

  const preferredLanguages = useUserStore((state) => state.preferredLanguages);
  const dailyCompleted = useUserStore(state => state.dailyCompletedActivities);
  const _hasHydrated = useUserStore(state => state._hasHydrated);
  const lastDate = useUserStore(state => state.lastCompletedDate);

  const quotePool = useUserStore(state => state.quotePool);
  const currentQuote = useUserStore(state => state.currentQuote);
  const setQuotePool = useUserStore(state => state.setQuotePool);
  const refreshQuote = useUserStore(state => state.refreshQuote);

  // Word of the Day Sync
  const [wordData, setWordData] = useState<{ word: string; phonetic: string; meaning: string } | null>(null);
  const [wordLoading, setWordLoading] = useState(true);

  useEffect(() => {
    const CACHE_KEY = 'word_of_day_cache_v2';
    const fetchWordData = async () => {
      try {
        const today = getEffectiveDate();
        const cached = await getCachedData<any>(CACHE_KEY);
        if (cached && cached.date === today) {
          setWordData(cached.data);
          setWordLoading(false);
          return;
        }

        const word = getDailyWord();
        const defRes = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
        let data: { word: string; phonetic: string; meaning: string };

        if (defRes.ok) {
          const defData = await defRes.json();
          const entry = defData[0];
          data = {
            word: word,
            meaning: entry.meanings[0].definitions[0].definition,
            phonetic: entry.phonetic || ''
          };
        } else {
          data = {
            word: word,
            meaning: 'A common daily word to help you reclaim your time and focus.',
            phonetic: ''
          };
        }

        setWordData(data);
        await setCachedData(CACHE_KEY, { date: today, data });
      } catch (error) {
        console.error("Failed to fetch word of the day:", error);
      } finally {
        setWordLoading(false);
      }
    };
    fetchWordData();
  }, []);

  // Word of the Day probability: 70% if interested in languages, 30% otherwise
  const [wordOfDayRoll] = useState(() => Math.random());
  const showWordOfDay = interests.includes('languages')
    ? wordOfDayRoll < 0.65
    : wordOfDayRoll < 0.1;
  const frictionPoints = useUserStore(state => state.frictionPoints);
  const [activeFriction, setActiveFriction] = useState<FrictionPoint | null>(null);

  // Track which friction window is active for UI display only (no notifications).
  useEffect(() => {
    const checkFriction = () => {
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const day = now.getDay();
      const active = frictionPoints.find(p =>
        (p.days || [0, 1, 2, 3, 4, 5, 6]).includes(day) &&
        p.startTime <= timeStr &&
        p.endTime >= timeStr
      ) || null;
      setActiveFriction(active);
    };

    checkFriction();
    const interval = setInterval(checkFriction, 30000);
    return () => clearInterval(interval);
  }, [frictionPoints]);

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
            {activeFriction && (
              <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-4 duration-700">
                <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                <p className="text-[10px] font-black uppercase tracking-widest text-foreground/40 italic">
                  Currently in: <span className="text-accent">{activeFriction.label}</span>
                </p>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
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
          <div className="bg-accent rounded-[2.5rem] p-6 text-white space-y-6 shadow-[8px_8px_20px_rgba(0,0,0,0.15),-4px_-4px_15px_rgba(0,0,0,0.05)] ring-1 ring-black/5 col-span-1 md:col-span-2 overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
              <Hourglass size={120} />
            </div>

              <div className="animate-in fade-in zoom-in-95 duration-500">
                <div className="space-y-1 relative z-10 mb-6">
                  <h2 className="text-2xl font-black">How long do you expect to wait?</h2>
                  <p className="opacity-80 font-medium text-sm">Choose an approximate duration of your commute</p>
                </div>
                {/* Portrait: 3+1 split. Landscape: flex row of 5 via display:contents */}
                <div className="space-y-3 relative z-10 [@media(orientation:landscape)]:flex [@media(orientation:landscape)]:gap-3 [@media(orientation:landscape)]:space-y-0">
                  <div className="grid grid-cols-3 gap-3 [@media(orientation:landscape)]:contents">
                    {[5, 10, 15].map((mins) => (
                      <button
                        key={mins}
                        onClick={() => {
                          startSession(mins);
                          router.push('/session');
                        }}
                        className="rounded-2xl px-6 py-4 font-black transition-all bg-accent shadow-[6px_6px_12px_rgba(0,0,0,0.2),-6px_-6px_12px_rgba(255,255,255,0.1)] hover:scale-105 [@media(orientation:landscape)]:flex-1"
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
                          startSession(mins);
                          router.push('/session');
                        }}
                        className="rounded-2xl px-6 py-4 font-black transition-all bg-accent shadow-[6px_6px_12px_rgba(0,0,0,0.2),2px_2px_4px_rgba(0,0,0,0.1)] hover:scale-105 [@media(orientation:landscape)]:flex-1"
                      >
                        {mins}m
                      </button>
                    ))}
                  </div>
                </div>
              </div>
          </div>

          {preferences.showDevTiles && (
            <>
              <div className="bg-card rounded-[2.5rem] p-8 space-y-3 shadow-neo-out border border-white/5">
                <p className="text-foreground/40 font-bold uppercase tracking-widest text-xs">Time Reclaimed</p>
                <p className="text-5xl font-black text-accent">{Math.floor(stats.totalMinutesSaved)}<span className="text-xl font-bold text-foreground/20 ml-2 italic">mins</span></p>
              </div>

              <div className="bg-card rounded-[2.5rem] p-8 space-y-3 shadow-neo-out border border-white/5">
                <p className="text-foreground/40 font-bold uppercase tracking-widest text-xs">Daily Streak</p>
                <p className="text-5xl font-black text-accent">{stats.streakDays}<span className="text-xl font-bold text-foreground/20 ml-2 italic">days</span></p>
              </div>
            </>
          )}
        </section>
        {showWordOfDay && wordData ? (
          /* ── Word of the Day (synced) ── */
          <div className="bg-[#0f0f0f] rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative overflow-hidden group animate-in fade-in slide-in-from-top-4 duration-1000">
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-accent/20 rounded-full blur-[100px] animate-pulse pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-accent-secondary/10 rounded-full blur-[100px] animate-pulse pointer-events-none" style={{ animationDelay: '2s' }} />

            <div className="relative z-10 space-y-5">
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-accent/70">Word of the Day</p>

              {/* The word and Phonetic */}
              <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
                <h2 className="text-5xl md:text-6xl font-black text-white tracking-tighter capitalize animate-in fade-in slide-in-from-bottom-4 duration-700">
                  {wordData.word}
                </h2>
                {wordData.phonetic && (
                  <span className="text-orange-500/80 text-xl font-bold font-mono tracking-widest italic animate-in fade-in slide-in-from-bottom-2 duration-1000 delay-200">
                    {wordData.phonetic}
                  </span>
                )}
              </div>

              {/* Meaning */}
              <div className="border-l-2 border-accent/40 pl-6 py-1">
                <p className="text-white/70 font-medium text-lg md:text-xl leading-relaxed italic">
                  "{wordData.meaning}"
                </p>
              </div>
            </div>
          </div>
        ) : showWordOfDay && wordLoading ? (
          <div className="bg-[#0f0f0f] rounded-[2.5rem] p-12 shadow-2xl flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        ) : currentQuote ? (
          /* ── Motivational Quote (default) ── */
          <div className="bg-[#0f0f0f] rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative overflow-hidden group animate-in fade-in slide-in-from-top-4 duration-1000">
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-accent/20 rounded-full blur-[100px] animate-pulse pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-accent-secondary/10 rounded-full blur-[100px] animate-pulse pointer-events-none" style={{ animationDelay: '2s' }} />

            <div className="relative z-10 space-y-6">
              <div className="flex flex-wrap gap-x-3 gap-y-2 max-w-3xl">
                {currentQuote.split(' ').map((word, i) => {
                  const cleanWord = word.toLowerCase().replace(/[.,!?;:\"]/g, '');
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
        ) : null}

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
