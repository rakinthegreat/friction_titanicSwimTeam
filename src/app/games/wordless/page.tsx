'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { WordLess } from '@/components/games/WordLess';
import { Card } from '@/components/ui/Card';
import { useUserStore } from '@/store/userStore';
import { useRouter } from 'next/navigation';
import { ArrowLeft, HelpCircle } from 'lucide-react';
import { GameTutorial } from '@/components/games/GameTutorial';

const TUTORIAL_STEPS = [
  "Guess the hidden 5-letter word in 6 tries.",
  "GREEN: The letter is in the word and in the correct spot.",
  "YELLOW: The letter is in the word but in the wrong spot.",
  "GRAY: The letter is not in the word in any spot."
];

import { getDailyWordLess } from '@/lib/dailyWord';

export default function WordLessPage() {
  const router = useRouter();
  const updateStats = useUserStore((state) => state.updateStats);
  const [dailyWord, setDailyWord] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);

  useEffect(() => {
    const hasSeen = localStorage.getItem('tutorial-wordless');
    if (!hasSeen) {
      setIsTutorialOpen(true);
      localStorage.setItem('tutorial-wordless', 'true');
    }
  }, []);

  useEffect(() => {
    try {
      const word = getDailyWordLess();
      setDailyWord(word);
    } catch (e) {
      setDailyWord("LIGHT");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleComplete = (xp: number) => {
    updateStats(5);
    router.push('/games');
  };

  return (
    <main className="min-h-screen bg-background p-6">
      <header className="max-w-md mx-auto mb-8 flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => router.push('/games')}
            className="p-3 rounded-2xl bg-card shadow-neo-out text-accent transition-all active:scale-95"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold ml-4">WordLess</h1>
        </div>
        <button 
          onClick={() => setIsTutorialOpen(true)}
          className="p-3 rounded-2xl bg-card shadow-neo-out text-accent transition-all active:scale-95"
        >
          <HelpCircle className="w-6 h-6" />
        </button>
      </header>

      <GameTutorial 
        title="WordLess"
        steps={TUTORIAL_STEPS}
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
      />

      <div className="max-w-md mx-auto">
        <Card className="p-8 shadow-neo-out min-h-[400px] flex flex-col justify-center">
          {loading ? (
            <div className="flex flex-col items-center justify-center space-y-4 animate-pulse">
              <div className="w-12 h-12 bg-accent/20 rounded-full" />
              <p className="text-foreground/40 font-bold uppercase tracking-widest text-xs">Syncing Daily Word...</p>
            </div>
          ) : (
            <Suspense fallback={<div className="h-64 flex items-center justify-center animate-pulse text-foreground/20 italic font-black">Loading...</div>}>
              <WordLess onComplete={handleComplete} targetWord={dailyWord} />
            </Suspense>
          )}
        </Card>
      </div>
    </main>
  );
}
