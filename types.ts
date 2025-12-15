export interface UserSettings {
  soundEnabled: boolean;
  animationsEnabled: boolean;
  theme: 'dark' | 'light'; // Kept for structure, though UI is primarily dark
}

export interface UserStats {
  totalWins: number;
  totalRounds: number;
  totalCoinsWon: number;
  preferredMode: '2X' | '10X' | 'None';
}

export interface User {
  username: string;
  wallet: number;
  settings: UserSettings;
  stats: UserStats;
}

export type GameMode = 'HOME' | '2X' | '10X';

export interface GameState {
  phase: 'BETTING' | 'RESULT';
  timeLeft: number;
  roundId: number;
  winningCard: string | null;
  history: string[]; // Last few winners
}
