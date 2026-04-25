'use client';

import { useUserStore } from "@/store/userStore";
import { BackButton } from "@/components/ui/BackButton";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { ArrowLeft, MapPin, Accessibility, Timer, CheckCircle2, History, Send, Loader2, Sparkles, UserCircle, Zap } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { generateChallenge } from "./actions";

type Step = 'context' | 'loading' | 'active' | 'reflect' | 'summary';

export default function ChallengesPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<Step>('context');
  const [location, setLocation] = useState('');
  const [posture, setPosture] = useState('');
  const [vibe, setVibe] = useState('Introverted');
  const [energy, setEnergy] = useState('Chill');
  const [currentChallenge, setCurrentChallenge] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [reflection, setReflection] = useState('');
  const [isDoneDisabled, setIsDoneDisabled] = useState(true);

  const addRealLifeChallenge = useUserStore(state => state.addRealLifeChallenge);
  const completeRealLifeChallenge = useUserStore(state => state.completeRealLifeChallenge);
  const history = useUserStore(state => state.realLifeChallenges);
  const [activeChallengeId, setActiveChallengeId] = useState<string | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleStartChallenge = async () => {
    if (!location || !posture) return;
    setStep('loading');

    const result = await generateChallenge({ location, posture, vibe, energy }, history);

    if (result.success && result.challenge) {
      const challengeData = result.challenge;
      setCurrentChallenge(challengeData);
      setTimeLeft(challengeData.estimatedTime);
      setIsDoneDisabled(true);

      const id = addRealLifeChallenge({
        challenge: challengeData.challenge,
        context: { location, posture, vibe, energy },
        estimatedTime: challengeData.estimatedTime
      });
      setActiveChallengeId(id);
      setStep('active');

      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            setIsDoneDisabled(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      alert("Failed to generate challenge. Try again!");
      setStep('context');
    }
  };

  const handleComplete = () => {
    setStep('reflect');
  };

  const handleSaveReflection = () => {
    if (activeChallengeId) {
      completeRealLifeChallenge(activeChallengeId, reflection);
    }
    setStep('summary');
  };

  const resetChallenge = () => {
    setStep('context');
    setLocation('');
    setPosture('');
    setVibe('Introverted');
    setEnergy('Chill');
    setCurrentChallenge(null);
    setReflection('');
  };

  if (!mounted) return null;

  return (
    <main className="min-h-screen p-8 max-w-4xl mx-auto space-y-12 animate-in fade-in duration-1000">
      <header className="flex justify-between items-start">
        <div className="space-y-2">
          <BackButton href="/" className="text-accent" />
          <h1 className="text-5xl font-extrabold tracking-tight">Real-Life <span className="text-accent italic">Challenge</span></h1>
          <p className="text-foreground/60 font-medium">Break the digital wall and interact with the world.</p>
        </div>
        <ThemeToggle />
      </header>

      <section className={`${step === 'summary' ? '' : 'bg-card p-10 border border-black/5'} rounded-[2.5rem] relative overflow-hidden`}>
        {step === 'context' && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-6">
              <h2 className="text-2xl font-black flex items-center gap-3">
                <MapPin className="text-accent" /> Where are you now?
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                  'Vehicle', 'Crowded Place', 'Open Space',
                  'Cafe / Shop', 'Waiting Room', 'Home',
                  'Work / Office', 'Nature / Park', 'Transit Hub'
                ].map((loc) => (
                  <button
                    key={loc}
                    onClick={() => setLocation(loc)}
                    className={`py-5 px-3 rounded-3xl font-black text-[10px] uppercase tracking-wider transition-all ${location === loc ? 'bg-accent text-white shadow-neo-in' : 'bg-card text-foreground/40 shadow-neo-out hover:scale-105'
                      }`}
                  >
                    {loc}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-2xl font-black flex items-center gap-3">
                <Accessibility className="text-accent-secondary" /> What's your posture?
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {['Sitting', 'Standing'].map((p) => (
                  <button
                    key={p}
                    onClick={() => setPosture(p)}
                    className={`py-6 px-4 rounded-3xl font-black text-sm uppercase tracking-wider transition-all ${posture === p ? 'bg-accent-secondary text-white shadow-neo-in' : 'bg-card text-foreground/40 shadow-neo-out hover:scale-105'
                      }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h2 className="text-xl font-black flex items-center gap-3">
                  <UserCircle className="text-accent" /> Social Vibe
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  {['Introverted', 'Extroverted'].map((v) => (
                    <button
                      key={v}
                      onClick={() => setVibe(v)}
                      className={`py-4 px-3 rounded-2xl font-black text-[10px] uppercase tracking-wider transition-all ${vibe === v ? 'bg-accent text-white shadow-neo-in' : 'bg-card text-foreground/40 shadow-neo-out hover:scale-105'
                        }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <h2 className="text-xl font-black flex items-center gap-3">
                  <Zap className="text-accent-secondary" /> Energy Level
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  {['Chill', 'Active'].map((e) => (
                    <button
                      key={e}
                      onClick={() => setEnergy(e)}
                      className={`py-4 px-3 rounded-2xl font-black text-[10px] uppercase tracking-wider transition-all ${energy === e ? 'bg-accent-secondary text-white shadow-neo-in' : 'bg-card text-foreground/40 shadow-neo-out hover:scale-105'
                        }`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={handleStartChallenge}
              disabled={!location || !posture}
              className="w-full py-6 bg-accent text-white rounded-3xl font-black text-xl shadow-neo-out hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-20 disabled:grayscale"
            >
              GENERATE CHALLENGE
            </button>
          </div>
        )}

        {step === 'loading' && (
          <div className="py-20 flex flex-col items-center justify-center space-y-6 animate-pulse">
            <div className="relative">
              <Sparkles className="w-16 h-16 text-accent animate-spin-slow" />
              <Loader2 className="w-16 h-16 text-accent absolute inset-0 animate-spin" />
            </div>
            <p className="text-xl font-black text-foreground/60 uppercase tracking-widest">Generating context-aware challenge...</p>
          </div>
        )}

        {step === 'active' && currentChallenge && (
          <div className="space-y-10 animate-in zoom-in duration-500 text-center">
            <div className="space-y-4">
              <p className="text-accent font-black uppercase tracking-[0.3em] text-sm">Active Challenge</p>
              <h2 className="text-4xl font-black leading-tight">{currentChallenge.challenge}</h2>
              <p className="text-foreground/40 font-medium italic">"{currentChallenge.rationale}"</p>
            </div>

            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="relative w-48 h-48 flex items-center justify-center">
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                  <circle
                    cx="96" cy="96" r="88"
                    className="stroke-background fill-none stroke-[8]"
                  />
                  <circle
                    cx="96" cy="96" r="88"
                    className="stroke-accent fill-none stroke-[8] transition-all duration-1000"
                    style={{
                      strokeDasharray: 552.92,
                      strokeDashoffset: 552.92 * (1 - timeLeft / currentChallenge.estimatedTime)
                    }}
                  />
                </svg>
                <div className="text-4xl font-black text-accent tabular-nums flex flex-col items-center">
                  <Timer className="mb-1" size={24} />
                  {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                </div>
              </div>
              <p className="text-sm font-bold text-foreground/40 uppercase tracking-widest">Wait for completion...</p>
            </div>

            <button
              onClick={handleComplete}
              disabled={isDoneDisabled}
              className={`w-full py-6 rounded-3xl font-black text-xl shadow-neo-out transition-all ${isDoneDisabled
                ? 'bg-card text-foreground/20 grayscale cursor-not-allowed'
                : 'bg-green-500 text-white hover:scale-[1.02] active:scale-95'
                }`}
            >
              {isDoneDisabled ? 'STAY FOCUSED...' : 'DONE!'}
            </button>
          </div>
        )}

        {step === 'reflect' && (
          <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
            <div className="space-y-2">
              <h2 className="text-3xl font-black flex items-center gap-3">
                <CheckCircle2 className="text-green-500" /> Challenge Complete!
              </h2>
              <p className="text-foreground/60 font-medium text-lg">How did it feel? (Optional log for your history)</p>
            </div>

            <textarea
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder="Record your experience here..."
              className="w-full h-48 p-6 bg-card rounded-3xl border-none shadow-neo-in focus:ring-2 focus:ring-accent outline-none text-lg font-medium resize-none"
            />

            <button
              onClick={handleSaveReflection}
              className="w-full py-6 bg-accent text-white rounded-3xl font-black text-xl shadow-neo-out hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              <Send size={24} />
              SAVE & CONTINUE
            </button>
          </div>
        )}

        {step === 'summary' && (
          <div className="w-full max-w-2xl mx-auto bg-card rounded-[3rem] p-8 pt-16 text-center space-y-8 shadow-neo-out relative border border-foreground/5 overflow-hidden animate-in zoom-in duration-700">
            <div className="absolute top-6 left-6">
              <BackButton href="/" className="text-accent" />
            </div>

            <div className="w-24 h-24 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 size={48} />
            </div>
            <div className="space-y-2">
              <h2 className="text-4xl font-black">Amazing Work!</h2>
              <p className="text-xl text-foreground/60 font-medium max-w-sm mx-auto">
                You've successfully reclaimed a moment from the digital world.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-6">
              <button
                onClick={resetChallenge}
                className="w-full py-5 bg-card text-foreground/50 rounded-2xl font-black shadow-neo-out hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest"
              >
                ANOTHER ONE?
              </button>
            </div>
          </div>
        )}
      </section>

      {history.length > 0 && step === 'context' && (
        <section className="space-y-8 animate-in fade-in duration-1000 delay-300">
          <div className="flex items-center gap-3">
            <History className="text-foreground/40" />
            <h2 className="text-2xl font-black uppercase tracking-widest text-foreground/40">Recent History</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {history.slice(0, 4).map((h) => (
              <div key={h.id} className="bg-card p-8 rounded-[2rem] shadow-neo-out border border-white/5 space-y-4">
                <div className="flex justify-between items-start">
                  <span className="px-3 py-1 bg-accent/10 text-accent rounded-full text-[10px] font-black uppercase tracking-widest">
                    {new Date(h.timestamp).toLocaleDateString()}
                  </span>
                  {h.status === 'completed' && <CheckCircle2 className="text-green-500" size={20} />}
                </div>
                <h3 className="font-bold text-lg leading-tight">{h.challenge}</h3>
                {h.experience && (
                  <p className="text-sm text-foreground/50 italic border-l-2 border-accent/20 pl-4 py-1">
                    "{h.experience}"
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
