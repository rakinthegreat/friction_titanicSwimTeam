import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import localforage from 'localforage';

interface LearningSession {
  conceptName: string;
  conceptText: string;
  mcqs: Array<{
    question: string;
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
  }>;
  reflection: {
    question: string;
    answer: string;
    feedback: string;
  };
  timestamp: number;
}

interface UserState {
  uid: string | null;
  interests: string[];
  stats: {
    totalMinutesSaved: number;
    activitiesCompleted: number;
    streakDays: number;
    lastActivityDate: string | null;
    highScores: Record<string, number>;
  };
  preferences: {
    darkMode: boolean;
    blockDoomscrolling: boolean;
  };

  // Philosophy
  completedPhilosophyConcepts: string[];
  customPhilosophyConcepts: any[];
  philosophyReflections: LearningSession[];

  // Science
  completedScienceConcepts: string[];
  customScienceConcepts: any[];
  scienceReflections: LearningSession[];

  // English
  englishReviewWords: Record<string, number>;

  dailyCompletedActivities: string[];
  lastCompletedDate: string | null;

  setInterests: (interests: string[]) => void;
  updateStats: (minutes: number, gameId?: string, score?: number) => void;
  setDarkMode: (enabled: boolean) => void;

  // Philosophy Actions
  completePhilosophyConcept: (name: string) => void;
  addCustomPhilosophyConcepts: (concepts: any[]) => void;
  addPhilosophyReflection: (session: Omit<LearningSession, 'timestamp'>) => void;

  // Science Actions
  completeScienceConcept: (name: string) => void;
  addCustomScienceConcepts: (concepts: any[]) => void;
  addScienceReflection: (session: Omit<LearningSession, 'timestamp'>) => void;

  // English Actions
  addEnglishReviewWord: (word: string) => void;
  recordEnglishReviewSuccess: (word: string) => void;

  completeActivity: (id: string) => void;
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
        lastActivityDate: null,
        highScores: {},
      },
      preferences: {
        darkMode: false,
        blockDoomscrolling: false,
      },

      completedPhilosophyConcepts: [],
      customPhilosophyConcepts: [],
      philosophyReflections: [],

      completedScienceConcepts: [],
      customScienceConcepts: [],
      scienceReflections: [],

      // English
      englishReviewWords: {},

      dailyCompletedActivities: [],
      lastCompletedDate: null,

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

          // Streak logic
          const today = new Date().toISOString().split('T')[0];
          let newStreak = state.stats.streakDays;

          if (state.stats.lastActivityDate === null) {
            newStreak = 1;
          } else if (state.stats.lastActivityDate !== today) {
            const last = new Date(state.stats.lastActivityDate);
            const now = new Date(today);
            const diffTime = Math.abs(now.getTime() - last.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays === 1) {
              newStreak += 1;
            } else {
              newStreak = 1;
            }
          }

          return {
            stats: {
              ...state.stats,
              totalMinutesSaved: state.stats.totalMinutesSaved + minutes,
              activitiesCompleted: state.stats.activitiesCompleted + 1,
              streakDays: newStreak,
              lastActivityDate: today,
              highScores: newHighScores,
            },
          };
        }),
      setDarkMode: (enabled) =>
        set((state) => ({
          preferences: { ...state.preferences, darkMode: enabled },
        })),

      // Philosophy
      completePhilosophyConcept: (name) =>
        set((state) => ({
          completedPhilosophyConcepts: state.completedPhilosophyConcepts.includes(name)
            ? state.completedPhilosophyConcepts
            : [...state.completedPhilosophyConcepts, name],
        })),
      addCustomPhilosophyConcepts: (concepts) =>
        set((state) => ({
          customPhilosophyConcepts: [...state.customPhilosophyConcepts, ...concepts],
        })),
      addPhilosophyReflection: (session) =>
        set((state) => ({
          philosophyReflections: [
            { ...session, timestamp: Date.now() },
            ...state.philosophyReflections,
          ],
        })),

      // Science
      completeScienceConcept: (name) =>
        set((state) => ({
          completedScienceConcepts: state.completedScienceConcepts.includes(name)
            ? state.completedScienceConcepts
            : [...state.completedScienceConcepts, name],
        })),
      addCustomScienceConcepts: (concepts) =>
        set((state) => ({
          customScienceConcepts: [...state.customScienceConcepts, ...concepts],
        })),
      addScienceReflection: (session) =>
        set((state) => ({
          scienceReflections: [
            { ...session, timestamp: Date.now() },
            ...state.scienceReflections,
          ],
        })),

      // English
      addEnglishReviewWord: (word) =>
        set((state) => {
          if (state.englishReviewWords[word] !== undefined) return state;
          return {
            englishReviewWords: { ...state.englishReviewWords, [word]: 0 },
          };
        }),
      recordEnglishReviewSuccess: (word) =>
        set((state) => {
          const currentCount = state.englishReviewWords[word];
          if (currentCount === undefined) return state;
          
          if (currentCount >= 1) {
            // Reached 2 successes, remove the word
            const newReviewWords = { ...state.englishReviewWords };
            delete newReviewWords[word];
            return { englishReviewWords: newReviewWords };
          }
          
          // Otherwise increment
          return {
            englishReviewWords: {
              ...state.englishReviewWords,
              [word]: currentCount + 1,
            },
          };
        }),

      completeActivity: (id) =>
        set((state) => {
          const today = new Date().toISOString().split('T')[0];
          const isNewDay = state.lastCompletedDate !== today;
          const currentList = isNewDay ? [] : state.dailyCompletedActivities;
          
          if (currentList.includes(id)) return state;
          
          return {
            dailyCompletedActivities: [...currentList, id],
            lastCompletedDate: today,
          };
        }),
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => localforage as any),
    }
  )
);
