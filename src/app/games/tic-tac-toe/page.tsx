'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, RotateCcw, HelpCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/userStore';
import { GameTutorial } from '@/components/games/GameTutorial';

const TUTORIAL_STEPS = [
  "Tap an empty square to place your 'X'.",
  "The AI will automatically place an 'O' after your turn.",
  "Connect three 'X's in a row (horizontal, vertical, or diagonal) to win.",
  "Try to block the AI from completing its row!"
];

type Player = 'X' | 'O' | null;

export default function TicTacToePage() {
  const router = useRouter();
  const updateStats = useUserStore((state) => state.updateStats);
  const recordGameStart = useUserStore((state) => state.recordGameStart);
  const recordGameResult = useUserStore((state) => state.recordGameResult);
  const startTime = React.useRef<number>(Date.now());
  const gameEnded = React.useRef<boolean>(false);

  const [board, setBoard] = useState<Player[]>(Array(9).fill(null));
  const boardRef = React.useRef<Player[]>(board);
  const [isXNext, setIsXNext] = useState<boolean>(true);
  const [winner, setWinner] = useState<Player | 'Draw' | null>(null);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);

  useEffect(() => {
    boardRef.current = board;
  }, [board]);

  useEffect(() => {
    const hasSeen = localStorage.getItem('tutorial-tictactoe');
    if (!hasSeen) {
      setIsTutorialOpen(true);
      localStorage.setItem('tutorial-tictactoe', 'true');
    }
    
    // Start game on mount
    recordGameStart('tictactoe');
    startTime.current = Date.now();
    gameEnded.current = false;

    return () => {
      if (!gameEnded.current && boardRef.current.some(c => c !== null)) {
        const timeSpent = (Date.now() - startTime.current) / 1000;
        recordGameResult('tictactoe', 'quit', timeSpent);
      }
    };
  }, []);

  // Simple AI
  useEffect(() => {
    if (!isXNext && !winner) {
      const timer = setTimeout(() => {
        makeAIMove();
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [isXNext, winner, board]);

  const findWinningMove = (player: Player) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];
    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (board[a] === player && board[b] === player && board[c] === null) return c;
        if (board[a] === player && board[c] === player && board[b] === null) return b;
        if (board[b] === player && board[c] === player && board[a] === null) return a;
    }
    return null;
  }

  const makeAIMove = () => {
    // 1. Try to win
    let move = findWinningMove('O');
    
    // 2. Block 'X' from winning
    if (move === null) {
      move = findWinningMove('X');
    }
    
    // 3. Pick random empty square
    if (move === null) {
      const emptyIndices = board.map((val, idx) => val === null ? idx : null).filter(val => val !== null) as number[];
      if (emptyIndices.length > 0) {
        move = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
      }
    }

    if (move !== null) {
      handleClick(move, true);
    }
  };

  const checkWinner = (squares: Player[]) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    if (!squares.includes(null)) return 'Draw';
    return null;
  };

  const handleClick = (index: number, isAI: boolean = false) => {
    if (board[index] || winner || (!isXNext && !isAI)) return;

    const newBoard = [...board];
    newBoard[index] = isXNext ? 'X' : 'O';
    setBoard(newBoard);
    
    const newWinner = checkWinner(newBoard);
    if (newWinner) {
      setWinner(newWinner);
      if (newWinner === 'X') {
        updateStats(5, 'tictactoe');
      }
      
      if (!gameEnded.current) {
        gameEnded.current = true;
        const timeSpent = (Date.now() - startTime.current) / 1000;
        // Treat Draw as a 'loss' or just don't count it towards wins
        recordGameResult('tictactoe', newWinner === 'X' ? 'win' : 'loss', timeSpent);
      }
    } else {
      setIsXNext(!isXNext);
    }
  };

  const resetGame = () => {
    if (!gameEnded.current && board.some(c => c !== null)) {
      const timeSpent = (Date.now() - startTime.current) / 1000;
      recordGameResult('tictactoe', 'quit', timeSpent);
    }

    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);

    recordGameStart('tictactoe');
    startTime.current = Date.now();
    gameEnded.current = false;
  };

  return (
    <div className="min-h-screen p-6 flex flex-col max-w-md mx-auto">
      <div className="flex items-center mb-8">
        <button 
          onClick={() => router.push('/games')}
          className="p-2 -ml-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          aria-label="Back to games"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-bold ml-2">Tic-Tac-Toe</h1>
        <button 
          onClick={() => setIsTutorialOpen(true)}
          className="p-2 ml-auto rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-accent"
        >
          <HelpCircle className="w-6 h-6" />
        </button>
      </div>

      <GameTutorial 
        title="Tic-Tac-Toe"
        steps={TUTORIAL_STEPS}
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
      />

      <Card className="flex flex-col items-center justify-start p-6 sm:p-8">
        <div className="mb-8 text-2xl font-black min-h-[40px] flex items-center justify-center">
          <div className={`transition-all duration-300 ${winner ? 'scale-125 text-accent animate-bounce' : 'text-foreground/40 text-sm uppercase tracking-widest'}`}>
            {winner === 'Draw' 
              ? "IT'S A DRAW!" 
              : winner === 'X'
                ? "YOU WON!"
                : winner === 'O'
                  ? "AI WON!"
                : `Your Turn: ${isXNext ? 'X' : 'O'}`}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-10 w-full max-w-[340px]">
          {board.map((cell, index) => (
            <button
              key={index}
              onClick={() => handleClick(index)}
              disabled={!!winner || (!isXNext && !cell)}
              className={`aspect-square w-full min-h-[100px] min-w-[100px] rounded-2xl text-7xl font-black transition-all duration-300 flex items-center justify-center bg-card
                ${cell === 'X' ? 'text-accent' : 'text-accent-secondary'}
                ${cell ? 'shadow-neo-in scale-95' : 'shadow-neo-out'}
                ${!cell && !winner && isXNext ? 'hover:scale-[1.02] hover:shadow-neo-in active:scale-95' : ''}
              `}
              aria-label={`Square ${index}`}
            >
              {cell && (
                <span className="animate-in zoom-in duration-200">
                  {cell}
                </span>
              )}
            </button>
          ))}
        </div>

        <Button 
          variant={winner ? "primary" : "outline"}
          onClick={resetGame}
          className="w-full max-w-[200px]"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          {winner ? "Play Again" : "Restart Game"}
        </Button>
      </Card>
    </div>
  );
}
