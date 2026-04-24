'use client';

import { useUserStore } from "@/store/userStore";
import Onboarding from "@/components/Onboarding";
import { WordLess } from "@/components/games/WordLess";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { WeatherWidget } from "@/components/dashboard/WeatherWidget";
import { useEffect, useState } from "react";
import { Gamepad2, User, ShieldCheck, ChevronRight, ArrowRight, PlayCircle, X, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ACTIVITIES } from "@/lib/activities";
import videosDb from "@/stored-data/videos-db.json";

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

  // Video Section States
  const [shuffledVideos, setShuffledVideos] = useState<typeof videosDb>([]);
  const [selectedGenre, setSelectedGenre] = useState<string>("For You");
  const [videoDurationFilter, setVideoDurationFilter] = useState<string>("all");
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);
  const [visibleCounts, setVisibleCounts] = useState<Record<string, number>>({
    "For You": 8,
    "Travel": 6,
    "History": 6,
    "Educational": 6,
    "Politics": 6,
    "News": 6
  });
  const [videoSuggestion, setVideoSuggestion] = useState<any>(null);

  useEffect(() => {
    setShuffledVideos([...videosDb].sort(() => Math.random() - 0.5));
  }, []);

  const baseFilteredVideos = shuffledVideos.filter(v => {
    if (v.duration < 60) return false; // Don't show videos shorter than 1 min
    if (videoDurationFilter === "all") return true;
    if (videoDurationFilter === "under5") return v.duration < 300;
    if (videoDurationFilter === "5-10") return v.duration >= 300 && v.duration <= 600;
    if (videoDurationFilter === "10-15") return v.duration > 600 && v.duration <= 900;
    if (videoDurationFilter === "15+") return v.duration > 900;
    return true;
  });

  let finalVideos = [];
  if (selectedGenre === "For You") {
    const interested = baseFilteredVideos.filter(v => videoGenres.includes(v.genre));
    const others = baseFilteredVideos.filter(v => !videoGenres.includes(v.genre));
    let combined = [];
    let i = 0, j = 0;
    while (i < interested.length || j < others.length) {
      combined.push(...interested.slice(i, i + 5));
      combined.push(...others.slice(j, j + 3));
      i += 5;
      j += 3;
    }
    finalVideos = combined;
  } else {
    finalVideos = baseFilteredVideos.filter(v => v.genre === selectedGenre);
  }

  const currentVisibleCount = visibleCounts[selectedGenre] || 6;
  const visibleVideos = finalVideos.slice(0, currentVisibleCount);

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
                    // Lock entire logic if at least one activity from ANY set is completed
                    // Wait, user said "until an activity is completed".
                    // I will stick to current behavior: once you start one, you're locked into THAT session.
                    if (anySuggestionCompleted && !allSuggestionsCompleted && selectedDuration !== 1) {
                      return; 
                    }

                    // Check if we have locked suggestions for THIS duration
                    if (suggestionLock[mins] && !allSuggestionsCompleted) {
                      setSuggestions(suggestionLock[mins]);
                      setSelectedDuration(mins);
                      
                      // Update video suggestion even if locked
                      if (mins > 1) {
                        const relevantVideos = shuffledVideos.filter(v => 
                          (videoGenres.includes(v.genre)) && 
                          v.duration >= 60 &&
                          v.duration <= mins * 60
                        );
                        const videoPool = relevantVideos.length > 0 ? relevantVideos : shuffledVideos.filter(v => v.duration >= 60);
                        setVideoSuggestion(videoPool[Math.floor(Math.random() * videoPool.length)]);
                      } else {
                        setVideoSuggestion(null);
                      }
                      return;
                    }

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
                    
                    // Add a video suggestion for the timer (Skip for 1 min)
                    if (mins > 1) {
                      const relevantVideos = shuffledVideos.filter(v => 
                        (videoGenres.includes(v.genre)) && 
                        v.duration >= 60 && // Exclude < 1min
                        v.duration <= mins * 60
                      );
                      const videoPool = relevantVideos.length > 0 ? relevantVideos : shuffledVideos.filter(v => v.duration >= 60);
                      setVideoSuggestion(videoPool[Math.floor(Math.random() * videoPool.length)]);
                    } else {
                      setVideoSuggestion(null);
                    }

                    // Save to lock
                    setSuggestionLock(prev => ({ ...prev, [mins]: newSuggestions }));
                  }}
                  className={`rounded-2xl px-6 py-4 font-black transition-all ${
                    selectedDuration === mins 
                    ? "bg-white text-accent shadow-neo-in scale-95" 
                    : (anySuggestionCompleted && !allSuggestionsCompleted && selectedDuration !== 1 && mins !== 1) ? "bg-accent/40 cursor-not-allowed opacity-50 shadow-none" : "bg-accent shadow-[6px_6px_12px_rgba(0,0,0,0.2),-6px_-6px_12px_rgba(255,255,255,0.1)] hover:scale-105"
                  }`}
                  disabled={anySuggestionCompleted && !allSuggestionsCompleted && selectedDuration !== 1 && mins !== 1}
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

                {videoSuggestion && (
                  <div className="pt-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-3">Recreation Highlight</p>
                    <button
                      onClick={() => setPlayingVideo(videoSuggestion.ytId)}
                      className="w-full flex items-center gap-4 p-4 bg-white/10 rounded-[2rem] border border-white/5 hover:bg-white/20 transition-all text-left group"
                    >
                      <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center shadow-[4px_4px_8px_rgba(0,0,0,0.2),-4px_-4px_8px_rgba(255,255,255,0.1)] group-hover:scale-110 transition-transform">
                        <PlayCircle className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="px-2 py-0.5 bg-white/10 rounded text-[8px] font-black uppercase tracking-tighter text-white/60">{videoSuggestion.genre}</span>
                        </div>
                        <h3 className="text-sm font-black text-white truncate">{videoSuggestion.title}</h3>
                        <p className="text-[10px] text-white/60 font-medium uppercase tracking-widest">{videoSuggestion.creator}</p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-white/40 group-hover:text-white transition-colors mr-2" />
                    </button>
                  </div>
                )}
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

        {/* RECREATION: Videos Section */}
        <section className="bg-card rounded-[2.5rem] p-8 space-y-6 shadow-neo-out border border-white/5 relative z-10">
          <div className="space-y-1">
            <h2 className="text-3xl font-black">Recreation</h2>
            <p className="text-foreground/60 font-medium">Watch curated videos directly in the app.</p>
          </div>

          {/* Genre Tabs */}
          <div className="flex flex-wrap gap-3">
            {["For You", "Travel", "History", "Educational", "Politics", "News"].map(genre => (
              <button
                key={genre}
                onClick={() => {
                  setSelectedGenre(genre);
                }}
                className={`px-5 py-2 rounded-full font-black text-sm transition-all shadow-sm ${selectedGenre === genre ? 'bg-accent text-white shadow-neo-in' : 'bg-background hover:bg-accent/10'}`}
              >
                {genre}
              </button>
            ))}
          </div>

          {/* Duration Filters */}
          <div className="flex flex-wrap gap-2 pt-2">
            {[
              { id: 'all', label: 'All' },
              { id: 'under5', label: 'Under 5 mins' },
              { id: '5-10', label: '5-10 mins' },
              { id: '10-15', label: '10-15 mins' },
              { id: '15+', label: '15+ mins' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => {
                  setVideoDurationFilter(f.id);
                }}
                className={`px-4 py-1.5 rounded-full font-bold text-xs transition-all border ${videoDurationFilter === f.id ? 'border-accent text-accent bg-accent/10' : 'border-foreground/10 text-foreground/60 hover:border-foreground/30'}`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Video Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
            {visibleVideos.map(video => (
              <button
                key={video.id}
                onClick={() => setPlayingVideo(video.ytId || video.id)}
                className="group relative bg-background rounded-2xl overflow-hidden shadow-sm hover:shadow-neo-out transition-all border border-transparent hover:border-accent/30 text-left flex flex-col"
              >
                <div className="relative aspect-video w-full overflow-hidden">
                  <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors flex items-center justify-center">
                     <PlayCircle className="w-12 h-12 text-white opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all drop-shadow-lg" />
                  </div>
                  <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/80 text-white text-[10px] font-black rounded-md backdrop-blur-md">
                    {Math.floor(video.duration / 60)}:{String(video.duration % 60).padStart(2, '0')}
                  </div>
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                  <h3 className="font-bold text-sm leading-tight line-clamp-2">{video.title}</h3>
                  <p className="text-[10px] uppercase font-black tracking-widest text-accent opacity-80">{video.creator}</p>
                </div>
              </button>
            ))}
            {finalVideos.length === 0 && (
              <div className="col-span-full py-12 text-center text-foreground/50 font-medium">
                No videos found for this duration in this category.
              </div>
            )}
          </div>

          {finalVideos.length > currentVisibleCount && (
            <div className="pt-4 flex justify-center">
              <button
                onClick={() => setVisibleCounts(prev => ({
                  ...prev,
                  [selectedGenre]: (prev[selectedGenre] || (selectedGenre === "For You" ? 8 : 6)) + 3
                }))}
                className="px-8 py-3 rounded-full bg-accent text-white font-black hover:scale-105 active:scale-95 transition-all shadow-neo-out"
              >
                Load More
              </button>
            </div>
          )}
        </section>
      </div>

      {/* Video Player Modal */}
      {playingVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-4xl bg-black rounded-[2rem] overflow-hidden shadow-2xl animate-in zoom-in-95">
            <button 
              onClick={() => setPlayingVideo(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md transition-colors"
            >
              <X size={24} />
            </button>
            <div className="aspect-video w-full">
              <iframe
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${playingVideo}?autoplay=1`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}


    </main>
  );
}
