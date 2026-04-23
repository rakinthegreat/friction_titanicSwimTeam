'use client';

import React, { useState } from 'react';
import { LessonProgressBar } from '@/components/learn/LessonProgressBar';
import { FreeResponseInteraction } from '@/components/learn/FreeResponseInteraction';
import { Card } from '@/components/ui/Card';
import { Brain } from 'lucide-react';
import { useRouter } from 'next/navigation';

type Question = 
  | { type: 'concept'; title: string; description: string; }
  | { type: 'interpret'; prompt: string; context: string; };

const lessonData: Question[] = [
  {
    type: 'concept',
    title: 'Determinism',
    description: 'The philosophical idea that every event or state of affairs, including every human decision and action, is the inevitable and necessary consequence of antecedent states of affairs. In simpler terms: everything happens for a reason, and it couldn\'t have happened any other way.'
  },
  {
    type: 'interpret',
    prompt: 'If all your actions were predetermined, would you still feel responsible for your choices? Why or why not?',
    context: 'Reflecting on Determinism'
  },
  {
    type: 'concept',
    title: 'Stoicism',
    description: 'An ancient Greek philosophy which teaches the development of self-control and fortitude as a means of overcoming destructive emotions. The core idea is to focus only on what you can control, and accept what you cannot.'
  },
  {
    type: 'interpret',
    prompt: 'Think of a recent situation that frustrated you. How could applying Stoicism (focusing only on what you can control) change your perspective?',
    context: 'Applying Stoicism'
  }
];

export default function PhilosophyModule() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    setCurrentIndex(prev => prev + 1);
  };

  const currentStep = lessonData[currentIndex];

  if (currentIndex >= lessonData.length) {
    return (
      <main className="min-h-screen max-w-2xl mx-auto p-6 flex flex-col justify-center items-center space-y-8 animate-in zoom-in-95 duration-700">
        <div className="w-32 h-32 bg-accent-secondary/20 text-accent-secondary rounded-full flex items-center justify-center shadow-neo-out">
          <Brain className="w-16 h-16 animate-pulse" />
        </div>
        <h1 className="text-4xl font-black text-center">Mind Expanded</h1>
        <p className="text-foreground/70 text-lg text-center max-w-md font-medium">
          You've explored some deep concepts and reflected on their meaning. Great mental workout!
        </p>
        <button 
          onClick={() => router.push('/learn')}
          className="w-full sm:w-auto px-12 py-4 bg-accent-secondary text-white rounded-2xl font-black text-xl shadow-neo-out hover:scale-105 active:scale-95 transition-all"
        >
          Continue
        </button>
      </main>
    );
  }

  return (
    <main className="min-h-screen max-w-2xl mx-auto p-4 flex flex-col">
      <LessonProgressBar current={currentIndex} total={lessonData.length} />

      <div className="flex-1 mt-8 pb-12">
        {currentStep.type === 'concept' && (
          <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-500">
            <h2 className="text-2xl font-extrabold text-foreground/50 uppercase tracking-widest text-center mb-8">
              New Concept
            </h2>
            
            <Card className="p-8 space-y-6 text-center border-t-8 border-accent-secondary bg-card shadow-neo-out relative overflow-hidden">
              <Brain className="absolute -top-10 -right-10 w-40 h-40 text-accent-secondary/5 rotate-12" />
              <h3 className="text-4xl font-black text-accent-secondary relative z-10">{currentStep.title}</h3>
              <p className="text-xl font-medium leading-relaxed text-foreground/80 relative z-10">
                {currentStep.description}
              </p>
            </Card>

            <button
              onClick={handleNext}
              className="w-full py-5 mt-10 rounded-2xl font-black text-xl bg-accent-secondary text-white shadow-[6px_6px_12px_rgba(0,0,0,0.1),-6px_-6px_12px_rgba(255,255,255,0.05)] hover:scale-[1.02] active:scale-95 transition-all"
            >
              Got it
            </button>
          </div>
        )}

        {currentStep.type === 'interpret' && (
          <FreeResponseInteraction 
            prompt={currentStep.prompt}
            context={currentStep.context}
            onSubmit={(resp) => {
              console.log("User Interpretation:", resp);
              handleNext();
            }}
          />
        )}
      </div>
    </main>
  );
}
