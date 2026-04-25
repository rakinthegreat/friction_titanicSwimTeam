'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/userStore';

interface BackButtonProps {
  className?: string;
  href?: string;
}

export function BackButton({ className = "", href = "/" }: BackButtonProps) {
  const router = useRouter();
  const sessionEndTime = useUserStore(state => state.sessionEndTime);
  
  const handleBack = () => {
    if (href === "/" && sessionEndTime && sessionEndTime > Date.now()) {
      router.push("/session");
    } else {
      router.push(href);
    }
  };

  return (
    <button 
      onClick={handleBack}
      className={`p-3 rounded-2xl bg-transparent hover:bg-foreground/5 transition-all active:scale-95 flex items-center justify-center ${className}`}
      aria-label="Back to home"
    >
      <ArrowLeft className="w-6 h-6" />
    </button>
  );
}
