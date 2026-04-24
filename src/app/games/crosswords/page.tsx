'use client';

import React, { Suspense } from 'react';
import { Crosswords } from '@/components/games/Crosswords';
import { Card } from '@/components/ui/Card';
import { useUserStore } from '@/store/userStore';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function CrosswordsPage() {
  const router = useRouter();
  const updateStats = useUserStore((state) => state.updateStats);

  const handleComplete = (xp: number) => {
    updateStats(xp);
    router.push('/games');
  };

  return (
    <main className="min-h-screen bg-background p-6">
      <header className="max-w-xl mx-auto mb-8 flex items-center">
        <button 
          onClick={() => router.push('/games')}
          className="p-2 -ml-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors mr-2"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-bold tracking-tight italic uppercase">Crosswords</h1>
      </header>

      <div className="max-w-xl mx-auto">
        <Card className="p-6 sm:p-8 shadow-neo-out bg-card/30 backdrop-blur-sm border border-foreground/5">
          <Suspense fallback={<div className="h-64 flex items-center justify-center animate-pulse text-foreground/20 italic font-black">Loading...</div>}>
            <Crosswords onComplete={handleComplete} />
          </Suspense>
        </Card>
      </div>
    </main>
  );
}
