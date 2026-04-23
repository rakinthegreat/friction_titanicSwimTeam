'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { ArrowLeft, Globe, MapPin, CheckCircle2, XCircle, Trophy } from 'lucide-react';
import { useRouter } from 'next/navigation';

type Category = 'bangladesh' | 'international' | null;

interface Question {
  text: string;
  options: string[];
  correctAnswer: number;
}

const bangladeshQuestions: Question[] = [
  { text: "What is the capital of Bangladesh?", options: ["Chittagong", "Dhaka", "Sylhet", "Rajshahi"], correctAnswer: 1 },
  { text: "What is the national flower of Bangladesh?", options: ["Water Lily", "Rose", "Sunflower", "Lotus"], correctAnswer: 0 },
  { text: "In which year did Bangladesh gain independence?", options: ["1947", "1952", "1971", "1990"], correctAnswer: 2 },
  { text: "Who is known as the Father of the Nation in Bangladesh?", options: ["A. K. Fazlul Huq", "Huseyn Shaheed Suhrawardy", "Ziaur Rahman", "Sheikh Mujibur Rahman"], correctAnswer: 3 },
  { text: "What is the national animal of Bangladesh?", options: ["Royal Bengal Tiger", "Asian Elephant", "Spotted Deer", "Leopard"], correctAnswer: 0 }
];

const internationalQuestions: Question[] = [
  { text: "What is the largest planet in our solar system?", options: ["Earth", "Mars", "Jupiter", "Saturn"], correctAnswer: 2 },
  { text: "Which ocean is the largest?", options: ["Atlantic Ocean", "Indian Ocean", "Arctic Ocean", "Pacific Ocean"], correctAnswer: 3 },
  { text: "Who painted the Mona Lisa?", options: ["Vincent van Gogh", "Pablo Picasso", "Leonardo da Vinci", "Michelangelo"], correctAnswer: 2 },
  { text: "What is the chemical symbol for Gold?", options: ["Ag", "Au", "Pb", "Fe"], correctAnswer: 1 },
  { text: "Which country is known as the Land of the Rising Sun?", options: ["China", "South Korea", "Japan", "Thailand"], correctAnswer: 2 }
];

