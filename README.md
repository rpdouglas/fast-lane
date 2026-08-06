# One Day at a Time (standalone)
*(working title, previously "Fast Lane" — see `docs/Design/fast-lane_master_design_document.md`)*

A multi-week economic life-sim with an AI rival ("Casey") — manage jobs and
promotions, courses, a wellbeing shop, housing tiers, and a loan/stock
subsystem while racing toward wealth, wellbeing, education, and career
goals. Extracted from [MRT2](../) (My Recovery Toolkit) for standalone
development, fully decoupled from that app's Firebase/Firestore backend and
zero-knowledge encryption layer.

## Running

```bash
npm install
npm run dev      # http://localhost:5173
npm run test     # vitest
npm run build    # type-check + production build
```

## What changed from the MRT2 version

This is a straight code extraction with the app-specific plumbing swapped
for standalone equivalents — the game logic (`src/lib/fastLane/`) and all UI
(`src/components/`) are otherwise unchanged:

- **`hooks/useGameSave.ts`** — was Firestore + AES-GCM client-side encryption
  (`game_saves` collection, per-user, requires auth). Now persists the save
  blob to `localStorage` under `fastlane_save_fast-lane`. Same call shape
  (`{ save, isLoading, saveGame, isSaving, clearSave }`), no encryption, no
  network, no account.
- **`hooks/useGameProgress.ts`** — was Firestore's encrypted `game_progress`
  collection (completed-play history, streak/XP integration). Now appends
  to a local `fastlane_progress_history` array in `localStorage`. No
  streak/XP system exists in this app.
- **`components/GameFooter.tsx`** — dropped the "Exit to hub" button
  (`react-router-dom` navigation to a games list that doesn't exist here).
  Pause/resume controls carried over unchanged.
- **`components/FastLane.tsx`** — dropped `react-router-dom`'s `useNavigate`
  and the win-screen's "Back to Games" button for the same reason.
- **`hooks/useShareImage.ts`**, **`contexts/GameSessionContext.tsx`**,
  **`components/GameHeader.tsx`**, **`components/PlayerStatus.tsx`**,
  **`components/LocationBoard.tsx`**, **`components/GameLog.tsx`**, and all
  of **`lib/fastLane/`** (`types.ts`, `gameData.ts`, `turnEngine.ts`) are
  carried over as-is — they had no MRT2-specific coupling to begin with.
