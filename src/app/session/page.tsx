'use client';

import { useUserStore } from "@/store/userStore";
import { useEffect, useState } from "react";
import { ChevronRight, PlayCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ACTIVITIES, buildSuggestions, VIDEO_ACTIVITY_ID, ActivityDefinition } from "@/lib/activities";
import { BackButton } from "@/components/ui/BackButton";

export default function SessionPage() {
  const router = useRouter();
  const sessionDuration = useUserStore((state) => state.sessionDuration);
  const sessionEndTime = useUserStore((state) => state.sessionEndTime);
  const endSession = useUserStore((state) => state.endSession);
  const interests = useUserStore((state) => state.interests);
  const videoGenres = useUserStore((state) => state.videoGenres);
  const dailyCompleted = useUserStore(state => state.dailyCompletedActivities);
  const _hasHydrated = useUserStore(state => state._hasHydrated);

  const [suggestions, setSuggestions] = useState<ActivityDefinition[]>([]);
  const [nonInterestSuggestion, setNonInterestSuggestion] = useState<ActivityDefinition | null>(null);

  useEffect(() => {
    if (!_hasHydrated) return;

    if (!sessionDuration || !sessionEndTime) {
      router.push('/');
      return;
    }

    const { picked, nonInterest } = buildSuggestions(sessionDuration, interests, videoGenres, dailyCompleted);
    setSuggestions(picked);
    setNonInterestSuggestion(nonInterest);
  }, [sessionDuration, sessionEndTime, interests, videoGenres, dailyCompleted, _hasHydrated, router]);

  if (!_hasHydrated || !sessionDuration) return null;

  return (
    <main className="min-h-screen bg-background text-foreground pb-4 animate-in fade-in duration-500">
      <div className="max-w-4xl mx-auto px-6 pt-0 pb-2 space-y-6">
        <header className="flex items-center mb-4">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight">Active Session</h1>
            <p className="text-accent font-medium uppercase tracking-widest text-sm">Drafting Activities</p>
          </div>
        </header>

        <section className="grid grid-cols-1 gap-4">
          <div className="bg-accent rounded-[2.5rem] p-6 sm:px-10 sm:pt-10 sm:pb-8 text-white space-y-6 shadow-[8px_8px_20px_rgba(0,0,0,0.15),-4px_-4px_15px_rgba(0,0,0,0.05)] ring-1 ring-black/5 overflow-hidden relative group">

            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 relative z-10">
              <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
                <div>
                  <h2 className="text-3xl font-black">Your Options</h2>
                  <p className="text-[12px] font-black uppercase tracking-[0.2em] opacity-80 mt-1">Curated for {sessionDuration}m</p>
                </div>
                <button
                  onClick={() => {
                    endSession();
                    router.push('/');
                  }}
                  className="p-3 rounded-full bg-black/10 hover:bg-black/20 transition-colors shadow-lg border border-black/5"
                  aria-label="End Session"
                >
                  <ChevronRight className="w-6 h-6 rotate-180" />
                </button>
              </div>

              <div className="space-y-2">
                {suggestions.map((activity) => (
                  <Link
                    key={activity.id}
                    href={activity.id === VIDEO_ACTIVITY_ID ? `/watch?time=${sessionDuration}` : `${activity.href}?time=${sessionDuration}`}
                    className="group"
                  >
                    <div className="flex items-center gap-3 px-4 py-3 bg-white/10 rounded-2xl border border-white/5 hover:bg-white/20 transition-all hover:translate-x-1 relative mt-2 shadow-sm">
                      <div className="w-8 h-8 shrink-0 rounded-xl bg-white/10 flex items-center justify-center">
                        {(() => {
                          if (activity.id === VIDEO_ACTIVITY_ID) return <PlayCircle className="w-4 h-4 text-white" />;
                          const original = ACTIVITIES.find(a => a.id === activity.id);
                          const Icon = original?.icon;
                          return Icon ? <Icon className="w-4 h-4 text-white" /> : null;
                        })()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-black leading-tight">{activity.title}</h3>
                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-50 mt-0.5">
                          {activity.id === VIDEO_ACTIVITY_ID ? 'Video' : activity.type === 'life' ? 'Activity' : activity.type === 'game' ? 'Game' : 'Learning'}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-white/40 shrink-0" />
                    </div>
                  </Link>
                ))}
              </div>

              {nonInterestSuggestion && (
                <div className="pt-6 mt-4 border-t border-white/10 space-y-2">
                  <h3 className="text-xs font-black uppercase tracking-widest opacity-60">Broaden Your Horizons</h3>
                  <Link
                    href={`${nonInterestSuggestion.href}?time=${sessionDuration}`}
                    className="group"
                  >
                    <div className="flex items-center gap-3 px-4 py-3 bg-white/5 border border-dashed border-white/20 rounded-2xl hover:bg-white/10 transition-all hover:translate-x-1 relative shadow-sm">

                      <div className="w-8 h-8 shrink-0 rounded-xl bg-white/10 flex items-center justify-center">
                        {(() => {
                          const Icon = nonInterestSuggestion.icon;
                          return Icon ? <Icon className="w-4 h-4 text-white/70" /> : null;
                        })()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-black leading-tight opacity-80">{nonInterestSuggestion.title}</h3>
                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mt-0.5">
                          {nonInterestSuggestion.type === 'life' ? 'Activity' : 'Learning'}
                        </p>
                      </div>
                    </div>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
