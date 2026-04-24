import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import localforage from 'localforage';

interface TriviaItem {
  q: string;
  a: string;
  category: string;
  used: boolean;
}

interface VocabItem {
  word: string;
  meaning: string;
  example: string;
  used: boolean;
}

interface JokeItem {
  setup: string;
  punchline: string;
  used: boolean;
}

interface ContentState {
  lastFetched: number | null;
  trivia: TriviaItem[];
  vocab: VocabItem[];
  jokes: JokeItem[];
  setContent: (content: any) => void;
  markUsed: (type: 'trivia' | 'vocab' | 'jokes', index: number) => void;
}

export const useContentStore = create<ContentState>()(
  persist(
    (set) => ({
      lastFetched: null,
      trivia: [],
      vocab: [],
      jokes: [],
      setContent: (content) => set({
        lastFetched: Date.now(),
        trivia: content.trivia || [],
        vocab: content.vocab || [],
        jokes: content.jokes || [],
      }),
      markUsed: (type, index) => set((state) => {
        const list = [...state[type]];
        if (list[index]) {
          list[index] = { ...list[index], used: true };
        }
        return { [type]: list };
      }),
    }),
    {
      name: 'content-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
