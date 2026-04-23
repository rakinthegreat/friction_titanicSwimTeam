import { WORD_LIST } from './wordlist';

const getEffectiveDate = () => {
  if (typeof window !== 'undefined') {
    const override = localStorage.getItem('dev_date_override');
    if (override) return override;
  }
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

export const getDailyCrossword = async () => {
  const today = getEffectiveDate();
  const seed = hashString(today + 'crossword-v5');
  
  const pool = WORD_LIST.filter(w => w.length >= 4 && w.length <= 7);
  const starterWord = pool[seed % pool.length].toUpperCase();
  const starterRow = 4;
  const starterCol = Math.floor((9 - starterWord.length) / 2);

  const clues: any[] = [
    { 
      label: 'A', 
      direction: 'across' as const, 
      answer: starterWord, 
      row: starterRow, 
      col: starterCol,
      clue: await fetchDefinition(starterWord)
    }
  ];

  let intersectionsFound = 0;
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
      if (row >= 0 && row + downWord.length <= 9) {
        clues.push({
          label: (intersectionsFound + 1).toString(),
          direction: 'down' as const,
          answer: downWord,
          row: row,
          col: col,
          clue: await fetchDefinition(downWord)
        });
        intersectionsFound++;
      }
    }
  }
  return clues;
};

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