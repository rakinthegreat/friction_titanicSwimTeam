'use client';

import React, { Suspense } from 'react';
import { Crosswords } from '@/components/games/Crosswords';
import { Card } from '@/components/ui/Card';
import { useUserStore } from '@/store/userStore';
import { useRouter } from 'next/navigation';
import { ArrowLeft, HelpCircle } from 'lucide-react';
import { GameTutorial } from '@/components/games/GameTutorial';

const TUTORIAL_STEPS = [
  "Tap a cell to focus it. Tap again to change direction (Across vs Down).",
  "Type letters to fill the grid. Use backspace to clear.",
  "Check the clues above the keyboard to find the correct words.",
  "Fill the entire grid correctly to complete the challenge!"
];

export default function CrosswordsPage() {
  const router = useRouter();
  const updateStats = useUserStore((state) => state.updateStats);
  const [isTutorialOpen, setIsTutorialOpen] = React.useState(false);

  React.useEffect(() => {
    const hasSeen = localStorage.getItem('tutorial-crosswords');
    if (!hasSeen) {
      setIsTutorialOpen(true);
      localStorage.setItem('tutorial-crosswords', 'true');
    }
  }, []);

  const handleComplete = (xp: number) => {
    updateStats(xp);
    router.push('/games');
  };

  return (
    <main className="min-h-screen bg-background p-6">
      <header className="max-w-xl mx-auto mb-8 flex items-center justify-between">
        <div className="flex items-center">
          <button 
            onClick={() => router.push('/games')}
            className="p-3 rounded-2xl bg-card shadow-neo-out text-accent transition-all active:scale-95"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold tracking-tight italic uppercase ml-4">Crosswords</h1>
        </div>
        <button 
          onClick={() => setIsTutorialOpen(true)}
          className="p-3 rounded-2xl bg-card shadow-neo-out text-accent transition-all active:scale-95"
        >
          <HelpCircle className="w-6 h-6" />
        </button>
      </header>

      <GameTutorial 
        title="Crosswords"
        steps={TUTORIAL_STEPS}
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
      />

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
