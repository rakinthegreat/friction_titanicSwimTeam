'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { ArrowLeft, Leaf, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUserStore } from '@/store/userStore';

export default function ActivitiesDirectoryPage() {
  const router = useRouter();
  const navigationSource = useUserStore((state) => state.navigationSource);

  const modules = [
    {
      title: 'Real-Life Challenges',
      description: 'Break the digital wall and interact with the world around you.',
      icon: <Sparkles className="w-8 h-8" />,
      href: '/activities/challenges',
      color: 'text-accent'
    },
    {
      title: 'Daily Meditation',
      description: 'Reflect on your day, clear your mind, and find your focus.',
      icon: <Leaf className="w-8 h-8" />,
      href: '/activities/meditation',
      color: 'text-accent-secondary'
    }
  ];

  return (
    <main className="min-h-screen p-6 sm:p-8 max-w-4xl mx-auto space-y-12 animate-in fade-in duration-700">
      <header className="flex justify-between items-center">
        <div className="flex items-center">
          <button
            onClick={() => router.push(navigationSource === 'profile' ? '/profile' : '/')}
            className="p-2 -ml-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors mr-2"
            aria-label="Back to home"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Daily <span className="text-accent italic">Activities</span></h1>
            <p className="text-foreground/60 font-medium">Real-world practices for a better wait.</p>
          </div>
        </div>
        <ThemeToggle />
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        {modules.map((mod, i) => (
          <Link key={i} href={mod.href}>
            <Card className="h-full flex items-start p-8 hover:-translate-y-1 hover:shadow-neo-in transition-all group border border-white/5 bg-card">
              <div className={`p-4 rounded-2xl bg-black/5 dark:bg-white/5 shadow-neo-in mr-6 group-hover:scale-105 transition-transform ${mod.color}`}>
                {mod.icon}
              </div>
              <div className="flex flex-col flex-1">
                <h2 className="text-2xl font-black text-foreground mb-2">
                  {mod.title}
                </h2>
                <p className="text-foreground/60 text-sm font-medium leading-relaxed">
                  {mod.description}
                </p>
              </div>
            </Card>
          </Link>
        ))}
      </section>

      <section className="bg-accent/5 rounded-[2.5rem] p-8 border border-accent/10">
        <h3 className="text-xl font-bold mb-2">Why these activities?</h3>
        <p className="text-foreground/70 text-sm leading-relaxed">
          While digital learning is great, reconnecting with your physical environment and your own mind is essential for reducing "scroll-induced" friction. These activities are designed to be done anywhere, anytime.
        </p>
      </section>
    </main>
  );
}
