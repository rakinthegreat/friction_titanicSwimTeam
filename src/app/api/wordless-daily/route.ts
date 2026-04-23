import { NextResponse } from 'next/server';

export const revalidate = 86400; // Cache this response for 24 hours

export async function GET() {
  try {
    let finalWord = '';

    // Try up to 10 times to find a random 5-letter word
    for (let i = 0; i < 10; i++) {
      const wordRes = await fetch('https://random-word-api.vercel.app/api?words=1&length=5');
      if (!wordRes.ok) continue;
      
      const [randomWord] = await wordRes.json();
      
      // Ensure it's a real dictionary word
      const defRes = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${randomWord}`);
      if (!defRes.ok) continue;

      finalWord = randomWord.toUpperCase();
      break;
    }

    if (!finalWord) finalWord = 'TRUST';

    return NextResponse.json({ word: finalWord });
  } catch (error) {
    console.error("Error generating daily WordLess:", error);
    return NextResponse.json({ word: 'LIGHT' });
  }
}
