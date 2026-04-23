import { WORD_LIST } from './wordlist';

const getEffectiveDate = () => {
  if (typeof window !== 'undefined') {
    const override = localStorage.getItem('dev_date_override');
    if (override) return override;
  }
  return new Date().toISOString().split('T')[0];
};

// MurmurHash3's mixing function to ensure good distribution (avalanche effect)
const hashString = (str: string) => {
  let h = 0x811c9dc5; // FNV offset basis
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = (h * 0x01000193) | 0; // FNV prime
  }
  
  // Final mixing
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  
  return h >>> 0;
};

export const getDailyWord = () => {
  const today = getEffectiveDate();
  const seed = hashString(today + 'salt-word-of-day');
  const index = seed % WORD_LIST.length;
  return WORD_LIST[index];
};

export const getDailyWordLess = () => {
  const today = getEffectiveDate();
  const seed = hashString(today + 'salt-wordless');
  
  const fives = WORD_LIST.filter(w => w.length === 5);
  const index = seed % fives.length;
  return fives[index].toUpperCase();
};