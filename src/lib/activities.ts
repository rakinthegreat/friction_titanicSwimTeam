import { Laptop, History, Puzzle, Languages, FlaskConical, Brain, BookOpen, HelpCircle, Zap, Move, Grid3X3, Type, BrainCircuit, Blocks, Sparkles, Leaf, PlayCircle } from 'lucide-react';

export interface ActivityDefinition {
  id: string;
  title: string;
  description: string;
  type: 'game' | 'learn' | 'life';
  href: string;
  icon: any;
  color: string;
  minTime: number; // in minutes
  maxTime: number; // in minutes
  interests: string[];
  scalable?: boolean;
}

export const ACTIVITIES: ActivityDefinition[] = [
  // GAMES
  {
    id: 'tictactoe',
    title: 'Tic-Tac-Toe',
    description: 'Quick strategy rounds.',
    type: 'game',
    href: '/games/tic-tac-toe',
    icon: Blocks,
    color: 'text-accent-secondary',
    minTime: 5,
    maxTime: 5,
    interests: ['logic'],
    scalable: false
  },
  {
    id: 'rapid-math',
    title: 'Rapid Math',
    description: 'Quick arithmetic under pressure.',
    type: 'game',
    href: '/games/rapid-math',
    icon: Zap,
    color: 'text-accent',
    minTime: 5,
    maxTime: 10,
    interests: ['logic', 'tech', 'science'],
    scalable: true
  },
  {
    id: 'wordless',
    title: 'WordLess',
    description: 'Guess the hidden 5-letter word.',
    type: 'game',
    href: '/games/wordless',
    icon: Type,
    color: 'text-accent',
    minTime: 3,
    maxTime: 10,
    interests: ['languages', 'logic'],
    scalable: false
  },
  {
    id: 'memory-match',
    title: 'Memory Match',
    description: 'Test your recall.',
    type: 'game',
    href: '/games/memory-match',
    icon: BrainCircuit,
    color: 'text-accent',
    minTime: 3,
    maxTime: 15,
    interests: ['logic', 'tech', 'science'],
    scalable: true
  },
  {
    id: '2048',
    title: '2048',
    description: 'Slide and combine numbers.',
    type: 'game',
    href: '/games/2048',
    icon: Blocks,
    color: 'text-accent-secondary',
    minTime: 5,
    maxTime: 25,
    interests: ['logic', 'tech'],
    scalable: true
  },
  {
    id: 'sudoku',
    title: 'Sudoku',
    description: 'Classic number logic.',
    type: 'game',
    href: '/games/sudoku',
    icon: Grid3X3,
    color: 'text-accent',
    minTime: 5,
    maxTime: 25,
    interests: ['logic'],
    scalable: true
  },
  {
    id: 'crosswords',
    title: 'Crosswords',
    description: 'Daily vocab puzzle.',
    type: 'game',
    href: '/games/crosswords',
    icon: Languages,
    color: 'text-accent-secondary',
    minTime: 5,
    maxTime: 20,
    interests: ['languages', 'history'],
    scalable: false
  },
  {
    id: 'maze',
    title: 'Maze Solver',
    description: 'Navigate complex paths.',
    type: 'game',
    href: '/games/maze',
    icon: Move,
    color: 'text-accent-secondary',
    minTime: 3,
    maxTime: 15,
    interests: ['logic'],
    scalable: true
  },

  // LEARNING
  {
    id: 'english',
    title: 'Vocab & English',
    description: 'Learn new words.',
    type: 'learn',
    href: '/learn/english',
    icon: BookOpen,
    color: 'text-accent',
    minTime: 3,
    maxTime: 30,
    interests: ['languages'],
    scalable: true
  },
  {
    id: 'philosophy',
    title: 'Philosophical Ideas',
    description: 'Deep concepts & reflection.',
    type: 'learn',
    href: '/learn/philosophy',
    icon: Brain,
    color: 'text-accent-secondary',
    minTime: 5,
    maxTime: 30,
    interests: ['philosophy', 'history'],
    scalable: true
  },
  {
    id: 'science',
    title: 'Science Concepts',
    description: 'Bite-sized facts.',
    type: 'learn',
    href: '/learn/science',
    icon: FlaskConical,
    color: 'text-accent',
    minTime: 5,
    maxTime: 30,
    interests: ['science', 'tech'],
    scalable: true
  },
  {
    id: 'trivia',
    title: 'Quick Trivia',
    description: 'World & Local facts.',
    type: 'learn',
    href: '/learn/trivia',
    icon: HelpCircle,
    color: 'text-accent',
    minTime: 5,
    maxTime: 30,
    interests: ['history', 'tech', 'science', 'philosophy'],
  },
  // LIFE
  {
    id: 'meditation',
    title: 'Daily Meditation',
    description: 'Reflect on your day and find focus.',
    type: 'life',
    href: '/activities/meditation',
    icon: Leaf,
    color: 'text-accent-secondary',
    minTime: 5,
    maxTime: 20,
    interests: ['philosophy'],
    scalable: true
  },
  {
    id: 'challenges',
    title: 'Real-Life Challenges',
    description: 'Interact with the world around you.',
    type: 'life',
    href: '/activities/challenges',
    icon: Sparkles,
    color: 'text-accent',
    minTime: 5,
    maxTime: 30,
    interests: [],
    scalable: true
  }
];

