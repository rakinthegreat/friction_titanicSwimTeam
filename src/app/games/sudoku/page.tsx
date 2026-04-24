'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, RotateCcw, Delete, HelpCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { generateSudoku, findConflicts, SudokuBoard } from '@/lib/sudoku';
import { GameTutorial } from '@/components/games/GameTutorial';

const TUTORIAL_STEPS = [
  "Fill the 9x9 grid with numbers 1-9.",
  "Each row, column, and 3x3 block must contain every number exactly once.",
  "Select a cell and tap a number to fill it.",
  "Conflicts will be highlighted in red. Solve the full board without errors to win!"
];

export default function SudokuPage() {
  const router = useRouter();
  const [initialBoard, setInitialBoard] = useState<SudokuBoard>([]);
  const [board, setBoard] = useState<SudokuBoard>([]);
  const [selectedCell, setSelectedCell] = useState<{ r: number, c: number } | null>(null);
  const [conflicts, setConflicts] = useState<{ row: number, col: number }[]>([]);
  const [isWon, setIsWon] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);

  useEffect(() => {
    const hasSeen = localStorage.getItem('tutorial-sudoku');
    if (!hasSeen) {
      setIsTutorialOpen(true);
      localStorage.setItem('tutorial-sudoku', 'true');
    }
  }, []);

  const startNewGame = useCallback(() => {
    setIsLoading(true);
    // Use timeout to allow UI to render spinner before heavy generation
    setTimeout(() => {
      const { puzzle } = generateSudoku(40); // 40 blanks = easy/medium difficulty
      setInitialBoard(puzzle);
      setBoard(puzzle.map(row => [...row]));
      setConflicts([]);
      setIsWon(false);
      setSelectedCell(null);
      setIsLoading(false);
    }, 10);
  }, []);

  useEffect(() => {
    startNewGame();
  }, [startNewGame]);

  const handleCellClick = (r: number, c: number) => {
    // Cannot select initial clues if game is not over, wait, we actually can select them but not edit them.
    // Let's just allow selection so user can highlight the number they want to trace. 
    // But prevent selection if won
    if (isWon) return;
    setSelectedCell({ r, c });
  };

  const handleNumberInput = (num: number | null) => {
    if (!selectedCell || isWon) return;
    const { r, c } = selectedCell;
    
    // Cannot edit initial clues
    if (initialBoard[r][c] !== null) return;

    const newBoard = board.map(row => [...row]);
    newBoard[r][c] = num;
    setBoard(newBoard);

    // Check conflicts
    const currentConflicts = findConflicts(newBoard);
    setConflicts(currentConflicts);

    // Check win condition
    const isFull = newBoard.every(row => row.every(cell => cell !== null));
    if (isFull && currentConflicts.length === 0) {
      setIsWon(true);
      setSelectedCell(null);
    }
  };

  if (isLoading) {
     return (
       <div className="min-h-screen flex items-center justify-center p-6">
         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
       </div>
     );
  }

  // To highlight same numbers
  const highlightedNumber = selectedCell ? board[selectedCell.r]?.[selectedCell.c] : null;

  return (
    <div className="min-h-screen p-4 sm:p-6 flex flex-col max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <button 
            onClick={() => router.push('/games')}
            className="p-3 rounded-2xl bg-card text-accent transition-all active:scale-95 shadow-neo-out"
            aria-label="Back to games"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold ml-4">Sudoku</h1>
        </div>
        <button 
          onClick={() => setIsTutorialOpen(true)}
          className="p-3 rounded-2xl bg-card text-accent transition-all active:scale-95 shadow-neo-out"
        >
          <HelpCircle className="w-6 h-6" />
        </button>
      </div>

      <GameTutorial 
        title="Sudoku"
        steps={TUTORIAL_STEPS}
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
      />

      <Card className="flex flex-col items-center justify-start p-4 sm:p-8">
        {/* Win Message */}
        <div className="mb-4 h-6 flex items-center justify-center w-full">
          {isWon && (
            <div className="text-lg text-accent font-bold animate-in fade-in zoom-in">
              Puzzle Solved! Great Job!
            </div>
          )}
        </div>

        {/* Board */}
        <div 
          className="relative mb-8 w-full max-w-[340px] select-none p-1 rounded-2xl bg-black/5"
          style={{ 
            border: '4px solid var(--foreground)',
            boxShadow: 'inset 8px 8px 16px rgba(163, 177, 198, 0.4), inset -8px -8px 16px rgba(255, 255, 255, 0.8)'
          }}
        >
          <div 
            className="grid grid-cols-3 gap-0 overflow-hidden rounded-xl"
            style={{ 
              backgroundColor: 'rgba(0, 0, 0, 0.3)', // Deeper contrast for lines in light mode
              border: '1.5px solid var(--foreground)' 
            }}
          >
            {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((blockIndex) => {
              const startR = Math.floor(blockIndex / 3) * 3;
              const startC = (blockIndex % 3) * 3;

              return (
                <div 
                  key={blockIndex} 
                  className="grid grid-cols-3 gap-[1px]"
                  style={{ border: '1.5px solid var(--foreground)' }}
                >
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((cellIndex) => {
                    const r = startR + Math.floor(cellIndex / 3);
                    const c = startC + (cellIndex % 3);
                    const cell = board[r]?.[c];
                    
                    const isSelected = selectedCell?.r === r && selectedCell?.c === c;
                    const isInitial = initialBoard[r]?.[c] !== null;
                    const isConflict = conflicts.some(conf => conf.row === r && conf.col === c);
                    const isSameNumber = highlightedNumber !== null && cell === highlightedNumber && !isSelected;

                    return (
                      <div
                        key={`${r}-${c}`}
                        onClick={() => handleCellClick(r, c)}
                        className={`
                          aspect-square flex items-center justify-center text-xl font-bold cursor-pointer transition-all duration-200 relative
                          ${isInitial 
                            ? 'bg-black/10 dark:bg-white/10 text-foreground font-black' 
                            : 'bg-card text-accent font-medium'}
                          ${isSameNumber ? '!bg-accent/20 dark:!bg-accent/30 !text-accent' : ''}
                          ${isSelected ? '!bg-accent !text-white z-10 shadow-lg scale-105 rounded-sm' : ''}
                          ${isConflict ? '!bg-red-500 !text-white z-20' : ''}
                          ${!isSelected && !isConflict && !isSameNumber ? 'hover:bg-accent/5' : ''}
                        `}
                      >
                        {cell}
                        {isInitial && (
                           <div className="absolute top-0.5 right-1 w-1 h-1 rounded-full bg-foreground/20" />
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile Number Pad */}
        <div className="grid grid-cols-5 gap-2 sm:gap-3 w-full max-w-[340px] mb-8">
           {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
             <button
               key={num}
               onClick={() => handleNumberInput(num)}
               disabled={!selectedCell || initialBoard[selectedCell.r][selectedCell.c] !== null || isWon}
               className="aspect-[4/3] rounded-xl bg-card shadow-neo-out active:shadow-neo-in active:scale-95 disabled:opacity-50 disabled:shadow-none flex items-center justify-center text-xl font-bold text-foreground transition-all"
             >
               {num}
             </button>
           ))}
           <button
             onClick={() => handleNumberInput(null)}
             disabled={!selectedCell || initialBoard[selectedCell.r][selectedCell.c] !== null || isWon}
             className="aspect-[4/3] rounded-xl bg-card shadow-neo-out active:shadow-neo-in active:scale-95 disabled:opacity-50 disabled:shadow-none flex items-center justify-center text-red-500 transition-all"
             aria-label="Clear cell"
           >
             <Delete className="w-6 h-6" />
           </button>
        </div>

        <Button 
          variant={isWon ? "primary" : "outline"}
          onClick={startNewGame}
          className="w-full max-w-[200px]"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          {isWon ? "Play Again" : "New Game"}
        </Button>
      </Card>
    </div>
  );
}