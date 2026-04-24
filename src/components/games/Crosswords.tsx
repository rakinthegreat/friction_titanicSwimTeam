'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Trophy, HelpCircle, Loader2 } from 'lucide-react';
import { getDailyCrossword } from '@/lib/dailyCrossword';
import { useUserStore } from '@/store/userStore';

interface Cell {
  letter: string;
  isWall: boolean;
  label?: string;
}

interface Clue {
  label: string;
  direction: 'across' | 'down';
  clue: string;
  answer: string;
  row: number;
  col: number;
}

const GRID_SIZE = 9;

export const Crosswords = ({ onComplete }: { onComplete: (xp: number) => void }) => {
  const [grid, setGrid] = useState<string[][]>(Array(GRID_SIZE).fill("").map(() => Array(GRID_SIZE).fill("")));
  const [clues, setClues] = useState<Clue[] | null>(null);
  const [focused, setFocused] = useState<{ r: number, c: number }>({ r: 0, c: 0 });
  const [won, setWon] = useState(false);
  const [lastDir, setLastDir] = useState<'across' | 'down'>('across');
  const [shake, setShake] = useState(false);
  const [correctCells, setCorrectCells] = useState<Set<string>>(new Set());
  const recordGameStart = useUserStore((state) => state.recordGameStart);
  const recordGameResult = useUserStore((state) => state.recordGameResult);
  const gameEnded = useRef<boolean>(false);
  const [canReveal, setCanReveal] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [hint, setHint] = useState<string | null>(null);
  const [isLoadingHint, setIsLoadingHint] = useState(false);
  const startTimeRef = useRef<number>(Date.now());

  const fetchedRef = useRef(false);

  useEffect(() => {
    // Record game start
    recordGameStart('crosswords');
    startTimeRef.current = Date.now();
    gameEnded.current = false;

    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const remaining = Math.max(0, 60 - elapsed);
      setTimeLeft(remaining);
      if (remaining === 0) {
        setCanReveal(true);
        clearInterval(timer);
      }
    }, 1000);

    return () => {
      clearInterval(timer);
      if (!gameEnded.current && gridRef.current.some(row => row.some(cell => cell !== ""))) {
        const timeSpent = (Date.now() - startTimeRef.current) / 1000;
        recordGameResult('crosswords', 'quit', timeSpent);
      }
    };
  }, [recordGameStart, recordGameResult]);

  const gridRef = useRef<string[][]>(grid);
  useEffect(() => {
    gridRef.current = grid;
  }, [grid]);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    const fetchPuzzle = async () => {
      try {
        const result = await getDailyCrossword();
        if (result && result.length > 0) {
          setClues(result);
        } else {
          throw new Error("No clues generated");
        }
      } catch (e) {
        console.error("CRITICAL: Failed to load crossword puzzle:", e);
        setClues([]);
      }
    };
    fetchPuzzle();
  }, []);

  const gridDefinition: Cell[][] = Array(GRID_SIZE).fill(null).map(() =>
    Array(GRID_SIZE).fill(null).map(() => ({ letter: "", isWall: true }))
  );

  if (clues) {
    clues.forEach(clue => {
      for (let i = 0; i < clue.answer.length; i++) {
        const r = clue.direction === 'across' ? clue.row : clue.row + i;
        const c = clue.direction === 'across' ? clue.col + i : clue.col;
        if (r < GRID_SIZE && c < GRID_SIZE) {
          gridDefinition[r][c].isWall = false;
          if (i === 0) gridDefinition[r][c].label = clue.label;
        }
      }
    });
  }

  const handleInput = (r: number, c: number, val: string) => {
    if (won || !clues) return;
    const newGrid = [...grid];
    const upperVal = val.toUpperCase().slice(-1);
    newGrid[r][c] = upperVal;
    setGrid(newGrid);

    const newCorrect = new Set(correctCells);
    newCorrect.delete(`${r}-${c}`);
    setCorrectCells(newCorrect);

    if (upperVal !== "") {
      if (lastDir === 'across' && c < GRID_SIZE - 1) {
        for (let i = c + 1; i < GRID_SIZE; i++) if (!gridDefinition[r][i].isWall) { setFocused({ r, c: i }); break; }
      } else if (lastDir === 'down' && r < GRID_SIZE - 1) {
        for (let i = r + 1; i < GRID_SIZE; i++) if (!gridDefinition[i][c].isWall) { setFocused({ r: i, c }); break; }
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!clues) return;
    const { r, c } = focused;
    if (e.key === 'ArrowRight' && c < GRID_SIZE - 1) {
      setLastDir('across');
      for (let i = c + 1; i < GRID_SIZE; i++) if (!gridDefinition[r][i].isWall) { setFocused({ r, c: i }); break; }
    } else if (e.key === 'ArrowLeft' && c > 0) {
      setLastDir('across');
      for (let i = c - 1; i >= 0; i--) if (!gridDefinition[r][i].isWall) { setFocused({ r, c: i }); break; }
    } else if (e.key === 'ArrowDown' && r < GRID_SIZE - 1) {
      setLastDir('down');
      for (let i = r + 1; i < GRID_SIZE; i++) if (!gridDefinition[i][c].isWall) { setFocused({ r: i, c }); break; }
    } else if (e.key === 'ArrowUp' && r > 0) {
      setLastDir('down');
      for (let i = r - 1; i >= 0; i--) if (!gridDefinition[i][c].isWall) { setFocused({ r: i, c }); break; }
    }
  };

  const handleSubmit = () => {
    if (!clues) return;
    const newCorrect = new Set<string>();
    let allCorrect = true;

    clues.forEach(clue => {
      let clueCorrect = true;
      const positions: { r: number, c: number }[] = [];

      for (let i = 0; i < clue.answer.length; i++) {
        const r = clue.direction === 'across' ? clue.row : clue.row + i;
        const c = clue.direction === 'across' ? clue.col + i : clue.col;
        positions.push({ r, c });
        if (grid[r][c] !== clue.answer[i]) {
          clueCorrect = false;
          allCorrect = false;
        }
      }

      if (clueCorrect) {
        positions.forEach(p => newCorrect.add(`${p.r}-${p.c}`));
      }
    });

    setCorrectCells(newCorrect);

    if (allCorrect && !gameEnded.current) {
      setWon(true);
      gameEnded.current = true;
      const timeSpent = (Date.now() - startTimeRef.current) / 1000;
      recordGameResult('crosswords', 'win', timeSpent);
      setTimeout(() => onComplete(50), 2500);
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  const handleReveal = () => {
    if (!clues) return;
    const newGrid = [...grid];
    clues.forEach(clue => {
      for (let i = 0; i < clue.answer.length; i++) {
        const r = clue.direction === 'across' ? clue.row : clue.row + i;
        const c = clue.direction === 'across' ? clue.col + i : clue.col;
        newGrid[r][c] = clue.answer[i];
      }
    });
    setGrid(newGrid);
    setIsRevealed(true);

    if (!gameEnded.current) {
      gameEnded.current = true;
      const timeSpent = (Date.now() - startTimeRef.current) / 1000;
      recordGameResult('crosswords', 'loss', timeSpent);
    }
  };

  const handleHint = async () => {
    if (!clues || isLoadingHint) return;
    
    // Find clue that covers focused cell
    // We try to prioritize the direction the user is currently typing in (lastDir)
    let activeClue = clues.find(c => {
      if (c.direction !== lastDir) return false;
      for (let i = 0; i < c.answer.length; i++) {
        const r = c.direction === 'across' ? c.row : c.row + i;
        const col = c.direction === 'across' ? c.col + i : c.col;
        if (r === focused.r && col === focused.c) return true;
      }
      return false;
    });

    // Fallback to any clue at that position
    if (!activeClue) {
      activeClue = clues.find(c => {
        for (let i = 0; i < c.answer.length; i++) {
          const r = c.direction === 'across' ? c.row : c.row + i;
          const col = c.direction === 'across' ? c.col + i : c.col;
          if (r === focused.r && col === focused.c) return true;
        }
        return false;
      });
    }

    if (!activeClue) {
      setHint("Select a letter in a word to get a hint!");
      return;
    }

    setIsLoadingHint(true);
    setHint(null);

    try {
      const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${activeClue.answer}`);
      const data = await res.json();
      
      const synonyms: string[] = [];
      if (Array.isArray(data)) {
        data.forEach(entry => {
          entry.meanings?.forEach((m: any) => {
            if (m.synonyms) synonyms.push(...m.synonyms);
          });
        });
      }

      if (synonyms.length > 0) {
        setHint(`Hint for ${activeClue.label} ${activeClue.direction.toUpperCase()}: Synonyms include "${synonyms.slice(0, 3).join(', ')}"`);
      } else {
        setHint(`No specific synonyms found for this word, but keep trying!`);
      }
    } catch (e) {
      setHint("Could not fetch hint at this time.");
    } finally {
      setIsLoadingHint(false);
    }
  };

  if (clues === null) return (
    <div className="h-64 flex flex-col items-center justify-center space-y-4">
      <Loader2 className="w-8 h-8 animate-spin text-accent" />
      <p className="text-xs font-black uppercase tracking-[0.2em] text-foreground/30">Generating Daily Grid...</p>
    </div>
  );

  if (clues.length === 0) return (
    <div className="h-64 flex flex-col items-center justify-center space-y-4 text-center p-6">
      <p className="text-sm font-bold text-foreground/50 italic">The daily puzzle is resting. Please try again in a moment.</p>
      <Button variant="outline" onClick={() => window.location.reload()}>Retry Generation</Button>
    </div>
  );

  return (
    <div className={`flex flex-col items-center space-y-8 animate-in zoom-in-95 duration-500 ${shake ? 'animate-shake' : ''}`}>
      <div className="grid grid-cols-9 gap-[1px] bg-foreground/20 p-[1px] rounded-sm overflow-hidden shadow-xl">
        {gridDefinition.map((row, r) => row.map((cell, c) => (
          <div key={`${r}-${c}`} className="relative w-8 h-8 sm:w-10 sm:h-10">
            {cell.isWall ? (
              <div 
                className="w-full h-full text-foreground/10" 
                style={{ backgroundColor: 'currentColor' }}
                aria-hidden="true"
              />
            ) : (
              <>
                <input
                  type="text"
                  maxLength={1}
                  value={grid[r][c]}
                  onChange={(e) => handleInput(r, c, e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={(e) => {
                    setFocused({ r, c });
                    setTimeout(() => e.target.setSelectionRange(1, 1), 0);
                  }}
                  ref={(el) => {
                    if (focused.r === r && focused.c === c) el?.focus();
                  }}
                  className={`w-full h-full text-center font-black text-lg transition-all outline-none border-none ${focused.r === r && focused.c === c
                      ? 'bg-accent/50 text-white shadow-[inset_0_0_0_2px_var(--accent)]'
                      : correctCells.has(`${r}-${c}`)
                        ? 'bg-accent/40 text-white'
                        : 'bg-card text-foreground'
                    }`}
                />
                {cell.label && (
                  <span className={`absolute top-0.5 left-1 text-[8px] sm:text-[9px] font-bold leading-none pointer-events-none ${correctCells.has(`${r}-${c}`) ? 'text-white/60' : 'text-foreground/40'
                    }`}>
                    {cell.label}
                  </span>
                )}
              </>
            )}
          </div>
        )))}
      </div>

      <div className="w-full max-w-md space-y-6">
        <div className="bg-card/50 p-4 rounded-2xl shadow-neo-in border border-foreground/5 max-h-48 overflow-y-auto scrollbar-hide">
          <h3 className="text-xs font-black uppercase tracking-widest text-accent mb-3 flex items-center gap-2">
            <HelpCircle size={14} /> Daily Clues
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-[10px] font-black text-foreground/30 uppercase tracking-tighter">Across</p>
              {clues.filter(c => c.direction === 'across').map(clue => (
                <p key={clue.label} className="text-xs font-medium text-foreground/80 leading-tight">
                  <span className="font-bold text-accent mr-1">{clue.label}.</span> {clue.clue}
                </p>
              ))}
            </div>
            <div className="space-y-2">
              <p className="text-[10px] font-black text-foreground/30 uppercase tracking-tighter">Down</p>
              {clues.filter(c => c.direction === 'down').map(clue => (
                <p key={clue.label} className="text-xs font-medium text-foreground/80 leading-tight">
                  <span className="font-bold text-accent mr-1">{clue.label}.</span> {clue.clue}
                </p>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {hint && (
            <div className="bg-accent/10 p-3 rounded-xl border border-accent/20 text-[10px] font-medium text-accent animate-in fade-in slide-in-from-top-1 relative group">
              {hint}
              <button 
                onClick={() => setHint(null)}
                className="absolute top-1 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-[8px] font-black uppercase hover:text-accent-secondary"
              >
                Clear
              </button>
            </div>
          )}

          {isRevealed && (
            <div className="bg-accent-secondary/10 p-4 rounded-xl border border-accent-secondary/20 space-y-3 animate-in fade-in slide-in-from-top-2 duration-500">
              <div className="flex items-center gap-2 text-accent-secondary font-black text-[10px] uppercase tracking-widest">
                <HelpCircle size={14} /> Solution Revealed
              </div>
              <p className="text-[10px] text-foreground/60 font-medium leading-tight">Study the grid above to learn today's answers. Try again tomorrow for a fresh challenge!</p>
              <Button 
                onClick={() => onComplete(0)} 
                variant="outline"
                className="w-full py-2 text-[8px] font-black tracking-widest uppercase border-accent-secondary/20 text-accent-secondary hover:bg-accent-secondary/5"
              >
                Exit Game
              </Button>
            </div>
          )}
          
          <Button
            onClick={handleSubmit}
            className="w-full py-6 text-lg font-black italic tracking-widest shadow-neo-out hover:shadow-neo-in transition-all active:scale-95"
          >
            CHECK
          </Button>

          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={handleHint}
              disabled={won || isRevealed || isLoadingHint}
              className="py-3 text-[10px] font-black tracking-[0.2em] uppercase shadow-neo-out hover:shadow-neo-in transition-all border-foreground/5 text-foreground/60 disabled:opacity-30"
            >
              {isLoadingHint ? <Loader2 className="w-3 h-3 animate-spin" /> : "Get Hint"}
            </Button>

            <Button
              variant="outline"
              onClick={handleReveal}
              disabled={!canReveal || won || isRevealed}
              className="py-3 text-[10px] font-black tracking-[0.2em] uppercase shadow-neo-out hover:shadow-neo-in transition-all border-accent/20 text-accent disabled:opacity-50 disabled:grayscale"
            >
              {canReveal ? "Reveal Solution" : `Reveal in ${timeLeft}s`}
            </Button>
          </div>
        </div>
      </div>

      {won && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-background/20 backdrop-blur-sm animate-in fade-in duration-500">
          <Card className="w-full max-w-xs p-8 text-center space-y-6 shadow-2xl border-2 border-accent/20">
            <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto text-white">
              <Trophy size={32} />
            </div>
            <h2 className="text-3xl font-black italic">SOLVED!</h2>
            <p className="text-foreground/60 font-medium">You completed the daily crossword.</p>
          </Card>
        </div>
      )}
    </div>
  );
};