/** Virtual activity id for the watch/recreation slot */
export const VIDEO_ACTIVITY_ID = '__video__';

/** A synthetic ActivityDefinition representing the video/watch option */
export const VIDEO_ACTIVITY: ActivityDefinition = {
  id: VIDEO_ACTIVITY_ID,
  title: 'Watch Something Interesting',
  description: 'Curated videos based on your interests.',
  type: 'learn', // use 'learn' so category cap applies correctly
  href: '/watch',
  icon: PlayCircle as any,
  color: 'text-accent',
  minTime: 3,
  maxTime: 30,
  interests: [], // will be matched separately
  scalable: true,
};

/** Fisher-Yates shuffle — proper unbiased randomization */
export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Category pool for the "Broaden Your Horizons" slot.
 * Mirrors the real learn/ and activities/ folders:
 *   learn/      → trivia | english | philosophy | science
 *   activities/ → meditation | challenges
 */
export const BROADEN_CATEGORY_IDS = ['trivia', 'english', 'philosophy', 'science', 'meditation', 'challenges'] as const;

/**
 * Builds hub suggestions:
 * - `picked`: up to 3 interest-matched items (original logic, unchanged)
 * - `nonInterest`: 1 item for "Broaden Your Horizons" — picked by shuffling
 *                 BROADEN_CATEGORY_IDS and taking the first eligible one
 *                 that wasn't already picked and doesn't match user interests
 */
export function buildSuggestions(
  mins: number,
  interests: string[],
  videoGenres: string[],
  dailyCompleted: string[]
): { picked: ActivityDefinition[]; nonInterest: ActivityDefinition | null } {
  const sortByCompletion = (pool: ActivityDefinition[]) =>
    [...pool].sort((a, b) => {
      const aDone = dailyCompleted.includes(a.id);
      const bDone = dailyCompleted.includes(b.id);
      if (aDone && !bDone) return 1;
      if (!aDone && bDone) return -1;
      return Math.random() - 0.5;
    });

  // Time-eligible activities
  const timeEligible = ACTIVITIES.filter(
    (a) => a.minTime <= mins && a.maxTime >= mins
  );

  // Interest-matched pool (any type) — also inject video if videoGenres are set
  const interestMatched = timeEligible.filter(
    (a) =>
      a.interests.some((i) => interests.includes(i)) ||
      interests.length === 0 ||
      a.type === 'life'
  );

  // Add the video option to the candidate pool (max 1 will be enforced below)
  const includeVideo = videoGenres && videoGenres.length > 0;
  const candidatePool = sortByCompletion(
    includeVideo ? [...interestMatched, VIDEO_ACTIVITY] : interestMatched
  );

  // Pick up to 3 from the pool with per-category caps:
  // - max 1 video ('__video__' type is treated as its own category)
  // - max 3 for game / learn / life
  const picked: ActivityDefinition[] = [];
  const categoryCount: Record<string, number> = {};
  for (const activity of candidatePool) {
    if (picked.length >= 3) break;
    const cat = activity.id === VIDEO_ACTIVITY_ID ? '__video__' : activity.type;
    const cap = cat === '__video__' ? 1 : 3;
    const count = categoryCount[cat] ?? 0;
    if (count >= cap) continue;
    picked.push(activity);
    categoryCount[cat] = count + 1;
  }

  // ── Broaden Your Horizons ────────────────────────────────────────────────────
  // Shuffle the full category list, then walk it and pick the first activity that:
  //   1. Wasn't already shown in the main 3
  //   2. Doesn't overlap with the user's interests (true "broaden" behaviour)
  const pickedIds = new Set(picked.map((a) => a.id));
  const shuffledBroaden = shuffle([...BROADEN_CATEGORY_IDS]);

  // Walk the shuffled category list — first one not already in the main 3 wins.
  // No interest filtering here: the point is variety across ALL categories,
  // not strict non-overlap (which caused challenges to always win because its
  // interests:[] never matched the filter).
  let nonInterest: ActivityDefinition | null = null;
  for (const catId of shuffledBroaden) {
    const candidate = ACTIVITIES.find((a) => a.id === catId) ?? null;
    if (!candidate) continue;
    if (pickedIds.has(candidate.id)) continue;
    nonInterest = candidate;
    break;
  }

  return { picked, nonInterest };
}
