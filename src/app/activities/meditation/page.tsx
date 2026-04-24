'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useUserStore } from "@/store/userStore";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { ArrowLeft, Leaf, Play, Pause, Volume2, VolumeX, RotateCcw, CheckCircle2, Sparkles, Compass } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const CALM_MUSIC_URL = "https://cdn.pixabay.com/audio/2022/05/27/audio_1808f3030c.mp3";

const MORNING_PROMPTS = [
  "Take a moment to observe your current thoughts. What is your intention for the next few hours?",
  "Focus on your breath. What is one thing you want to cultivate in your mind right now?",
  "If your thoughts were a landscape, what would it look like in this moment?",
  "What is a small thing you can do for yourself today to maintain your peace?"
];

const EVENING_PROMPTS = [
  "The day is winding down. What was the most meaningful interaction you had today?",
  "Reflect on your day: What is one thing you're proud of, no matter how small?",
  "As the sun sets, what tension from today are you ready to release?",
  "What was a moment of unexpected joy or peace in your day today?"
];

type Step = 'prompt' | 'timer' | 'complete';

export default function MeditationPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<Step>('prompt');
  const [currentPrompt, setCurrentPrompt] = useState("");
  
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [selectedDuration, setSelectedDuration] = useState(60);
  const [musicEnabled, setMusicEnabled] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const completeActivity = useUserStore(state => state.completeActivity);
  const updateStats = useUserStore(state => state.updateStats);

  useEffect(() => {
    setMounted(true);
    const hour = new Date().getHours();
    const pool = hour >= 16 ? EVENING_PROMPTS : MORNING_PROMPTS;
    setCurrentPrompt(pool[Math.floor(Math.random() * pool.length)]);
  }, []);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleComplete();
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft]);

  useEffect(() => {
    if (audioRef.current) {
      if (musicEnabled && isActive) {
        audioRef.current.play().catch(() => setMusicEnabled(false));
      } else {
        audioRef.current.pause();
      }
    }
  }, [musicEnabled, isActive]);

  const handleStart = () => {
    setIsActive(true);
  };

  const handlePause = () => {
    setIsActive(false);
  };

  const handleReset = () => {
    setIsActive(false);
    setTimeLeft(selectedDuration);
  };

  const handleComplete = () => {
    setIsActive(false);
    completeActivity('meditation');
    updateStats(Math.floor(selectedDuration / 60));
    setStep('complete');
    if (audioRef.current) audioRef.current.pause();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!mounted) return null;

  if (step === 'complete') {
    return (
      <main className="min-h-screen bg-background p-6 sm:p-8 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-700">
        <div className="max-w-md w-full text-center space-y-8">
          <div className="w-24 h-24 bg-accent/10 rounded-full flex items-center justify-center mx-auto shadow-neo-out border border-accent/20">
            <CheckCircle2 className="w-12 h-12 text-accent" />
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl font-black text-foreground">Centered.</h1>
            <p className="text-foreground/60 font-medium italic">
              "The soul always knows what to do to heal itself. The challenge is to silence the mind."
            </p>
          </div>
          <button
            onClick={() => router.push('/activities')}
            className="w-full py-4 bg-accent text-white rounded-2xl font-black shadow-neo-out hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            CONTINUE
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background p-6 sm:p-8 animate-in fade-in duration-700">
      <audio ref={audioRef} src={CALM_MUSIC_URL} loop />
      
      <div className="max-w-3xl mx-auto space-y-12">
        <header className="flex justify-between items-start">
          <div className="space-y-2">
            <Link href="/activities" className="inline-flex items-center text-accent hover:text-accent/80 font-medium uppercase tracking-widest text-sm transition-colors mb-2">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Activities
            </Link>
            <h1 className="text-5xl font-extrabold tracking-tight">Meditation</h1>
          </div>
          <ThemeToggle />
        </header>

        {step === 'prompt' ? (
          <section className="bg-card rounded-[2.5rem] p-8 sm:p-12 shadow-neo-out border border-white/5 text-center space-y-10 animate-in slide-in-from-bottom-8 duration-700 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 opacity-5 rotate-12">
              <Compass size={240} className="text-accent" />
            </div>
            
            <div className="space-y-6 relative z-10">
              <div className="w-20 h-20 bg-accent/10 rounded-3xl flex items-center justify-center mx-auto shadow-neo-in mb-4">
                <Sparkles className="w-10 h-10 text-accent" />
              </div>
              <p className="text-accent font-black uppercase tracking-[0.3em] text-xs">Reflection Moment</p>
              <h2 className="text-3xl sm:text-4xl font-black leading-tight max-w-xl mx-auto italic">
                "{currentPrompt}"
              </h2>
              <p className="text-foreground/40 font-medium max-w-sm mx-auto">
                Hold this thought in your mind as we begin our timed session.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 relative z-10">
              {[60, 120].map((d) => (
                <button
                  key={d}
                  onClick={() => {
                    setSelectedDuration(d);
                    setTimeLeft(d);
                    setStep('timer');
                    setIsActive(true); // Start automatically
                  }}
                  className="p-6 bg-card rounded-[2rem] shadow-neo-out hover:scale-[1.02] active:scale-[0.98] transition-all group border border-white/5"
                >
                  <p className="text-accent font-black text-2xl mb-1">{d / 60} MIN</p>
                  <p className="text-[10px] text-foreground/40 font-bold uppercase tracking-widest group-hover:text-accent transition-colors">Start Session</p>
                </button>
              ))}
            </div>
          </section>
        ) : (
          <section className="bg-card rounded-[2.5rem] p-8 sm:p-16 shadow-neo-out border border-white/5 text-center space-y-12 relative overflow-hidden animate-in zoom-in duration-500">
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-accent/5 rounded-full blur-3xl transition-all duration-1000 ${isActive ? 'scale-150 opacity-100' : 'scale-100 opacity-0'}`} />
            
            <div className="space-y-6 relative z-10">
              <div className={`w-24 h-24 bg-accent/10 rounded-full flex items-center justify-center mx-auto shadow-neo-in mb-8 transition-transform duration-1000 ${isActive ? 'scale-110' : ''}`}>
                <Leaf className={`w-12 h-12 text-accent transition-all duration-1000 ${isActive ? 'animate-pulse' : ''}`} />
              </div>
              
              <div className="space-y-2">
                <div className="text-8xl sm:text-9xl font-black tracking-tighter tabular-nums text-foreground drop-shadow-sm">
                  {formatTime(timeLeft)}
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center gap-8 relative z-10">
              <div className="flex items-center gap-6">
                <button
                  onClick={() => setMusicEnabled(!musicEnabled)}
                  className={`p-5 rounded-2xl shadow-neo-out transition-all hover:scale-105 active:scale-95 ${musicEnabled ? 'text-accent shadow-neo-in' : 'text-foreground/40'}`}
                  title={musicEnabled ? "Disable Music" : "Enable Music"}
                >
                  {musicEnabled ? <Volume2 size={28} /> : <VolumeX size={28} />}
                </button>

                {isActive ? (
                  <button
                    onClick={handlePause}
                    className="w-24 h-24 bg-accent text-white rounded-full flex items-center justify-center shadow-neo-out hover:scale-105 active:scale-95 transition-all"
                  >
                    <Pause size={40} fill="currentColor" />
                  </button>
                ) : (
                  <button
                    onClick={handleStart}
                    className="w-24 h-24 bg-accent text-white rounded-full flex items-center justify-center shadow-neo-out hover:scale-105 active:scale-95 transition-all pl-2"
                  >
                    <Play size={40} fill="currentColor" />
                  </button>
                )}

                <button
                  onClick={handleReset}
                  className="p-5 rounded-2xl shadow-neo-out transition-all hover:scale-105 active:scale-95 text-foreground/40"
                  title="Reset Timer"
                >
                  <RotateCcw size={28} />
                </button>
              </div>
            </div>
          </section>
        )}

        <footer className="text-center pb-8">
          <p className="text-foreground/40 font-medium italic animate-pulse">
            {step === 'prompt' ? "Read the prompt and choose a duration." : (isActive ? "Breathe in... Breathe out..." : "Session paused.")}
          </p>
        </footer>
      </div>
    </main>
  );
}
