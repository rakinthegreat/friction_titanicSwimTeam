'use client';

import React, { useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { GoogleLoginButton } from '@/components/auth/GoogleLoginButton';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { ArrowLeft } from 'lucide-react';
import { useUserStore } from '@/store/userStore';

export default function LoginPage() {
  const uid = useUserStore((state) => state.uid);

  return (
    <main className="min-h-screen p-6 sm:p-8 flex flex-col items-center justify-center animate-in fade-in duration-700 bg-background text-foreground">
      <div className="w-full max-w-sm">
        <header className="flex justify-between items-center mb-8">
          <button 
            onClick={() => window.location.href = '/'}
            className="p-2 -ml-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            aria-label="Back to home"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <ThemeToggle />
        </header>

        <Card className="p-8 text-center space-y-8 flex flex-col items-center">
          <div className="space-y-2">
            <h1 className="text-4xl font-black text-accent tracking-tighter">WaitLess</h1>
            <p className="text-foreground/60 font-medium text-sm pt-2">
              Sign in with Google to sync your stats, interests, and reclaimed time across all your devices.
            </p>
          </div>

          <div className="w-full flex justify-center py-4">
            <GoogleLoginButton 
              text="Continue with Google" 
              buttonVariant="primary"
              className="w-full text-base py-4 font-bold rounded-2xl shadow-neo-out active:shadow-neo-in"
              containerClassName="w-full flex flex-col items-center"
            />
          </div>
        </Card>
      </div>
    </main>
  );
}
