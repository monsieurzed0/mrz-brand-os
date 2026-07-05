import type { AppState } from '@/types';
import { mockSeed } from '@/data/mockSeed';

const STORAGE_KEY = 'mrz-brand-os';

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as AppState;
    }
  } catch {
    // corrupted data
  }
  const state = structuredClone(mockSeed);
  saveState(state);
  return state;
}

export function saveState(state: AppState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function resetState(): AppState {
  const state = structuredClone(mockSeed);
  saveState(state);
  return state;
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}
