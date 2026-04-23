import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import localforage from 'localforage';

interface UserState {
  uid: string | null;
  interests: string[];
  stats: {
    totalMinutesSaved: number;
    activitiesCompleted: number;
    streakDays: number;
    highScores: Record<string, number>;
  };
  preferences: {
    darkMode: boolean;
    blockDoomscrolling: boolean;
  };
  setInterests: (interests: string[]) => void;
  updateStats: (minutes: number, gameId?: string, score?: number) => void;
  setDarkMode: (enabled: boolean) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      uid: null,
      interests: [],
      stats: {
        totalMinutesSaved: 0,
        activitiesCompleted: 0,
        streakDays: 0,
        highScores: {},
      },
      preferences: {
        darkMode: false,
        blockDoomscrolling: false,
      },
      setInterests: (interests) => set({ interests }),
      updateStats: (minutes, gameId, score) =>
        set((state) => {
          const newHighScores = { ...state.stats.highScores };
          if (gameId && score !== undefined) {
            const currentHigh = newHighScores[gameId] || 0;
            if (score > currentHigh) {
              newHighScores[gameId] = score;
            }
          }

          return {
            stats: {
              ...state.stats,
              totalMinutesSaved: state.stats.totalMinutesSaved + minutes,
              activitiesCompleted: state.stats.activitiesCompleted + 1,
              highScores: newHighScores,
            },
          };
        }),
      setDarkMode: (enabled) =>
        set((state) => ({
          preferences: { ...state.preferences, darkMode: enabled },
        })),
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => localforage as any),
    }
  )
);
