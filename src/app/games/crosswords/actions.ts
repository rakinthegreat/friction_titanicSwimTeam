'use server';

import { WORD_LIST } from '@/lib/wordlist';

/**
 * Crossword Logic Strategy:
 * 1. Pick a high-frequency 5-7 letter word for the center.
 * 2. Scan the WORD_LIST for intersecting words.
 * 3. Build a small, valid grid.
 * 4. Fetch dictionary definitions for the selected words.
 */

const getEffectiveDate = () => {
  return new Date().toISOString().split('T')[0];
};

const hashString = (str: string) => {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = (h * 0x01000193) | 0;
  }
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return h >>> 0;
};

export async function generateCrossword() {
  try {
    const today = getEffectiveDate();
    const seed = hashString(today + 'crossword-v4');
    
    // 1. Pick 4-5 words that can actually intersect
    const pool = WORD_LIST.filter(w => w.length >= 4 && w.length <= 7);
    
    // Starter word (Across)
    const starterWord = pool[seed % pool.length].toUpperCase();
    const starterRow = 4;
    const starterCol = Math.floor((9 - starterWord.length) / 2);

    const clues = [
      { 
        number: 1, 
        direction: 'across', 
        answer: starterWord, 
        row: starterRow, 
        col: starterCol,
        clue: await fetchDefinition(starterWord)
      }
    ];

    // 2. Try to find intersecting 'down' words
    let intersectionsFound = 0;
    // We'll skip every other letter to keep the grid clean
    for (let i = 0; i < starterWord.length; i += 2) {
      if (intersectionsFound >= 3) break;
      
      const char = starterWord[i];
      const col = starterCol + i;
      
      const matchSeed = (seed + i + 100);
      const possibleDowns = pool.filter(w => w.includes(char) && w !== starterWord);
      
      if (possibleDowns.length > 0) {
        const downWord = possibleDowns[matchSeed % possibleDowns.length].toUpperCase();
        const charIndexInDown = downWord.indexOf(char);
        const row = starterRow - charIndexInDown;
        
        // Bounds check
        if (row >= 0 && row + downWord.length <= 9) {
          clues.push({
            number: intersectionsFound + 1,
            direction: 'down',
            answer: downWord,
            row: row,
            col: col,
            clue: await fetchDefinition(downWord)
          });
          intersectionsFound++;
        }
      }
    }

    return { success: true, clues };
  } catch (error) {
    console.error("Crossword Gen Error:", error);
    return {
      success: false,
      clues: [
        { number: 1, direction: 'across', clue: 'Fundamental principles', answer: 'ETHICS', row: 4, col: 2 },
        { number: 1, direction: 'down', clue: 'Existing', answer: 'EXIST', row: 2, col: 2 },
      ]
    };
  }
}

async function fetchDefinition(word: string) {
  try {
    const res = await fetch('https://api.dictionaryapi.dev/api/v2/entries/en/' + word);
    if (!res.ok) return 'A common daily word: ' + word;
    const data = await res.json();
    return data[0].meanings[0].definitions[0].definition;
  } catch (e) {
    return 'Daily challenge word';
  }
}
