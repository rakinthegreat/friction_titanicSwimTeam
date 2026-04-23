'use client';

import { useUserStore } from "@/store/userStore";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { LogOut, ArrowLeft, CloudUpload, Settings2, Check, X, Laptop, History, Puzzle, Languages, FlaskConical, Brain, Leaf } from "lucide-react";
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

export default function Profile() {
  const stats = useUserStore((state) => state.stats);
  const interests = useUserStore((state) => state.interests);
  const uid = useUserStore((state) => state.uid);
  const { logout, signInWithGoogle, isLoading } = useFirebaseAuth();
  const setInterests = useUserStore((state) => state.setInterests);
  const [mounted, setMounted] = useState(false);
  const [isEditingInterests, setIsEditingInterests] = useState(false);
  const [tempInterests, setTempInterests] = useState<string[]>(interests);

  useEffect(() => {
    setMounted(true);
  }, []);

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
        
        <div className="bg-card rounded-[2.5rem] p-8 space-y-4 shadow-neo-out border border-white/5 md:col-span-2">
          <div className="flex justify-between items-center mb-2">
            <p className="text-foreground/40 font-bold uppercase tracking-widest text-xs">Interests</p>
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

        <div className="bg-card rounded-[2.5rem] p-8 space-y-4 shadow-neo-out border border-white/5 md:col-span-2 group">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <p className="text-foreground/40 font-bold uppercase tracking-widest text-xs">Data Sync</p>
              <h3 className="text-xl font-black">{uid ? 'Cloud Synced' : 'Cloud Backup'}</h3>
              <p className="text-sm text-foreground/60 font-medium">
                {uid ? 'Your data is being backed up to Firebase.' : 'Keep your progress safe across devices.'}
              </p>
            </div>
            <div className={`p-3 rounded-2xl ${uid ? 'bg-accent/20 text-accent' : 'bg-accent/10 text-accent'} group-hover:scale-110 transition-transform`}>
              <CloudUpload size={24} />
            </div>
          </div>
          <button 
            onClick={uid ? undefined : signInWithGoogle}
            disabled={isLoading}
            className={`w-full py-4 rounded-2xl font-black shadow-neo-out transition-all ${
              uid 
                ? 'bg-card text-accent opacity-50 cursor-default' 
                : 'bg-accent text-white hover:scale-[1.02] active:scale-[0.98]'
            }`}
          >
            {isLoading ? 'Connecting...' : uid ? 'Backup Active' : 'Sign in to Backup'}
          </button>
        </div>
      </section>

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
