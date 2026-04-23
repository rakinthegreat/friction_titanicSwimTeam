import { NextResponse } from 'next/server';

export const revalidate = 0;

export async function GET() {
  return NextResponse.json({ 
     clues: [
        { number: 1, direction: 'across', clue: 'THIS IS NEW API', answer: 'NEWWW', row: 1, col: 1 },
        { number: 1, direction: 'down', clue: 'TESTING REFRESH', answer: 'NOTST', row: 1, col: 1 },
     ]
  });
}