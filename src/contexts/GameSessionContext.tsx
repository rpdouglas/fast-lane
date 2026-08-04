/**
 * src/contexts/GameSessionContext.tsx
 * Extracted from MRT2 (My Recovery Toolkit) for standalone development.
 *
 * Ephemeral, in-session-only state for the game currently being played
 * (phase/score) — deliberately not persisted here; see hooks/useGameSave.ts
 * for the resumable save layer.
 */
import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

export type GameSessionPhase = 'idle' | 'playing' | 'paused' | 'complete';

interface GameSessionContextType {
  activeGameId: string | null;
  phase: GameSessionPhase;
  score: number;
  startSession: (gameId: string) => void;
  pauseSession: () => void;
  resumeSession: () => void;
  completeSession: (finalScore: number) => void;
  resetSession: () => void;
  setScore: (score: number) => void;
}

const GameSessionContext = createContext<GameSessionContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export function useGameSession() {
  const context = useContext(GameSessionContext);
  if (context === undefined) {
    throw new Error('useGameSession must be used within a GameSessionProvider');
  }
  return context;
}

export function GameSessionProvider({ children }: { children: ReactNode }) {
  const [activeGameId, setActiveGameId] = useState<string | null>(null);
  const [phase, setPhase] = useState<GameSessionPhase>('idle');
  const [score, setScore] = useState(0);

  const startSession = useCallback((gameId: string) => {
    setActiveGameId(gameId);
    setPhase('playing');
    setScore(0);
  }, []);

  const pauseSession = useCallback(() => setPhase('paused'), []);
  const resumeSession = useCallback(() => setPhase('playing'), []);

  const completeSession = useCallback((finalScore: number) => {
    setScore(finalScore);
    setPhase('complete');
  }, []);

  const resetSession = useCallback(() => {
    setActiveGameId(null);
    setPhase('idle');
    setScore(0);
  }, []);

  const value = {
    activeGameId,
    phase,
    score,
    startSession,
    pauseSession,
    resumeSession,
    completeSession,
    resetSession,
    setScore,
  };

  return (
    <GameSessionContext.Provider value={value}>
      {children}
    </GameSessionContext.Provider>
  );
}
