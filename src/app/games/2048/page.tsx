'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, RotateCcw, HelpCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/userStore';
import { GameTutorial } from '@/components/games/GameTutorial';

const TUTORIAL_STEPS = [
  "Slide the tiles in any direction (Up, Down, Left, Right).",
  "When two tiles with the same number touch, they merge into one!",
  "Each merge adds the value of the new tile to your score.",
  "A new tile appears after every move. It will glow for its first turn to help you keep track!",
  "Keep merging tiles to reach the ultimate goal: 2048!"
];

type Grid = number[][];

export default function Game2048Page() {
  const router = useRouter();
  const [grid, setGrid] = useState<Grid>(Array(4).fill(0).map(() => Array(4).fill(0)));
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [hasWon, setHasWon] = useState(false);
  const [variations, setVariations] = useState<{r: number, ox: number, oy: number}[]>([]);
  const [lastNewPos, setLastNewPos] = useState<{r: number, c: number} | null>(null);
  const updateStats = useUserStore((state) => state.updateStats);
  const recordGameStart = useUserStore((state) => state.recordGameStart);
  const recordGameResult = useUserStore((state) => state.recordGameResult);
  
  const touchStart = useRef<{ x: number, y: number } | null>(null);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const startTime = useRef<number>(Date.now());
  const gameEnded = useRef<boolean>(false);

  useEffect(() => {
    const hasSeen = localStorage.getItem('tutorial-2048');
    if (!hasSeen) {
      setIsTutorialOpen(true);
      localStorage.setItem('tutorial-2048', 'true');
    }
  }, []);

  // Initialize game
  const initGame = useCallback(() => {
    // If restarting an ongoing game, record it as a quit
    if (!gameEnded.current && grid.some(row => row.some(cell => cell !== 0))) {
      const timeSpent = (Date.now() - startTime.current) / 1000;
      recordGameResult('2048', 'quit', timeSpent);
    }

    let newGrid = Array(4).fill(0).map(() => Array(4).fill(0));
    const { grid: g1, newPos: p1 } = addRandomTile(newGrid);
    const { grid: g2, newPos: p2 } = addRandomTile(g1);
    setGrid(g2);
    setLastNewPos(p2);
    setScore(0);
    const newVariations = Array(16).fill(0).map(() => ({
      r: Math.random() * 4 - 2,
      ox: Math.random() * 6 - 3,
      oy: Math.random() * 6 - 3
    }));
    setVariations(newVariations);
    setGameOver(false);
    setHasWon(false);

    // Track new game start
    recordGameStart('2048');
    startTime.current = Date.now();
    gameEnded.current = false;
  }, [grid, recordGameStart, recordGameResult]);

  const scoreRef = useRef(score);
  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  useEffect(() => {
    initGame();
    // Load best score
    const saved = localStorage.getItem('2048-best-score');
    if (saved) setBestScore(parseInt(saved));

    return () => {
      // Record quit on unmount if game not ended and player started playing
      if (!gameEnded.current && scoreRef.current > 0) {
        const timeSpent = (Date.now() - startTime.current) / 1000;
        recordGameResult('2048', 'quit', timeSpent);
      }
    };
  }, []); // Only on mount/unmount

  useEffect(() => {
    if (score > bestScore) {
      setBestScore(score);
      localStorage.setItem('2048-best-score', score.toString());
    }
  }, [score, bestScore]);

  const addRandomTile = (currentGrid: Grid): { grid: Grid, newPos: {r: number, c: number} | null } => {
    const emptyCells = [];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (currentGrid[r][c] === 0) emptyCells.push({ r, c });
      }
    }
    if (emptyCells.length === 0) return { grid: currentGrid, newPos: null };
    const { r, c } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const newGrid = currentGrid.map(row => [...row]);
    newGrid[r][c] = Math.random() < 0.9 ? 2 : 4;
    return { grid: newGrid, newPos: { r, c } };
  };

  const move = useCallback((direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => {
    if (gameOver) return;

    let newGrid = grid.map(row => [...row]);
    let moved = false;
    let currentScore = score;

    // Helper to rotate grid 90 degrees clockwise
    const rotateClockwise = (g: Grid) => {
      const result = Array(4).fill(0).map(() => Array(4).fill(0));
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          result[c][3 - r] = g[r][c];
        }
      }
      return result;
    };

    // Standardize everything to "LEFT" move
    // LEFT: 0 rotations
    // UP: 3 rotations clockwise (so top becomes left)
    // RIGHT: 2 rotations clockwise
    // DOWN: 1 rotation clockwise
    let rotations = 0;
    if (direction === 'UP') rotations = 3;
    else if (direction === 'RIGHT') rotations = 2;
    else if (direction === 'DOWN') rotations = 1;

    for (let i = 0; i < rotations; i++) newGrid = rotateClockwise(newGrid);

    // Perform merge LEFT
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
      
      if (newGrid[r].join(',') !== mergedRow.join(',')) moved = true;
      newGrid[r] = mergedRow;
    }

    // Rotate back to original orientation
    const backRotations = (4 - rotations) % 4;
    for (let i = 0; i < backRotations; i++) newGrid = rotateClockwise(newGrid);

    if (moved) {
      const { grid: finalGrid, newPos } = addRandomTile(newGrid);
      setGrid(finalGrid);
      setLastNewPos(newPos);
      setScore(currentScore);
      
      if (hasWon && !gameEnded.current) {
        gameEnded.current = true;
        const timeSpent = (Date.now() - startTime.current) / 1000;
        recordGameResult('2048', 'win', timeSpent);
      }

      if (isGameOver(finalGrid)) {
        setGameOver(true);
        updateStats(10, '2048', currentScore);
        if (!gameEnded.current) {
          gameEnded.current = true;
          const timeSpent = (Date.now() - startTime.current) / 1000;
          recordGameResult('2048', hasWon ? 'win' : 'loss', timeSpent);
        }
      }   
    }
  }, [grid, gameOver, score, updateStats, hasWon, recordGameResult]);

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

    const handleTStart = (e: TouchEvent) => {
      // Don't prevent default if we're clicking a button or link
      if ((e.target as HTMLElement).closest('button, a')) return;
      
      // Prevent scrolling/ghosting
      if (e.cancelable) e.preventDefault();
      touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    const handleTEnd = (e: TouchEvent) => {
      if (!touchStart.current) return;
      if (e.cancelable) e.preventDefault();
      const dx = e.changedTouches[0].clientX - touchStart.current.x;
      const dy = e.changedTouches[0].clientY - touchStart.current.y;
      touchStart.current = null;

      if (Math.abs(dx) > Math.abs(dy)) {
        if (Math.abs(dx) > 30) move(dx > 0 ? 'RIGHT' : 'LEFT');
      } else {
        if (Math.abs(dy) > 30) move(dy > 0 ? 'DOWN' : 'UP');
      }
    };

    const handleMDown = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest('button, a')) return;

      // Prevent selection/ghosting
      e.preventDefault();
      touchStart.current = { x: e.clientX, y: e.clientY };
    };

    const handleMUp = (e: MouseEvent) => {
      if (!touchStart.current) return;
      e.preventDefault();
      const dx = e.clientX - touchStart.current.x;
      const dy = e.clientY - touchStart.current.y;
      touchStart.current = null;

      if (Math.abs(dx) > Math.abs(dy)) {
        if (Math.abs(dx) > 30) move(dx > 0 ? 'RIGHT' : 'LEFT');
      } else {
        if (Math.abs(dy) > 30) move(dy > 0 ? 'DOWN' : 'UP');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('touchstart', handleTStart, { passive: false });
    window.addEventListener('touchend', handleTEnd, { passive: false });
    window.addEventListener('mousedown', handleMDown);
    window.addEventListener('mouseup', handleMUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('touchstart', handleTStart);
      window.removeEventListener('touchend', handleTEnd);
      window.removeEventListener('mousedown', handleMDown);
      window.removeEventListener('mouseup', handleMUp);
    };
  }, [move]);

  const getTileColor = (val: number) => {
    switch (val) {
      case 2: return 'bg-card text-foreground shadow-neo-out text-4xl';
      case 4: return 'bg-accent/10 text-accent shadow-neo-out text-4xl';
      case 8: return 'bg-accent/20 text-accent font-bold text-4xl';
      case 16: return 'bg-accent/40 text-white font-bold text-4xl';
      case 32: return 'bg-accent/60 text-white font-bold text-4xl';
      case 64: return 'bg-accent/80 text-white font-black text-4xl';
      case 128: return 'bg-accent text-white font-black text-3xl shadow-neo-in';
      case 256: return 'bg-accent-secondary/50 text-white font-black text-3xl shadow-neo-in';
      case 512: return 'bg-accent-secondary/70 text-white font-black text-3xl shadow-neo-in';
      case 1024: return 'bg-accent-secondary/90 text-white font-black text-2xl shadow-neo-in';
      case 2048: return 'bg-accent-secondary text-white font-black text-2xl animate-pulse shadow-neo-in';
      default: return 'bg-card/50 opacity-20';
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 flex flex-col max-w-xl mx-auto">
      <div className="flex items-center justify-between mb-8 touch-auto relative z-50">
        <div className="flex items-center">
          <button
            onClick={() => router.push('/games')}
            className="p-3 rounded-2xl bg-card shadow-neo-out text-accent transition-all active:scale-95"
            aria-label="Back to games"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold ml-4">2048</h1>
        </div>
        <button
          onClick={() => setIsTutorialOpen(true)}
          className="p-3 rounded-2xl bg-card shadow-neo-out text-accent transition-all active:scale-95"
        >
          <HelpCircle className="w-6 h-6" />
        </button>
      </div>

      <GameTutorial
        title="2048"
        steps={TUTORIAL_STEPS}
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)} 
      />

      <div className="flex justify-center gap-4 mb-8">
        <div className="bg-card px-6 py-3 rounded-2xl shadow-neo-in text-center min-w-[90px]">
          <p className="text-[10px] font-bold uppercase tracking-tighter opacity-40 leading-none mb-2">Score</p>
          <p className="text-xl font-black leading-none">{score}</p>
        </div>
        <div className="bg-card px-6 py-3 rounded-2xl shadow-neo-in text-center min-w-[90px]">
          <p className="text-[10px] font-bold uppercase tracking-tighter opacity-40 leading-none mb-2">Best</p>
          <p className="text-xl font-black leading-none">{bestScore}</p>
        </div>
      </div>

      <Card
        className="flex flex-col items-center justify-center p-4 sm:p-6 mb-8 relative select-none"
      >
        <div className="grid grid-cols-4 gap-4 sm:gap-6 w-full bg-black/10 dark:bg-white/5 p-4 sm:p-6 rounded-[2.5rem] shadow-neo-in aspect-square relative">
          {grid.flat().map((val, i) => {
            const r = Math.floor(i / 4);
            const c = i % 4;
            const isLatest = lastNewPos?.r === r && lastNewPos?.c === c;
            
            return (
              <div
                key={i}
                className={`
                  aspect-square rounded-2xl flex items-center justify-center transition-all duration-300 
                  ${getTileColor(val)}
                  ${val === 0 ? 'shadow-neo-in' : 'scale-100'}
                  ${isLatest ? 'ring-4 ring-white/30 animate-pulse' : ''}
                `}
                style={{
                  transform: variations[i]
                    ? `rotate(${variations[i].r}deg) translate(${variations[i].ox}px, ${variations[i].oy}px)`
                    : 'none'
                }}
              >
                {val !== 0 && val}
              </div>
            );
          })}

          {/* Overlays */}
          {(gameOver || hasWon) && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm rounded-[2.5rem] animate-in fade-in zoom-in duration-300">
              <h2 className="text-4xl font-black mb-6 text-accent">
                {hasWon ? 'You Win!' : 'Game Over'}
              </h2>
              <Button onClick={initGame} size="lg" className="px-8 py-4 text-lg font-black italic tracking-widest shadow-neo-out hover:shadow-neo-in transition-all active:scale-95">
                <RotateCcw className="w-5 h-5 mr-3" />
                TRY AGAIN
              </Button>
            </div>
          )}
        </div>
      </Card>

      <div className="flex flex-col gap-4 items-center">
        <p className="text-sm font-medium opacity-40 text-center">
          Swipe, Drag or use Arrow Keys to merge tiles!
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
