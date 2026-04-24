'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useUserStore } from '@/store/userStore';
import { 
  ArrowLeft, RotateCcw, 
  Laptop, Cpu, Smartphone, Radio,
  History, Landmark, Shield, Scroll,
  Puzzle, Lightbulb, Dna, Binary,
  Languages, MessageSquare, Type, Globe,
  FlaskConical, Atom, Telescope, Microscope,
  Palette, Brush, Image as ImageIcon, Music,
  Brain, Quote, Users, Cloud,
  Leaf, Trees, Sun, Flower2,
  HelpCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { GameTutorial } from '@/components/games/GameTutorial';

const TUTORIAL_STEPS = [
  "Tap a card to flip it and reveal its hidden icon.",
  "Try to find and flip its matching pair immediately after.",
  "If the icons match, they stay revealed. If not, they flip back.",
  "Match all pairs in the grid to win the game and save your time!"
];

const ICON_MAP: Record<string, any[]> = {
  tech: [Laptop, Cpu, Smartphone, Radio],
  history: [History, Landmark, Shield, Scroll],
  logic: [Puzzle, Lightbulb, Dna, Binary],
  languages: [Languages, MessageSquare, Type, Globe],
  science: [FlaskConical, Atom, Telescope, Microscope],
  art: [Palette, Brush, ImageIcon, Music],
  philosophy: [Brain, Quote, Users, Cloud],
  nature: [Leaf, Trees, Sun, Flower2],
};

interface MemoryCard {
  id: number;
  iconId: string;
  Icon: any;
  isFlipped: boolean;
  isMatched: boolean;
  rotation: number;
  offsetX: number;
  offsetY: number;
}

export default function MemoryMatchPage() {
  const router = useRouter();
  const interests = useUserStore((state) => state.interests);
  const updateStats = useUserStore((state) => state.updateStats);
  const recordGameStart = useUserStore((state) => state.recordGameStart);
  const recordGameResult = useUserStore((state) => state.recordGameResult);
  const [board, setBoard] = useState<MemoryCard[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [isWon, setIsWon] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);

  const startTime = React.useRef<number>(Date.now());
  const gameEnded = React.useRef<boolean>(false);

  useEffect(() => {
    const hasSeen = localStorage.getItem('tutorial-memory-match');
    if (!hasSeen) {
      setIsTutorialOpen(true);
      localStorage.setItem('tutorial-memory-match', 'true');
    }
  }, []);

  const initGame = useCallback(() => {
    // Record quit if starting new game without finishing current
    if (!gameEnded.current && moves > 0) {
      const timeSpent = (Date.now() - startTime.current) / 1000;
      recordGameResult('memory-match', 'quit', timeSpent);
    }

    // 1. Get icons based on interests
    let availableIcons: { id: string, icon: any }[] = [];
    interests.forEach(interest => {
      const icons = ICON_MAP[interest];
      if (icons) {
        icons.forEach((Icon, idx) => {
          availableIcons.push({ id: `${interest}-${idx}`, icon: Icon });
        });
      }
    });

    // Fallback if not enough icons
    if (availableIcons.length < 8) {
      const defaults = [HelpCircle, Cpu, Shield, Puzzle, Globe, Atom, Palette, Leaf];
      defaults.forEach((Icon, idx) => {
        if (availableIcons.length < 8) {
          availableIcons.push({ id: `default-${idx}`, icon: Icon });
        }
      });
    }

    // 2. Pick 8 icons
    const shuffledIcons = [...availableIcons].sort(() => Math.random() - 0.5);
    const selectedIcons = shuffledIcons.slice(0, 8);

    // 3. Duplicate and shuffle
    const gameIcons = [...selectedIcons, ...selectedIcons].sort(() => Math.random() - 0.5);

    // 4. Create board
    const newBoard = gameIcons.map((item, index) => ({
      id: index,
      iconId: item.id,
      Icon: item.icon,
      isFlipped: false,
      isMatched: false,
      rotation: (Math.random() * 4 - 2), // -2 to 2 degrees
      offsetX: (Math.random() * 6 - 3), // -3 to 3px
      offsetY: (Math.random() * 6 - 3), // -3 to 3px
    }));

    setBoard(newBoard);
    setFlipped([]);
    setMoves(0);
    setIsWon(false);
    setIsProcessing(false);

    // Track game start
    recordGameStart('memory-match');
    startTime.current = Date.now();
    gameEnded.current = false;
  }, [interests, moves, recordGameStart, recordGameResult]);

  const movesRef = React.useRef(moves);
  useEffect(() => {
    movesRef.current = moves;
  }, [moves]);

  useEffect(() => {
    initGame();
    return () => {
      if (!gameEnded.current && movesRef.current > 0) {
        const timeSpent = (Date.now() - startTime.current) / 1000;
        recordGameResult('memory-match', 'quit', timeSpent);
      }
    };
  }, []); // Only once on mount

  const handleFlip = (id: number) => {
    if (isProcessing || isWon) return;
    const card = board[id];
    if (card.isFlipped || card.isMatched) return;

    // Flip the card
    const newBoard = [...board];
    newBoard[id].isFlipped = true;
    setBoard(newBoard);

    const newFlipped = [...flipped, id];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      setIsProcessing(true);

      const [firstId, secondId] = newFlipped;
      const firstCard = board[firstId];
      const secondCard = board[secondId];

      if (firstCard.iconId === secondCard.iconId) {
        // Match
        setTimeout(() => {
          const matchedBoard = [...board];
          matchedBoard[firstId].isMatched = true;
          matchedBoard[secondId].isMatched = true;
          setBoard(matchedBoard);
          setFlipped([]);
          setIsProcessing(false);

          if (matchedBoard.every(c => c.isMatched) && !gameEnded.current) {
            setIsWon(true);
            updateStats(10, 'memory-match');
            
            gameEnded.current = true;
            const timeSpent = (Date.now() - startTime.current) / 1000;
            recordGameResult('memory-match', 'win', timeSpent);
          }
        }, 500);
      } else {
        // No match
        setTimeout(() => {
          const resetBoard = [...board];
          resetBoard[firstId].isFlipped = false;
          resetBoard[secondId].isFlipped = false;
          setBoard(resetBoard);
          setFlipped([]);
          setIsProcessing(false);
        }, 800);
      }
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 flex flex-col max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <button 
            onClick={() => router.push('/games')}
            className="p-3 rounded-2xl bg-card shadow-neo-out text-accent transition-all active:scale-95"
            aria-label="Back to games"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold ml-4">Memory Match</h1>
        </div>
        <button 
          onClick={() => setIsTutorialOpen(true)}
          className="p-3 rounded-2xl bg-card shadow-neo-out text-accent transition-all active:scale-95"
        >
          <HelpCircle className="w-6 h-6" />
        </button>
      </div>

      <GameTutorial 
        title="Memory Match"
        steps={TUTORIAL_STEPS}
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
      />

      <Card className="flex flex-col items-center justify-start p-6 sm:p-8">
        <div className="w-full grid grid-cols-3 items-center mb-8 px-2">
          <div className="text-sm font-bold uppercase tracking-widest text-foreground/40 text-left">
            Moves: <span className="text-foreground">{moves}</span>
          </div>
          <div className="flex justify-center">
            {isWon && (
              <div className="text-xl text-accent font-black animate-bounce whitespace-nowrap">
                WELL DONE!
              </div>
            )}
          </div>
          <div className="text-sm font-bold uppercase tracking-widest text-foreground/40 text-right">
            Matches: <span className="text-accent">{board.filter(c => c.isMatched).length / 2} / 8</span>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3 sm:gap-4 w-full mb-10">
          {board.map((card) => {
            const Icon = card.Icon;
            const shown = card.isFlipped || card.isMatched;

            return (
              <div
                key={card.id}
                onClick={() => handleFlip(card.id)}
                className={`aspect-square perspective-1000 cursor-pointer transition-all duration-300 ${!shown ? 'hover:scale-[1.05]' : ''}`}
                style={{
                  transform: `rotate(${card.rotation}deg) translate(${card.offsetX}px, ${card.offsetY}px)`
                }}
              >
                <div className={`relative w-full h-full text-center transition-transform duration-500 preserve-3d ${shown ? 'rotate-y-180' : ''}`}>
                  {/* Front (Hidden) */}
                  <div className="absolute w-full h-full backface-hidden shadow-neo-out rounded-2xl bg-card flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full border-4 border-foreground/5" />
                  </div>
                  {/* Back (Visible) */}
                  <div className={`absolute w-full h-full backface-hidden rotate-y-180 shadow-neo-in rounded-2xl flex items-center justify-center ${card.isMatched ? 'bg-accent/10 border-2 border-accent/20' : 'bg-card'}`}>
                    <Icon className={`w-10 h-10 sm:w-12 sm:h-12 ${card.isMatched ? 'text-accent' : 'text-accent-secondary'}`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <Button 
          variant={isWon ? "primary" : "outline"}
          onClick={initGame}
          className="w-full max-w-[200px]"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          {isWon ? "Play Again" : "Restart"}
        </Button>
      </Card>

      <style jsx global>{`
        .perspective-1000 { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
    </div>
  );
}
