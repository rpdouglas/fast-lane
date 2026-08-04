// src/hooks/useGameProgress.ts
// Standalone replacement for MRT2's Firestore + zero-knowledge-encryption
// backed useGameProgress — records completed-play history to localStorage
// instead of the encrypted `game_progress` collection. No streak/XP system
// in this app, so this is just a simple append-only local log.
import { useCallback } from 'react';

export interface RecordGameProgressParams {
  gameId: string;
  personaTarget: string;
  score: number;
  stats: Record<string, unknown>;
  reflection?: string;
}

const STORAGE_KEY = 'fastlane_progress_history';

export function useGameProgress() {
  const recordProgress = useCallback(async (params: RecordGameProgressParams) => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const history = raw ? (JSON.parse(raw) as RecordGameProgressParams[]) : [];
      history.push({ ...params, stats: params.stats });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch {
      /* best-effort */
    }
  }, []);

  return { recordProgress };
}
