'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Trophy, HelpCircle, Loader2 } from 'lucide-react';
import { getDailyCrossword } from '@/lib/dailyCrossword';

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

  const fetchedRef = useRef(false);

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
      const positions: {r: number, c: number}[] = [];
      
      for (let i = 0; i < clue.answer.length; i++) {
        const r = clue.direction === 'across' ? clue.row : clue.row + i;
        const c = clue.direction === 'across' ? clue.col + i : clue.col;
        positions.push({r, c});
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

    if (allCorrect) {
      setWon(true);
      setTimeout(() => onComplete(50), 2500);
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 500);
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
          <div key={`${r}-${c}`} className="relative w-10 h-10">
            {cell.isWall ? (
              <div className="w-full h-full bg-foreground" />
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
                  className={`w-full h-full text-center font-black text-lg transition-all outline-none border-none ${
                    focused.r === r && focused.c === c 
                      ? 'bg-accent/20 text-accent' 
                      : correctCells.has(`${r}-${c}`)
                        ? 'bg-accent/40 text-white'
                        : 'bg-card text-foreground'
                  }`}
                />
                {cell.label && (
                  <span className={`absolute top-0.5 left-1 text-[8px] sm:text-[9px] font-bold leading-none pointer-events-none ${
                    correctCells.has(`${r}-${c}`) ? 'text-white/60' : 'text-foreground/40'
                  }`}>
                    {cell.label}
                  </span>
                )}
              </>
            )}
          </div>
        )))}
      </div>

      <div className="w-full max-w-sm space-y-6">
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

        <Button 
          onClick={handleSubmit}
          className="w-full py-6 text-lg font-black italic tracking-widest shadow-neo-out hover:shadow-neo-in transition-all active:scale-95"
        >
          SUBMIT SOLUTION
        </Button>
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
