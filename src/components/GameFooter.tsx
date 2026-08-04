// src/components/GameFooter.tsx
// Adapted from MRT2 (My Recovery Toolkit) for standalone development.
// The original had an "Exit to hub" button (react-router-dom navigate to
// a games list) — dropped here since this app has no hub to exit to.
// Pause/resume session controls carried over unchanged.
import { PauseIcon, PlayIcon } from '@heroicons/react/24/outline';
import { useGameSession } from '../contexts/GameSessionContext';

export default function GameFooter() {
  const { phase, pauseSession, resumeSession } = useGameSession();

  if (phase !== 'playing' && phase !== 'paused') return null;

  return (
    <div className="flex items-center justify-end px-4 py-3 rounded-xl bg-slate-100 border border-slate-200">
      {phase === 'playing' && (
        <button
          onClick={pauseSession}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-200 transition-colors active:scale-95"
          aria-label="Pause"
        >
          <PauseIcon className="h-5 w-5" />
          <span className="text-sm font-semibold">Pause</span>
        </button>
      )}

      {phase === 'paused' && (
        <button
          onClick={resumeSession}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-indigo-600 hover:bg-indigo-50 transition-colors active:scale-95"
          aria-label="Resume"
        >
          <PlayIcon className="h-5 w-5" />
          <span className="text-sm font-semibold">Resume</span>
        </button>
      )}
    </div>
  );
}
