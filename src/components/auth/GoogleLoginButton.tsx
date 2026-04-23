'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import { LogIn, User } from 'lucide-react';
import Link from 'next/link';
import { useUserStore } from '@/store/userStore';

export function GoogleLoginButton({ 
  text = 'Backup Data', 
  className = '',
  buttonVariant = 'secondary' as any,
  containerClassName = 'flex flex-col items-end'
}: { 
  text?: string; 
  className?: string; 
  buttonVariant?: any;
  containerClassName?: string;
}) {
  const { signInWithGoogle, isLoading, error } = useFirebaseAuth();
  const uid = useUserStore((state) => state.uid);

  const handleLogin = async () => {
    await signInWithGoogle();
  };

  if (uid) {
    return (
      <Link href="/profile" className="flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-full hover:bg-accent/20 transition-colors cursor-pointer">
        <User className="w-4 h-4 text-accent" />
        <span className="text-xs font-bold uppercase tracking-wider text-accent">Profile</span>
      </Link>
    );
  }

  return (
    <div className={containerClassName}>
      <Button 
        onClick={handleLogin} 
        disabled={isLoading}
        variant={buttonVariant}
        className={`text-sm px-4 py-2 ${className}`}
      >
        <LogIn className="w-4 h-4 mr-2" />
        {isLoading ? 'Connecting...' : text}
      </Button>
      {error && <p className="text-red-500 text-xs mt-2 font-medium max-w-[200px] text-right">{error}</p>}
    </div>
  );
}
