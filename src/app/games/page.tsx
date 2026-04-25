'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { ArrowLeft, Hash, Grid3X3, Type, BrainCircuit, Blocks, HelpCircle, Zap, Move } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUserStore } from '@/store/userStore';
import { BackButton } from '@/components/ui/BackButton';

export default function GamesDirectoryPage() {
  const router = useRouter();
  const setNavigationSource = useUserStore((state) => state.setNavigationSource);

  React.useEffect(() => {
    setNavigationSource('games');
  }, [setNavigationSource]);

  const games = [
    {
      title: 'Rapid Math',
      description: 'Quick arithmetic under pressure.',
      icon: <Zap className="w-8 h-8" />,
      href: '/games/rapid-math',
      active: true,
      color: 'text-accent'
    },
    {
      title: 'Crosswords',
      description: 'Daily puzzle to expand your vocabulary.',
      icon: <Grid3X3 className="w-8 h-8" />,
      href: '/games/crosswords',
      active: true,
      color: 'text-accent-secondary'
    },
    {
      title: 'Maze Solver',
      description: 'Navigate through complex paths.',
      icon: <Move className="w-8 h-8" />,
      href: '/games/maze',
      active: true,
      color: 'text-accent-secondary'
    },
    {
      title: 'Sudoku',
      description: 'Classic number puzzle to sharpen your mind.',
      icon: <Hash className="w-8 h-8" />,
      href: '/games/sudoku',
      active: true,
      color: 'text-accent'
    },
    {
      title: 'Tic-Tac-Toe',
      description: 'Quick rounds against a simple AI.',
      icon: <Blocks className="w-8 h-8" />,
      href: '/games/tic-tac-toe',
      active: true,
      color: 'text-accent-secondary'
    },
    {
      title: 'WordLess',
      description: 'Guess the hidden 5-letter word.',
      icon: <Type className="w-8 h-8" />,
      href: '/games/wordless',
      active: true,
      color: 'text-accent'
    },
    {
      title: 'Memory Match',
      description: 'Card flipping game testing your recall.',
      icon: <BrainCircuit className="w-8 h-8" />,
      href: '/games/memory-match',
      active: true,
      color: 'text-accent'
    },
    {
      title: '2048',
      description: 'Swipe and combine matching numbers.',
      icon: <Blocks className="w-8 h-8" />,
      href: '/games/2048',
      active: true,
      color: 'text-accent-secondary'
    }
  ];

  return (
    <main className="min-h-screen p-6 sm:p-8 max-w-4xl mx-auto space-y-12 animate-in fade-in duration-700">
      <header className="flex justify-between items-center">
        <div className="flex items-center">
          <BackButton href="/" className="text-accent" />
          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Mini-Games</h1>
          </div>
        </div>
        <ThemeToggle />
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {games.map((game, i) => (
          <Link key={i} href={game.href} className={!game.active ? 'pointer-events-none' : ''}>
            <Card className="h-full flex items-start p-6 hover:-translate-y-1 hover:shadow-neo-in transition-all group">
              <div className={`p-4 rounded-2xl bg-black/5 dark:bg-white/5 shadow-neo-in mr-5 group-hover:scale-105 transition-transform ${game.color}`}>
                {game.icon}
              </div>
              <div className="flex flex-col flex-1 p-1">
                <div className="flex items-center justify-between mb-2">
                  <h2 className={`text-xl font-bold ${!game.active ? 'text-foreground/50' : 'text-foreground'}`}>
                    {game.title}
                  </h2>
                  {!game.active && (
                    <span className="px-2 py-1 bg-foreground/10 text-foreground/50 rounded-full text-[10px] font-bold uppercase tracking-widest">
                      Soon
                    </span>
                  )}
                </div>
                <p className="text-foreground/60 text-sm font-medium">
                  {game.description}
                </p>
              </div>
            </Card>
          </Link>
        ))}
      </section>
    </main>
  );
}
