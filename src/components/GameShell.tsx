// src/components/GameShell.tsx
// Extracted from MRT2 (My Recovery Toolkit) for standalone development.
// Composes the session provider + header + footer around the game content.
import type { ReactNode } from 'react';
import { GameSessionProvider } from '../contexts/GameSessionContext';
import GameHeader from './GameHeader';
import GameFooter from './GameFooter';

interface GameShellProps {
  title: string;
  children: ReactNode;
}

export default function GameShell({ title, children }: GameShellProps) {
  return (
    <GameSessionProvider>
      <div className="flex flex-col gap-4 p-4 max-w-2xl mx-auto">
        <GameHeader title={title} />
        <div className="flex-1">{children}</div>
        <GameFooter />
      </div>
    </GameSessionProvider>
  );
}
