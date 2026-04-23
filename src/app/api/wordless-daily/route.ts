import { NextResponse } from 'next/server';
import { WORD_LIST } from '@/lib/wordlist';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const today = new Date().toISOString().split('T')[0];
    let hash = 0;
    for (let i = 0; i < today.length; i++) {
      hash = ((hash << 5) - hash) + today.charCodeAt(i);
      hash |= 0;
    }
    
    const fives = WORD_LIST.filter(w => w.length === 5);
    const index = Math.abs(hash) % fives.length;
    const word = fives[index];

    return NextResponse.json({ word: word.toUpperCase() });
  } catch (error) {
    return NextResponse.json({ word: 'TRUST' });
  }
}