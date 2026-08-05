# Fast Lane

Standalone economic life-sim extracted from MRT2. React 19 + TypeScript + Vite, Tailwind,
Vitest. No backend — game state persists to `localStorage` only (see README for what was
stripped out during extraction).

## Commands
- `npm run dev` — dev server (localhost:5173)
- `npm run build` — typecheck (`tsc -b`) + production build; a failing build is a hard stop
- `npm run lint` — ESLint, zero warnings allowed (`--max-warnings 0`)
- `npm run test` / `npm run test:once` — Vitest (watch / single run)

## Stack rules
- React 19 function components + hooks only, no class components
- Game logic lives in `src/lib/fastLane/` (types, gameData, turnEngine) and must stay
  UI-framework-agnostic — no React imports there
- UI lives in `src/components/`; keep it thin, push logic into `lib/fastLane` or hooks
- Persistence goes through `hooks/useGameSave.ts` / `useGameProgress.ts` only — never touch
  `localStorage` directly from components

## Directory map
- `src/lib/fastLane/` — pure game logic + types (turn engine, game data)
- `src/components/` — presentational + container components
- `src/hooks/` — save/progress/share-image hooks
- `src/contexts/` — GameSessionContext
- `docs/Design/` — durable design references (e.g. `fastlane_personas.md`)
- `docs/governance/` — this project's governance process doc
- `docs/scratch_pad/` — ephemeral planning docs, gap analyses, migration plans; promote
  anything meant to be durable out to a named location when it's done (see
  `docs/governance/GOVERNANCE.md`)

## The one non-negotiable boundary
Never reintroduce Firebase/Firestore, encryption, or `react-router-dom` navigation into this
repo — that coupling was deliberately removed during extraction from MRT2 (README §"What
changed"). If a feature seems to need routing or a backend, that's a signal it belongs back
in MRT2, not here.

## Workflow
- **Spec gate (light):** non-trivial work gets a written plan before implementation
  starts — Plan Mode (`Shift+Tab`) reviewed live, or a dated doc in `docs/scratch_pad/`
  for anything worth a durable record. This is fast-lane's scaled-down version of a
  hard spec-gate; see `docs/governance/GOVERNANCE.md` for the reasoning.
- Prefer the `explorer` subagent for read-only research over doing it in the main context.
- Prefer the `implementer` subagent for isolated, scoped implementation work.
- Run the `/review` skill (or the `reviewer` subagent) before calling a feature or phase done.
- Use separate git worktrees only for genuinely independent work — e.g. a content/copy
  pass alongside a refactor, or two unrelated bugfixes. The Phaser/Zustand board migration
  (`docs/scratch_pad/2026-08-05-fast-lane-phaser-zustand-migration-plan.md`) is *not* an
  example of this: its 6 phases are strictly sequential (each phase's UI work calls actions
  the previous phase built into the Zustand store), so work it phase-by-phase in one
  session/worktree, not split across parallel ones.

## Before you push
There's no CI and no PR gate — pushes go straight to `main`. That makes these checks
manual and non-negotiable before every push, not automated safety nets:
- `npm run build` (typecheck + production build) and `npm run lint` must both pass clean.
- `npm run test:once` must pass.
