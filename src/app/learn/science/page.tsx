'use client';

import React, { useState } from 'react';
import { LessonProgressBar } from '@/components/learn/LessonProgressBar';
import { Card } from '@/components/ui/Card';
import { CheckCircle2, XCircle, FlaskConical } from 'lucide-react';
import { useRouter } from 'next/navigation';

type Question = 
  | { type: 'fact'; title: string; description: string; }
  | { type: 'quiz'; text: string; options: string[]; answer: number };

const lessonData: Question[] = [
  {
    type: 'fact',
    title: 'Photosynthesis',
    description: 'Photosynthesis is a process used by plants and other organisms to convert light energy into chemical energy that, through cellular respiration, can later be released to fuel the organism\'s activities.'
  },
  {
    type: 'quiz',
    text: 'What do plants convert light energy into during photosynthesis?',
    options: ['Heat energy', 'Chemical energy', 'Kinetic energy', 'Electrical energy'],
    answer: 1
  },
  {
    type: 'fact',
    title: 'Black Holes',
    description: 'A black hole is a region of spacetime where gravity is so strong that nothing—no particles or even electromagnetic radiation such as light—can escape from it. The boundary of no escape is called the event horizon.'
  },
  {
    type: 'quiz',
    text: 'What is the boundary around a black hole from which nothing can escape called?',
    options: ['The Singularity', 'The Event Horizon', 'The Accretion Disk', 'The Photon Sphere'],
    answer: 1
  }
];

export default function ScienceModule() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);

  const handleNext = () => {
    setSelectedAnswer(null);
    setIsRevealed(false);
    setCurrentIndex(prev => prev + 1);
  };

  const handleQuizSelect = (index: number, answerIndex: number) => {
    if (isRevealed) return;
    setSelectedAnswer(index);
    setIsRevealed(true);

    setTimeout(() => {
      handleNext();
    }, 1500);
  };

  const currentStep = lessonData[currentIndex];

  if (currentIndex >= lessonData.length) {
    return (
      <main className="min-h-screen max-w-2xl mx-auto p-6 flex flex-col justify-center items-center space-y-8 animate-in zoom-in-95 duration-700">
        <div className="w-32 h-32 bg-blue-500/20 text-blue-500 rounded-full flex items-center justify-center shadow-neo-out">
          <FlaskConical className="w-16 h-16 animate-bounce" />
        </div>
        <h1 className="text-4xl font-black text-center">Experiment Complete!</h1>
        <p className="text-foreground/70 text-lg text-center max-w-md font-medium">
          You've absorbed some fascinating scientific facts today.
        </p>
        <button 
          onClick={() => router.push('/learn')}
          className="w-full sm:w-auto px-12 py-4 bg-blue-500 text-white rounded-2xl font-black text-xl shadow-neo-out hover:scale-105 active:scale-95 transition-all"
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
        {currentStep.type === 'fact' && (
          <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-500">
            <h2 className="text-2xl font-extrabold text-foreground/50 uppercase tracking-widest text-center mb-8">
              Did you know?
            </h2>
            
            <Card className="p-8 space-y-6 text-center border-t-8 border-blue-500 bg-card shadow-neo-out relative overflow-hidden">
              <FlaskConical className="absolute -bottom-10 -left-10 w-40 h-40 text-blue-500/5 -rotate-12" />
              <h3 className="text-4xl font-black text-blue-500 dark:text-blue-400 relative z-10">{currentStep.title}</h3>
              <p className="text-xl font-medium leading-relaxed text-foreground/80 relative z-10">
                {currentStep.description}
              </p>
            </Card>

            <button
              onClick={handleNext}
              className="w-full py-5 mt-10 rounded-2xl font-black text-xl bg-blue-500 text-white shadow-[6px_6px_12px_rgba(0,0,0,0.1),-6px_-6px_12px_rgba(255,255,255,0.05)] hover:scale-[1.02] active:scale-95 transition-all"
            >
              Fascinating!
            </button>
          </div>
        )}

        {currentStep.type === 'quiz' && (
          <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-500">
            <h2 className="text-2xl sm:text-3xl font-extrabold leading-tight text-center">
              {currentStep.text}
            </h2>

            <div className="grid grid-cols-1 gap-4 pt-4">
              {currentStep.options.map((opt, i) => {
                const isSelected = selectedAnswer === i;
                const isCorrect = i === currentStep.answer;
                
                let btnStyle = "bg-card hover:scale-[1.02]";
                let textStyle = "text-foreground";

                if (isRevealed) {
                  if (isCorrect) {
                    btnStyle = "bg-green-500/10 border-2 border-green-500 dark:bg-green-500/20";
                    textStyle = "text-green-600 dark:text-green-400 font-bold";
                  } else if (isSelected) {
                    btnStyle = "bg-red-500/10 border-2 border-red-500 dark:bg-red-500/20";
                    textStyle = "text-red-600 dark:text-red-400 font-bold";
                  } else {
                    btnStyle = "bg-card opacity-50 shadow-none";
                  }
                } else if (isSelected) {
                  btnStyle = "bg-blue-500/10 border-2 border-blue-500 dark:border-blue-400";
                }

                return (
                  <Card 
                    key={i}
                    onClick={() => handleQuizSelect(i, currentStep.answer)}
                    className={`p-6 border-2 border-transparent transition-all duration-300 cursor-pointer flex justify-between items-center ${btnStyle}`}
                  >
                    <span className={`text-xl ${textStyle}`}>{opt}</span>
                    {isRevealed && isCorrect && <CheckCircle2 className="w-6 h-6 text-green-500" />}
                    {isRevealed && isSelected && !isCorrect && <XCircle className="w-6 h-6 text-red-500" />}
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
