'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Trophy, RefreshCw, ArrowLeft, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, HelpCircle } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/userStore';
import { GameTutorial } from '@/components/games/GameTutorial';
import { BackButton } from '@/components/ui/BackButton';

const TUTORIAL_STEPS = [
  "Navigate through the maze to reach the trophy icon.",
  "On desktop, use your arrow keys to move.",
  "On mobile, swipe in any direction to move the player.",
  "Avoid the walls and find the most direct path!"
];

const SIZE_DEFAULT = 23;

export default function MazePage() {
  const router = useRouter();
  const updateStats = useUserStore((state) => state.updateStats);
  const recordGameStart = useUserStore((state) => state.recordGameStart);
  const recordGameResult = useUserStore((state) => state.recordGameResult);

  const [size, setSize] = useState(SIZE_DEFAULT);
  const [maze, setMaze] = useState<number[][]>([]);
  const [player, setPlayer] = useState({ x: 1, y: 1 });
  const [goal, setGoal] = useState({ x: SIZE_DEFAULT - 2, y: SIZE_DEFAULT - 2 });
  const [minMoves, setMinMoves] = useState(0);
  const [obstacles, setObstacles] = useState<Set<string>>(new Set());
  const [isAndroid, setIsAndroid] = useState(false);

  const startTime = useRef<number>(Date.now());
  const gameEnded = useRef<boolean>(false);

  const calculateShortestPath = (grid: number[][], start: { x: number, y: number }, target: { x: number, y: number }, obstacleSet: Set<string>) => {
    const queue: [number, number, number][] = [[start.x, start.y, 0]];
    const visited = new Set<string>();
    visited.add(`${start.x},${start.y}`);

    while (queue.length > 0) {
      const [x, y, dist] = queue.shift()!;
      if (x === target.x && y === target.y) return dist;

      [[0, 1], [0, -1], [1, 0], [-1, 0]].forEach(([dx, dy]) => {
        const nx = x + dx, ny = y + dy;
        const isObstacle = obstacleSet.has(`${nx},${ny}`);
        if (nx >= 0 && nx < size && ny >= 0 && ny < size && grid[ny][nx] === 0 && !isObstacle && !visited.has(`${nx},${ny}`)) {
          visited.add(`${nx},${ny}`);
          queue.push([nx, ny, dist + 1]);
        }
      });
    }
    return 0;
  };

  useEffect(() => {
    // Maze is now fixed size
    setSize(SIZE_DEFAULT);
    setGoal({ x: SIZE_DEFAULT - 2, y: SIZE_DEFAULT - 2 });
  }, []);

  const [won, setWon] = useState(false);
  const [moves, setMoves] = useState(0);

  const dragStart = useRef<{ x: number, y: number } | null>(null);
  const isDragging = useRef(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);

  useEffect(() => {
    const hasSeen = localStorage.getItem('tutorial-maze');
    if (!hasSeen) {
      setIsTutorialOpen(true);
      localStorage.setItem('tutorial-maze', 'true');
    }

    // Android detection
    const ua = typeof navigator !== 'undefined' ? navigator.userAgent.toLowerCase() : '';
    const isAndroidUA = /android/.test(ua);
    const isCapacitorAndroid = Capacitor.getPlatform() === 'android';
    setIsAndroid(isAndroidUA || isCapacitorAndroid);
  }, []);

  const generateMaze = useCallback(() => {
    // Record quit if starting new maze without finishing current
    if (!gameEnded.current && moves > 0) {
      const timeSpent = (Date.now() - startTime.current) / 1000;
      recordGameResult('maze', 'quit', timeSpent);
    }

    const newMaze = Array(size).fill(null).map(() => Array(size).fill(1));
    const stack: [number, number][] = [];
    const start = { x: 1, y: 1 };
    newMaze[start.y][start.x] = 0;
    stack.push([start.x, start.y]);

    while (stack.length > 0) {
      const [cx, cy] = stack[stack.length - 1];
      const neighbors: [number, number, number, number][] = [];

      [[0, -2], [0, 2], [-2, 0], [2, 0]].forEach(([dx, dy]) => {
        const nx = cx + dx, ny = cy + dy;
        if (nx > 0 && nx < size - 1 && ny > 0 && ny < size - 1 && newMaze[ny][nx] === 1) {
          neighbors.push([nx, ny, cx + dx / 2, cy + dy / 2]);
        }
      });

      if (neighbors.length > 0) {
        neighbors.sort(() => Math.random() - 0.5);
        const [nx, ny, px, py] = neighbors[0];
        newMaze[ny][nx] = 0;
        newMaze[py][px] = 0;
        stack.push([nx, ny]);

        // Add deep branches
        if (neighbors.length > 1 && Math.random() > 0.4) {
          const [snx, sny, spx, spy] = neighbors[1];
          newMaze[sny][snx] = 0;
          newMaze[spy][spx] = 0;
          stack.push([snx, sny]);
        }
      } else {
        stack.pop();
      }
    }

    // CREATE MULTIPLE PATHS & LOOPS
    // Randomly remove some walls to create alternative paths and cycles
    for (let i = 0; i < (size * size) / 10; i++) {
      const rx = Math.floor(Math.random() * (size - 2)) + 1;
      const ry = Math.floor(Math.random() * (size - 2)) + 1;
      if (newMaze[ry][rx] === 1) {
        let corridors = 0;
        if (newMaze[ry - 1][rx] === 0) corridors++;
        if (newMaze[ry + 1][rx] === 0) corridors++;
        if (newMaze[ry][rx - 1] === 0) corridors++;
        if (newMaze[ry][rx + 1] === 0) corridors++;
        if (corridors >= 2) newMaze[ry][rx] = 0;
      }
    }

    // ADD DECEPTIVE DEAD ENDS
    // Specifically carve out deep "traps" that look like potential paths
    for (let i = 0; i < 5; i++) {
      let dx = Math.floor(Math.random() * (size - 6)) + 3;
      let dy = Math.floor(Math.random() * (size - 6)) + 3;

      if (newMaze[dy][dx] === 0) {
        // Find a direction that's currently a wall
        const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];
        const d = dirs[Math.floor(Math.random() * 4)];

        // Carve 3-4 blocks deep in that direction
        for (let j = 1; j <= 4; j++) {
          const nx = dx + d[0] * j;
          const ny = dy + d[1] * j;
          if (nx > 0 && nx < size - 1 && ny > 0 && ny < size - 1) {
            newMaze[ny][nx] = 0;
          }
        }
      }
    }

    // ADD STATIC OBSTACLES
    const newObstacles = new Set<string>();
    let obstacleCount = 0;
    let attempts = 0;
    while (obstacleCount < 10 && attempts < 100) {
      attempts++;
      const ox = Math.floor(Math.random() * (size - 2)) + 1;
      const oy = Math.floor(Math.random() * (size - 2)) + 1;

      const isReserved = (Math.abs(ox - 1) <= 1 && Math.abs(oy - 1) <= 1) ||
        (Math.abs(ox - (size - 2)) <= 1 && Math.abs(oy - (size - 2)) <= 1);

      if (newMaze[oy][ox] === 0 && !isReserved && !newObstacles.has(`${ox},${oy}`)) {
        // Validation: Ensure at least one path still exists
        const testObstacles = new Set(newObstacles);
        testObstacles.add(`${ox},${oy}`);
        const testShortest = calculateShortestPath(newMaze, { x: 1, y: 1 }, { x: size - 2, y: size - 2 }, testObstacles);

        if (testShortest > 0) {
          newObstacles.add(`${ox},${oy}`);
          obstacleCount++;
        }
      }
    }

    const shortest = calculateShortestPath(newMaze, { x: 1, y: 1 }, { x: size - 2, y: size - 2 }, newObstacles);
    setMinMoves(shortest);
    setMaze(newMaze);
    setObstacles(newObstacles);
    setPlayer({ x: 1, y: 1 });
    setWon(false);
    setMoves(0);

    // Track game start
    recordGameStart('maze');
    startTime.current = Date.now();
    gameEnded.current = false;
  }, [size, recordGameStart, recordGameResult, moves]);

  const resetPlayer = () => {
    setPlayer({ x: 1, y: 1 });
    setWon(false);
    setMoves(0);
    // Track retry as a start? Or just keep current session?
    // Let's keep current session for retry same maze.
  };

  const movesRef = React.useRef(moves);
  useEffect(() => {
    movesRef.current = moves;
  }, [moves]);

  useEffect(() => {
    generateMaze();
    return () => {
      if (!gameEnded.current && movesRef.current > 0) {
        const timeSpent = (Date.now() - startTime.current) / 1000;
        recordGameResult('maze', 'quit', timeSpent);
      }
    };
  }, []); // Only once on mount

  const movePlayer = useCallback((dx: number, dy: number) => {
    if (won) return;

    setPlayer((prev) => {
      const nx = prev.x + dx;
      const ny = prev.y + dy;
      const isObstacle = obstacles.has(`${nx},${ny}`);

      if (nx >= 0 && nx < size && ny >= 0 && ny < size && maze[ny][nx] === 0 && !isObstacle) {
        const isGoal = nx === goal.x && ny === goal.y;
        if (isGoal && !gameEnded.current) {
          setWon(true);
          updateStats(3);
          useUserStore.getState().completeActivity('maze');

          gameEnded.current = true;
          const timeSpent = (Date.now() - startTime.current) / 1000;
          recordGameResult('maze', 'win', timeSpent);
        }
        setMoves(m => m + 1);
        return { x: nx, y: ny };
      }
      return prev;
    });
  }, [won, maze, goal, updateStats, recordGameResult]);

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
        <BackButton href="/" className="text-accent" />
        <h1 className="text-2xl font-black italic tracking-tighter text-foreground/80">MAZE SOLVER</h1>
        <button
          onClick={() => setIsTutorialOpen(true)}
          className="p-3 rounded-2xl bg-transparent hover:bg-foreground/5 text-accent"
        >
          <HelpCircle size={24} />
        </button>
      </header>

      <div className="flex gap-4 mb-4">
        <div className="bg-card px-4 py-2 rounded-xl shadow-neo-in flex flex-col items-center min-w-[80px]">
          <span className="text-[10px] font-black opacity-40 uppercase tracking-tighter">Moves</span>
          <span className="text-lg font-black leading-none">{isAndroid ? moves : Math.floor(moves / 2)}</span>
        </div>
        <div className="bg-card px-4 py-2 rounded-xl shadow-neo-in flex flex-col items-center min-w-[80px]">
          <span className="text-[10px] font-black opacity-40 uppercase tracking-tighter">Target</span>
          <span className="text-lg font-black leading-none">{minMoves}</span>
        </div>
      </div>

      <GameTutorial
        title="Maze Solver"
        steps={TUTORIAL_STEPS}
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
      />

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
            <div className={`grid w-full h-full gap-0`} style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}>
              {maze.map((row, y) => row.map((cell, x) => (
                <div
                  key={`${x}-${y}`}
                  className={`aspect-square transition-all duration-75 ${cell === 1
                      ? 'bg-foreground'
                      : (x === player.x && y === player.y)
                        ? 'bg-accent z-10 scale-100 ring-1 ring-accent/30'
                        : (x === goal.x && y === goal.y)
                          ? 'bg-accent-secondary animate-pulse ring-1 ring-accent-secondary/30'
                          : obstacles.has(`${x},${y}`)
                            ? 'bg-foreground/40 flex items-center justify-center'
                            : 'bg-transparent'
                    }`}
                >
                  {obstacles.has(`${x},${y}`) && (
                    <div className="w-[45%] h-[45%] bg-foreground/60 rounded-sm rotate-45" />
                  )}
                </div>
              )))}
            </div>
          </Card>

          {/* Overlay for feedback */}
          {won && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/80 backdrop-blur-md rounded-[2.5rem] animate-in fade-in zoom-in duration-500">
              <div className="relative p-8 rounded-[3rem] bg-card shadow-neo-out flex flex-col items-center space-y-6 max-w-[85%] border border-white/10">
                <div className="absolute top-4 left-4">
                  <BackButton href="/" className="text-accent" />
                </div>
                <div className="w-20 h-20 bg-accent/20 rounded-full flex items-center justify-center">
                  <Trophy className="w-12 h-12 text-accent" />
                </div>
                <div className="text-center">
                  <h2 className="text-3xl font-black italic tracking-tighter mb-2">MAZE CLEARED</h2>
                  <p className="text-foreground/40 font-bold text-sm tracking-widest uppercase mb-4">You found the exit!</p>

                  <div className="flex gap-4 justify-center">
                    <div className="bg-card px-4 py-3 rounded-2xl shadow-neo-in text-center min-w-[100px]">
                      <p className="text-[10px] font-bold uppercase opacity-40 mb-1">Your Moves</p>
                      <p className="text-xl font-black">{isAndroid ? moves : Math.floor(moves / 2)}</p>
                    </div>
                    <div className="bg-card px-4 py-3 rounded-2xl shadow-neo-in text-center min-w-[100px]">
                      <p className="text-[10px] font-bold uppercase opacity-40 mb-1">Target</p>
                      <p className="text-xl font-black">{minMoves}</p>
                    </div>
                  </div>

                  {(isAndroid ? moves : Math.floor(moves / 2)) <= minMoves ? (
                    <div className="mt-6 py-4 px-6 bg-card rounded-2xl shadow-neo-in border border-accent-secondary/10">
                      <p className="text-accent-secondary font-black text-xs tracking-[0.2em] uppercase">
                        Perfect Shortest Path
                      </p>
                    </div>
                  ) : (
                    <div className="mt-6 flex flex-col gap-4 w-full">
                      <div className="py-4 px-6 bg-card rounded-2xl shadow-neo-in border border-foreground/5 opacity-60">
                        <p className="text-foreground/40 font-black text-[10px] tracking-widest uppercase text-center">
                          Optimization Required
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        onClick={resetPlayer}
                        className="w-full py-3 text-xs font-black tracking-[0.2em] uppercase shadow-neo-out hover:scale-[1.02] active:scale-[0.98] transition-all border-accent/20 text-accent"
                      >
                        Retry Same Maze
                      </Button>
                    </div>
                  )}
                </div>
                <Button onClick={() => {
                  const state = useUserStore.getState();
                  if (state.sessionEndTime && state.sessionEndTime > Date.now()) {
                    router.push('/session');
                  } else {
                    router.push('/');
                  }
                }} size="lg" className="w-full py-4 text-lg font-black italic tracking-widest shadow-neo-out hover:scale-[1.02] active:scale-[0.98] transition-all">
                  CONTINUE
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="text-center space-y-4">
          <p className="text-xs font-black text-foreground/20 uppercase tracking-[0.2em] italic">
            Swipe to Move
          </p>
        </div>
      </div>
    </main>
  );
}
