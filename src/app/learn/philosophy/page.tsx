'use client';

import React, { useState, useMemo } from 'react';
import { LessonProgressBar } from '@/components/learn/LessonProgressBar';
import { FreeResponseInteraction } from '@/components/learn/FreeResponseInteraction';
import { MCQInteraction } from '@/components/learn/MCQInteraction';
import { Card } from '@/components/ui/Card';
import { Brain, Trophy } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { concepts } from './topics';
import { useUserStore } from '@/store/userStore';
import { generateConcepts } from './actions';
import { Loader2 } from 'lucide-react';

type Step = 
  | { type: 'concept'; title: string; description: string; conceptName: string; }
  | { type: 'mcq'; question: string; options: any[]; conceptName: string; }
  | { type: 'interpret'; prompt: string; context: string; conceptName: string; };

export default function PhilosophyModule() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const completePhilosophyConcept = useUserStore(state => state.completePhilosophyConcept);
  const addCustomPhilosophyConcepts = useUserStore(state => state.addCustomPhilosophyConcepts);
  const interests = useUserStore(state => state.interests);

  const [sessionConcepts, setSessionConcepts] = useState<any[]>([]);

  React.useEffect(() => {
    setMounted(true);
    const state = useUserStore.getState();
    const completed = state.completedPhilosophyConcepts;
    const allConcepts = [...concepts, ...state.customPhilosophyConcepts];
    setSessionConcepts(allConcepts.filter(c => !completed.includes(c.concept_name)));
  }, []);

  const lessonData = useMemo(() => {
    return sessionConcepts.flatMap(concept => [
      {
        type: 'concept' as const,
        title: concept.concept_name,
        description: concept.concept_text,
        conceptName: concept.concept_name
      },
      {
        type: 'mcq' as const,
        question: (concept as any)["question 1"].question_body,
        options: (concept as any)["question 1"].options,
        conceptName: concept.concept_name
      },
      {
        type: 'mcq' as const,
        question: (concept as any)["question 2"].question_body,
        options: (concept as any)["question 2"].options,
        conceptName: concept.concept_name
      },
      {
        type: 'interpret' as const,
        prompt: (concept as any)["question 3"].question_body,
        context: concept.concept_name,
        conceptName: concept.concept_name
      }
    ]);
  }, [sessionConcepts]);

  const handleNext = () => {
    setCurrentIndex(prev => prev + 1);
  };

  const handleSkip = () => {
    completePhilosophyConcept(currentStep.conceptName);
    const nextConceptIndex = lessonData.findIndex((step, idx) => idx > currentIndex && step.type === 'concept');
    if (nextConceptIndex !== -1) {
      setCurrentIndex(nextConceptIndex);
    } else {
      setCurrentIndex(lessonData.length);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    const result = await generateConcepts(interests);
    
    if (result.success && result.concepts) {
      addCustomPhilosophyConcepts(result.concepts);
      setSessionConcepts(result.concepts);
      setCurrentIndex(0);
    } else {
      setError(result.error || "Failed to generate concepts.");
    }
    setIsGenerating(false);
  };

  const currentStep = lessonData[currentIndex];

  if (!mounted) return null;

  if (sessionConcepts.length === 0) {
    return (
      <main className="min-h-screen max-w-2xl mx-auto p-6 flex flex-col justify-center items-center space-y-8 animate-in zoom-in-95 duration-700">
        <div className="w-32 h-32 bg-accent-secondary/20 text-accent-secondary rounded-[2.5rem] flex items-center justify-center shadow-neo-out relative overflow-hidden">
          {isGenerating ? (
             <Loader2 className="w-16 h-16 animate-spin" />
          ) : (
             <Trophy className="w-16 h-16" />
          )}
        </div>
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-black tracking-tight">
            {isGenerating ? "Curating Knowledge..." : "Thought Master"}
          </h1>
          <p className="text-foreground/70 text-lg font-medium max-w-md">
            {isGenerating 
              ? "DeepSeek AI is analyzing the universe to bring you 10 brand new philosophical concepts."
              : "You've explored every concept in our current library. You're a true philosopher!"}
          </p>
          {error && <p className="text-red-500 font-bold mt-4">{error}</p>}
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <button 
            onClick={handleGenerate}
            disabled={isGenerating}
            className={`px-8 py-5 rounded-2xl font-black text-xl shadow-neo-out transition-all ${
              isGenerating ? 'bg-card text-foreground/50 opacity-50 cursor-not-allowed' : 'bg-accent-secondary text-white hover:scale-105 active:scale-95'
            }`}
          >
            {isGenerating ? 'Synthesizing...' : 'Generate More Concepts'}
          </button>
          {!isGenerating && (
            <button 
              onClick={() => router.push('/learn')}
              className="px-8 py-5 bg-card text-foreground rounded-2xl font-black text-xl shadow-neo-out hover:scale-105 active:scale-95 transition-all"
            >
              Return Home
            </button>
          )}
        </div>
      </main>
    );
  }

  if (currentIndex >= lessonData.length) {
    return (
      <main className="min-h-screen max-w-2xl mx-auto p-6 flex flex-col justify-center items-center space-y-8 animate-in zoom-in-95 duration-700">
        <div className="w-32 h-32 bg-green-500/20 text-green-500 rounded-[2.5rem] flex items-center justify-center shadow-neo-out border-2 border-green-500/20">
          <Trophy className="w-16 h-16" />
        </div>
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-black tracking-tight">Session Complete</h1>
          <p className="text-foreground/70 text-lg font-medium max-w-md">
            You've mastered {sessionConcepts.length} new concepts in this session.
          </p>
        </div>
        <button 
          onClick={() => router.push('/learn')}
          className="w-full sm:w-auto px-12 py-5 bg-accent-secondary text-white rounded-2xl font-black text-xl shadow-neo-out hover:scale-105 active:scale-95 transition-all"
        >
          Return to Learning
        </button>
      </main>
    );
  }

  return (
    <main className="min-h-screen max-w-2xl mx-auto p-4 flex flex-col">
      <div className="pt-4 px-2">
        <LessonProgressBar current={currentIndex} total={lessonData.length} />
      </div>

      <div className="flex-1 mt-8 pb-12 px-2">
        {currentStep.type === 'concept' && (
          <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-500">
            <div className="space-y-2 text-center">
              <h2 className="text-sm font-black text-accent-secondary uppercase tracking-[0.2em]">
                Deep Concept
              </h2>
              <h3 className="text-5xl font-black tracking-tighter text-foreground">{currentStep.title}</h3>
            </div>
            
            <Card className="p-8 space-y-6 border-none bg-card shadow-neo-out relative overflow-hidden rounded-[3rem]">
              <Brain className="absolute -top-10 -right-10 w-48 h-48 text-accent-secondary/5 rotate-12" />
              <p className="text-xl font-bold leading-relaxed text-foreground/80 relative z-10">
                {currentStep.description}
              </p>
            </Card>

            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <button
                onClick={handleSkip}
                className="w-full sm:w-1/3 py-5 rounded-3xl font-black text-xl bg-card text-foreground/50 shadow-neo-out hover:scale-[1.02] active:scale-95 transition-all"
              >
                Skip
              </button>
              <button
                onClick={handleNext}
                className="w-full sm:w-2/3 py-5 rounded-3xl font-black text-xl bg-accent-secondary text-white shadow-neo-out hover:scale-[1.02] active:scale-95 transition-all"
              >
                Continue Exploration
              </button>
            </div>
          </div>
        )}

        {currentStep.type === 'mcq' && (
          <MCQInteraction 
            question={currentStep.question}
            options={currentStep.options}
            onSubmit={(isCorrect) => {
              handleNext();
            }}
          />
        )}

        {currentStep.type === 'interpret' && (
          <FreeResponseInteraction 
            prompt={currentStep.prompt}
            context={currentStep.context}
            onSubmit={(resp) => {
              completePhilosophyConcept(currentStep.conceptName);
              handleNext();
            }}
          />
        )}
      </div>
    </main>
  );
}

