'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { WordLess } from '@/components/games/WordLess';
import { Card } from '@/components/ui/Card';
import { useUserStore } from '@/store/userStore';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function WordLessPage() {
  const router = useRouter();
  const updateStats = useUserStore((state) => state.updateStats);
  const [dailyWord, setDailyWord] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWord = async () => {
      try {
        const res = await fetch('/api/wordless-daily');
        const data = await res.json();
        setDailyWord(data.word);
      } catch (e) {
        setDailyWord("LIGHT");
      } finally {
        setLoading(false);
      }
    };
    fetchWord();
  }, []);

  const handleComplete = (xp: number) => {
    updateStats(5);
    router.push('/games');
  };

  return (
    <main className="min-h-screen bg-background p-6">
      <header className="max-w-md mx-auto mb-8 flex items-center">
        <button
          onClick={() => router.push('/games')}
          className="p-2 -ml-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors mr-2"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-bold">WordLess</h1>
      </header>

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
