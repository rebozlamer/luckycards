import { User } from '../types';

const STORAGE_KEY = 'luckycards_user_v1';

const DEFAULT_USER: User = {
  username: 'Guest' + Math.floor(1000 + Math.random() * 9000),
  wallet: 1000,
  settings: {
    soundEnabled: true,
    animationsEnabled: true,
    theme: 'dark',
  },
  stats: {
    totalWins: 0,
    totalRounds: 0,
    totalCoinsWon: 0,
    preferredMode: 'None',
  },
};

export const loadUser = (): User => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error("Failed to load user data", e);
  }
  // Initialize default if not found
  saveUser(DEFAULT_USER);
  return DEFAULT_USER;
};

export const saveUser = (user: User): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } catch (e) {
    console.error("Failed to save user data", e);
  }
};

export const resetUser = (): User => {
  const newUser = { ...DEFAULT_USER, username: 'Guest' + Math.floor(1000 + Math.random() * 9000) };
  saveUser(newUser);
  return newUser;
};
