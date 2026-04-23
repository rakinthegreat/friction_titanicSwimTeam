'use client';

import React, { useState } from 'react';
import { LessonProgressBar } from '@/components/learn/LessonProgressBar';
import { FreeResponseInteraction } from '@/components/learn/FreeResponseInteraction';
import { Card } from '@/components/ui/Card';
import { CheckCircle2, XCircle, BookOpen } from 'lucide-react';
import { useRouter } from 'next/navigation';

type Question = 
  | { type: 'vocab'; text: string; word: string; options: {word: string, meaning: string}[]; answer: number }
  | { type: 'interpret'; prompt: string; context: string; };

const lessonData: Question[] = [
  {
    type: 'vocab',
    text: "He was known for his ___ approach to problem-solving, always finding the most practical solution.",
    word: "Pragmatic",
    options: [
      {word: "Theoretical", meaning: "Concerned with theories rather than practical application"},
      {word: "Pragmatic", meaning: "Dealing with things sensibly and realistically"},
      {word: "Idealistic", meaning: "Unrealistically aiming for perfection"},
      {word: "Dogmatic", meaning: "Inclined to lay down principles as incontrovertibly true"}
    ],
    answer: 1
  },
  {
    type: 'vocab',
    text: "The politician's speech was intentionally ___, leaving the audience confused about his actual stance.",
    word: "Obfuscated",
    options: [
      {word: "Pellucid", meaning: "Translucently clear; easily understood"},
      {word: "Lucid", meaning: "Expressed clearly; easy to understand"},
      {word: "Obfuscated", meaning: "Made obscure, unclear, or unintelligible"},
      {word: "Articulate", meaning: "Having or showing the ability to speak fluently and coherently"}
    ],
    answer: 2
  },
  {
    type: 'interpret',
    prompt: "What does this quote mean to you?",
    context: "All the world's a stage, and all the men and women merely players."
  }
];

export default function EnglishModule() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);

  const handleNext = () => {
    setSelectedAnswer(null);
    setIsRevealed(false);
    setCurrentIndex(prev => prev + 1);
  };

  const handleVocabSelect = (index: number, answerIndex: number) => {
    if (isRevealed) return;
    setSelectedAnswer(index);
    setIsRevealed(true);
  };

  const currentStep = lessonData[currentIndex];

  if (currentIndex >= lessonData.length) {
    return (
      <main className="min-h-screen max-w-2xl mx-auto p-6 flex flex-col justify-center items-center space-y-8 animate-in zoom-in-95 duration-700">
        <div className="w-32 h-32 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center shadow-neo-out">
          <BookOpen className="w-16 h-16 animate-bounce" />
        </div>
        <h1 className="text-4xl font-black text-center">Lesson Complete!</h1>
        <p className="text-foreground/70 text-lg text-center max-w-md font-medium">
          Great job expanding your vocabulary and reflecting on literature.
        </p>
        <button 
          onClick={() => router.push('/learn')}
          className="w-full sm:w-auto px-12 py-4 bg-green-500 text-white rounded-2xl font-black text-xl shadow-neo-out hover:scale-105 active:scale-95 transition-all"
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
        {currentStep.type === 'vocab' && (
          <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-500">
            <h2 className="text-2xl sm:text-3xl font-extrabold leading-tight">
              Fill in the blank
            </h2>
            <div className="p-6 bg-card rounded-3xl shadow-neo-out text-xl font-medium leading-relaxed">
              {currentStep.text.split('___').map((part, i, arr) => (
                <React.Fragment key={i}>
                  {part}
                  {i < arr.length - 1 && (
                    <span className="inline-block px-4 py-1 mx-2 border-b-2 border-foreground/20 text-accent font-bold">
                      {isRevealed && selectedAnswer !== null ? currentStep.options[selectedAnswer].word : '______'}
                    </span>
                  )}
                </React.Fragment>
              ))}
            </div>

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
                  btnStyle = "bg-accent/10 border-2 border-accent";
                }

                return (
                  <Card 
                    key={i}
                    onClick={() => handleVocabSelect(i, currentStep.answer)}
                    className={`p-6 border-2 border-transparent transition-all duration-300 cursor-pointer flex flex-col justify-center ${btnStyle}`}
                  >
                    <div className="flex justify-between items-center w-full">
                      <span className={`text-xl ${textStyle}`}>{opt.word}</span>
                      {isRevealed && isCorrect && <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />}
                      {isRevealed && isSelected && !isCorrect && <XCircle className="w-6 h-6 text-red-500 flex-shrink-0" />}
                    </div>
                    {isRevealed && (
                      <div className="mt-2 text-sm text-foreground/70 animate-in fade-in slide-in-from-top-2 duration-300">
                        {opt.meaning}
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>

            {isRevealed && (
              <button
                onClick={handleNext}
                className="w-full py-4 mt-8 rounded-2xl font-black text-xl transition-all shadow-neo-out bg-green-500 text-white hover:scale-[1.02] active:scale-95 animate-in slide-in-from-bottom-4 duration-300"
              >
                Continue
              </button>
            )}
          </div>
        )}

        {currentStep.type === 'interpret' && (
          <FreeResponseInteraction 
            prompt={currentStep.prompt}
            context={currentStep.context}
            onSubmit={(resp) => {
              // We could save this somewhere, but for now we just move on
              console.log("User Interpretation:", resp);
              handleNext();
            }}
          />
        )}
      </div>
    </main>
  );
}
