/**
 * src/components/__tests__/FastLane.test.tsx
 * Extracted from MRT2 (My Recovery Toolkit) for standalone development.
 *
 * `resolveWeekEnd`/`runRivalTurn` are stubbed to force an immediate win on
 * the first "End Week" click — the real week-by-week economic math already
 * has its own dedicated coverage in turnEngine.test.ts. Everything else in
 * turnEngine (createNewGameState, applyWork, etc.) stays real so the
 * component drives an actual, type-correct FastLaneSaveState.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import FastLane from '../FastLane';
import { DIFFICULTY_LEVELS } from '../../lib/fastLane/gameData';
import type { FastLaneWeekResult, FastLaneRivalTurnResult } from '../../lib/fastLane/types';

const mockRecordProgress = vi.fn().mockResolvedValue(undefined);
vi.mock('../../hooks/useGameProgress', () => ({
  useGameProgress: () => ({ recordProgress: mockRecordProgress }),
}));

const mockSaveGame = vi.fn().mockResolvedValue(undefined);
const mockClearSave = vi.fn().mockResolvedValue(undefined);
vi.mock('../../hooks/useGameSave', () => ({
  useGameSave: () => ({ save: null, isLoading: false, saveGame: mockSaveGame, clearSave: mockClearSave, isSaving: false }),
}));

vi.mock('../../hooks/useShareImage', () => ({
  useShareImage: () => ({ shareImage: vi.fn(), isSharing: false }),
}));

vi.mock('../../lib/fastLane/turnEngine', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../lib/fastLane/turnEngine')>();
  return {
    ...actual,
    resolveWeekEnd: vi.fn((player): FastLaneWeekResult => ({
      updatedPlayer: { ...player, week: player.week + 1 },
      logMessages: ['Forced win for test.'],
      playerWon: true,
    })),
    runRivalTurn: vi.fn((rival): FastLaneRivalTurnResult => ({
      updatedRival: rival,
      logMessages: [],
      rivalWon: false,
    })),
  };
});

describe('🎮 FastLane', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows the Difficulty Selector before a save exists', () => {
    render(<FastLane />);
    expect(screen.getByText('Choose a Starting Point')).toBeInTheDocument();
    expect(screen.getByText(DIFFICULTY_LEVELS.EASY.name)).toBeInTheDocument();
  });

  it('autosaves via saveGame on choosing a difficulty', () => {
    render(<FastLane />);
    fireEvent.click(screen.getByText(DIFFICULTY_LEVELS.EASY.name));

    expect(mockSaveGame).toHaveBeenCalledWith(
      expect.objectContaining({ gameId: 'fast-lane', state: expect.objectContaining({ difficulty: 'EASY' }) }),
    );
  });

  it('calls recordProgress and clearSave on reaching the win condition', () => {
    render(<FastLane />);
    fireEvent.click(screen.getByText(DIFFICULTY_LEVELS.EASY.name));
    fireEvent.click(screen.getByText('Weekly Planner'));
    fireEvent.click(screen.getAllByText('End Week')[0]);

    expect(mockRecordProgress).toHaveBeenCalledWith(
      expect.objectContaining({ gameId: 'fast-lane', personaTarget: 'Walt' }),
    );
    expect(mockClearSave).toHaveBeenCalled();
    expect(screen.getByText('You reached your goals.')).toBeInTheDocument();
  });
});
