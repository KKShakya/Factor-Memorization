export type GameMode = 'tables' | 'famous' | 'challenge';

export interface HistoryEntry {
  id: string;
  target: number;
  factor1: number | null;
  factor2: number | null;
  isCorrect: boolean;
  timestamp: number;
  timeTaken: number; // in seconds
  mode: GameMode;
}

export interface GameStats {
  totalPlayed: number;
  totalCorrect: number;
  currentStreak: number;
  maxStreak: number;
  bestChallengeScore: number;
}

export interface FactorPair {
  f1: number;
  f2: number;
}

export interface FamousNumberFact {
  number: number;
  description: string;
  factorPairs: FactorPair[];
}
