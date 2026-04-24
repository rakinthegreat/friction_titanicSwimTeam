'use client';

import { useUserStore } from "@/store/userStore";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { LogOut, ArrowLeft, CloudUpload, Settings2, Check, X, Laptop, History, Puzzle, Languages, FlaskConical, Brain, Leaf, Plane, Landmark, GraduationCap, Megaphone, Newspaper } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const INTEREST_OPTIONS = [
  { id: 'tech', label: 'Technology', icon: Laptop },
  { id: 'history', label: 'History', icon: History },
  { id: 'logic', label: 'Logic Puzzles', icon: Puzzle },
  { id: 'languages', label: 'Languages', icon: Languages },
  { id: 'science', label: 'Science', icon: FlaskConical },
  { id: 'philosophy', label: 'Philosophy', icon: Brain },
];

const VIDEO_GENRES = [
  { id: 'Travel', label: 'Travel', icon: Plane },
  { id: 'History', label: 'History', icon: Landmark },
  { id: 'Educational', label: 'Educational', icon: GraduationCap },
  { id: 'Politics', label: 'Politics', icon: Megaphone },
  { id: 'News', label: 'News', icon: Newspaper },
];

export default function Profile() {
  const stats = useUserStore((state) => state.stats);
  const gameStats = useUserStore((state) => state.gameStats);
  const interests = useUserStore((state) => state.interests);
  const videoGenres = useUserStore((state) => state.videoGenres);
  const uid = useUserStore((state) => state.uid);
  const { logout, signInWithGoogle, isLoading } = useFirebaseAuth();
  const setInterests = useUserStore((state) => state.setInterests);
  const setVideoGenres = useUserStore((state) => state.setVideoGenres);
  const [mounted, setMounted] = useState(false);
  const [isEditingInterests, setIsEditingInterests] = useState(false);
  const [tempInterests, setTempInterests] = useState<string[]>(interests);
  const [isEditingVideoGenres, setIsEditingVideoGenres] = useState(false);
  const [tempVideoGenres, setTempVideoGenres] = useState<string[]>(videoGenres || []);

  const lastBackupDate = useUserStore((state) => state.lastBackupDate);
  const syncWithFirebase = useUserStore((state) => state.syncWithFirebase);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const setNavigationSource = useUserStore((state) => state.setNavigationSource);

  useEffect(() => {
    setMounted(true);
    setNavigationSource('profile');
  }, [setNavigationSource]);

  const handleToggleInterest = (id: string) => {
    if (tempInterests.includes(id)) {
      setTempInterests(tempInterests.filter(i => i !== id));
    } else {
      setTempInterests([...tempInterests, id]);
    }
  };

  const handleSaveInterests = () => {
    setInterests(tempInterests);
    setIsEditingInterests(false);
  };

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncSuccess(false);
    try {
      await syncWithFirebase();
      setSyncSuccess(true);
      setTimeout(() => setSyncSuccess(false), 3000);
    } catch (err) {
      console.error("Sync failed:", err);
      alert("Sync failed. Please try again.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleToggleVideoGenre = (id: string) => {
    if (tempVideoGenres.includes(id)) {
      setTempVideoGenres(tempVideoGenres.filter(i => i !== id));
    } else {
      setTempVideoGenres([...tempVideoGenres, id]);
    }
  };

  const handleSaveVideoGenres = () => {
    setVideoGenres(tempVideoGenres);
    setIsEditingVideoGenres(false);
  };

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-background p-6 md:p-12 max-w-5xl mx-auto space-y-12">
      <header className="flex justify-between items-center">
        <Link 
          href="/"
          className="p-4 bg-card rounded-2xl shadow-neo-out hover:scale-105 active:scale-95 transition-all group"
        >
          <ArrowLeft className="w-6 h-6 text-foreground/40 group-hover:text-accent transition-colors" />
        </Link>
        <div className="flex items-center gap-4">
          <ThemeToggle />
        </div>
      </header>

      <section className="text-center space-y-2">
        <h1 className="text-5xl font-black italic tracking-tighter uppercase leading-tight">Your Profile</h1>
        <p className="text-foreground/40 font-bold tracking-widest text-sm uppercase">Track your growth & progress</p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="bg-card rounded-[2.5rem] p-8 space-y-2 shadow-neo-out border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
            <Leaf size={80} />
          </div>
          <p className="text-foreground/40 font-bold uppercase tracking-widest text-xs">Total Progress</p>
          <p className="text-6xl font-black italic tracking-tighter text-accent">{stats.totalMinutesSaved}</p>
          <p className="text-sm font-bold text-foreground/60">Minutes Saved</p>
        </div>

        <div className="bg-card rounded-[2.5rem] p-8 space-y-2 shadow-neo-out border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
            <Check size={80} />
          </div>
          <p className="text-foreground/40 font-bold uppercase tracking-widest text-xs">Productivity</p>
          <p className="text-6xl font-black italic tracking-tighter text-accent-secondary">{stats.activitiesCompleted}</p>
          <p className="text-sm font-bold text-foreground/60">Sessions Completed</p>
        </div>

        <div className="bg-card rounded-[2.5rem] p-8 space-y-2 shadow-neo-out border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
            <Trophy size={80} />
          </div>
          <p className="text-foreground/40 font-bold uppercase tracking-widest text-xs">Current Streak</p>
          <p className="text-6xl font-black italic tracking-tighter text-accent">{stats.streakDays}</p>
          <p className="text-sm font-bold text-foreground/60">Days in a row</p>
        </div>

        <div className="bg-card rounded-[2.5rem] p-8 space-y-4 shadow-neo-out border border-white/5 md:col-span-2">
          <div className="flex justify-between items-center mb-2">
            <p className="text-foreground/40 font-bold uppercase tracking-widest text-xs">Interests & Focus</p>
            <button 
              onClick={() => {
                setTempInterests(interests);
                setIsEditingInterests(!isEditingInterests);
              }}
              className={`p-2 rounded-xl shadow-neo-out transition-all ${isEditingInterests ? 'text-red-500' : 'text-accent'}`}
            >
              {isEditingInterests ? <X size={18} /> : <Settings2 size={18} />}
            </button>
          </div>

          {isEditingInterests ? (
            <div className="space-y-6 animate-in fade-in zoom-in duration-300">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {INTEREST_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = tempInterests.includes(opt.id);
                  return (
                    <div
                      key={opt.id}
                      onClick={() => handleToggleInterest(opt.id)}
                      className={`flex flex-col items-center justify-center p-4 rounded-2xl transition-all cursor-pointer ${isSelected
                        ? 'shadow-neo-in text-accent'
                        : 'shadow-neo-out text-foreground/40 hover:scale-[1.02]'
                      }`}
                    >
                      <Icon size={24} className="mb-2" />
                      <span className="font-bold text-[10px] uppercase tracking-wider">{opt.label}</span>
                    </div>
                  );
                })}
              </div>
              <button
                onClick={handleSaveInterests}
                disabled={tempInterests.length < 1}
                className="w-full py-4 bg-accent text-white rounded-2xl font-black shadow-neo-out active:shadow-neo-in active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Check size={20} />
                SAVE INTERESTS
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {interests.length > 0 ? interests.map(i => (
                <span key={i} className="px-4 py-2 bg-accent/10 text-accent rounded-full text-sm font-bold capitalize">
                  {i}
                </span>
              )) : <p className="text-foreground/40 text-sm">No interests added yet.</p>}
            </div>
          )}
        </div>

        <div className="bg-card rounded-[2.5rem] p-8 space-y-4 shadow-neo-out border border-white/5 md:col-span-2">
          <div className="flex justify-between items-center mb-2">
            <p className="text-foreground/40 font-bold uppercase tracking-widest text-xs">Video Interests</p>
            <button 
              onClick={() => {
                setTempVideoGenres(videoGenres || []);
                setIsEditingVideoGenres(!isEditingVideoGenres);
              }}
              className={`p-2 rounded-xl shadow-neo-out transition-all ${isEditingVideoGenres ? 'text-red-500' : 'text-accent'}`}
            >
              {isEditingVideoGenres ? <X size={18} /> : <Settings2 size={18} />}
            </button>
          </div>

          {isEditingVideoGenres ? (
            <div className="space-y-6 animate-in fade-in zoom-in duration-300">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {VIDEO_GENRES.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = tempVideoGenres.includes(opt.id);
                  return (
                    <div
                      key={opt.id}
                      onClick={() => handleToggleVideoGenre(opt.id)}
                      className={`flex flex-col items-center justify-center p-4 rounded-2xl transition-all cursor-pointer ${isSelected
                        ? 'shadow-neo-in text-accent'
                        : 'shadow-neo-out text-foreground/40 hover:scale-[1.02]'
                      }`}
                    >
                      <Icon size={24} className="mb-2" />
                      <span className="font-bold text-[10px] uppercase tracking-wider">{opt.label}</span>
                    </div>
                  );
                })}
              </div>
              <button
                onClick={handleSaveVideoGenres}
                disabled={tempVideoGenres.length < 1}
                className="w-full py-4 bg-accent text-white rounded-2xl font-black shadow-neo-out active:shadow-neo-in active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Check size={20} />
                SAVE VIDEO INTERESTS
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {videoGenres && videoGenres.length > 0 ? videoGenres.map(i => (
                <span key={i} className="px-4 py-2 bg-accent/10 text-accent rounded-full text-sm font-bold capitalize">
                  {i}
                </span>
              )) : <p className="text-foreground/40 text-sm">No video interests added yet.</p>}
            </div>
          )}
        </div>

        <div className="bg-card rounded-[2.5rem] p-8 space-y-6 shadow-neo-out border border-white/5 md:col-span-3">
          <div className="space-y-1">
            <p className="text-foreground/40 font-bold uppercase tracking-widest text-xs">Performance Analysis</p>
            <h3 className="text-2xl font-black italic">GAME SESSION ANALYTICS</h3>
          </div>

          <div className="overflow-x-auto -mx-2 sm:mx-0">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-foreground/5">
                  <th className="py-4 px-2 text-[10px] font-black text-foreground/30 uppercase tracking-widest">Game</th>
                  <th className="py-4 px-2 text-[10px] font-black text-foreground/30 uppercase tracking-widest text-center">Plays</th>
                  <th className="py-4 px-2 text-[10px] font-black text-foreground/30 uppercase tracking-widest text-center">Wins</th>
                  <th className="py-4 px-2 text-[10px] font-black text-foreground/30 uppercase tracking-widest text-center">Loss/Quit</th>
                  <th className="py-4 px-2 text-[10px] font-black text-foreground/30 uppercase tracking-widest text-center">Avg Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-foreground/5">
                {Object.entries(gameStats || {}).length > 0 ? (
                  Object.entries(gameStats).map(([id, s]) => (
                    <tr key={id} className="group hover:bg-foreground/[0.02] transition-colors">
                      <td className="py-4 px-2">
                        <span className="font-black italic uppercase text-sm tracking-tight group-hover:text-accent transition-colors">{id}</span>
                      </td>
                      <td className="py-4 px-2 text-center">
                        <span className="font-bold text-sm">{s.timesPlayed}</span>
                      </td>
                      <td className="py-4 px-2 text-center">
                        <span className="font-bold text-sm text-green-500">{s.wins}</span>
                      </td>
                      <td className="py-4 px-2 text-center">
                        <span className="font-bold text-sm text-red-500/60">{(s.losses || 0) + (s.quits || 0)}</span>
                      </td>
                      <td className="py-4 px-2 text-center">
                        <span className="font-black text-xs text-accent">
                          {s.averageTime > 60 
                            ? `${Math.floor(s.averageTime / 60)}m ${Math.round(s.averageTime % 60)}s` 
                            : `${Math.round(s.averageTime)}s`}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-12 text-center">
                      <p className="text-foreground/30 font-bold italic text-sm">No game data recorded yet. Start playing to see your stats!</p>
                      <Link href="/games" className="text-xs text-accent font-black uppercase tracking-widest mt-2 inline-block hover:underline">Go to Games →</Link>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-card rounded-[2.5rem] p-8 space-y-4 shadow-neo-out border border-white/5 md:col-span-2 group">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <p className="text-foreground/40 font-bold uppercase tracking-widest text-xs">Cloud Backup</p>
              <h3 className="text-xl font-black italic">KEEP YOUR PROGRESS SAFE</h3>
            </div>
            <div className="p-3 bg-accent/10 text-accent rounded-2xl">
              <CloudUpload size={24} />
            </div>
          </div>
          
          <div className="bg-foreground/5 p-4 rounded-2xl space-y-1">
            <p className="text-[10px] font-black text-foreground/40 uppercase tracking-tighter">Last Backup</p>
            <p className="text-xs font-bold">{lastBackupDate ? new Date(lastBackupDate).toLocaleString() : 'Never'}</p>
          </div>
          
          {!uid ? (
            <button 
              onClick={signInWithGoogle}
              disabled={isLoading}
              className="w-full py-4 bg-accent text-white rounded-2xl font-black shadow-neo-out hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              {isLoading ? 'Connecting...' : 'Sign in to Backup'}
            </button>
          ) : (
            <button 
              onClick={handleSync}
              disabled={isSyncing}
              className={`w-full py-4 rounded-2xl font-black transition-all flex items-center justify-center gap-2 ${
                syncSuccess 
                  ? 'bg-card text-green-500 shadow-neo-in scale-[0.98]' 
                  : 'bg-card text-accent shadow-neo-out hover:scale-[1.02] active:scale-[0.98]'
              }`}
            >
              {isSyncing ? (
                <>
                  <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                  Syncing...
                </>
              ) : syncSuccess ? (
                <>
                  <Check size={20} />
                  Sync Successful!
                </>
              ) : (
                <>
                  <CloudUpload size={20} />
                  Sync Now
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {uid && (
        <section className="flex justify-center pt-8">
          <button
            onClick={logout}
            disabled={isLoading}
            className="flex items-center gap-2 px-10 py-5 bg-card text-red-500 rounded-[2rem] font-black shadow-neo-out hover:scale-[1.02] active:scale-[0.98] active:shadow-neo-in transition-all"
          >
            <LogOut className="w-5 h-5" />
            {isLoading ? 'Logging out...' : 'LOG OUT'}
          </button>
        </section>
      )}
    </main>
  );
}

const Trophy = ({ size, className }: { size?: number, className?: string }) => (
  <svg 
    width={size || 24} 
    height={size || 24} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
  </svg>
);
