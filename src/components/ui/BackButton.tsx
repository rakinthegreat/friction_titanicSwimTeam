'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface BackButtonProps {
  className?: string;
  href?: string;
}

export function BackButton({ className = "", href = "/" }: BackButtonProps) {
  const router = useRouter();
  
  return (
    <button 
      onClick={() => router.push(href)}
      className={`p-3 rounded-2xl bg-transparent hover:bg-foreground/5 transition-all active:scale-95 flex items-center justify-center ${className}`}
      aria-label="Back to home"
    >
      <ArrowLeft className="w-6 h-6" />
    </button>
  );
}
