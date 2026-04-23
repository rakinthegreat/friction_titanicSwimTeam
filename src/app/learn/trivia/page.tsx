'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card } from '@/components/ui/Card';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { ArrowLeft, Globe, MapPin, CheckCircle2, XCircle, Trophy, Compass, Timer, Flame } from 'lucide-react';
import { useRouter } from 'next/navigation';
import geographyData from '@/stored-data/geography.json';
import bangladeshData from '@/stored-data/bangladesh.json';
import internationalData from '@/stored-data/international.json';

type Category = 'bangladesh' | 'international' | 'geography' | null;

interface Question {
  text: string;
  options: string[];
  correctAnswer: number;
}

const SEAS = ["Mediterranean Sea", "Caribbean Sea", "South China Sea", "Bering Sea", "Gulf of Mexico", "Okhotsk Sea", "East China Sea", "Hudson Bay", "Japan Sea", "Andaman Sea", "Red Sea", "Baltic Sea", "Arabian Sea", "Black Sea", "North Sea"];
const MOUNTAINS = ["Mount Everest", "K2", "Kangchenjunga", "Lhotse", "Makalu", "Cho Oyu", "Dhaulagiri", "Manaslu", "Nanga Parbat", "Annapurna", "Mount Kilimanjaro", "Mount Elbrus", "Denali", "Mount Fuji", "Mount Vesuvius"];
const OCEANS = ["Pacific Ocean", "Atlantic Ocean", "Indian Ocean", "Southern Ocean", "Arctic Ocean"];
const RIVERS = ["Amazon River", "Nile", "Yangtze", "Mississippi River", "Yenisei", "Yellow River", "Ob", "Paraná", "Congo River", "Amur", "Thames", "Seine", "Tiber", "Colorado River"];
const LAKES = ["Caspian Sea", "Lake Superior", "Lake Victoria", "Lake Huron", "Lake Michigan", "Lake Tanganyika", "Lake Baikal", "Great Bear Lake", "Lake Malawi", "Great Slave Lake", "Lake Erie", "Lake Winnipeg", "Lake Ontario", "Lake Titicaca", "Loch Ness"];
const DESERTS = ["Sahara Desert", "Arabian Desert", "Gobi Desert", "Kalahari Desert", "Patagonian Desert", "Syrian Desert", "Great Basin Desert", "Chihuahuan Desert", "Great Victoria Desert", "Antarctic Desert"];

