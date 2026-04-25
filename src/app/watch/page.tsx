'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useUserStore } from '@/store/userStore';
import { getRecommendedVideos } from '@/app/recreation/actions';
import { PlayCircle, RotateCcw, Loader2, X, ArrowLeft, Hourglass } from 'lucide-react';

function WatchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const timeMins = parseInt(searchParams.get('time') || '10');

  const getDurationLabel = (mins: number) => {
    if (mins <= 5)  return 'Under 5 minutes';
    if (mins <= 10) return '5 – 10 minutes';
    if (mins <= 15) return '10 – 15 minutes';
    return '15+ minutes';
  };

  const interests = useUserStore((state) => state.interests);
  const videoGenres = useUserStore((state) => state.videoGenres);
  const preferredLanguages = useUserStore((state) => state.preferredLanguages);
  const _hasHydrated = useUserStore((state) => state._hasHydrated);

  const [videos, setVideos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const getEnvironmentalContext = () => {
    const hour = new Date().getHours();
    const timeOfDay = hour >= 5 && hour < 12 ? 'Morning' : hour >= 12 && hour < 17 ? 'Afternoon' : hour >= 17 && hour < 21 ? 'Evening' : 'Night';
    try {
      const cachedWeather = localStorage.getItem('weather_cache');
      if (cachedWeather) {
        const data = JSON.parse(cachedWeather);
        return { location: data.city, timeOfDay, weather: data.condition };
      }
    } catch {}
    return { location: 'Unknown', timeOfDay, weather: 'Clear' };
  };

  const loadVideos = async (forceRefresh = false) => {
    if (isLoading) return;

    // Map selected time to a duration bucket matching the VideoRecommendation widget
    const getDurationFilter = (mins: number) => (v: any): boolean => {
      if (v.duration < 60) return false;
      if (mins <= 5)  return v.duration < 300;               // <5 min
      if (mins <= 10) return v.duration >= 300 && v.duration <= 600;  // 5-10 min
      if (mins <= 15) return v.duration > 600 && v.duration <= 900;   // 10-15 min
      return v.duration > 900;                               // 15+ min (20 or 25)
    };

    if (!forceRefresh) {
      try {
        const cachedData = localStorage.getItem('video_cache');
        const cachedTime = localStorage.getItem('video_cache_time');
        if (cachedData && cachedTime) {
          const ageInMs = Date.now() - parseInt(cachedTime);
          if (ageInMs < 60 * 60 * 1000) {
            const allVideos: any[] = JSON.parse(cachedData);
            const filtered = allVideos.filter(getDurationFilter(timeMins));
            const shuffled = [...filtered].sort(() => 0.5 - Math.random());
            setVideos(shuffled.slice(0, 6));
            return;
          }
        }
      } catch {}
    }

    setIsLoading(true);
    try {
      const context = getEnvironmentalContext();
      const history = videos.map(v => v.id);
      const fetched = await getRecommendedVideos(interests, videoGenres, context, history, preferredLanguages);
      if (fetched && fetched.length > 0) {
        localStorage.setItem('video_cache', JSON.stringify(fetched));
        localStorage.setItem('video_cache_time', Date.now().toString());
        const filtered = fetched.filter(getDurationFilter(timeMins));
        const shuffled = [...filtered].sort(() => 0.5 - Math.random());
        setVideos(shuffled.slice(0, 6));
      }
    } catch (e) {
      console.error('Failed to load videos:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!_hasHydrated || !mounted) return;
    loadVideos(false);
  }, [_hasHydrated, mounted]);

  if (!mounted || !_hasHydrated) return null;

  return (
    <main className="min-h-screen bg-background text-foreground pb-24 animate-in fade-in duration-700">
      <div className="max-w-4xl mx-auto p-8 space-y-8">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-3 rounded-2xl bg-card shadow-neo-out hover:scale-105 active:shadow-neo-in transition-all text-accent"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <Hourglass className="w-5 h-5 text-accent-secondary" />
                <p className="text-accent-secondary font-black uppercase tracking-widest text-sm">{timeMins} min window</p>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight">Something to Watch</h1>
            </div>
          </div>
          <button
            onClick={() => loadVideos(true)}
            disabled={isLoading}
            className="p-3 rounded-2xl bg-card shadow-neo-out hover:scale-105 active:shadow-neo-in transition-all text-accent disabled:opacity-50"
            title="Refresh"
          >
            <RotateCcw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </header>

        <p className="text-foreground/60 font-medium -mt-4">
          Videos in the <span className="font-black text-foreground">{getDurationLabel(timeMins)}</span> range — perfect for your wait.
        </p>

        {/* Video Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading && videos.length === 0 ? (
            <div className="col-span-full py-16 flex flex-col items-center justify-center space-y-4">
              <Loader2 className="w-10 h-10 animate-spin text-accent" />
              <p className="text-foreground/50 font-bold">Curating videos for your wait...</p>
            </div>
          ) : videos.length === 0 ? (
            <div className="col-span-full py-16 text-center">
              <p className="text-foreground/50 font-medium mb-4">No videos loaded yet.</p>
              <button
                onClick={() => loadVideos(true)}
                className="px-6 py-3 bg-accent text-white rounded-2xl font-black hover:scale-105 transition-all"
              >
                Fetch Videos
              </button>
            </div>
          ) : (
            videos.map(video => (
              <button
                key={video.id}
                onClick={() => setPlayingVideo(video.ytId || video.id)}
                className="group relative bg-card rounded-2xl overflow-hidden shadow-neo-out hover:shadow-neo-in transition-all border border-foreground/5 hover:border-accent/20 text-left flex flex-col"
              >
                <div className="relative aspect-video w-full overflow-hidden">
                  <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                    <PlayCircle className="w-12 h-12 text-white opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all drop-shadow-lg" />
                  </div>
                  <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/80 text-white text-[10px] font-black rounded-md backdrop-blur-md">
                    {Math.floor(video.duration / 60)}:{String(video.duration % 60).padStart(2, '0')}
                  </div>
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between space-y-1">
                  <h3 className="font-bold text-sm leading-tight line-clamp-2">{video.title}</h3>
                  <p className="text-[10px] uppercase font-black tracking-widest text-accent opacity-80">{video.creator}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Video Modal */}
      {playingVideo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="relative w-full max-w-5xl aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl">
            <button
              onClick={() => setPlayingVideo(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <iframe
              src={`https://www.youtube.com/embed/${playingVideo}?autoplay=1`}
              className="w-full h-full"
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </main>
  );
}

export default function WatchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-accent" /></div>}>
      <WatchPageContent />
    </Suspense>
  );
}
