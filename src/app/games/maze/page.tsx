'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Move, Trophy, RefreshCw, ArrowLeft, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/userStore';

const SIZE = 15;

export default function MazePage() {
  const router = useRouter();
  const updateStats = useUserStore((state) => state.updateStats);

  const [maze, setMaze] = useState<number[][]>([]);
  const [player, setPlayer] = useState({ x: 1, y: 1 });
  const [goal, setGoal] = useState({ x: SIZE - 2, y: SIZE - 2 });
  const [won, setWon] = useState(false);
  const [moves, setMoves] = useState(0);

  const generateMaze = useCallback(() => {
    const newMaze = Array(SIZE).fill(null).map(() => Array(SIZE).fill(1));
    
    const stack: [number, number][] = [];
    const start = { x: 1, y: 1 };
    newMaze[start.y][start.x] = 0;
    stack.push([start.x, start.y]);

    while (stack.length > 0) {
      const [cx, cy] = stack[stack.length - 1];
      const neighbors: [number, number, number, number][] = [];

      // Check 2 cells away in each direction
      [[0, -2], [0, 2], [-2, 0], [2, 0]].forEach(([dx, dy]) => {
        const nx = cx + dx, ny = cy + dy;
        if (nx > 0 && nx < SIZE - 1 && ny > 0 && ny < SIZE - 1 && newMaze[ny][nx] === 1) {
          neighbors.push([nx, ny, cx + dx / 2, cy + dy / 2]);
        }
      });

      if (neighbors.length > 0) {
        const [nx, ny, px, py] = neighbors[Math.floor(Math.random() * neighbors.length)];
        newMaze[ny][nx] = 0;
        newMaze[py][px] = 0;
        stack.push([nx, ny]);
      } else {
        stack.pop();
      }
    }

    setMaze(newMaze);
    setPlayer({ x: 1, y: 1 });
    setWon(false);
    setMoves(0);
  }, []);

  useEffect(() => {
    generateMaze();
  }, [generateMaze]);

  const movePlayer = (dx: number, dy: number) => {
    if (won) return;
    const nx = player.x + dx;
    const ny = player.y + dy;

    if (nx >= 0 && nx < SIZE && ny >= 0 && ny < SIZE && maze[ny][nx] === 0) {
      setPlayer({ x: nx, y: ny });
      setMoves(m => m + 1);
      if (nx === goal.x && ny === goal.y) {
        setWon(true);
        updateStats(3);
      }
    }
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') movePlayer(0, -1);
      if (e.key === 'ArrowDown') movePlayer(0, 1);
      if (e.key === 'ArrowLeft') movePlayer(-1, 0);
      if (e.key === 'ArrowRight') movePlayer(1, 0);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [player, won, maze]);

  return (
    <main className="min-h-screen bg-background p-6 flex flex-col items-center">
      <header className="w-full max-w-md flex justify-between items-center mb-8">
        <button onClick={() => router.push('/games')} className="p-3 rounded-2xl bg-card shadow-neo-out text-accent">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-black italic tracking-tighter">MAZE SOLVER</h1>
        <div className="w-12" />
      </header>

      <div className="w-full max-w-md space-y-8">
        <Card className="p-4 shadow-neo-out aspect-square flex items-center justify-center bg-card/50">
          <div className="grid grid-cols-15 w-full h-full gap-0.5 sm:gap-1">
            {maze.map((row, y) => row.map((cell, x) => (
              <div 
                key={`${x}-${y}`} 
                className={`aspect-square rounded-[2px] sm:rounded-sm transition-all duration-200 ${
                  cell === 1 
                    ? 'bg-foreground/5 shadow-neo-in' 
                    : (x === player.x && y === player.y) 
                      ? 'bg-accent shadow-[0_0_15px_var(--accent)] z-10 scale-110' 
                      : (x === goal.x && y === goal.y)
                        ? 'bg-accent-secondary animate-pulse'
                        : 'bg-transparent'
                }`}
              />
            )))}
          </div>
        </Card>

        <div className="grid grid-cols-3 gap-4 max-w-[240px] mx-auto">
          <div />
          <button onClick={() => movePlayer(0, -1)} className="p-6 bg-card rounded-2xl shadow-neo-out flex items-center justify-center text-accent active:shadow-neo-in transition-all">
            <ChevronUp size={24} />
          </button>
          <div />
          <button onClick={() => movePlayer(-1, 0)} className="p-6 bg-card rounded-2xl shadow-neo-out flex items-center justify-center text-accent active:shadow-neo-in transition-all">
            <ChevronLeft size={24} />
          </button>
          <button onClick={() => movePlayer(0, 1)} className="p-6 bg-card rounded-2xl shadow-neo-out flex items-center justify-center text-accent active:shadow-neo-in transition-all">
            <ChevronDown size={24} />
          </button>
          <button onClick={() => movePlayer(1, 0)} className="p-6 bg-card rounded-2xl shadow-neo-out flex items-center justify-center text-accent active:shadow-neo-in transition-all">
            <ChevronRight size={24} />
          </button>
        </div>

        {won && (
          <Card className="p-8 text-center space-y-6 shadow-neo-out animate-in zoom-in duration-500 bg-accent/5 border border-accent/20">
            <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center mx-auto text-white shadow-neo-out">
              <Trophy size={32} />
            </div>
            <div className="space-y-1">
              <h2 className="text-3xl font-black">Escape!</h2>
              <p className="text-foreground/60 font-medium">You navigated the maze in {moves} moves.</p>
            </div>
            <Button onClick={generateMaze} className="w-full py-4 text-lg">NEW MAZE</Button>
          </Card>
        )}
      </div>
    </main>
  );
}
