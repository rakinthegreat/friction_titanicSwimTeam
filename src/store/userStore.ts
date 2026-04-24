import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import localforage from 'localforage';
import { db } from '@/lib/firebase';
import { doc, setDoc, writeBatch, collection, getDoc, getDocs } from 'firebase/firestore';

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
  videoGenres: string[];
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

  // Meditation
  meditationLogs: Array<{
    prompt: string;
    reflection: string;
    timestamp: number;
  }>;

  dailyCompletedActivities: string[];
  lastCompletedDate: string | null;
  lastBackupDate: string | null;
  realLifeChallenges: Array<{
    id: string;
    challenge: string;
    context: {
      location: string;
      posture: string;
      vibe: string;
      energy: string;
    };
    estimatedTime: number; // in seconds
    experience?: string;
    timestamp: number;
    status: 'pending' | 'completed';
  }>;

  setInterests: (interests: string[]) => void;
  setVideoGenres: (genres: string[]) => void;
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

  // Meditation Actions
  addMeditationLog: (log: { prompt: string; reflection: string }) => void;

  // Challenge Actions
  addRealLifeChallenge: (challenge: { challenge: string; context: {
    location: string;
    posture: string;
    vibe: string;
    energy: string;
  }; estimatedTime: number }) => string;
  completeRealLifeChallenge: (id: string, experience?: string) => void;

  completeActivity: (id: string) => void;
  syncWithFirebase: () => Promise<void>;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      uid: null,
      interests: [],
      videoGenres: [],
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

      // Meditation
      meditationLogs: [],

      dailyCompletedActivities: [],
      lastCompletedDate: null,
      lastBackupDate: null,
      realLifeChallenges: [],

      setInterests: (interests) => set({ interests }),
      setVideoGenres: (genres) => set({ videoGenres: genres }),
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

      // Meditation
      addMeditationLog: (log) =>
        set((state) => ({
          meditationLogs: [
            { ...log, timestamp: Date.now() },
            ...state.meditationLogs,
          ],
        })),

      // Challenge Actions
      addRealLifeChallenge: (challenge) => {
        const id = Math.random().toString(36).substring(7);
        set((state) => ({
          realLifeChallenges: [
            { ...challenge, id, timestamp: Date.now(), status: 'pending' },
            ...state.realLifeChallenges,
          ],
        }));
        return id;
      },
      completeRealLifeChallenge: (id, experience) =>
        set((state) => ({
          realLifeChallenges: state.realLifeChallenges.map((c) =>
            c.id === id ? { ...c, status: 'completed', experience } : c
          ),
        })),

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
      
      syncWithFirebase: async () => {
        const state = useUserStore.getState();
        if (!state.uid) throw new Error("User not authenticated");

        // 1. PULL: Fetch existing data from Firestore
        const userDocRef = doc(db, 'users', state.uid);
        const [userDocSnap, philSnap, sciSnap] = await Promise.all([
          getDoc(userDocRef),
          getDocs(collection(userDocRef, 'philosophy_reflections')),
          getDocs(collection(userDocRef, 'science_reflections'))
        ]);

        const remoteData = userDocSnap.exists() ? userDocSnap.data() : {};
        const remotePhil = philSnap.docs.map(d => d.data() as LearningSession);
        const remoteSci = sciSnap.docs.map(d => d.data() as LearningSession);

        // 2. MERGE: Intelligent merging logic
        
        // Interests: Union of both sets
        const mergedInterests = Array.from(new Set([...state.interests, ...(remoteData.interests || [])]));

        // Stats: Max of both values
        const mergedStats = {
          totalMinutesSaved: Math.max(state.stats.totalMinutesSaved, remoteData.stats?.totalMinutesSaved || 0),
          activitiesCompleted: Math.max(state.stats.activitiesCompleted, remoteData.stats?.activitiesCompleted || 0),
          streakDays: Math.max(state.stats.streakDays, remoteData.stats?.streakDays || 0),
          lastActivityDate: (state.stats.lastActivityDate || '') > (remoteData.stats?.lastActivityDate || '') 
            ? state.stats.lastActivityDate 
            : (remoteData.stats?.lastActivityDate || null),
          highScores: { ...(remoteData.stats?.highScores || {}), ...state.stats.highScores }
        };

        // Helper for timestamp-based merging (Reflections & Meditation)
        const mergeByTimestamp = (local: any[], remote: any[]) => {
          const map = new Map<number, any>();
          remote.forEach(item => map.set(item.timestamp, item));
          local.forEach(item => map.set(item.timestamp, item));
          return Array.from(map.values()).sort((a, b) => b.timestamp - a.timestamp);
        };

        const mergedPhil = mergeByTimestamp(state.philosophyReflections, remotePhil);
        const mergedSci = mergeByTimestamp(state.scienceReflections, remoteSci);
        const mergedMeditation = mergeByTimestamp(state.meditationLogs, remoteData.meditationLogs || []);

        // Concepts Merge
        const mergedCompletedPhil = Array.from(new Set([...state.completedPhilosophyConcepts, ...(remoteData.completedPhilosophyConcepts || [])]));
        const mergedCompletedSci = Array.from(new Set([...state.completedScienceConcepts, ...(remoteData.completedScienceConcepts || [])]));
        
        const mergeCustom = (local: any[], remote: any[]) => {
          const map = new Map<string, any>();
          remote.forEach(c => map.set(c.name || c.title, c));
          local.forEach(c => map.set(c.name || c.title, c));
          return Array.from(map.values());
        };

        const mergedCustomPhil = mergeCustom(state.customPhilosophyConcepts, remoteData.customPhilosophyConcepts || []);
        const mergedCustomSci = mergeCustom(state.customScienceConcepts, remoteData.customScienceConcepts || []);

        // 3. UPDATE LOCAL STORE
        const now = new Date().toISOString();
        set({
          interests: mergedInterests,
          stats: mergedStats,
          philosophyReflections: mergedPhil,
          scienceReflections: mergedSci,
          meditationLogs: mergedMeditation,
          completedPhilosophyConcepts: mergedCompletedPhil,
          completedScienceConcepts: mergedCompletedSci,
          customPhilosophyConcepts: mergedCustomPhil,
          customScienceConcepts: mergedCustomSci,
          realLifeChallenges: mergeByTimestamp(state.realLifeChallenges, remoteData.realLifeChallenges || []),
          lastBackupDate: now
        });

        // 4. PUSH: Save merged state back to Firestore
        const batch = writeBatch(db);
        
        const profileToPush = {
          interests: mergedInterests,
          stats: mergedStats,
          preferences: state.preferences,
          completedPhilosophyConcepts: mergedCompletedPhil,
          completedScienceConcepts: mergedCompletedSci,
          customPhilosophyConcepts: mergedCustomPhil,
          customScienceConcepts: mergedCustomSci,
          meditationLogs: mergedMeditation,
          realLifeChallenges: mergeByTimestamp(state.realLifeChallenges, remoteData.realLifeChallenges || []),
          englishReviewWords: { ...(remoteData.englishReviewWords || {}), ...state.englishReviewWords },
          dailyCompletedActivities: state.dailyCompletedActivities,
          lastCompletedDate: state.lastCompletedDate,
          lastBackupDate: now,
        };

        batch.set(userDocRef, profileToPush, { merge: true });

        // Push merged logs
        mergedPhil.forEach(session => {
          const refDoc = doc(collection(userDocRef, 'philosophy_reflections'), session.timestamp.toString());
          batch.set(refDoc, session, { merge: true });
        });

        mergedSci.forEach(session => {
          const refDoc = doc(collection(userDocRef, 'science_reflections'), session.timestamp.toString());
          batch.set(refDoc, session, { merge: true });
        });

        await batch.commit();
      },
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => localforage as any),
    }
  )
);
