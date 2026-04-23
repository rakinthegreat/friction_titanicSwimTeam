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
    
    const index = Math.abs(hash) % WORD_LIST.length;
    const word = WORD_LIST[index];

    const defRes = await fetch('https://api.dictionaryapi.dev/api/v2/entries/en/' + word);
    if (!defRes.ok) throw new Error('Dict down');
    const defData = await defRes.json();

    return NextResponse.json({ 
      word: word, 
      meaning: defData[0].meanings[0].definitions[0].definition, 
      phonetic: defData[0].phonetic || '' 
    });
  } catch (error) {
    return NextResponse.json({ 
      word: 'serendipity', 
      meaning: 'the occurrence and development of events by chance in a happy or beneficial way.', 
      phonetic: '/ˌserənˈdipədē/' 
    });
  }
}