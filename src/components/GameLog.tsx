// src/components/GameLog.tsx
// Extracted from MRT2 (My Recovery Toolkit) for standalone development.
import { useRef, useEffect } from 'react';

interface GameLogProps {
  log: string[];
}

export default function GameLog({ log }: GameLogProps) {
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [log]);

  return (
    <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4">
      <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-3">Game Log</h3>
      <div className="flex flex-col gap-1.5 max-h-80 overflow-y-auto text-sm text-slate-600">
        {log.map((entry, index) => (
          <p key={index}>{entry}</p>
        ))}
        <div ref={logEndRef} />
      </div>
    </div>
  );
}
