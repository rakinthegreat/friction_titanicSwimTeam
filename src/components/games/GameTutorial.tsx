'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { HelpCircle, X } from 'lucide-react';

interface GameTutorialProps {
  title: string;
  steps: string[];
  isOpen: boolean;
  onClose: () => void;
}

export function GameTutorial({ title, steps, isOpen, onClose }: GameTutorialProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <Card className="w-full max-w-md p-8 relative shadow-neo-out border-none rounded-[2.5rem] animate-in zoom-in-95 duration-300">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-foreground/40"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-accent/10 text-accent">
            <HelpCircle size={24} />
          </div>
          <h2 className="text-2xl font-black tracking-tight">How to Play: {title}</h2>
        </div>

        <div className="space-y-4">
          {steps.map((step, i) => (
            <div key={i} className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center font-black shrink-0 shadow-neo-out">
                {i + 1}
              </div>
              <p className="text-foreground/70 font-medium leading-relaxed pt-1">
                {step}
              </p>
            </div>
          ))}
        </div>

        <button 
          onClick={onClose}
          className="w-full mt-8 py-4 bg-accent text-white rounded-2xl font-black shadow-neo-out hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          GOT IT!
        </button>
      </Card>
    </div>
  );
}
