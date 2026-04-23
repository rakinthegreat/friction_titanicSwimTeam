'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Timer, Zap, Trophy, RefreshCw, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/userStore';

interface Equation {
  text: string;
  answer: number;
}

export default function RapidMathPage() {
  const router = useRouter();
  const updateStats = useUserStore((state) => state.updateStats);
  
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [equation, setEquation] = useState<Equation>({ text: '', answer: 0 });
  const [options, setOptions] = useState<number[]>([]);
  const [highScore, setHighScore] = useState(0);

  const generateEquation = useCallback(() => {
    const operators = ['+', '-', '*'];
    const op = operators[Math.floor(Math.random() * operators.length)];
    let num1, num2, ans;

    if (op === '+') {
      num1 = Math.floor(Math.random() * 50) + 1;
      num2 = Math.floor(Math.random() * 50) + 1;
      ans = num1 + num2;
    } else if (op === '-') {
      num1 = Math.floor(Math.random() * 50) + 20;
      num2 = Math.floor(Math.random() * num1) + 1;
      ans = num1 - num2;
    } else {
      num1 = Math.floor(Math.random() * 12) + 2;
      num2 = Math.floor(Math.random() * 12) + 2;
      ans = num1 * num2;
    }

    const newOptions = new Set<number>();
    newOptions.add(ans);
    while (newOptions.size < 4) {
      const offset = Math.floor(Math.random() * 10) - 5;
      const fake = ans + offset;
      if (fake !== ans && fake > 0) newOptions.add(fake);
      else newOptions.add(ans + Math.floor(Math.random() * 20) + 1);
    }

    setEquation({ text: `${num1} ${op} ${num2}`, answer: ans });
    setOptions(Array.from(newOptions).sort(() => Math.random() - 0.5));
  }, []);

  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && gameState === 'playing') {
      setGameState('finished');
      if (score > highScore) setHighScore(score);
      updateStats(2); // Award small reclaim for math session
    }
  }, [gameState, timeLeft, score, highScore, updateStats]);

  const startGame = () => {
    setScore(0);
    setTimeLeft(30);
    setGameState('playing');
    generateEquation();
  };

  const handleAnswer = (val: number) => {
    if (val === equation.answer) {
      setScore((s) => s + 1);
      generateEquation();
    } else {
      // Small penalty or visual shake could be added
      setTimeLeft((t) => Math.max(0, t - 2));
      generateEquation();
    }
  };

  return (
    <main className="min-h-screen bg-background p-6 flex flex-col items-center">
      <header className="w-full max-w-md flex justify-between items-center mb-12">
        <button onClick={() => router.push('/games')} className="p-3 rounded-2xl bg-card shadow-neo-out text-accent">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-black italic tracking-tighter">RAPID MATH</h1>
        <div className="w-12" />
      </header>

      <div className="w-full max-w-md space-y-8">
        {gameState === 'idle' && (
          <Card className="p-12 text-center space-y-8 shadow-neo-out animate-in zoom-in duration-500">
            <div className="w-24 h-24 bg-accent/10 rounded-[2rem] flex items-center justify-center mx-auto text-accent shadow-neo-in">
              <Zap size={48} fill="currentColor" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-black">Ready?</h2>
              <p className="text-foreground/60 font-medium">Solve as many as you can in 30 seconds.</p>
            </div>
            <Button onClick={startGame} className="w-full py-6 text-xl shadow-neo-out">START BLASTING</Button>
          </Card>
        )}

        {gameState === 'playing' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="flex justify-between gap-4">
              <Card className="flex-1 p-4 flex items-center justify-center gap-2 shadow-neo-in bg-accent/5">
                <Timer className="text-accent" size={20} />
                <span className="text-2xl font-black text-accent">{timeLeft}s</span>
              </Card>
              <Card className="flex-1 p-4 flex items-center justify-center gap-2 shadow-neo-in bg-accent-secondary/5">
                <Trophy className="text-accent-secondary" size={20} />
                <span className="text-2xl font-black text-accent-secondary">{score}</span>
              </Card>
            </div>

            <Card className="p-12 text-center shadow-neo-out border-2 border-accent/10 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-accent/20">
                <div 
                  className="h-full bg-accent transition-all duration-1000 ease-linear" 
                  style={{ width: `${(timeLeft / 30) * 100}%` }}
                />
              </div>
              <p className="text-6xl font-black tracking-tighter text-foreground/90">{equation.text}</p>
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
          <Card className="p-12 text-center space-y-8 shadow-neo-out animate-in zoom-in duration-500">
            <div className="space-y-2">
              <p className="text-accent font-black uppercase tracking-widest text-sm">Time's Up!</p>
              <h2 className="text-6xl font-black">{score}</h2>
              <p className="text-foreground/40 font-bold italic">equations solved</p>
            </div>

            <div className="bg-accent/5 p-6 rounded-3xl border border-accent/10">
              <p className="text-xs font-bold text-accent/60 uppercase tracking-widest mb-1">Best Today</p>
              <p className="text-2xl font-black text-accent">{highScore}</p>
            </div>

            <div className="flex gap-4">
              <Button onClick={startGame} className="flex-1 py-4 flex items-center justify-center gap-2">
                <RefreshCw size={20} />
                Try Again
              </Button>
              <Button onClick={() => router.push('/games')} variant="secondary" className="flex-1 py-4">
                Done
              </Button>
            </div>
          </Card>
        )}
      </div>
    </main>
  );
}
