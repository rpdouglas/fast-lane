// src/hooks/useGameSave.ts
// Standalone replacement for MRT2's Firestore + zero-knowledge-encryption
// backed useGameSave — same call shape ({ save, isLoading, saveGame,
// isSaving, clearSave }), but persists to localStorage instead of an
// encrypted Firestore doc. No account/auth concept in this app.
import { useState, useCallback } from 'react';

export interface SaveGameParams {
  gameId: string;
  state: Record<string, unknown>;
}

function storageKey(gameId: string): string {
  return `fastlane_save_${gameId}`;
}

function readSave(gameId: string): Record<string, unknown> | null {
  try {
    const raw = localStorage.getItem(storageKey(gameId));
    return raw ? (JSON.parse(raw) as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

export function useGameSave(gameId: string) {
  const [save, setSave] = useState<Record<string, unknown> | null>(() => readSave(gameId));
  const [isSaving, setIsSaving] = useState(false);

  const saveGame = useCallback(async (params: SaveGameParams) => {
    setIsSaving(true);
    try {
      localStorage.setItem(storageKey(params.gameId), JSON.stringify(params.state));
      setSave(params.state);
    } finally {
      setIsSaving(false);
    }
  }, []);

  const clearSave = useCallback(async () => {
    localStorage.removeItem(storageKey(gameId));
    setSave(null);
  }, [gameId]);

  return { save, isLoading: false, saveGame, isSaving, clearSave };
}
