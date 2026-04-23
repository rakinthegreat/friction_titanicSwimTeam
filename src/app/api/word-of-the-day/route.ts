import { NextResponse } from 'next/server';

export const revalidate = 86400; // Cache this response for 24 hours (86400 seconds)

export async function GET() {
  try {
    let finalWord = '';
    let finalMeaning = '';
    let finalPhonetic = '';

    // Try up to 10 times to find a random word that actually has a dictionary definition
    for (let i = 0; i < 10; i++) {
      const wordRes = await fetch('https://random-word-api.vercel.app/api?words=1');
      if (!wordRes.ok) continue;
      
      const [randomWord] = await wordRes.json();
      
      const defRes = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${randomWord}`);
      if (!defRes.ok) continue;

      const defData = await defRes.json();
      const entry = defData[0];
      
      if (entry.meanings && entry.meanings.length > 0) {
        finalWord = randomWord;
        finalMeaning = entry.meanings[0].definitions[0].definition;
        finalPhonetic = entry.phonetic || entry.phonetics?.find((p: any) => p.text)?.text || '';
        break;
      }
    }

    // Fallback if the random API is down or we couldn't find a word with a definition in 10 tries
    if (!finalWord) {
      finalWord = 'serendipity';
      finalMeaning = 'the occurrence and development of events by chance in a happy or beneficial way.';
      finalPhonetic = '/ˌserənˈdipədē/';
    }

    return NextResponse.json({ 
      word: finalWord, 
      meaning: finalMeaning, 
      phonetic: finalPhonetic 
    });
  } catch (error) {
    console.error("Error generating word of the day:", error);
    return NextResponse.json({ 
      word: 'ephemeral', 
      meaning: 'lasting for a very short time.', 
      phonetic: '/əˈfem(ə)rəl/' 
    });
  }
}
