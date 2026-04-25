'use client';

import React, { useState, useEffect } from 'react';
import { LessonProgressBar } from '@/components/learn/LessonProgressBar';
import { EnglishFITBInteraction } from '@/components/learn/EnglishFITBInteraction';
import { Card } from '@/components/ui/Card';
import { ArrowLeft, CheckCircle2, XCircle, BookOpen, ChevronLeft, Loader2, Play, Combine, RefreshCcw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/userStore';
import vocabData from '@/stored-data/english-vocab.json';

const shuffle = <T,>(array: T[]): T[] => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

type Option = { word: string; meaning: string };
type FillQuestion = { text: string; answer: string; options: Option[] };
type MatchRound = { words: string[]; meanings: Option[] };

export default function EnglishModule() {
  const router = useRouter();
  const updateStats = useUserStore(state => state.updateStats);
  const addEnglishReviewWord = useUserStore(state => state.addEnglishReviewWord);
  const englishReviewWords = useUserStore(state => state.englishReviewWords);
  const recordEnglishReviewSuccess = useUserStore(state => state.recordEnglishReviewSuccess);

  const [viewMode, setViewMode] = useState<'menu' | 'fill' | 'match' | 'review'>('menu');
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fill & Review State
  const [fillQuestions, setFillQuestions] = useState<FillQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);



  // Match State
  const [matchRounds, setMatchRounds] = useState<MatchRound[]>([]);
  const [selectedWordIdx, setSelectedWordIdx] = useState<number | null>(null);
  const [selectedMeaningIdx, setSelectedMeaningIdx] = useState<number | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);
  const [errorPair, setErrorPair] = useState<{ word: number, meaning: number } | null>(null);
  const [isRoundComplete, setIsRoundComplete] = useState(false);

  const startFillMode = () => {
    setLoading(true);
    const session = shuffle(vocabData).slice(0, 10).map(item => {
      const distractors = shuffle(vocabData.filter(v => v.answer !== item.answer)).slice(0, 3);
      const options = shuffle([item, ...distractors]).map(o => ({ word: o.answer, meaning: o.definition }));
      return { text: item.question.replace('______', '___'), answer: item.answer, options };
    });
    setFillQuestions(session);
    setScore(0);
    setCurrentIndex(0);
    setViewMode('fill');
    setLoading(false);
  };

  const startMatchMode = () => {
    setLoading(true);
    const rounds: MatchRound[] = [];
    const pool = shuffle(vocabData);
    for (let i = 0; i < 3; i++) {
      const slice = pool.slice(i * 5, i * 5 + 5);
      const words = shuffle(slice.map(s => s.answer));
      const meanings = shuffle(slice.map(s => ({ word: s.answer, meaning: s.definition })));
      rounds.push({ words, meanings });
    }
    setMatchRounds(rounds);
    setMatchedPairs([]);
    setScore(0);
    setCurrentIndex(0);
    setViewMode('match');
    setLoading(false);
  };

  const startReviewMode = () => {
    setLoading(true);
    const wordsToReview = Object.keys(englishReviewWords);
    if (wordsToReview.length < 5) {
      setFillQuestions([]);
      setViewMode('review');
      setLoading(false);
      return;
    }

    const sessionWords = shuffle(wordsToReview).slice(0, 10);
    const session = sessionWords.map(word => {
      const item = vocabData.find(v => v.answer === word);
      if (!item) return null;
      const distractors = shuffle(vocabData.filter(v => v.answer !== item.answer)).slice(0, 3);
      const options = shuffle([item, ...distractors]).map(o => ({ word: o.answer, meaning: o.definition }));
      return { text: item.question.replace('______', '___'), answer: item.answer, options };
    }).filter(Boolean) as FillQuestion[];

    setFillQuestions(session);
    setScore(0);
    setCurrentIndex(0);
    setViewMode('review');
    setLoading(false);
  };


  const handleFITBSubmit = (isCorrect: boolean, selectedWord: string) => {
    const currentQ = fillQuestions[currentIndex];

    if (isCorrect) {
      setScore(prev => prev + 5);
      if (viewMode === 'review') {
        recordEnglishReviewSuccess(currentQ.answer);
      }
    } else {
      setScore(prev => prev - 3);
      addEnglishReviewWord(currentQ.answer);
    }

    setCurrentIndex(prev => prev + 1);
  };

  // Match Mode Logic
  useEffect(() => {
    if (viewMode === 'match' && selectedWordIdx !== null && selectedMeaningIdx !== null) {
      const currentRound = matchRounds[currentIndex];
      const word = currentRound.words[selectedWordIdx];
      const meaningOpt = currentRound.meanings[selectedMeaningIdx];

      if (word === meaningOpt.word) {
        setMatchedPairs(prev => [...prev, word]);
        setScore(prev => prev + 5);
        setSelectedWordIdx(null);
        setSelectedMeaningIdx(null);
      } else {
        setErrorPair({ word: selectedWordIdx, meaning: selectedMeaningIdx });
        addEnglishReviewWord(word);
        setScore(prev => prev - 3);

        setTimeout(() => {
          setErrorPair(null);
          setSelectedWordIdx(null);
          setSelectedMeaningIdx(null);
        }, 1000);
      }
    }
  }, [selectedWordIdx, selectedMeaningIdx, currentIndex, matchRounds, addEnglishReviewWord, viewMode]);

  useEffect(() => {
    if (viewMode === 'match' && matchRounds.length > 0 && matchedPairs.length === 5) {
      setIsRoundComplete(true);
    }
  }, [matchedPairs.length, viewMode, matchRounds.length]);

  const handleNextRound = () => {
    setMatchedPairs([]);
    setIsRoundComplete(false);
    setCurrentIndex(prev => prev + 1);
  };

  const finishSession = () => {
    const minutes = Math.max(1, Math.floor(currentIndex / 2));
    updateStats(minutes, 'english_vocab', score);
    setCurrentIndex(0);
    setScore(0);
    setViewMode('menu');
  };

  if (loading) {
    return <main className="min-h-screen flex items-center justify-center"><Loader2 className="w-12 h-12 animate-spin text-blue-400" /></main>
  }

  // ==== MENU VIEW ====
  if (viewMode === 'menu') {
    return (
      <main className="min-h-screen max-w-4xl mx-auto p-6 flex flex-col animate-in fade-in duration-700">
        <div className="w-full flex items-center mb-8">
          <button
            onClick={() => {
              setCurrentIndex(0);
              setScore(0);
              router.push('/learn');
            }}
            className="p-3 rounded-2xl bg-transparent hover:bg-foreground/5 text-blue-400 transition-all active:scale-95"
            aria-label="Back to Hub"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 flex flex-col justify-center space-y-12">
          <div className="space-y-4 text-center">
            <h1 className="text-6xl font-black tracking-tighter text-foreground italic">
              English <span className="text-blue-400">Mastery</span>
            </h1>
            <p className="text-xl text-foreground/60 font-medium max-w-xl mx-auto">
              Expand your vocabulary through context, meaning, and targeted review.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button onClick={startFillMode} className="group relative p-1 rounded-[3rem] bg-gradient-to-br from-blue-400 to-blue-600 transition-all hover:scale-[1.02] active:scale-95 shadow-neo-out">
              <div className="bg-card rounded-[2.8rem] p-8 h-full flex flex-col items-center text-center space-y-6">
                <div className="w-16 h-16 bg-blue-400/10 text-blue-400 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Play size={32} strokeWidth={2.5} />
                </div>
                <div>
                  <h2 className="text-2xl font-black mb-2">Fill in Blanks</h2>
                  <p className="text-sm text-foreground/60 font-bold">Use context clues to find the missing word.</p>
                </div>
              </div>
            </button>

            <button onClick={startMatchMode} className="group relative p-1 rounded-[3rem] bg-gradient-to-br from-blue-400 to-blue-600 transition-all hover:scale-[1.02] active:scale-95 shadow-neo-out">
              <div className="bg-card rounded-[2.8rem] p-8 h-full flex flex-col items-center text-center space-y-6">
                <div className="w-16 h-16 bg-blue-400/10 text-blue-400 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Combine size={32} strokeWidth={2.5} />
                </div>
                <div>
                  <h2 className="text-2xl font-black mb-2">Word Match</h2>
                  <p className="text-sm text-foreground/60 font-bold">Connect 5 words with their correct definitions.</p>
                </div>
              </div>
            </button>

            <button
              onClick={startReviewMode}
              disabled={Object.keys(englishReviewWords).length < 5}
              className={`group relative p-1 rounded-[3rem] transition-all shadow-neo-out ${Object.keys(englishReviewWords).length < 5 ? 'bg-foreground/10 cursor-not-allowed opacity-50' : 'bg-gradient-to-br from-blue-400 to-blue-600 hover:scale-[1.02] active:scale-95'}`}
            >
              <div className="bg-card rounded-[2.8rem] p-8 h-full flex flex-col items-center text-center space-y-6">
                <div className="w-16 h-16 bg-blue-400/10 text-blue-400 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <RefreshCcw size={32} strokeWidth={2.5} />
                </div>
                <div>
                  <h2 className="text-2xl font-black mb-2">Review Words</h2>
                  <p className="text-sm text-foreground/60 font-bold">
                    {Object.keys(englishReviewWords).length < 5
                      ? `Need ${5 - Object.keys(englishReviewWords).length} more words to unlock.`
                      : "Master the words you've missed previously."}
                  </p>
                </div>
                {Object.keys(englishReviewWords).length > 0 && (
                  <div className="px-4 py-1 bg-blue-400/20 text-blue-400 rounded-full text-xs font-black uppercase tracking-widest">
                    {Object.keys(englishReviewWords).length} to Review
                  </div>
                )}
              </div>
            </button>
          </div>
        </div>
      </main>
    );
  }

  // ==== END OF SESSION SCREEN ====
  const currentTotal = viewMode === 'match' ? matchRounds.length : fillQuestions.length;

  if ((viewMode === 'fill' || viewMode === 'review') && currentIndex >= fillQuestions.length && fillQuestions.length > 0) {
    return (
      <main className="min-h-screen max-w-2xl mx-auto p-6 flex flex-col justify-center items-center space-y-8 animate-in zoom-in-95 duration-700">
        <div className="w-32 h-32 bg-blue-400/20 text-blue-400 rounded-[2.5rem] flex items-center justify-center shadow-neo-out border-2 border-blue-400/20">
          <BookOpen className="w-16 h-16 animate-bounce" />
        </div>
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-black tracking-tight text-center">Session Complete!</h1>
          <p className="text-foreground/70 text-lg text-center max-w-md font-medium">
            Great job! You scored <span className="text-blue-400 font-black">{score}</span> points.
          </p>
        </div>
        <button onClick={finishSession} className="w-full sm:w-auto px-12 py-5 bg-blue-400 text-white rounded-2xl font-black text-xl shadow-neo-out hover:scale-105 active:scale-95 transition-all">
          Return to Menu
        </button>
      </main>
    );
  }

  if (viewMode === 'match' && currentIndex >= matchRounds.length && matchRounds.length > 0) {
    return (
      <main className="min-h-screen max-w-2xl mx-auto p-6 flex flex-col justify-center items-center space-y-8 animate-in zoom-in-95 duration-700">
        <div className="w-32 h-32 bg-blue-400/20 text-blue-400 rounded-[2.5rem] flex items-center justify-center shadow-neo-out border-2 border-blue-400/20">
          <Combine className="w-16 h-16 animate-bounce" />
        </div>
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-black tracking-tight text-center">Matching Complete!</h1>
          <p className="text-foreground/70 text-lg text-center max-w-md font-medium">
            You scored <span className="text-blue-400 font-black">{score}</span> points.
          </p>
        </div>
        <button onClick={finishSession} className="w-full sm:w-auto px-12 py-5 bg-blue-400 text-white rounded-2xl font-black text-xl shadow-neo-out hover:scale-105 active:scale-95 transition-all">
          Return to Menu
        </button>
      </main>
    );
  }

  if (viewMode === 'review' && fillQuestions.length === 0) {
    return (
      <main className="min-h-screen max-w-2xl mx-auto p-6 flex flex-col justify-center items-center space-y-8 animate-in zoom-in-95 duration-700">
        <div className="w-32 h-32 bg-blue-400/20 text-blue-400 rounded-[2.5rem] flex items-center justify-center shadow-neo-out border-2 border-blue-400/20">
          <CheckCircle2 className="w-16 h-16" />
        </div>
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-black tracking-tight text-center">Not enough words!</h1>
          <p className="text-foreground/70 text-lg text-center max-w-md font-medium">
            You need at least 5 words in your review queue to start a session. Keep learning!
          </p>
        </div>
        <button onClick={() => setViewMode('menu')} className="w-full sm:w-auto px-12 py-5 bg-blue-400 text-white rounded-2xl font-black text-xl shadow-neo-out hover:scale-105 active:scale-95 transition-all">
          Return to Menu
        </button>
      </main>
    );
  }

  // ==== ACTIVE SESSION UI ====
  return (
    <main className="min-h-screen max-w-4xl mx-auto p-4 flex flex-col">
      <div className="pt-4 px-2 mb-8 flex items-center justify-between">
        <div className="flex-1 max-w-2xl mx-auto">
          <LessonProgressBar current={currentIndex} total={currentTotal} onClose={finishSession} />
        </div>
        <div className="ml-4 px-4 py-2 bg-blue-400/10 rounded-xl shadow-neo-in">
          <span className="font-black text-blue-400">{score} pts</span>
        </div>
      </div>
      <div className="flex-1 pb-12 px-2 flex flex-col">
        {(viewMode === 'fill' || viewMode === 'review') && fillQuestions[currentIndex] && (
          <EnglishFITBInteraction
            key={currentIndex}
            question={fillQuestions[currentIndex].text}
            options={fillQuestions[currentIndex].options}
            answer={fillQuestions[currentIndex].answer}
            onSubmit={handleFITBSubmit}
          />
        )}

        {/* MATCH MODE */}
        {viewMode === 'match' && matchRounds[currentIndex] && (
          <div className="animate-in slide-in-from-bottom-8 duration-500 w-full h-full flex flex-col">
            <div className="text-center mb-8">
              <h2 className="text-sm font-black text-blue-400 uppercase tracking-[0.2em]">Match the Words</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1">
              {/* Words Column */}
              <div className="flex flex-col gap-3">
                {matchRounds[currentIndex].words.map((word, i) => {
                  const isMatched = matchedPairs.includes(word);
                  const isSelected = selectedWordIdx === i;
                  const isError = errorPair?.word === i;

                  let style = "bg-card text-foreground border-2 border-transparent hover:border-blue-400/50 hover:scale-[1.02]";
                  if (isMatched) style = "bg-[#7EA68B] text-white opacity-50 cursor-not-allowed shadow-none border-2 border-[#7EA68B]";
                  else if (isError) style = "bg-[#DC2626] text-white border-2 border-[#DC2626]";
                  else if (isSelected) style = "bg-card text-blue-500 border-2 border-blue-400";

                  return (
                    <button
                      key={i}
                      disabled={isMatched || errorPair !== null}
                      onClick={() => setSelectedWordIdx(i)}
                      className={`p-6 text-left rounded-[2rem] shadow-neo-out font-black text-2xl transition-all ${style}`}
                    >
                      {word}
                    </button>
                  );
                })}
              </div>

              {/* Meanings Column */}
              <div className="flex flex-col gap-3">
                {matchRounds[currentIndex].meanings.map((opt, i) => {
                  const isMatched = matchedPairs.includes(opt.word);
                  const isSelected = selectedMeaningIdx === i;
                  const isError = errorPair?.meaning === i;

                  let style = "bg-card text-foreground border-2 border-transparent hover:border-blue-400/50 hover:scale-[1.02]";
                  if (isMatched) style = "bg-[#7EA68B] text-white opacity-50 cursor-not-allowed shadow-none border-2 border-[#7EA68B]";
                  else if (isError) style = "bg-[#DC2626] text-white border-2 border-[#DC2626]";
                  else if (isSelected) style = "bg-card text-blue-500 border-2 border-blue-400";

                  return (
                    <button
                      key={i}
                      disabled={isMatched || errorPair !== null}
                      onClick={() => setSelectedMeaningIdx(i)}
                      className={`p-6 text-left rounded-[2rem] shadow-neo-out font-medium text-lg border-2 border-transparent transition-all h-full ${style}`}
                    >
                      {opt.meaning}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {viewMode === 'match' && isRoundComplete && (
          <div className="mt-8 animate-in zoom-in-95 duration-500">
            <button
              onClick={handleNextRound}
              className="w-full py-6 rounded-[2.5rem] bg-[#7EA68B] text-white font-black text-2xl shadow-neo-out hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 group ring-4 ring-[#7EA68B]/20"
            >
              Next Round

            </button>
          </div>
        )}
      </div>

      {/* Universal Finish Early Button */}
      {viewMode !== 'match' && (
        <div className="pt-4 pb-8 px-2">
          <button onClick={finishSession} className="w-full py-4 rounded-3xl font-bold text-sm transition-all uppercase tracking-widest text-foreground/30 hover:text-foreground/80 active:scale-95 bg-transparent">
            Finish Learning Early
          </button>
        </div>
      )}
      {viewMode === 'match' && (
        <div className="pt-4 pb-8 px-2 max-w-2xl mx-auto w-full">
          <button onClick={finishSession} className="w-full py-4 rounded-3xl font-bold text-sm transition-all uppercase tracking-widest text-foreground/30 hover:text-foreground/80 active:scale-95 bg-transparent">
            Finish Learning Early
          </button>
        </div>
      )}
    </main>
  );
}