export default function TriviaPage() {
  const router = useRouter();
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'results'>('menu');
  const [category, setCategory] = useState<Category>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);

  const currentQuestions = category === 'bangladesh' ? bangladeshQuestions : internationalQuestions;

  const startGame = (selectedCategory: Category) => {
    setCategory(selectedCategory);
    setGameState('playing');
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setIsAnswerRevealed(false);
  };

  const handleAnswerSelect = (optionIndex: number) => {
    if (isAnswerRevealed) return; // Prevent multiple clicks

    setSelectedAnswer(optionIndex);
    setIsAnswerRevealed(true);

    const isCorrect = optionIndex === currentQuestions[currentQuestionIndex].correctAnswer;
    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    // Wait a bit before moving to next question
    setTimeout(() => {
      if (currentQuestionIndex < currentQuestions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setSelectedAnswer(null);
        setIsAnswerRevealed(false);
      } else {
        setGameState('results');
      }
    }, 1500);
  };

  const resetGame = () => {
    setGameState('menu');
    setCategory(null);
  };

  return (
    <main className="min-h-screen p-6 sm:p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700">
      <header className="flex justify-between items-center">
        <div className="flex items-center">
          <button 
            onClick={() => {
              if (gameState === 'menu') {
                router.push('/games');
              } else {
                setGameState('menu');
              }
            }}
            className="p-2 -ml-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors mr-2"
            aria-label="Back"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Trivia</h1>
          </div>
        </div>
        <ThemeToggle />
      </header>

      {gameState === 'menu' && (
        <section className="flex flex-col items-center justify-center space-y-8 py-12">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold">Choose a Category</h2>
            <p className="text-foreground/60">Select your preferred topic to start playing.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl">
            <Card 
              onClick={() => startGame('bangladesh')}
              className="flex flex-col items-center justify-center p-12 hover:-translate-y-2 group"
            >
              <div className="p-6 rounded-3xl bg-black/5 dark:bg-white/5 mb-6 group-hover:scale-110 transition-transform text-accent">
                <MapPin className="w-16 h-16" />
              </div>
              <h3 className="text-2xl font-bold">Bangladesh</h3>
            </Card>

            <Card 
              onClick={() => startGame('international')}
              className="flex flex-col items-center justify-center p-12 hover:-translate-y-2 group"
            >
              <div className="p-6 rounded-3xl bg-black/5 dark:bg-white/5 mb-6 group-hover:scale-110 transition-transform text-accent-secondary">
                <Globe className="w-16 h-16" />
              </div>
              <h3 className="text-2xl font-bold">International</h3>
            </Card>
          </div>
        </section>
      )}

      {gameState === 'playing' && category && (
        <section className="space-y-8 max-w-2xl mx-auto w-full animate-in slide-in-from-bottom-8 duration-500">
          <div className="flex justify-between items-center bg-card p-4 rounded-2xl shadow-neo-out">
            <span className="font-semibold text-foreground/70 uppercase tracking-wider text-sm">
              Question {currentQuestionIndex + 1} / {currentQuestions.length}
            </span>
            <span className="font-bold text-accent">
              Score: {score}
            </span>
          </div>

          <div className="min-h-[120px] flex items-center justify-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-center leading-tight">
              {currentQuestions[currentQuestionIndex].text}
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {currentQuestions[currentQuestionIndex].options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrect = index === currentQuestions[currentQuestionIndex].correctAnswer;
              
              let buttonStyle = "bg-card";
              let textStyle = "text-foreground";
              
              if (isAnswerRevealed) {
                if (isCorrect) {
                  buttonStyle = "bg-green-500/10 border-green-500 dark:bg-green-500/20";
                  textStyle = "text-green-600 dark:text-green-400 font-bold";
                } else if (isSelected) {
                  buttonStyle = "bg-red-500/10 border-red-500 dark:bg-red-500/20";
                  textStyle = "text-red-600 dark:text-red-400 font-bold";
                }
              } else if (isSelected) {
                buttonStyle = "bg-accent/10 border-accent";
              }

              return (
                <Card
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  className={`p-6 border-2 border-transparent transition-all duration-300 ${buttonStyle} ${!isAnswerRevealed ? 'hover:scale-[1.02]' : 'cursor-default shadow-none'}`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-lg sm:text-xl ${textStyle}`}>
                      {option}
                    </span>
                    {isAnswerRevealed && isCorrect && <CheckCircle2 className="w-6 h-6 text-green-500" />}
                    {isAnswerRevealed && isSelected && !isCorrect && <XCircle className="w-6 h-6 text-red-500" />}
                  </div>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {gameState === 'results' && (
        <section className="flex flex-col items-center justify-center space-y-10 py-16 animate-in zoom-in-95 duration-500">
          <div className="p-8 rounded-[3rem] bg-accent/10 text-accent mb-4 shadow-neo-out">
            <Trophy className="w-24 h-24 animate-bounce" />
          </div>
          
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-extrabold">Quiz Complete!</h2>
            <p className="text-xl text-foreground/70">
              You scored <span className="text-3xl font-bold text-accent mx-2">{score}</span> out of {currentQuestions.length}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
            <button
              onClick={resetGame}
              className="flex-1 py-4 px-6 rounded-2xl bg-foreground text-background font-bold text-lg hover:opacity-90 transition-opacity active:scale-95 shadow-neo-out"
            >
              Play Again
            </button>
            <button
              onClick={() => router.push('/games')}
              className="flex-1 py-4 px-6 rounded-2xl bg-card font-bold text-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors active:scale-95 shadow-neo-out"
            >
              Back to Games
            </button>
          </div>
        </section>
      )}
    </main>
  );
}