export default function TriviaPage() {
  const router = useRouter();
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'results'>('menu');
  const [category, setCategory] = useState<Category>(null);

  // Game state
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isShaking, setIsShaking] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'plus' | 'minus', value: number } | null>(null);

  // Interaction state
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);

  // Track remaining questions to prevent repeats
  const remainingDataRef = useRef<{ question: string, answer: string }[]>([]);

  // Helper: Smart distractor generator
  const generateQuestion = useCallback((item: { question: string, answer: string }, data: { question: string, answer: string }[]): Question => {

    let distractors: string[] = [];
    // Regular expressions for Year (e.g. 1971), generic Number, and Dates
    const isYear = /^(17|18|19|20)\d{2}$/.test(item.answer);
    const isNumber = /^\d+$/.test(item.answer);
    const isDate = /^(January|February|March|April|May|June|July|August|September|October|November|December)\s\d{1,2}(,\s\d{4})?$/.test(item.answer);

    // Geographic matchers
    const isSea = item.answer.includes('Sea') || item.answer.includes('Bay') || item.answer.includes('Gulf');
    const isOcean = item.answer.includes('Ocean');
    const isMountain = item.answer.includes('Mount') || item.answer.includes('Peak');
    const isRiver = item.answer.includes('River') || item.answer === 'Nile' || item.answer === 'Seine' || item.answer === 'Thames' || item.answer === 'Tiber';
    const isLake = item.answer.includes('Lake') || item.answer.includes('Loch');
    const isDesert = item.answer.includes('Desert');

    if (isYear) {
      const year = parseInt(item.answer);
      while (distractors.length < 3) {
        // Generate random fake years within +/- 20 years
        const fakeYear = year + Math.floor(Math.random() * 41) - 20;
        if (fakeYear !== year && !distractors.includes(fakeYear.toString())) {
          distractors.push(fakeYear.toString());
        }
      }
    } else if (isNumber) {
      const num = parseInt(item.answer);
      while (distractors.length < 3) {
        // Generate fake numbers within +/- 30%
        const offset = Math.floor(num * 0.3);
        const fakeNum = num + Math.floor(Math.random() * (offset * 2 + 1)) - offset;
        const candidate = fakeNum === num ? num + 1 : fakeNum;
        if (!distractors.includes(candidate.toString())) {
          distractors.push(candidate.toString());
        }
      }
    } else if (isDate) {
      const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      const hasYear = item.answer.includes(',');
      while (distractors.length < 3) {
        const fakeMonth = months[Math.floor(Math.random() * months.length)];
        const fakeDay = Math.floor(Math.random() * 28) + 1; // 1 to 28 to avoid invalid days
        let fakeDate = `${fakeMonth} ${fakeDay}`;
        if (hasYear) {
          const yearMatch = item.answer.match(/\d{4}/);
          if (yearMatch) {
            const year = parseInt(yearMatch[0]);
            const fakeYear = year + Math.floor(Math.random() * 11) - 5; // +/- 5 years
            fakeDate += `, ${fakeYear}`;
          }
        }
        if (fakeDate !== item.answer && !distractors.includes(fakeDate)) {
          distractors.push(fakeDate);
        }
      }
    } else if (isOcean) {
      distractors = [...OCEANS].filter(x => x !== item.answer).sort(() => 0.5 - Math.random()).slice(0, 3);
    } else if (isSea) {
      distractors = [...SEAS].filter(x => x !== item.answer).sort(() => 0.5 - Math.random()).slice(0, 3);
    } else if (isMountain) {
      distractors = [...MOUNTAINS].filter(x => x !== item.answer).sort(() => 0.5 - Math.random()).slice(0, 3);
    } else if (isRiver) {
      distractors = [...RIVERS].filter(x => x !== item.answer).sort(() => 0.5 - Math.random()).slice(0, 3);
    } else if (isLake) {
      distractors = [...LAKES].filter(x => x !== item.answer).sort(() => 0.5 - Math.random()).slice(0, 3);
    } else if (isDesert) {
      distractors = [...DESERTS].filter(x => x !== item.answer).sort(() => 0.5 - Math.random()).slice(0, 3);
    } else {
      const hasDigits = /\d/.test(item.answer);

      // Pick random text distractors from the rest of the dataset
      let allOtherAnswers = data
        .map(q => q.answer)
        .filter(ans => ans !== item.answer);

      // If the correct answer has no numbers, filter out any distractors with numbers
      if (!hasDigits) {
        allOtherAnswers = allOtherAnswers.filter(ans => !/\d/.test(ans));
      }

      const shuffledOthers = allOtherAnswers.sort(() => 0.5 - Math.random());
      distractors = Array.from(new Set(shuffledOthers)).slice(0, 3);

      // Fallback if dataset is too small
      while (distractors.length < 3) {
        distractors.push("Unknown " + Math.random().toString(36).substr(2, 5));
      }
    }

    const options = [item.answer, ...distractors].sort(() => 0.5 - Math.random());
    const correctAnswer = options.indexOf(item.answer);

    return {
      text: item.question,
      options,
      correctAnswer
    };
  }, []);

  const loadNextQuestion = useCallback((cat: Category) => {
    let fullData = bangladeshData;
    if (cat === 'international') fullData = internationalData;
    if (cat === 'geography') fullData = geographyData;

    if (remainingDataRef.current.length === 0) {
      remainingDataRef.current = [...fullData].sort(() => 0.5 - Math.random());
    }

    const nextItem = remainingDataRef.current.pop() || fullData[0];

    setCurrentQuestion(generateQuestion(nextItem, fullData));
    setSelectedAnswer(null);
    setIsAnswerRevealed(false);
  }, [generateQuestion]);

  const startGame = (selectedCategory: Category) => {
    remainingDataRef.current = [];
    setCategory(selectedCategory);
    setGameState('playing');
    setScore(0);
    setTimeLeft(60);
    setIsShaking(false);
    setFeedback(null);
    loadNextQuestion(selectedCategory);
  };

  // Timer Effect
  useEffect(() => {
    if (gameState !== 'playing') return;

    if (timeLeft <= 0) {
      setGameState('results');
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, gameState]);

  const triggerFeedback = (type: 'plus' | 'minus', value: number) => {
    setFeedback({ type, value });
    if (type === 'minus') {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    }
    setTimeout(() => setFeedback(null), 800);
  };

  const handleAnswerSelect = (optionIndex: number) => {
    if (isAnswerRevealed || !currentQuestion) return;

    setSelectedAnswer(optionIndex);
    setIsAnswerRevealed(true);

    const isCorrect = optionIndex === currentQuestion.correctAnswer;
    if (isCorrect) {
      setScore(prev => prev + 1);
      setTimeLeft(prev => prev + 3);
      triggerFeedback('plus', 3);
    } else {
      setTimeLeft(prev => Math.max(0, prev - 5));
      triggerFeedback('minus', 5);
    }

    // Load next question quickly
    setTimeout(() => {
      if (timeLeft > 0 && gameState === 'playing') {
        loadNextQuestion(category);
      }
    }, 600); // 600ms delay to show right/wrong
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
                router.push('/learn');
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
            <p className="text-foreground/60">60 seconds. +3s for correct. -1s for wrong.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-4xl">
            <Card
              onClick={() => startGame('bangladesh')}
              className="flex flex-col items-center justify-center p-8 hover:-translate-y-2 group cursor-pointer"
            >
              <div className="p-6 rounded-3xl bg-black/5 dark:bg-white/5 mb-6 group-hover:scale-110 transition-transform text-accent">
                <MapPin className="w-12 h-12" />
              </div>
              <h3 className="text-xl font-bold text-center">Bangladesh</h3>
            </Card>

            <Card
              onClick={() => startGame('international')}
              className="flex flex-col items-center justify-center p-8 hover:-translate-y-2 group cursor-pointer"
            >
              <div className="p-6 rounded-3xl bg-black/5 dark:bg-white/5 mb-6 group-hover:scale-110 transition-transform text-accent-secondary">
                <Globe className="w-12 h-12" />
              </div>
              <h3 className="text-xl font-bold text-center">International</h3>
            </Card>

            <Card
              onClick={() => startGame('geography')}
              className="flex flex-col items-center justify-center p-8 hover:-translate-y-2 group cursor-pointer"
            >
              <div className="p-6 rounded-3xl bg-black/5 dark:bg-white/5 mb-6 group-hover:scale-110 transition-transform text-green-500">
                <Compass className="w-12 h-12" />
              </div>
              <h3 className="text-xl font-bold text-center">Geography</h3>
            </Card>
          </div>
        </section>
      )}

      {gameState === 'playing' && currentQuestion && (
        <section className="space-y-8 max-w-2xl mx-auto w-full animate-in slide-in-from-bottom-8 duration-500">
          <div className={`flex justify-between items-center p-6 rounded-3xl shadow-neo-out transition-colors duration-300 ${timeLeft <= 10 ? 'bg-red-500/10' : 'bg-card'}`}>
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl ${timeLeft <= 10 ? 'bg-red-500 text-white animate-pulse' : 'bg-accent text-white'}`}>
                <Timer className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground/50 uppercase tracking-wider">Time Left</p>
                <div className="flex items-baseline gap-2 relative">
                  <p className={`text-3xl font-black tabular-nums ${timeLeft <= 10 ? 'text-red-500' : 'text-foreground'}`}>
                    {Math.max(0, timeLeft)}s
                  </p>
                  {feedback && (
                    <span className={`absolute -right-8 top-1 font-bold animate-in slide-in-from-bottom-2 fade-in ${feedback.type === 'plus' ? 'text-green-500' : 'text-red-500'}`}>
                      {feedback.type === 'plus' ? '+' : '-'}{feedback.value}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="text-right">
              <p className="text-sm font-semibold text-foreground/50 uppercase tracking-wider">Score</p>
              <div className="flex items-center gap-2 text-3xl font-black text-accent">
                {score}
                <Flame className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className={`min-h-[120px] flex items-center justify-center transition-transform ${isShaking ? 'animate-shake' : ''}`}>
            <h2 className="text-2xl sm:text-3xl font-bold text-center leading-tight">
              {currentQuestion.text}
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrect = index === currentQuestion.correctAnswer;

              let buttonStyle = "bg-card";
              let textStyle = "text-foreground";

              if (isAnswerRevealed) {
                if (isCorrect) {
                  buttonStyle = "bg-green-500/10 border-green-500 dark:bg-green-500/20 shadow-none";
                  textStyle = "text-green-600 dark:text-green-400 font-bold";
                } else if (isSelected) {
                  buttonStyle = "bg-red-500/10 border-red-500 dark:bg-red-500/20 shadow-none";
                  textStyle = "text-red-600 dark:text-red-400 font-bold";
                }
              } else if (isSelected) {
                buttonStyle = "bg-accent/10 border-accent";
              }

              return (
                <Card
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  className={`p-6 border-2 border-transparent transition-all duration-300 ${buttonStyle} ${!isAnswerRevealed ? 'hover:scale-[1.02] cursor-pointer shadow-neo-out' : 'cursor-default'}`}
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
            <h2 className="text-4xl font-extrabold">Time's Up!</h2>
            <p className="text-xl text-foreground/70">
              You scored <span className="text-3xl font-bold text-accent mx-2">{score}</span> points.
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
              onClick={() => router.push('/learn')}
              className="flex-1 py-4 px-6 rounded-2xl bg-card font-bold text-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors active:scale-95 shadow-neo-out"
            >
              Back to Learn
            </button>
          </div>
        </section>
      )}
    </main>
  );
}
