// src/components/GameHeader.tsx
// Extracted from MRT2 (My Recovery Toolkit) for standalone development.
// Shows the game title and the current in-session score.
import { TrophyIcon } from '@heroicons/react/24/outline';
import { useGameSession } from '../contexts/GameSessionContext';

interface GameHeaderProps {
  title: string;
}

export default function GameHeader({ title }: GameHeaderProps) {
  const { score, phase } = useGameSession();

  return (
    <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-md">
      <h2 className="text-lg font-bold">{title}</h2>
      <div className="flex items-center gap-2">
        {phase !== 'idle' && (
          <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
            <TrophyIcon className="h-4 w-4" />
            <span className="text-sm font-bold">{score}</span>
          </div>
        )}
      </div>
    </div>
  );
}
