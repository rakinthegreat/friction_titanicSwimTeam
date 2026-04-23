import { NextResponse } from 'next/server';
import { WORD_LIST } from '@/lib/wordlist';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. Shuffler
    const shuffled = [...WORD_LIST].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 10);
    
    let w1Across = '', w1Down = '';
    
    // 2. Local-first search for stability
    w1Across = selected[0];
    const char = w1Across[2];
    const match = selected.find(w => w[0] === char && w !== w1Across);
    w1Down = match || (char + 'OON');

    const clues = [
      { number: 1, direction: 'across', clue: 'Find the word: ' + w1Across, answer: w1Across, row: 1, col: 1 },
      { number: 1, direction: 'down', clue: 'Vertical entry: ' + w1Down, answer: w1Down, row: 1, col: 3 },
    ];

    return NextResponse.json({ clues });
  } catch (error) {
    return NextResponse.json({ 
       clues: [
          { number: 1, direction: 'across', clue: 'Stable fallback', answer: 'TRUST', row: 1, col: 1 },
          { number: 1, direction: 'down', clue: 'Vertical entry', answer: 'TOAST', row: 1, col: 1 },
       ]
    });
  }
}