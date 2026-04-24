import { Laptop, History, Puzzle, Languages, FlaskConical, Brain, BookOpen, HelpCircle, Zap, Move, Grid3X3, Type, BrainCircuit, Blocks, Sparkles, Leaf } from 'lucide-react';

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
    maxTime: 15,
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
    maxTime: 25,
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
    maxTime: 10,
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
