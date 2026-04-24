import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { PartyPopper, Heart } from 'lucide-react';
import { useUserStore } from '@/store/userStore';

interface WordLessProps {
  onComplete: (xp: number) => void;
  targetWord?: string; // For testing, otherwise random from vocab
}

export const WordLess = ({ onComplete, targetWord = "GUESS" }: WordLessProps) => {
  const recordGameStart = useUserStore((state) => state.recordGameStart);
  const recordGameResult = useUserStore((state) => state.recordGameResult);
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState("");
  const [status, setStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [ee, setEe] = useState(false);
  const [kb, setKb] = useState("");

  const startTime = React.useRef<number>(Date.now());
  const gameEnded = React.useRef<boolean>(false);
  const guessesRef = React.useRef<string[]>([]);

  useEffect(() => {
    // Record game start
    recordGameStart('wordless');
    startTime.current = Date.now();
    gameEnded.current = false;

    return () => {
      if (!gameEnded.current && guessesRef.current.length > 0) {
        const timeSpent = (Date.now() - startTime.current) / 1000;
        recordGameResult('wordless', 'quit', timeSpent);
      }
    };
  }, [recordGameResult, recordGameStart]); // Only on mount/unmount

  useEffect(() => {
    guessesRef.current = guesses;
  }, [guesses]);
  const MAX_GUESSES = 6;
  const WORD_LENGTH = targetWord.length;

  const submitGuess = useCallback((guess: string) => {
    if (guess.length !== WORD_LENGTH) return;

    const newGuesses = [...guesses, guess.toUpperCase()];
    setGuesses(newGuesses);
    setCurrentGuess("");

    if (guess.toUpperCase() === targetWord.toUpperCase()) {
      setStatus('won');
      if (!gameEnded.current) {
        gameEnded.current = true;
        const timeSpent = (Date.now() - startTime.current) / 1000;
        recordGameResult('wordless', 'win', timeSpent);
      }
      setTimeout(() => onComplete(50), 1500);
    } else if (newGuesses.length >= MAX_GUESSES) {
      setStatus('lost');
      if (!gameEnded.current) {
        gameEnded.current = true;
        const timeSpent = (Date.now() - startTime.current) / 1000;
        recordGameResult('wordless', 'loss', timeSpent);
      }
      setTimeout(() => onComplete(10), 1500);
    }
  }, [guesses, WORD_LENGTH, targetWord, onComplete, recordGameResult, MAX_GUESSES]);

  const onKeyPress = useCallback((e: KeyboardEvent) => {
    // Easter egg detection
    const t = atob("QXJzaGk=").toLowerCase();
    setKb(p => {
      const n = (p + e.key.toLowerCase()).slice(-t.length);
      if (n === t) setEe(true);
      return n;
    });

    if (status !== 'playing') return;

    if (e.key === 'Enter') {
      submitGuess(currentGuess);
    } else if (e.key === 'Backspace') {
      setCurrentGuess(prev => prev.slice(0, -1));
    } else if (/^[a-zA-Z]$/.test(e.key) && currentGuess.length < WORD_LENGTH) {
      const nextLetter = e.key.toUpperCase();
      const nextGuess = currentGuess + nextLetter;
      setCurrentGuess(nextGuess);
      
      if (nextGuess.length === WORD_LENGTH) {
        submitGuess(nextGuess);
      }
    }
  }, [currentGuess, status, WORD_LENGTH, submitGuess]);

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
          <p className="text-2xl font-bold flex items-center justify-center gap-2">
            {status === 'won' ? <><PartyPopper className="w-6 h-6 text-accent drop-shadow-sm" /> Brilliant!</> : `Target: ${targetWord}`}
          </p>
        </div>
      )}

      {ee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-card p-8 rounded-3xl shadow-neo-out border border-accent/20 max-w-sm w-full text-center space-y-6 animate-in zoom-in duration-300">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
              <Heart className="w-8 h-8 text-red-500 fill-red-500/20" />
            </div>
            <p className="text-xl font-bold leading-relaxed">
              {atob("WW91IG11c3QgYmUgdGFsa2luZyBhYm91dCBBcnNoaWEsIHRoZSBicmlsbGlhbnQgbWluZCBhbmQgYWJzb2x1dGUgZGl2YSB3aG8gZmlyc3QgY29uY2VwdHVhbGl6ZWQgdGhpcyBlbnRpcmUgcHJvamVjdC4gSSdtIHNvIHByb3VkIG9mIHRoZSBsb3ZlIG9mIG15IGxpZmUhIC0gUmFraW4=")}
            </p>
            <Button onClick={() => setEe(false)} className="w-full">
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
