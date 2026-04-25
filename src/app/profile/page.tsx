'use client';

import { useUserStore } from "@/store/userStore";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { LogOut, ArrowLeft, CloudUpload, Settings2, Check, X, Laptop, History, Puzzle, Languages, FlaskConical, Brain, Leaf, Plane, Landmark, GraduationCap, Megaphone, Newspaper, Trophy, Search, X as XIcon, Clock, Bell, BellOff } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ALL_LANGUAGES } from "@/lib/languages";
import { FRICTION_PRESETS } from "@/lib/friction-presets";
import { FrictionPoint } from "@/store/userStore";

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
  const preferredLanguages = useUserStore((state) => state.preferredLanguages);
  const uid = useUserStore((state) => state.uid);
  const { logout, signInWithGoogle, isLoading } = useFirebaseAuth();
  const setInterests = useUserStore((state) => state.setInterests);
  const setVideoGenres = useUserStore((state) => state.setVideoGenres);
  const setPreferredLanguages = useUserStore((state) => state.setPreferredLanguages);
  const [mounted, setMounted] = useState(false);

  const [isEditingInterests, setIsEditingInterests] = useState(false);
  const [tempInterests, setTempInterests] = useState<string[]>(interests);

  const [isEditingVideoGenres, setIsEditingVideoGenres] = useState(false);
  const [tempVideoGenres, setTempVideoGenres] = useState<string[]>(videoGenres || []);

  const [isEditingLanguages, setIsEditingLanguages] = useState(false);
  const [tempLanguages, setTempLanguages] = useState<string[]>(preferredLanguages || []);
  const [languageSearch, setLanguageSearch] = useState('');

  const lastBackupDate = useUserStore((state) => state.lastBackupDate);
  const autoBackupTime = useUserStore((state) => state.autoBackupTime);
  const setAutoBackupTime = useUserStore((state) => state.setAutoBackupTime);
  const syncWithFirebase = useUserStore((state) => state.syncWithFirebase);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [pendingBackupTime, setPendingBackupTime] = useState<string>('');
  const [isEditingBackupTime, setIsEditingBackupTime] = useState(false);
  const setNavigationSource = useUserStore((state) => state.setNavigationSource);
  const frictionPoints = useUserStore((state) => state.frictionPoints);
  const setFrictionPoints = useUserStore((state) => state.setFrictionPoints);
  const removeFrictionPoint = useUserStore((state) => state.removeFrictionPoint);
  const addFrictionPoint = useUserStore((state) => state.addFrictionPoint);

  const [isAddingFriction, setIsAddingFriction] = useState(false);
  const [selectedPresetForConfig, setSelectedPresetForConfig] = useState<typeof FRICTION_PRESETS[0] | null>(null);
  const [configTimes, setConfigTimes] = useState({ start: '09:00', end: '10:00' });
  const [isCreatingCustomFriction, setIsCreatingCustomFriction] = useState(false);
  const [customFriction, setCustomFriction] = useState({ label: '', start: '09:00', end: '10:00' });
  const [editingFrictionId, setEditingFrictionId] = useState<string | null>(null);
  const [tempFrictionTime, setTempFrictionTime] = useState({ start: '', end: '' });

  useEffect(() => {
    setMounted(true);
    setNavigationSource('profile');
  }, [setNavigationSource]);

  useEffect(() => {
    // Sync the pending input with whatever is already saved
    if (autoBackupTime) setPendingBackupTime(autoBackupTime);
  }, [autoBackupTime]);

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

  const handleSaveBackupTime = () => {
    if (pendingBackupTime) {
      setAutoBackupTime(pendingBackupTime);
    }
    setIsEditingBackupTime(false);
  };

  const handleClearBackupTime = () => {
    setAutoBackupTime(null);
    setPendingBackupTime('');
    setIsEditingBackupTime(false);
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

  const handleToggleLanguage = (id: string) => {
    if (tempLanguages.includes(id)) {
      setTempLanguages(tempLanguages.filter(l => l !== id));
    } else {
      setTempLanguages([...tempLanguages, id]);
    }
  };

  const handleSaveLanguages = () => {
    setPreferredLanguages(tempLanguages);
    setIsEditingLanguages(false);
  };

  const filteredLanguages = ALL_LANGUAGES.filter(lang =>
    lang.label.toLowerCase().includes(languageSearch.toLowerCase())
  );

  const handleUpdateFrictionTime = (id: string) => {
    const updated = frictionPoints.map(p => 
      p.id === id ? { ...p, startTime: tempFrictionTime.start, endTime: tempFrictionTime.end } : p
    );
    setFrictionPoints(updated);
    setEditingFrictionId(null);
  };

  const handleAddPresetFriction = (preset: typeof FRICTION_PRESETS[0]) => {
    setSelectedPresetForConfig(preset);
    setConfigTimes({ start: preset.defaultStart, end: preset.defaultEnd });
  };

  const handleConfirmPresetFriction = () => {
    if (selectedPresetForConfig) {
      addFrictionPoint({
        type: selectedPresetForConfig.type,
        label: selectedPresetForConfig.label,
        startTime: configTimes.start,
        endTime: configTimes.end,
        days: [1, 2, 3, 4, 5]
      });
      setSelectedPresetForConfig(null);
      setIsAddingFriction(false);
    }
  };

  const handleCreateCustomFriction = () => {
    if (customFriction.label) {
      addFrictionPoint({
        type: 'custom',
        label: customFriction.label,
        startTime: customFriction.start,
        endTime: customFriction.end,
        days: [1, 2, 3, 4, 5]
      });
      setCustomFriction({ label: '', start: '09:00', end: '10:00' });
      setIsCreatingCustomFriction(false);
      setIsAddingFriction(false);
    }
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-card rounded-[2.5rem] p-8 space-y-2 shadow-neo-out border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
            <Leaf size={80} />
          </div>
          <p className="text-foreground/40 font-bold uppercase tracking-widest text-xs">Total Progress</p>
          <p className="text-6xl font-black italic tracking-tighter text-accent">{Math.floor(stats.totalMinutesSaved)}</p>
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-card rounded-[2.5rem] p-8 space-y-4 shadow-neo-out border border-white/5 flex flex-col justify-between">
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

        <div className="bg-card rounded-[2.5rem] p-8 space-y-4 shadow-neo-out border border-white/5 flex flex-col justify-between">
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

        <div className="bg-card rounded-[2.5rem] p-8 space-y-4 shadow-neo-out border border-white/5 flex flex-col justify-between md:col-span-2">
          <div className="flex justify-between items-center mb-2">
            <p className="text-foreground/40 font-bold uppercase tracking-widest text-xs">Content Language</p>
            <button
              onClick={() => {
                setTempLanguages(preferredLanguages || []);
                setIsEditingLanguages(!isEditingLanguages);
                setLanguageSearch('');
              }}
              className={`p-2 rounded-xl shadow-neo-out transition-all ${isEditingLanguages ? 'text-red-500' : 'text-accent'}`}
            >
              {isEditingLanguages ? <X size={18} /> : <Settings2 size={18} />}
            </button>
          </div>

          {isEditingLanguages ? (
            <div className="space-y-6 animate-in fade-in zoom-in duration-300">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/20 group-focus-within:text-accent transition-colors" size={20} />
                <input
                  type="text"
                  placeholder="Search languages..."
                  value={languageSearch}
                  onChange={(e) => setLanguageSearch(e.target.value)}
                  className="w-full bg-card py-4 pl-12 pr-4 rounded-2xl shadow-neo-out focus:shadow-neo-in focus:outline-none transition-all font-bold"
                />
              </div>

              {tempLanguages.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tempLanguages.map(id => {
                    const lang = ALL_LANGUAGES.find(l => l.id === id);
                    return (
                      <div key={id} className="px-4 py-2 bg-accent/10 text-accent rounded-full text-[10px] font-black flex items-center gap-2 animate-in zoom-in duration-300">
                        {lang?.label}
                        <XIcon size={14} className="cursor-pointer" onClick={() => handleToggleLanguage(id)} />
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="max-h-[250px] overflow-y-auto pr-2 space-y-2 custom-scrollbar shadow-neo-in rounded-3xl p-4">
                {filteredLanguages.length > 0 ? (
                  filteredLanguages.map((lang) => {
                    const isSelected = tempLanguages.includes(lang.id);
                    return (
                      <div
                        key={lang.id}
                        onClick={() => handleToggleLanguage(lang.id)}
                        className={`flex items-center justify-between p-3 rounded-xl transition-all cursor-pointer ${isSelected
                          ? 'bg-accent text-white'
                          : 'hover:bg-foreground/5 text-foreground/40'
                          }`}
                      >
                        <span className="font-bold text-xs uppercase tracking-wider">{lang.label}</span>
                        {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                      </div>
                    );
                  })
                ) : (
                  <p className="py-8 text-center text-foreground/30 font-bold text-sm">No languages found.</p>
                )}
              </div>

              <button
                onClick={handleSaveLanguages}
                disabled={tempLanguages.length < 1}
                className="w-full py-4 bg-accent text-white rounded-2xl font-black shadow-neo-out active:shadow-neo-in active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Check size={20} />
                SAVE LANGUAGE PREFERENCES
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {preferredLanguages && preferredLanguages.length > 0 ? preferredLanguages.map(l => {
                const lang = ALL_LANGUAGES.find(opt => opt.id === l);
                return (
                  <span key={l} className="px-4 py-2 bg-accent/10 text-accent rounded-full text-sm font-bold capitalize">
                    {lang?.label || l}
                  </span>
                );
              }) : <p className="text-foreground/40 text-sm">No languages selected.</p>}
            </div>
          )}
        </div>

        <div className="bg-card rounded-[2.5rem] p-8 space-y-4 shadow-neo-out border border-white/5 flex flex-col justify-between md:col-span-2">
          <div className="flex justify-between items-center mb-2">
            <div className="space-y-1">
              <p className="text-foreground/40 font-bold uppercase tracking-widest text-xs">Recurring Friction</p>
              <h3 className="text-lg font-black uppercase">Your Idle Schedules</h3>
            </div>
            <button
              onClick={() => {
                setIsAddingFriction(!isAddingFriction);
                setIsCreatingCustomFriction(false);
              }}
              className={`p-2 rounded-xl shadow-neo-out transition-all ${isAddingFriction ? 'text-red-500' : 'text-accent'}`}
            >
              {isAddingFriction ? <X size={18} /> : <Settings2 size={18} />}
            </button>
          </div>

          {isAddingFriction ? (
            <div className="space-y-6 animate-in fade-in zoom-in duration-300">
              <div className="flex justify-between items-center">
                <p className="text-xs font-bold text-foreground/40 italic">
                  {selectedPresetForConfig ? `Configure your ${selectedPresetForConfig.label} time:` : isCreatingCustomFriction ? 'Define your custom idle period:' : 'Select a friction type or create your own:'}
                </p>
                <button
                  onClick={() => {
                    if (selectedPresetForConfig) {
                      setSelectedPresetForConfig(null);
                    } else {
                      setIsCreatingCustomFriction(!isCreatingCustomFriction);
                    }
                  }}
                  className="text-[10px] font-black uppercase tracking-widest text-accent hover:underline"
                >
                  {selectedPresetForConfig ? '← Change Preset' : isCreatingCustomFriction ? '← Back to Presets' : '+ Create Custom'}
                </button>
              </div>

              {selectedPresetForConfig ? (
                <div className="bg-foreground/[0.02] rounded-3xl p-6 border border-accent/20 space-y-4 shadow-neo-in animate-in slide-in-from-right-4 duration-300">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-4 bg-accent/10 text-accent rounded-2xl">
                      <selectedPresetForConfig.icon size={24} />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-black uppercase text-lg">{selectedPresetForConfig.label}</h4>
                      <p className="text-xs font-bold text-foreground/40">{selectedPresetForConfig.description}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-tighter text-foreground/40 px-2">Window Starts</label>
                      <div className="relative group/time">
                        <input
                          type="time"
                          value={configTimes.start}
                          onChange={(e) => setConfigTimes({ ...configTimes, start: e.target.value })}
                          className="w-full bg-card py-4 px-5 rounded-2xl shadow-neo-out focus:shadow-neo-in focus:outline-none transition-all font-black text-lg text-accent border border-transparent focus:border-accent/20"
                        />
                        <Clock size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground/20 pointer-events-none group-focus-within/time:text-accent transition-colors" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-tighter text-foreground/40 px-2">Window Ends</label>
                      <div className="relative group/time">
                        <input
                          type="time"
                          value={configTimes.end}
                          onChange={(e) => setConfigTimes({ ...configTimes, end: e.target.value })}
                          className="w-full bg-card py-4 px-5 rounded-2xl shadow-neo-out focus:shadow-neo-in focus:outline-none transition-all font-black text-lg text-accent border border-transparent focus:border-accent/20"
                        />
                        <Clock size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground/20 pointer-events-none group-focus-within/time:text-accent transition-colors" />
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleConfirmPresetFriction}
                    className="w-full py-4 bg-accent text-white rounded-2xl font-black shadow-neo-out active:shadow-neo-in active:scale-95 transition-all mt-4"
                  >
                    ADD TO SCHEDULE
                  </button>
                </div>
              ) : isCreatingCustomFriction ? (
                <div className="bg-foreground/[0.02] rounded-3xl p-6 border border-accent/20 space-y-4 shadow-neo-in animate-in slide-in-from-right-4 duration-300">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-tighter text-foreground/40 px-2">Label</label>
                    <input
                      type="text"
                      placeholder="e.g., Morning Walk, Game Breaks..."
                      value={customFriction.label}
                      onChange={(e) => setCustomFriction({ ...customFriction, label: e.target.value })}
                      className="w-full bg-card py-3 px-4 rounded-2xl shadow-neo-out focus:shadow-neo-in focus:outline-none transition-all font-bold text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-tighter text-foreground/40 px-2">Start</label>
                      <input
                        type="time"
                        value={customFriction.start}
                        onChange={(e) => setCustomFriction({ ...customFriction, start: e.target.value })}
                        className="w-full bg-card py-3 px-4 rounded-2xl shadow-neo-out focus:shadow-neo-in focus:outline-none transition-all font-bold text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-tighter text-foreground/40 px-2">End</label>
                      <input
                        type="time"
                        value={customFriction.end}
                        onChange={(e) => setCustomFriction({ ...customFriction, end: e.target.value })}
                        className="w-full bg-card py-3 px-4 rounded-2xl shadow-neo-out focus:shadow-neo-in focus:outline-none transition-all font-bold text-sm"
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleCreateCustomFriction}
                    disabled={!customFriction.label}
                    className="w-full py-4 bg-accent text-white rounded-2xl font-black shadow-neo-out active:shadow-neo-in active:scale-95 transition-all disabled:opacity-50 mt-2"
                  >
                    CREATE CATEGORY
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {FRICTION_PRESETS.filter(p => !frictionPoints.some(fp => fp.type === p.type)).map((preset) => {
                  const Icon = preset.icon;
                  return (
                    <button
                      key={preset.type}
                      onClick={() => handleAddPresetFriction(preset)}
                      className="flex items-center gap-4 p-4 bg-card rounded-2xl shadow-neo-out hover:scale-[1.02] active:scale-95 transition-all text-left group"
                    >
                      <div className="p-3 bg-accent/10 text-accent rounded-xl group-hover:bg-accent group-hover:text-white transition-colors">
                        <Icon size={20} />
                      </div>
                      <span className="font-black text-xs uppercase tracking-wider">{preset.label}</span>
                    </button>
                  );
                })}
                </div>
              )}
              {FRICTION_PRESETS.length === frictionPoints.length && (
                <p className="text-center text-foreground/30 font-bold py-4">All presets added!</p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {frictionPoints.length > 0 ? frictionPoints.map((point) => {
                const preset = FRICTION_PRESETS.find(p => p.type === point.type);
                const Icon = preset?.icon || Clock;
                const isEditing = editingFrictionId === point.id;

                return (
                  <div key={point.id} className="relative group bg-foreground/[0.02] rounded-3xl p-5 border border-foreground/5 hover:border-accent/10 transition-all">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-4">
                        <div className="p-3 bg-card rounded-2xl shadow-neo-out text-accent">
                          <Icon size={20} />
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-black text-sm uppercase tracking-tight">{point.label}</h4>
                          {isEditing ? (
                            <div className="flex items-center gap-2 mt-2">
                              <input
                                type="time"
                                value={tempFrictionTime.start}
                                onChange={(e) => setTempFrictionTime({ ...tempFrictionTime, start: e.target.value })}
                                className="bg-card text-[10px] font-black p-1 rounded-md shadow-neo-in focus:outline-none"
                              />
                              <span className="text-[10px] opacity-20">to</span>
                              <input
                                type="time"
                                value={tempFrictionTime.end}
                                onChange={(e) => setTempFrictionTime({ ...tempFrictionTime, end: e.target.value })}
                                className="bg-card text-[10px] font-black p-1 rounded-md shadow-neo-in focus:outline-none"
                              />
                            </div>
                          ) : (
                            <p className="text-xs font-bold text-foreground/40">
                              {point.startTime} — {point.endTime}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            if (isEditing) {
                              handleUpdateFrictionTime(point.id);
                            } else {
                              setEditingFrictionId(point.id);
                              setTempFrictionTime({ start: point.startTime, end: point.endTime });
                            }
                          }}
                          className="p-2 bg-card rounded-xl shadow-neo-out text-accent hover:scale-110 active:scale-95 transition-all"
                        >
                          {isEditing ? <Check size={14} /> : <Settings2 size={14} />}
                        </button>
                        <button
                          onClick={() => removeFrictionPoint(point.id)}
                          className="p-2 bg-card rounded-xl shadow-neo-out text-red-500 hover:scale-110 active:scale-95 transition-all"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              }) : (
                <div className="col-span-full py-8 text-center bg-foreground/[0.02] rounded-3xl border border-dashed border-foreground/10">
                  <p className="text-foreground/30 font-bold italic text-sm">No idle schedules defined yet.</p>
                  <button
                    onClick={() => setIsAddingFriction(true)}
                    className="text-xs text-accent font-black uppercase tracking-widest mt-2 hover:underline"
                  >
                    + Add Your First Friction Point
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <div className="bg-card rounded-[2.5rem] p-8 space-y-6 shadow-neo-out border border-white/5">
          <div className="space-y-1">
            <p className="text-foreground/40 font-bold uppercase tracking-widest text-xs">Performance Analysis</p>
            <h3 className="text-2xl font-black italic">GAME SESSION ANALYTICS</h3>
          </div>

          <div className="overflow-x-auto -mx-2 sm:mx-0">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-foreground/5">
                  <th className="py-4 px-2 text-[10px] font-black text-foreground/30 uppercase tracking-widest w-[30%]">Game</th>
                  <th className="py-4 px-2 text-[10px] font-black text-foreground/30 uppercase tracking-widest text-center w-[15%]">Plays</th>
                  <th className="py-4 px-2 text-[10px] font-black text-foreground/30 uppercase tracking-widest text-center w-[15%]">Wins</th>
                  <th className="py-4 px-2 text-[10px] font-black text-foreground/30 uppercase tracking-widest text-center w-[20%]">Loss/Quit</th>
                  <th className="py-4 px-2 text-[10px] font-black text-foreground/30 uppercase tracking-widest text-center w-[20%]">Avg Time</th>
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
      </div>

      <div className="flex justify-center">
        <div className="bg-card rounded-[2.5rem] p-8 space-y-6 shadow-neo-out border border-white/5 w-full max-w-2xl group">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <p className="text-foreground/40 font-bold uppercase tracking-widest text-xs">Cloud Backup</p>
              <h3 className="text-xl font-black italic">KEEP YOUR PROGRESS SAFE</h3>
            </div>
            <div className="p-3 bg-accent/10 text-accent rounded-2xl">
              <CloudUpload size={24} />
            </div>
          </div>

          {/* Last backup info */}
          <div className="bg-foreground/5 p-4 rounded-2xl space-y-1">
            <p className="text-[10px] font-black text-foreground/40 uppercase tracking-tighter">Last Backup</p>
            <p className="text-xs font-bold">{lastBackupDate ? new Date(lastBackupDate).toLocaleString() : 'Never'}</p>
          </div>

          {/* Auto-backup scheduler — only visible when signed in */}
          {uid && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-foreground/40" />
                  <p className="text-[10px] font-black text-foreground/40 uppercase tracking-tighter">Daily Auto-Backup</p>
                </div>
                {autoBackupTime && !isEditingBackupTime && (
                  <span className="flex items-center gap-1 px-3 py-1 bg-accent/10 text-accent rounded-full text-[10px] font-black">
                    <Bell size={10} />
                    {/* Format to 12-hour display */}
                    {(() => {
                      const [hh, mm] = autoBackupTime.split(':').map(Number);
                      const period = hh >= 12 ? 'PM' : 'AM';
                      const h12 = hh % 12 || 12;
                      return `${h12}:${String(mm).padStart(2, '0')} ${period}`;
                    })()}
                  </span>
                )}
              </div>

              {isEditingBackupTime ? (
                <div className="space-y-3 animate-in fade-in zoom-in duration-200">
                  <div className="flex items-center gap-3">
                    <input
                      id="auto-backup-time"
                      type="time"
                      value={pendingBackupTime}
                      onChange={(e) => setPendingBackupTime(e.target.value)}
                      className="flex-1 bg-card py-3 px-4 rounded-2xl shadow-neo-in focus:outline-none font-black text-sm text-accent tracking-wider"
                    />
                    <button
                      onClick={handleSaveBackupTime}
                      disabled={!pendingBackupTime}
                      className="p-3 bg-accent text-white rounded-2xl shadow-neo-out active:shadow-neo-in active:scale-95 transition-all disabled:opacity-40"
                    >
                      <Check size={18} />
                    </button>
                    <button
                      onClick={() => setIsEditingBackupTime(false)}
                      className="p-3 bg-card rounded-2xl shadow-neo-out active:shadow-neo-in active:scale-95 transition-all text-foreground/40"
                    >
                      <X size={18} />
                    </button>
                  </div>
                  {autoBackupTime && (
                    <button
                      onClick={handleClearBackupTime}
                      className="w-full py-3 rounded-2xl font-black text-xs text-red-400 bg-red-500/5 shadow-neo-out hover:scale-[1.01] active:scale-95 active:shadow-neo-in transition-all flex items-center justify-center gap-2"
                    >
                      <BellOff size={14} />
                      DISABLE AUTO-BACKUP
                    </button>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setIsEditingBackupTime(true)}
                  className="w-full py-3 rounded-2xl font-black text-xs text-foreground/50 bg-foreground/5 shadow-neo-out hover:scale-[1.01] active:scale-95 active:shadow-neo-in transition-all flex items-center justify-center gap-2"
                >
                  <Clock size={14} />
                  {autoBackupTime ? 'CHANGE BACKUP TIME' : 'SET DAILY BACKUP TIME'}
                </button>
              )}
            </div>
          )}

          {/* Manual sync / sign-in CTA */}
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

