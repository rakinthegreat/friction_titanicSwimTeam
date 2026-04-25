'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Timer, Zap, Trophy, RefreshCw, ArrowLeft, Plus, Minus, HelpCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/userStore';
import { GameTutorial } from '@/components/games/GameTutorial';
import { BackButton } from '@/components/ui/BackButton';

const TUTORIAL_STEPS = [
  "You'll be presented with a mathematical equation.",
  "Pick the correct result from the four options below.",
  "Each correct answer adds a few seconds to your total time.",
  "Solve as many as you can before the clock runs out!"
];

interface Equation {
  text: string;
  answer: number;
}

export default function RapidMathPage() {
  const router = useRouter();
  const updateStats = useUserStore((state) => state.updateStats);
  const persistentHighScore = useUserStore((state) => state.stats?.highScores?.['rapid-math'] || 0);
  const recordGameStart = useUserStore((state) => state.recordGameStart);
  const recordGameResult = useUserStore((state) => state.recordGameResult);
  const startTime = React.useRef<number>(Date.now());
  const gameEnded = React.useRef<boolean>(false);

  const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [score, setScore] = useState(0);
  const [totalTime, setTotalTime] = useState(30);
  const [questionTimeLeft, setQuestionTimeLeft] = useState(5);
  const [equation, setEquation] = useState<Equation>({ text: '', answer: 0 });
  const [options, setOptions] = useState<number[]>([]);
  const [feedback, setFeedback] = useState<{ text: string, type: 'plus' | 'minus' } | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);

  useEffect(() => {
    const hasSeen = localStorage.getItem('tutorial-rapid-math');
    if (!hasSeen) {
      setIsTutorialOpen(true);
      localStorage.setItem('tutorial-rapid-math', 'true');
    }
  }, []);

  const generateEquation = useCallback(() => {
    const operators = ['+', '-', '*'];
    const op = operators[Math.floor(Math.random() * operators.length)];
    let num1: number, num2: number;

    if (op === '+') {
      num1 = Math.floor(Math.random() * 50) + 1;
      num2 = Math.floor(Math.random() * 50) + 1;
    } else if (op === '-') {
      num1 = Math.floor(Math.random() * 50) + 20;
      num2 = Math.floor(Math.random() * num1) + 1;
    } else {
      num1 = Math.floor(Math.random() * 12) + 2;
      num2 = Math.floor(Math.random() * 12) + 2;
    }

    const ans: number = (op === '+') ? num1 + num2 : (op === '-') ? num1 - num2 : num1 * num2;

    const newOptions = new Set<number>();
    newOptions.add(ans);
    while (newOptions.size < 4) {
      const offset = Math.floor(Math.random() * 10) - 5;
      const fakeAnswer: number = ans + offset;
      if (fakeAnswer !== ans && fakeAnswer > 0) newOptions.add(fakeAnswer);
      else newOptions.add(ans + Math.floor(Math.random() * 20) + 1);
    }

    setEquation({ text: `${num1} ${op} ${num2}`, answer: ans });
    setOptions(Array.from(newOptions).sort(() => Math.random() - 0.5));
    setQuestionTimeLeft(5);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (gameState === 'playing') {
      interval = setInterval(() => {
        setTotalTime((prev) => {
          if (prev <= 0.05) {
            setGameState('finished');
            return 0;
          }
          return prev - 0.05;
        });

        setQuestionTimeLeft((prev) => {
          if (prev <= 0.05) {
            generateEquation();
            return 5;
          }
          return prev - 0.05;
        });
      }, 50);
    }

    return () => clearInterval(interval);
  }, [gameState, generateEquation]);

  // Handle Game Finish
  useEffect(() => {
    if (gameState === 'finished' && !gameEnded.current) {
      updateStats(2, 'rapid-math', score);
      useUserStore.getState().completeActivity('rapid-math');

      gameEnded.current = true;
      const timeSpent = (Date.now() - startTime.current) / 1000;
      recordGameResult('rapid-math', 'win', timeSpent);
    }
  }, [gameState, score, updateStats, recordGameResult]);

  const gameStateRef = React.useRef(gameState);
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    return () => {
      if (!gameEnded.current && gameStateRef.current === 'playing') {
        const timeSpent = (Date.now() - startTime.current) / 1000;
        recordGameResult('rapid-math', 'quit', timeSpent);
      }
    };
  }, [recordGameResult]);

  const startGame = () => {
    setScore(0);
    const params = new URLSearchParams(window.location.search);
    const scaledTime = 60; // 1m fixed duration
    setTotalTime(scaledTime);
    setGameState('playing');
    setFeedback(null);
    setIsShaking(false);
    generateEquation();

    // Track game start
    recordGameStart('rapid-math');
    startTime.current = Date.now();
    gameEnded.current = false;
  };

  const showFeedback = (text: string, type: 'plus' | 'minus') => {
    setFeedback({ text, type });
    if (type === 'minus') {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    }
    setTimeout(() => setFeedback(null), 800);
  };

  const handleAnswer = (val: number) => {
    if (val === equation.answer) {
      setScore((s) => s + 1);
      setTotalTime((t) => t + 1);
      showFeedback('1s', 'plus');
      generateEquation();
    } else {
      setTotalTime((t) => Math.max(0, t - 2));
      showFeedback('2s', 'minus');
      generateEquation();
    }
  };

  return (
    <main className="min-h-screen bg-background p-6 flex flex-col items-center">
      <header className="w-full max-w-md flex justify-between items-center mb-12">
        <BackButton href="/" className="text-accent" />
        <h1 className="text-2xl font-black italic tracking-tighter">RAPID MATH</h1>
        <div className="w-12" />
      </header>

      <div className="w-full max-w-md space-y-8 relative">
        {/* Floating Feedback */}
        {feedback && (
          <div className={`absolute -top-12 left-1/2 -translate-x-1/2 flex items-center gap-1 font-black text-2xl animate-in slide-in-from-bottom-4 fade-in duration-300 ${feedback.type === 'plus' ? 'text-green-500' : 'text-red-500'
            }`}>
            {feedback.type === 'plus' ? <Plus size={24} /> : <Minus size={24} />}
            {feedback.text}
          </div>
        )}
        {gameState === 'idle' && (
          <Card className="p-12 text-center space-y-8 shadow-neo-out animate-in zoom-in duration-500">
            <div className="w-24 h-24 bg-accent/10 rounded-[2rem] flex items-center justify-center mx-auto text-accent shadow-neo-in">
              <Zap size={48} fill="currentColor" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-black">Speed Mode</h2>
              <p className="text-foreground/60 font-medium">5s per question. +1s for each correct answer!</p>
            </div>
            <div className="bg-card p-4 rounded-2xl shadow-neo-in">
              <p className="text-xs font-bold text-accent uppercase tracking-widest mb-1">Personal Best</p>
              <p className="text-2xl font-black">{persistentHighScore}</p>
            </div>
            <Button onClick={startGame} className="w-full py-6 text-xl shadow-neo-out">START BLASTING</Button>
          </Card>
        )}

        {gameState === 'playing' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="flex justify-between gap-4">
              <Card className="flex-1 p-4 flex items-center justify-center gap-2 shadow-neo-in bg-accent/5 relative overflow-hidden">
                <Timer className="text-accent" size={20} />
                <span className="text-2xl font-black text-accent">{Math.ceil(totalTime)}s</span>
                <div
                  className="absolute bottom-0 left-0 h-1 bg-accent transition-all duration-1000 ease-linear"
                  style={{ width: `${(totalTime / 30) * 100}%` }}
                />
              </Card>
              <Card className="flex-1 p-4 flex items-center justify-center gap-2 shadow-neo-in bg-accent-secondary/5">
                <Trophy className="text-accent-secondary" size={20} />
                <span className="text-2xl font-black text-accent-secondary">{score}</span>
              </Card>
            </div>

            <Card className={`p-12 text-center shadow-neo-out border-2 border-accent/10 relative overflow-hidden transition-all duration-200 ${isShaking ? 'animate-shake' : ''} ${feedback?.type === 'minus' ? 'border-red-500/50 bg-red-500/5' : ''}`}>
              <div
                className="absolute top-0 left-0 h-2 bg-accent-secondary transition-all duration-75 ease-linear"
                style={{ width: `${(questionTimeLeft / 5) * 100}%` }}
              />
              <p className="text-6xl font-black tracking-tighter text-foreground/90">{equation.text}</p>
              <p className="absolute top-4 right-4 text-xs font-black text-accent-secondary/40 uppercase tracking-widest">{Math.ceil(questionTimeLeft)}s</p>
            </Card>

            <div className="grid grid-cols-2 gap-6">
              {options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => handleAnswer(opt)}
                  className="py-8 bg-card rounded-[2rem] text-3xl font-black shadow-neo-out hover:scale-105 active:shadow-neo-in active:scale-95 transition-all text-foreground/80 border border-white/5"
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {gameState === 'finished' && (
          <div className="relative">
            <div className="absolute -top-12 -left-4">
              <BackButton href="/" className="text-accent" />
            </div>
            <Card className="p-12 text-center space-y-8 shadow-neo-out animate-in zoom-in duration-500 rounded-[3rem] border border-white/10 backdrop-blur-md">
              <div className="w-24 h-24 bg-accent/20 rounded-full flex items-center justify-center mx-auto shadow-neo-in">
                <Trophy size={48} className="text-accent" />
              </div>

              <div className="space-y-2">
                <p className="text-accent font-black uppercase tracking-widest text-sm italic">Blitz Finished</p>
                <h2 className="text-7xl font-black italic tracking-tighter text-foreground/90">{score}</h2>
                <p className="text-foreground/40 font-bold uppercase tracking-widest text-[10px]">equations solved</p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="bg-card p-6 rounded-[2rem] shadow-neo-in border border-accent/5">
                  <p className="text-[10px] font-black text-accent/40 uppercase tracking-widest mb-1">Session</p>
                  <p className="text-3xl font-black text-accent">{score}</p>
                </div>
                <div className="bg-card p-6 rounded-[2rem] shadow-neo-in border border-accent-secondary/5">
                  <p className="text-[10px] font-black text-accent-secondary/40 uppercase tracking-widest mb-1">Record</p>
                  <p className="text-3xl font-black text-accent-secondary">{score > persistentHighScore ? score : persistentHighScore}</p>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button onClick={() => {
                  const state = useUserStore.getState();
                  if (state.sessionEndTime && state.sessionEndTime > Date.now()) {
                    router.push('/session');
                  } else {
                    router.push('/');
                  }
                }} className="w-full py-5 text-lg font-black italic tracking-widest shadow-neo-out hover:scale-[1.02] active:scale-[0.98] transition-all">
                  Continue
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </main>
  );
}
