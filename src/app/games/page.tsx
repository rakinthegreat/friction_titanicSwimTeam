'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { ArrowLeft, Hash, Grid3X3, Type, BrainCircuit, Blocks, HelpCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function GamesDirectoryPage() {
  const router = useRouter();

  const games = [
    {
      title: 'Sudoku',
      description: 'Classic number puzzle to sharpen your mind.',
      icon: <Grid3X3 className="w-8 h-8" />,
      href: '/games/sudoku',
      active: true,
      color: 'text-accent'
    },
    {
      title: 'Tic-Tac-Toe',
      description: 'Quick rounds against a simple AI.',
      icon: <Hash className="w-8 h-8" />,
      href: '/games/tic-tac-toe',
      active: true,
      color: 'text-accent-secondary'
    },
    {
      title: 'WordLess',
      description: 'Guess the hidden 5-letter word.',
      icon: <Type className="w-8 h-8" />,
      href: '/', // Handled on home screen currently
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
    },
    {
      title: 'Trivia',
      description: 'Test your knowledge on Bangladesh and the World.',
      icon: <HelpCircle className="w-8 h-8" />,
      href: '/games/trivia',
      active: true,
      color: 'text-accent'
    }
  ];

  return (
    <main className="min-h-screen p-6 sm:p-8 max-w-4xl mx-auto space-y-12 animate-in fade-in duration-700">
      <header className="flex justify-between items-center">
        <div className="flex items-center">
          <button
            onClick={() => router.push('/')}
            className="p-2 -ml-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors mr-2"
            aria-label="Back to home"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
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
