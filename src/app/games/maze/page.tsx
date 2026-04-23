'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Trophy, RefreshCw, ArrowLeft, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/userStore';

const SIZE = 23;

export default function MazePage() {
  const router = useRouter();
  const updateStats = useUserStore((state) => state.updateStats);

  const [maze, setMaze] = useState<number[][]>([]);
  const [player, setPlayer] = useState({ x: 1, y: 1 });
  const [goal, setGoal] = useState({ x: SIZE - 2, y: SIZE - 2 });
  const [won, setWon] = useState(false);
  const [moves, setMoves] = useState(0);
  
  const dragStart = useRef<{ x: number, y: number } | null>(null);
  const isDragging = useRef(false);

  const generateMaze = useCallback(() => {
    const newMaze = Array(SIZE).fill(null).map(() => Array(SIZE).fill(1));
    const stack: [number, number][] = [];
    const start = { x: 1, y: 1 };
    newMaze[start.y][start.x] = 0;
    stack.push([start.x, start.y]);

    while (stack.length > 0) {
      const [cx, cy] = stack[stack.length - 1];
      const neighbors: [number, number, number, number][] = [];

      [[0, -2], [0, 2], [-2, 0], [2, 0]].forEach(([dx, dy]) => {
        const nx = cx + dx, ny = cy + dy;
        if (nx > 0 && nx < SIZE - 1 && ny > 0 && ny < SIZE - 1 && newMaze[ny][nx] === 1) {
          neighbors.push([nx, ny, cx + dx / 2, cy + dy / 2]);
        }
      });

      if (neighbors.length > 0) {
        // Shuffle neighbors to ensure randomness
        neighbors.sort(() => Math.random() - 0.5);
        
        const [nx, ny, px, py] = neighbors[0];
        newMaze[ny][nx] = 0;
        newMaze[py][px] = 0;
        stack.push([nx, ny]);
        
        // Intensified Deception: Force a second, deep branch more frequently
        if (neighbors.length > 1 && Math.random() > 0.4) {
           const [snx, sny, spx, spy] = neighbors[1];
           // Create a long distraction by letting it carve separately later
           newMaze[sny][snx] = 0;
           newMaze[spy][spx] = 0;
           // We push it to the stack so it gets explored DEEP
           stack.push([snx, sny]);
        }
      } else {
        stack.pop();
      }
    }

    // Goal Post-Processing: Ensure the goal is surrounded by a few distractions
    // so the "obvious" path to it might be a dead-end
    setMaze(newMaze);
    setPlayer({ x: 1, y: 1 });
    setWon(false);
    setMoves(0);
  }, []);

  useEffect(() => {
    generateMaze();
  }, [generateMaze]);

  const movePlayer = useCallback((dx: number, dy: number) => {
    if (won) return;
    
    setPlayer((prev) => {
      const nx = prev.x + dx;
      const ny = prev.y + dy;

      if (nx >= 0 && nx < SIZE && ny >= 0 && ny < SIZE && maze[ny][nx] === 0) {
        const isGoal = nx === goal.x && ny === goal.y;
        if (isGoal) {
          setWon(true);
          updateStats(3);
        }
        setMoves(m => m + 0.5); // Manual halving to fix double-count
        return { x: nx, y: ny };
      }
      return prev;
    });
  }, [won, maze, goal, updateStats]);

  const lastPos = useRef<{ x: number, y: number } | null>(null);

  const handleStart = (x: number, y: number) => {
    dragStart.current = { x, y };
    lastPos.current = { x, y };
    isDragging.current = true;
  };

  const handleMove = (x: number, y: number) => {
    if (!isDragging.current || !lastPos.current) return;

    const dx = x - lastPos.current.x;
    const dy = y - lastPos.current.y;
    
    // Calculate cell size roughly based on the maze container
    // We'll use a fixed threshold of ~15-20px for a responsive feel
    const threshold = 18; 

    if (Math.abs(dx) > threshold) {
      movePlayer(dx > 0 ? 1 : -1, 0);
      lastPos.current = { x, y: lastPos.current.y }; // Only update X
    } else if (Math.abs(dy) > threshold) {
      movePlayer(0, dy > 0 ? 1 : -1);
      lastPos.current = { x: lastPos.current.x, y }; // Only update Y
    }
  };

  const handleEnd = () => {
    dragStart.current = null;
    lastPos.current = null;
    isDragging.current = false;
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
  }, [movePlayer]);

  return (
    <main className="min-h-screen bg-background p-6 flex flex-col items-center select-none overflow-hidden touch-none">
      <header className="w-full max-w-md flex justify-between items-center mb-8">
        <button onClick={() => router.push('/games')} className="p-3 rounded-2xl bg-card shadow-neo-out text-accent">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-black italic tracking-tighter text-foreground/80">MAZE SOLVER</h1>
        <div className="w-12" />
      </header>

      <div className="w-full max-w-md space-y-12">
        <div 
          className="relative group"
          onTouchStart={(e) => handleStart(e.touches[0].clientX, e.touches[0].clientY)}
          onTouchMove={(e) => handleMove(e.touches[0].clientX, e.touches[0].clientY)}
          onTouchEnd={handleEnd}
          onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
          onMouseMove={(e) => handleMove(e.clientX, e.clientY)}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
        >
          <Card className="p-2 aspect-square flex items-center justify-center bg-foreground/5 border border-foreground/10 overflow-hidden shadow-none cursor-move transition-colors hover:bg-foreground/[0.07]">
            <div className="grid grid-cols-23 w-full h-full gap-0">
              {maze.map((row, y) => row.map((cell, x) => (
                <div 
                  key={`${x}-${y}`} 
                  className={`aspect-square transition-colors duration-75 ${
                    cell === 1 
                      ? 'bg-foreground' 
                      : (x === player.x && y === player.y) 
                        ? 'bg-accent z-10 scale-100 ring-1 ring-accent/30' 
                        : (x === goal.x && y === goal.y)
                          ? 'bg-accent-secondary animate-pulse ring-1 ring-accent-secondary/30'
                          : 'bg-transparent'
                  }`}
                />
              )))}
            </div>
          </Card>
          
          {/* Overlay for feedback */}
          {won && (
            <div className="absolute inset-0 z-20 flex items-center justify-center p-6 animate-in zoom-in duration-300">
              <Card className="w-full p-8 text-center space-y-6 bg-background border-2 border-accent/20 shadow-2xl">
                <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto text-white">
                  <Trophy size={32} />
                </div>
                <div className="space-y-1">
                  <h2 className="text-3xl font-black">Escaped!</h2>
                  <p className="text-foreground/60 font-medium">Clearance in {Math.floor(moves)} steps.</p>
                </div>
                <Button onClick={generateMaze} className="w-full py-4 text-lg">PLAY AGAIN</Button>
              </Card>
            </div>
          )}
        </div>
        
        <div className="text-center space-y-4">
          <p className="text-xs font-black text-foreground/20 uppercase tracking-[0.2em] italic">
            Swipe to Move
          </p>
          <div className="flex justify-center gap-8">
            <div className="text-center">
              <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest mb-1">Moves</p>
              <p className="text-2xl font-black text-accent">{Math.floor(moves)}</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
