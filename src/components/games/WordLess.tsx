'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/Button';

interface WordLessProps {
  onComplete: (xp: number) => void;
  targetWord?: string; // For testing, otherwise random from vocab
}

export const WordLess = ({ onComplete, targetWord = "GUESS" }: WordLessProps) => {
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState("");
  const [status, setStatus] = useState<'playing' | 'won' | 'lost'>('playing');

  const MAX_GUESSES = 6;
  const WORD_LENGTH = targetWord.length;

  const onKeyPress = useCallback((e: KeyboardEvent) => {
    if (status !== 'playing') return;

    if (e.key === 'Enter') {
      if (currentGuess.length === WORD_LENGTH) {
        const newGuesses = [...guesses, currentGuess.toUpperCase()];
        setGuesses(newGuesses);
        setCurrentGuess("");

        if (currentGuess.toUpperCase() === targetWord.toUpperCase()) {
          setStatus('won');
          setTimeout(() => onComplete(50), 1500);
        } else if (newGuesses.length >= MAX_GUESSES) {
          setStatus('lost');
          setTimeout(() => onComplete(10), 1500);
        }
      }
    } else if (e.key === 'Backspace') {
      setCurrentGuess(prev => prev.slice(0, -1));
    } else if (/^[a-zA-Z]$/.test(e.key) && currentGuess.length < WORD_LENGTH) {
      setCurrentGuess(prev => prev + e.key.toUpperCase());
    }
  }, [currentGuess, guesses, status, targetWord, WORD_LENGTH, onComplete]);

  useEffect(() => {
    window.addEventListener('keydown', onKeyPress);
    return () => window.removeEventListener('keydown', onKeyPress);
  }, [onKeyPress]);

  const getLetterClass = (guess: string, index: number) => {
    const letter = guess[index];
    const target = targetWord.toUpperCase();
    
    // 1. Correct position (Green)
    if (target[index] === letter) return 'bg-accent text-white border-accent';
    
    // 2. Letter not in word at all (Gray)
    if (!target.includes(letter)) return 'bg-foreground/10 text-foreground border-foreground/5';

    // 3. Sophisticated Wordle logic for 'Present' (Yellow/Orange)
    // We only color it if there are more instances of this letter in the target 
    // that haven't been matched by 'Correct' positions.
    
    // Count how many times this letter appears in the target
    let targetCount = 0;
    for (let i = 0; i < target.length; i++) {
      if (target[i] === letter) targetCount++;
    }

    // Subtract the ones that the user already got in the 'Correct' (Green) positions
    let correctMatches = 0;
    for (let i = 0; i < target.length; i++) {
      if (guess[i] === letter && target[i] === letter) correctMatches++;
    }

    // Count how many times this letter appeared in the guess BEFORE this current index
    // that were marked as 'Present' (Yellow)
    let previousPresentMatches = 0;
    for (let i = 0; i < index; i++) {
      if (guess[i] === letter && target[i] !== letter && target.includes(letter)) {
        // This is a bit tricky: we need to know if the earlier one was actually colored yellow
        // A letter at index 'i' is colored yellow if targetCount > (correctMatches + previousPresentsBeforeI)
        previousPresentMatches++;
      }
    }

    const remainingToColor = targetCount - correctMatches;
    if (previousPresentMatches < remainingToColor) {
      return 'bg-accent-secondary text-white border-accent-secondary';
    }

    return 'bg-foreground/10 text-foreground border-foreground/5';
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-8 animate-in fade-in duration-500">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-black">WordLess</h2>
        <p className="text-foreground/40">Guess the {WORD_LENGTH}-letter word</p>
      </div>

      <div className="grid gap-2">
        {Array.from({ length: MAX_GUESSES }).map((_, i) => {
          const guess = guesses[i] || (i === guesses.length ? currentGuess : "");
          return (
            <div key={i} className="flex gap-2">
              {Array.from({ length: WORD_LENGTH }).map((_, j) => (
                <div 
                  key={j} 
                  className={`w-12 h-12 flex items-center justify-center border-2 rounded-xl text-xl font-bold transition-all duration-500 ${
                    guesses[i] ? getLetterClass(guesses[i], j) : 'border-foreground/10'
                  } ${i === guesses.length && guess[j] ? 'scale-110 border-accent/50' : ''}`}
                >
                  {guess[j] || ""}
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {status !== 'playing' && (
        <div className="text-center animate-bounce">
          <p className="text-2xl font-bold">{status === 'won' ? "🎉 Brilliant!" : `Target: ${targetWord}`}</p>
        </div>
      )}
    </div>
  );
};
