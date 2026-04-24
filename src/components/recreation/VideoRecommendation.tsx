'use client';

import React, { useEffect, useState } from 'react';
import { PlayCircle, RotateCcw, Loader2, X } from 'lucide-react';
import { getRecommendedVideos } from '@/app/recreation/actions';

interface VideoRecommendationProps {
  interests: string[];
  videoGenres: string[];
  preferredLanguages: string[];
  dailyCompleted: string[];
  updateStats: (minutes: number) => void;
}

export const VideoRecommendation = ({ interests, videoGenres, preferredLanguages, dailyCompleted, updateStats }: VideoRecommendationProps) => {
  const [videoDurationFilter, setVideoDurationFilter] = useState<string>("all");
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);
  const [dynamicVideos, setDynamicVideos] = useState<any[]>([]);
  const [isVideosLoading, setIsVideosLoading] = useState(false);
  const [visibleCount, setVisibleCount] = useState<number>(8);

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Morning";
    if (hour >= 12 && hour < 17) return "Afternoon";
    if (hour >= 17 && hour < 21) return "Evening";
    return "Night";
  };

  const getEnvironmentalContext = () => {
    const cachedWeather = localStorage.getItem('weather_cache');
    let city = "Unknown";
    let condition = "Clear";
    
    if (cachedWeather) {
      const data = JSON.parse(cachedWeather);
      city = data.city;
      condition = data.condition;
    }

    return {
      location: city,
      timeOfDay: getTimeOfDay(),
      weather: condition
    };
  };

  const handleFetchDynamicVideos = async (forceRefresh = false) => {
    if (isVideosLoading) return;
    
    // Check Cache
    if (!forceRefresh) {
      const cachedData = localStorage.getItem('video_cache');
      const cachedTime = localStorage.getItem('video_cache_time');
      
      if (cachedData && cachedTime) {
        const ageInMs = Date.now() - parseInt(cachedTime);
        const oneHourInMs = 60 * 60 * 1000;
        
        if (ageInMs < oneHourInMs) {
          console.log('[Cache] Loading videos from cache');
          setDynamicVideos(JSON.parse(cachedData));
          return;
        }
      }
    }

    setIsVideosLoading(true);
    try {
      const context = getEnvironmentalContext();
      const history = dynamicVideos.map(v => v.id);
      const videos = await getRecommendedVideos(interests, videoGenres, context, history, preferredLanguages);
      
      if (videos && videos.length > 0) {
        setDynamicVideos(videos);
        // Save to cache
        localStorage.setItem('video_cache', JSON.stringify(videos));
        localStorage.setItem('video_cache_time', Date.now().toString());
      }
    } catch (error) {
      console.error("Failed to load dynamic videos:", error);
    } finally {
      setIsVideosLoading(false);
    }
  };

  useEffect(() => {
    handleFetchDynamicVideos(false); // Check cache first on mount
  }, [interests, videoGenres, preferredLanguages]);

  const filteredVideos = dynamicVideos.filter(v => {
    if (v.duration < 60) return false;
    if (videoDurationFilter === "all") return true;
    if (videoDurationFilter === "under5") return v.duration < 300;
    if (videoDurationFilter === "5-10") return v.duration >= 300 && v.duration <= 600;
    if (videoDurationFilter === "10-15") return v.duration > 600 && v.duration <= 900;
    if (videoDurationFilter === "15+") return v.duration > 900;
    return true;
  });

  const visibleVideos = filteredVideos.slice(0, 6);

  const handleVideoClick = (videoId: string) => {
    setPlayingVideo(videoId);
    updateStats(5);
  };

  const hasNoData = interests.length === 0 && dailyCompleted.length === 0;

  return (
    <section className="bg-card rounded-[2.5rem] p-8 space-y-6 shadow-neo-out border border-white/5 relative z-10">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-black">
              {hasNoData ? "Discovery Mode" : "Personalized Recreation"}
            </h2>
            {hasNoData && (
              <span className="px-2 py-0.5 rounded-full bg-accent/20 text-accent text-[10px] font-black uppercase tracking-widest animate-pulse">
                New User
              </span>
            )}
          </div>
          <p className="text-foreground/60 font-medium">
            {hasNoData 
              ? "Exploring popular and trending topics while we learn your vibe."
              : "AI-curated discoveries based on your journey."}
          </p>
        </div>
        <button
          onClick={() => handleFetchDynamicVideos(true)}
          disabled={isVideosLoading}
          className="p-3 rounded-2xl bg-accent/10 text-accent hover:bg-accent/20 transition-all disabled:opacity-50"
          title="Refresh Recommendations"
        >
          <RotateCcw className={`w-5 h-5 ${isVideosLoading ? 'animate-spin' : ''}`} />
        </button>
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
            onClick={() => setVideoDurationFilter(f.id)}
            className={`px-4 py-1.5 rounded-full font-bold text-xs transition-all border ${videoDurationFilter === f.id ? 'border-accent text-accent bg-accent/10' : 'border-foreground/10 text-foreground/60 hover:border-foreground/30'}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Video Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
        {isVideosLoading && dynamicVideos.length === 0 ? (
          <div className="col-span-full py-12 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-10 h-10 animate-spin text-accent" />
            <p className="text-foreground/50 font-bold">Kimi is curating your personalized feed...</p>
          </div>
        ) : (
          visibleVideos.map(video => (
            <button
              key={video.id}
              onClick={() => handleVideoClick(video.ytId || video.id)}
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
          ))
        )}
        {!isVideosLoading && filteredVideos.length === 0 && (
          <div className="col-span-full py-12 text-center text-foreground/50 font-medium">
            No videos found for this duration. Try refreshing or changing the filter!
          </div>
        )}
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
            ></iframe>
          </div>
        </div>
      )}
    </section>
  );
};
