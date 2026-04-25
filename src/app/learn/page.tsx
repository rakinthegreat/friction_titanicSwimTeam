'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { ArrowLeft, BookOpen, Brain, FlaskConical, HelpCircle, Leaf, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { WordOfTheDayWidget } from '@/components/learn/WordOfTheDayWidget';
import { useUserStore } from '@/store/userStore';

export default function LearnDirectoryPage() {
  const router = useRouter();
  const navigationSource = useUserStore((state) => state.navigationSource);
  const setNavigationSource = useUserStore((state) => state.setNavigationSource);

  React.useEffect(() => {
    setNavigationSource('learn');
  }, [setNavigationSource]);

  const modules = [
    {
      title: 'English Language',
      description: 'Expand your vocabulary and learn grammar.',
      icon: <BookOpen className="w-8 h-8" />,
      href: '/learn/english',
      color: 'text-accent'
    },
    {
      title: 'Philosophical Ideas',
      description: 'Explore deep concepts and write your reflections.',
      icon: <Brain className="w-8 h-8" />,
      href: '/learn/philosophy',
      color: 'text-accent-secondary'
    },
    {
      title: 'Science Concepts',
      description: 'Learn bite-sized facts and test your knowledge.',
      icon: <FlaskConical className="w-8 h-8" />,
      href: '/learn/science',
      color: 'text-accent'
    },
    {
      title: 'Trivia',
      description: 'Test your knowledge on Bangladesh and the World.',
      icon: <HelpCircle className="w-8 h-8" />,
      href: '/learn/trivia',
      active: true,
      color: 'text-accent'
    },
  ];

  return (
    <main className="min-h-screen p-6 sm:p-8 max-w-4xl mx-auto space-y-12 animate-in fade-in duration-700">
      <header className="flex justify-between items-center">
        <div className="flex items-center">
          <button
            onClick={() => {
              const state = useUserStore.getState();
              if (state.sessionEndTime && state.sessionEndTime > Date.now()) {
                router.push('/session');
              } else {
                router.push(navigationSource === 'profile' ? '/profile' : '/');
              }
            }}
            className="p-2 -ml-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors mr-2"
            aria-label="Back to home"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Learning Modules</h1>
          </div>
        </div>
        <ThemeToggle />
      </header>

      <WordOfTheDayWidget />

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {modules.map((mod, i) => (
          <Link key={i} href={mod.href}>
            <Card className="h-full flex items-start p-6 hover:-translate-y-1 hover:shadow-neo-in transition-all group">
              <div className={`p-4 rounded-2xl bg-black/5 dark:bg-white/5 shadow-neo-in mr-5 group-hover:scale-105 transition-transform ${mod.color}`}>
                {mod.icon}
              </div>
              <div className="flex flex-col flex-1 p-1">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-xl font-bold text-foreground">
                    {mod.title}
                  </h2>
                </div>
                <p className="text-foreground/60 text-sm font-medium">
                  {mod.description}
                </p>
              </div>
            </Card>
          </Link>
        ))}
      </section>
    </main>
  );
}
