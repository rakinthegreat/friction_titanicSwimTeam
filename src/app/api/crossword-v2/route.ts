import { NextResponse } from 'next/server';
import { WORD_LIST } from '@/lib/wordlist';

export const revalidate = 0;

export async function GET() {
  try {
    // USE LOCAL WORD LIST FOR 100% RELIABILITY
    const shuffled = [...WORD_LIST].sort(() => 0.5 - Math.random());
    const w1Across = (shuffled[0] || 'TRUST').toUpperCase();
    const w1Down = (shuffled[1] || 'TOAST').toUpperCase();

    const clues = [
      { number: 1, direction: 'across', clue: 'A random common word: ' + w1Across, answer: w1Across, row: 1, col: 1 },
      { number: 1, direction: 'down', clue: 'Another puzzle word: ' + w1Down, answer: w1Down, row: 1, col: 1 },
    ];

    return NextResponse.json({ clues });
  } catch (error) {
    return NextResponse.json({ 
       clues: [
          { number: 1, direction: 'across', clue: 'Stable Fallback', answer: 'FAST', row: 1, col: 1 },
          { number: 1, direction: 'down', clue: 'Simple vertical', answer: 'FIRE', row: 1, col: 1 },
       ]
    });
  }
}