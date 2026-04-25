'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card } from '@/components/ui/Card';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { ArrowLeft, Globe, MapPin, CheckCircle2, XCircle, Trophy, Compass, Timer, Flame, Brain, HelpCircle, Star, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { LessonProgressBar } from '@/components/learn/LessonProgressBar';
import { MCQInteraction } from '@/components/learn/MCQInteraction';
import geographyData from '@/stored-data/geography.json';
import bangladeshData from '@/stored-data/bangladesh.json';
import internationalData from '@/stored-data/international.json';
import { useUserStore } from '@/store/userStore';

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
  const updateStats = useUserStore((state) => state.updateStats);
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'results'>('menu');
  const [category, setCategory] = useState<Category>(null);

  // Game state
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isShaking, setIsShaking] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'plus' | 'minus', value: number } | null>(null);

  // Interaction state (Handled by MCQInteraction now)


  // Track remaining questions to prevent repeats
  const remainingDataRef = useRef<{ question: string, answer: string }[]>([]);

  // Helper: Smart distractor generator
  const generateQuestion = useCallback((item: { question: string, answer: string }, data: { question: string, answer: string }[]): Question => {

    let distractors: string[] = [];
    const isYear = /^(17|18|19|20)\d{2}$/.test(item.answer);
    const isNumber = /^\d+$/.test(item.answer);
    const isDate = /^(January|February|March|April|May|June|July|August|September|October|November|December)\s\d{1,2}(,\s\d{4})?$/.test(item.answer);

    const isSea = item.answer.includes('Sea') || item.answer.includes('Bay') || item.answer.includes('Gulf');
    const isOcean = item.answer.includes('Ocean');
    const isMountain = item.answer.includes('Mount') || item.answer.includes('Peak');
    const isRiver = item.answer.includes('River') || item.answer === 'Nile' || item.answer === 'Seine' || item.answer === 'Thames' || item.answer === 'Tiber';
    const isLake = item.answer.includes('Lake') || item.answer.includes('Loch');
    const isDesert = item.answer.includes('Desert');

    if (isYear) {
      const year = parseInt(item.answer);
      while (distractors.length < 3) {
        const fakeYear = year + Math.floor(Math.random() * 41) - 20;
        if (fakeYear !== year && !distractors.includes(fakeYear.toString())) {
          distractors.push(fakeYear.toString());
        }
      }
    } else if (isNumber) {
      const num = parseInt(item.answer);
      while (distractors.length < 3) {
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
        const fakeDay = Math.floor(Math.random() * 28) + 1;
        let fakeDate = `${fakeMonth} ${fakeDay}`;
        if (hasYear) {
          const yearMatch = item.answer.match(/\d{4}/);
          if (yearMatch) {
            const year = parseInt(yearMatch[0]);
            const fakeYear = year + Math.floor(Math.random() * 11) - 5;
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
      let allOtherAnswers = data
        .map(q => q.answer)
        .filter(ans => ans !== item.answer);
      if (!hasDigits) {
        allOtherAnswers = allOtherAnswers.filter(ans => !/\d/.test(ans));
      }
      const shuffledOthers = allOtherAnswers.sort(() => 0.5 - Math.random());
      distractors = Array.from(new Set(shuffledOthers)).slice(0, 3);
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
  }, [generateQuestion]);

  const startGame = (selectedCategory: Category) => {
    remainingDataRef.current = [];
    setCategory(selectedCategory);
    setGameState('playing');
    setScore(0);
    const params = new URLSearchParams(window.location.search);
    const time = parseInt(params.get('time') || '1');
    const scaledTime = Math.min(300, Math.max(60, time * 60));
    setTimeLeft(scaledTime);
    setIsShaking(false);
    setFeedback(null);
    loadNextQuestion(selectedCategory);
  };

  // Timer Effect
  useEffect(() => {
    if (gameState !== 'playing') return;

    if (timeLeft <= 0) {
      setGameState('results');
      useUserStore.getState().completeActivity('trivia');
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



  const resetGame = () => {
    setGameState('menu');
    setCategory(null);
  };

  const categoryIcon = category === 'bangladesh' ? MapPin : category === 'international' ? Globe : Compass;

  return (
    <main className="min-h-screen max-w-4xl mx-auto flex flex-col p-4 animate-in fade-in duration-700">
      {gameState === 'menu' ? (
        <>
          <div className="w-full flex items-center mb-8">
            <button
              onClick={() => router.push('/learn')}
              className="p-3 rounded-2xl bg-transparent hover:bg-foreground/5 text-accent-secondary transition-all active:scale-95"
              aria-label="Back to Hub"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center space-y-12 py-12">
            <div className="text-center space-y-4">
              <div className="inline-block p-4 rounded-3xl bg-accent-secondary/10 text-accent-secondary shadow-neo-out mb-2">
                <Brain className="w-12 h-12" />
              </div>
              <h1 className="text-6xl font-black tracking-tighter text-foreground">Trivia</h1>
              <p className="text-xl font-bold text-foreground/50 tracking-wide uppercase">Select a Topic</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 w-full">
              {[
                { id: 'bangladesh', title: 'Bangladesh', icon: MapPin, color: 'text-accent' },
                { id: 'international', title: 'International', icon: Globe, color: 'text-accent-secondary' },
                { id: 'geography', title: 'Geography', icon: Compass, color: 'text-blue-400' }
              ].map((cat) => (
                <Card
                  key={cat.id}
                  onClick={() => startGame(cat.id as Category)}
                  className="flex flex-col items-center justify-center p-10 hover:-translate-y-2 group cursor-pointer rounded-[3rem] border-none shadow-neo-out bg-card transition-all"
                >
                  <div className={`p-8 rounded-[2.5rem] bg-black/5 dark:bg-white/5 mb-6 group-hover:scale-110 group-hover:shadow-neo-in transition-all ${cat.color}`}>
                    <cat.icon className="w-16 h-16" />
                  </div>
                  <h3 className="text-2xl font-black tracking-tight">{cat.title}</h3>
                </Card>
              ))}
            </div>
          </div>
        </>
      ) : gameState === 'playing' && currentQuestion ? (
        <div className="flex-1 flex flex-col py-4">
          <LessonProgressBar current={60 - timeLeft} total={60} onClose={resetGame} />

          <div className="flex-1 mt-4 space-y-8 max-w-2xl mx-auto w-full animate-in slide-in-from-bottom-8 duration-500">
            {/* Header Info */}
            <div className="flex justify-between items-center gap-4">
              <div className={`flex items-center gap-4 px-6 py-4 rounded-3xl shadow-neo-in bg-card transition-colors duration-300 ${timeLeft <= 10 ? 'border-2 border-red-500/50' : 'border-none'}`}>
                <div className={`p-2 rounded-xl ${timeLeft <= 10 ? 'bg-[#DC2626] text-white animate-pulse' : 'bg-accent-secondary text-white'}`}>
                  <Timer className="w-6 h-6" />
                </div>
                <div className="relative">
                  <p className={`text-3xl font-black tabular-nums ${timeLeft <= 10 ? 'text-red-500' : 'text-foreground'}`}>
                    {Math.max(0, timeLeft)}s
                  </p>
                  {feedback && (
                    <span className={`absolute -right-12 top-0 font-black text-xl animate-in slide-in-from-bottom-2 fade-in ${feedback.type === 'plus' ? 'text-accent' : 'text-orange-600'}`}>
                      {feedback.type === 'plus' ? '+' : '-'}{feedback.value}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4 px-6 py-4 rounded-3xl shadow-neo-in bg-card border-none">
                <p className="text-3xl font-black text-accent-secondary">{score}</p>
                <div className="p-2 rounded-xl bg-accent-secondary text-white">
                  <Flame className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Question Card */}
            <div className={`relative p-10 rounded-[3rem] shadow-neo-out bg-card overflow-hidden transition-transform ${isShaking ? 'animate-shake' : ''}`}>
              <div className="absolute -top-12 -right-12 text-accent-secondary/5 rotate-12">
                {React.createElement(categoryIcon, { className: "w-64 h-64" })}
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-center leading-tight relative z-10 tracking-tight">
                {currentQuestion.text}
              </h2>
            </div>

            {/* Options using MCQInteraction */}
            <MCQInteraction
              question={currentQuestion.text}
              options={currentQuestion.options.map((option, index) => ({
                optiontext: option,
                is_correct: index === currentQuestion.correctAnswer
              }))}
              manualConfirm={false}
              autoSubmit={true}
              showQuestion={false}
              onSubmit={(isCorrect) => {
                if (isCorrect) {
                  setScore(prev => prev + 1);
                  setTimeLeft(prev => prev + 3);
                  triggerFeedback('plus', 3);
                } else {
                  setTimeLeft(prev => Math.max(0, prev - 5));
                  triggerFeedback('minus', 5);
                }

                if (timeLeft > 0 && gameState === 'playing') {
                  loadNextQuestion(category);
                }
              }}
            />
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col justify-center items-center space-y-12 py-12 animate-in zoom-in-95 duration-700">
          <div className="w-40 h-40 bg-accent-secondary/20 text-accent-secondary rounded-[3rem] flex items-center justify-center shadow-neo-out border-4 border-accent-secondary/10 relative overflow-hidden">
            <Trophy className="w-20 h-20 animate-bounce" />
            <Star className="absolute top-4 right-4 w-8 h-8 text-yellow-500/50 animate-pulse" />
          </div>

          <div className="text-center space-y-4">
            <h2 className="text-6xl font-black tracking-tighter">Time's Up!</h2>
            <p className="text-2xl font-bold text-foreground/50 tracking-tight">
              You achieved a score of <span className="text-5xl text-accent-secondary mx-2">{score}</span>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 w-full max-w-md">
            <button
              onClick={resetGame}
              className="flex-1 py-6 px-8 rounded-[2rem] bg-accent-secondary text-white font-black text-2xl shadow-neo-out hover:scale-105 active:scale-95 transition-all"
            >
              Try Again
            </button>
            <button
              onClick={() => router.push('/learn')}
              className="flex-1 py-6 px-8 rounded-[2rem] bg-card text-foreground/50 font-black text-2xl shadow-neo-out hover:scale-105 active:scale-95 transition-all"
            >
              Finish
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
