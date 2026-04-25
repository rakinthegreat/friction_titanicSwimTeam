import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/Button';
import { PartyPopper, Heart, Delete } from 'lucide-react';
import { useUserStore } from '@/store/userStore';
import { BackButton } from '@/components/ui/BackButton';

interface WordLessProps {
  onComplete: (xp: number) => void;
  targetWord?: string; // For testing, otherwise random from vocab
}

const KEYS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE']
];

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

  const handleInput = useCallback((key: string) => {
    // Easter egg detection
    const t = atob("QXJzaGk=").toLowerCase();
    setKb(p => {
      const n = (p + key.toLowerCase()).slice(-t.length);
      if (n === t) setEe(true);
      return n;
    });

    if (status !== 'playing') return;

    const normalizedKey = key.toUpperCase();

    if (normalizedKey === 'ENTER') {
      if (currentGuess.length === WORD_LENGTH) {
        submitGuess(currentGuess);
      }
    } else if (normalizedKey === 'BACKSPACE' || normalizedKey === 'DELETE') {
      setCurrentGuess(prev => prev.slice(0, -1));
    } else if (/^[A-Z]$/.test(normalizedKey) && currentGuess.length < WORD_LENGTH) {
      setCurrentGuess(prev => prev + normalizedKey);
    }
  }, [currentGuess, status, WORD_LENGTH, submitGuess, setKb, setEe]);

  const onKeyPress = useCallback((e: KeyboardEvent) => {
    handleInput(e.key);
  }, [handleInput]);

  useEffect(() => {
    window.addEventListener('keydown', onKeyPress);
    return () => window.removeEventListener('keydown', onKeyPress);
  }, [onKeyPress]);

  const getLetterStatus = (letter: string, guess: string, index: number) => {
    const target = targetWord.toUpperCase();
    if (target[index] === letter) return 'correct';
    if (target.includes(letter)) return 'present';
    return 'absent';
  };

  const keyStatuses = useMemo(() => {
    const statuses: Record<string, 'correct' | 'present' | 'absent' | 'unused'> = {};
    const target = targetWord.toUpperCase();

    guesses.forEach(guess => {
      [...guess].forEach((letter, i) => {
        const currentStatus = getLetterStatus(letter, guess, i);
        if (currentStatus === 'correct') {
          statuses[letter] = 'correct';
        } else if (currentStatus === 'present' && statuses[letter] !== 'correct') {
          statuses[letter] = 'present';
        } else if (currentStatus === 'absent' && !statuses[letter]) {
          statuses[letter] = 'absent';
        }
      });
    });

    return statuses;
  }, [guesses, targetWord]);

  const getLetterClass = (guess: string, index: number) => {
    const letter = guess[index];
    const target = targetWord.toUpperCase();
    
    if (target[index] === letter) return 'bg-accent text-white border-accent';
    if (!target.includes(letter)) return 'bg-foreground/10 text-foreground border-foreground/5';

    let targetCount = 0;
    for (let i = 0; i < target.length; i++) {
      if (target[i] === letter) targetCount++;
    }

    let correctMatches = 0;
    for (let i = 0; i < target.length; i++) {
      if (guess[i] === letter && target[i] === letter) correctMatches++;
    }

    let previousPresentMatches = 0;
    for (let i = 0; i < index; i++) {
      if (guess[i] === letter && target[i] !== letter && target.includes(letter)) {
        previousPresentMatches++;
      }
    }

    const remainingToColor = targetCount - correctMatches;
    if (previousPresentMatches < remainingToColor) {
      return 'bg-accent-secondary text-white border-accent-secondary';
    }

    return 'bg-foreground/10 text-foreground border-foreground/5';
  };

  const getKeyClass = (key: string) => {
    const status = keyStatuses[key];
    const base = "flex items-center justify-center rounded-lg font-black transition-all active:scale-90 select-none ";
    
    if (key === 'ENTER' || key === 'BACKSPACE') {
      return base + "px-2 py-4 text-[10px] bg-foreground/10 text-foreground min-w-[3.5rem]";
    }

    switch (status) {
      case 'correct': return base + "bg-accent text-white w-8 sm:w-10 py-4";
      case 'present': return base + "bg-accent-secondary text-white w-8 sm:w-10 py-4";
      case 'absent': return base + "bg-foreground/10 text-foreground/20 w-8 sm:w-10 py-4";
      default: return base + "bg-foreground/10 text-foreground w-8 sm:w-10 py-4 hover:bg-foreground/20";
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-8 animate-in fade-in duration-500 w-full max-w-sm mx-auto relative">
      {status !== 'playing' && (
        <div className="absolute -top-16 -left-8">
          <BackButton href="/" className="text-accent" />
        </div>
      )}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-black italic tracking-tighter">WordLess</h2>
        <p className="text-foreground/40 font-bold uppercase tracking-[0.2em] text-[10px]">Guess the {WORD_LENGTH}-letter word</p>
      </div>

      <div className="grid gap-2">
        {Array.from({ length: MAX_GUESSES }).map((_, i) => {
          const guess = guesses[i] || (i === guesses.length ? currentGuess : "");
          return (
            <div key={i} className="flex gap-2">
              {Array.from({ length: WORD_LENGTH }).map((_, j) => (
                <div 
                  key={j} 
                  className={`w-12 h-12 flex items-center justify-center border-2 rounded-xl text-xl font-black transition-all duration-500 ${
                    guesses[i] ? getLetterClass(guesses[i], j) : 'border-foreground/10'
                  } ${i === guesses.length && guess[j] ? 'scale-110 border-accent/50 shadow-neo-out' : ''}`}
                >
                  {guess[j] || ""}
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* Virtual Keyboard */}
      <div className="w-full flex flex-col gap-2 mt-4">
        {KEYS.map((row, i) => (
          <div key={i} className="flex justify-center gap-1.5 w-full">
            {row.map(key => (
              <button
                key={key}
                onClick={() => handleInput(key)}
                className={getKeyClass(key)}
              >
                {key === 'BACKSPACE' ? <Delete size={16} /> : key}
              </button>
            ))}
          </div>
        ))}
      </div>

      {status !== 'playing' && (
        <div className="text-center animate-bounce">
          <p className="text-2xl font-black italic flex items-center justify-center gap-2">
            {status === 'won' ? <><PartyPopper className="w-6 h-6 text-accent drop-shadow-sm" /> Brilliant!</> : `Target: ${targetWord}`}
          </p>
        </div>
      )}

      {ee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-card p-8 rounded-[2.5rem] shadow-neo-out border border-accent/20 max-w-sm w-full text-center space-y-6 animate-in zoom-in duration-300">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
              <Heart className="w-8 h-8 text-red-500 fill-red-500/20" />
            </div>
            <p className="text-xl font-bold leading-relaxed italic">
              {atob("WW91IG11c3QgYmUgdGFsa2luZyBhYm91dCBBcnNoaWEsIHRoZSBicmlsbGlhbnQgbWluZCBhbmQgYWJzb2x1dGUgZGl2YSB3aG8gZmlyc3QgY29uY2VwdHVhbGl6ZWQgdGhpcyBlbnRpcmUgcHJvamVjdC4gSSdtIHNvIHByb3VkIG9mIHRoZSBsb3ZlIG9mIG15IGxpZmUhIC0gUmFraW4=")}
            </p>
            <Button onClick={() => setEe(false)} className="w-full py-4 rounded-2xl font-black">
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
