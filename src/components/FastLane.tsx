// src/components/FastLane.tsx
// TEMPORARY placeholder UI for "One Day at a Time" following the Phase 2
// logic-layer rewrite (see docs/scratch_pad and the master design doc).
// The real daily/weekly board UI is a later phase — this is just a manual
// smoke-test surface: pick a game length, see a freshly created
// FastLaneSaveState dumped as raw JSON.
import { useState } from 'react';
import GameShell from './GameShell';
import { createNewGameState } from '../lib/fastLane/turnEngine';
import type { FastLaneSaveState, GameConfig } from '../lib/fastLane/types';

const GAME_LENGTHS: GameConfig['totalDays'][] = [30, 60, 90];

function GameLengthPicker({ onSelect }: { onSelect: (totalDays: GameConfig['totalDays']) => void }) {
  return (
    <div className="flex flex-col gap-4 py-8 px-4 text-center">
      <h3 className="text-lg font-bold text-slate-800">How many days?</h3>
      <p className="text-sm text-slate-500 max-w-sm mx-auto">
        Recovery culture already orients around these milestones — 30 days, 60 days, or the full 90.
      </p>
      <div className="flex flex-col gap-3 mt-2">
        {GAME_LENGTHS.map((totalDays) => (
          <button
            key={totalDays}
            onClick={() => onSelect(totalDays)}
            className="text-left px-5 py-4 rounded-xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all active:scale-95"
          >
            <p className="font-bold text-slate-800">{totalDays} days</p>
          </button>
        ))}
      </div>
    </div>
  );
}

function FastLaneGame() {
  const [gameState, setGameState] = useState<FastLaneSaveState | null>(null);

  const handleSelectLength = (totalDays: GameConfig['totalDays']) => {
    setGameState(createNewGameState({ totalDays, priorities: [] }));
  };

  if (!gameState) {
    return <GameLengthPicker onSelect={handleSelectLength} />;
  }

  return (
    <div className="flex flex-col gap-4">
      <button
        onClick={() => setGameState(null)}
        className="self-start text-sm text-slate-400 hover:text-slate-600 font-semibold"
      >
        &larr; Start over
      </button>
      <pre className="text-xs bg-slate-900 text-slate-100 rounded-xl p-4 overflow-auto max-h-[70vh]">
        {JSON.stringify(gameState, null, 2)}
      </pre>
    </div>
  );
}

export default function FastLane() {
  return (
    <GameShell title="One Day at a Time">
      <FastLaneGame />
    </GameShell>
  );
}
