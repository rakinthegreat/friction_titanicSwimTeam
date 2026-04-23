'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { useRouter } from 'next/navigation';

type Grid = number[][];

export default function Game2048Page() {
  const router = useRouter();
  const [grid, setGrid] = useState<Grid>(Array(4).fill(0).map(() => Array(4).fill(0)));
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [hasWon, setHasWon] = useState(false);
  
  const touchStart = useRef<{ x: number, y: number } | null>(null);

  // Initialize game
  const initGame = useCallback(() => {
    let newGrid = Array(4).fill(0).map(() => Array(4).fill(0));
    newGrid = addRandomTile(newGrid);
    newGrid = addRandomTile(newGrid);
    setGrid(newGrid);
    setScore(0);
    setGameOver(false);
    setHasWon(false);
  }, []);

  useEffect(() => {
    initGame();
    // Load best score
    const saved = localStorage.getItem('2048-best-score');
    if (saved) setBestScore(parseInt(saved));
  }, [initGame]);

  useEffect(() => {
    if (score > bestScore) {
      setBestScore(score);
      localStorage.setItem('2048-best-score', score.toString());
    }
  }, [score, bestScore]);

  const addRandomTile = (currentGrid: Grid): Grid => {
    const emptyCells = [];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (currentGrid[r][c] === 0) emptyCells.push({ r, c });
      }
    }
    if (emptyCells.length === 0) return currentGrid;
    const { r, c } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const newGrid = currentGrid.map(row => [...row]);
    newGrid[r][c] = Math.random() < 0.9 ? 2 : 4;
    return newGrid;
  };

  const move = useCallback((direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => {
    if (gameOver) return;

    let newGrid = grid.map(row => [...row]);
    let moved = false;
    let currentScore = score;

    const rotate = (g: Grid) => {
      const result = Array(4).fill(0).map(() => Array(4).fill(0));
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          result[c][3 - r] = g[r][c];
        }
      }
      return result;
    };

    // Standardize move to LEFT by rotating
    let rotations = 0;
    if (direction === 'UP') rotations = 1;
    else if (direction === 'RIGHT') rotations = 2;
    else if (direction === 'DOWN') rotations = 3;

    for (let i = 0; i < rotations; i++) newGrid = rotate(newGrid);

    // Slide and Merge LEFT
    for (let r = 0; r < 4; r++) {
      const row = newGrid[r].filter(val => val !== 0);
      const mergedRow = [];
      for (let i = 0; i < row.length; i++) {
        if (i < row.length - 1 && row[i] === row[i + 1]) {
          const newVal = row[i] * 2;
          mergedRow.push(newVal);
          currentScore += newVal;
          if (newVal === 2048) setHasWon(true);
          i++;
          moved = true;
        } else {
          mergedRow.push(row[i]);
        }
      }
      while (mergedRow.length < 4) mergedRow.push(0);
      
      if (JSON.stringify(newGrid[r]) !== JSON.stringify(mergedRow)) moved = true;
      newGrid[r] = mergedRow;
    }

    // Rotate back
    for (let i = 0; i < (4 - rotations) % 4; i++) newGrid = rotate(newGrid);

    if (moved) {
      const finalGrid = addRandomTile(newGrid);
      setGrid(finalGrid);
      setScore(currentScore);
      
      // Check Game Over
      if (isGameOver(finalGrid)) setGameOver(true);
    }
  }, [grid, gameOver, score]);

  const isGameOver = (g: Grid): boolean => {
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (g[r][c] === 0) return false;
        if (c < 3 && g[r][c] === g[r][c + 1]) return false;
        if (r < 3 && g[r][c] === g[r + 1][c]) return false;
      }
    }
    return true;
  };

  // Input Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'w', 'W'].includes(e.key)) move('UP');
      else if (['ArrowDown', 's', 'S'].includes(e.key)) move('DOWN');
      else if (['ArrowLeft', 'a', 'A'].includes(e.key)) move('LEFT');
      else if (['ArrowRight', 'd', 'D'].includes(e.key)) move('RIGHT');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [move]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const dx = e.changedTouches[0].clientX - touchStart.current.x;
    const dy = e.changedTouches[0].clientY - touchStart.current.y;
    touchStart.current = null;

    if (Math.abs(dx) > Math.abs(dy)) {
      if (Math.abs(dx) > 30) move(dx > 0 ? 'RIGHT' : 'LEFT');
    } else {
      if (Math.abs(dy) > 30) move(dy > 0 ? 'DOWN' : 'UP');
    }
  };

  const getTileColor = (val: number) => {
    switch (val) {
      case 2: return 'bg-card text-foreground shadow-neo-out';
      case 4: return 'bg-accent/10 text-accent shadow-neo-out';
      case 8: return 'bg-accent/20 text-accent font-bold';
      case 16: return 'bg-accent/40 text-white font-bold';
      case 32: return 'bg-accent/60 text-white font-bold';
      case 64: return 'bg-accent/80 text-white font-black';
      case 128: return 'bg-accent text-white font-black text-2xl shadow-neo-in';
      case 256: return 'bg-accent-secondary/50 text-white font-black text-2xl shadow-neo-in';
      case 512: return 'bg-accent-secondary/70 text-white font-black text-2xl shadow-neo-in';
      case 1024: return 'bg-accent-secondary/90 text-white font-black text-xl shadow-neo-in';
      case 2048: return 'bg-accent-secondary text-white font-black text-xl animate-pulse shadow-neo-in';
      default: return 'bg-card/50 opacity-20';
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 flex flex-col max-w-lg mx-auto touch-none">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button 
            onClick={() => router.push('/games')}
            className="p-2 -ml-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            aria-label="Back to games"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-3xl font-black ml-2 text-accent">2048</h1>
        </div>
        <div className="flex gap-2">
          <div className="bg-card px-4 py-2 rounded-2xl shadow-neo-in text-center min-w-[70px]">
            <p className="text-[10px] font-bold uppercase tracking-tighter opacity-40 leading-none mb-1">Score</p>
            <p className="font-black leading-none">{score}</p>
          </div>
          <div className="bg-card px-4 py-2 rounded-2xl shadow-neo-in text-center min-w-[70px]">
            <p className="text-[10px] font-bold uppercase tracking-tighter opacity-40 leading-none mb-1">Best</p>
            <p className="font-black leading-none">{bestScore}</p>
          </div>
        </div>
      </div>

      <Card 
        className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 mb-4 relative"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="grid grid-cols-4 gap-3 sm:gap-4 w-full bg-black/5 dark:bg-white/5 p-3 sm:p-4 rounded-[2rem] shadow-neo-in aspect-square relative">
          {grid.flat().map((val, i) => (
            <div
              key={i}
              className={`
                aspect-square rounded-2xl flex items-center justify-center text-3xl transition-all duration-150 
                ${getTileColor(val)}
                ${val === 0 ? 'shadow-neo-in' : 'scale-100'}
              `}
            >
              {val !== 0 && val}
            </div>
          ))}

          {/* Overlays */}
          {(gameOver || hasWon) && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm rounded-[2rem] animate-in fade-in zoom-in duration-300">
              <h2 className="text-5xl font-black mb-6 text-accent">
                {hasWon ? 'You Win!' : 'Game Over'}
              </h2>
              <Button onClick={initGame} size="lg" className="px-10">
                <RotateCcw className="w-5 h-5 mr-3" />
                Try Again
              </Button>
            </div>
          )}
        </div>
      </Card>

      <div className="flex flex-col gap-4 items-center">
        <p className="text-sm font-medium opacity-40 text-center">
          {typeof window !== 'undefined' && 'ontouchstart' in window 
            ? 'Swipe tiles to merge matching numbers!' 
            : 'Use Arrow Keys or WASD to merge numbers!'}
        </p>
        <Button 
          variant="outline" 
          onClick={initGame}
          className="w-full max-w-[200px]"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Restart Game
        </Button>
      </div>
    </div>
  );
}
