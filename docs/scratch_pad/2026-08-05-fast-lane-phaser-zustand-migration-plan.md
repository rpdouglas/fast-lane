# Fast Lane: Zustand + Phaser Board Migration

## Context

Fast Lane currently plays through a tab-based UI: a "Weekly Planner" tab shows a grid of
location buttons (Work, School, Shopping, Living Situation, Financials, Risky Area,
Self-Care), a "Status" tab shows head-to-head stat bars against the AI rival ("Casey"),
and a "Game Log" tab shows a scrolling text log. The user proposed moving to a visual,
top-down board where a player token walks between clickable location nodes, with each
location opening a React activity modal — using Phaser for the map/token rendering and
Zustand as the state layer bridging Phaser and React, while the existing pure game-logic
layer (`src/lib/fastLane/`) stays untouched and is simply called from new call sites.

The original proposal was written in a different game's vocabulary (Recovery
Capital/Relationships/Health/Stability stats; Meeting/Sponsor/Service/Self-Care
activities) that doesn't match Fast Lane's actual domain (wealth/wellbeing/education/
career; Work/University/Shop/Apartment/Financials/Risky/Self-Care). This plan re-maps
the same architecture onto Fast Lane's real domain, confirmed against the actual
codebase (verified via direct file reads and an Explore pass — see "Verified current
state" below), and locks in scope decisions the user made explicitly:

1. **UI consolidation**: drop Game Log as a primary tab — move it behind a settings
   menu. Merge "Status" and "Weekly Planner" into one unified board+HUD screen.
2. **Placeholder art**: Phaser `Graphics` primitives (colored circles/rects) for nodes
   and the token — no sprite/tileset dependency, real art swapped in later.
3. **Migration strategy**: incremental and always-shippable. Zustand lands first with
   the UI visually unchanged; the board is added alongside the old tabs; cutover to the
   unified screen happens only once the board has full parity; old tab UI is removed
   last. Every phase must pass lint/typecheck/test/build on its own.
4. **Plan depth**: full 6-phase plan (mirroring the user's build order), with phases
   1–3 forming a concretely-shippable first milestone (real store, real board, one real
   working node, with walk animation — not a toy demo).

Execution proceeds phase by phase; each phase ends with an automated verification pass
(lint/typecheck/test/build) plus a manual dev-server check, and is a natural pause point
before continuing to the next phase.

## Verified current state (ground truth for this plan)

- **`src/lib/fastLane/`** — pure, framework-agnostic, well-tested game logic. `types.ts`
  (domain types), `gameData.ts` (static tables: `JOB_DATA`, `UNIVERSITY_COURSES`,
  `SHOP_ITEMS`, `APARTMENT_TIERS`, `DIFFICULTY_LEVELS`), `turnEngine.ts`
  (`createNewGameState`, `resolveWeekEnd`, `runRivalTurn`, `checkWinCondition`,
  `calculateStressLevel`, and 13 `apply*` action reducers). **Not modified by this
  plan** — new UI code calls these same exports.
- **`src/components/FastLane.tsx`** — orchestrator. Owns `useState<FastLaneSaveState |
  null>`, `activeTab`, `outcome`, `confirmingReset`. A `persist(next)` closure does
  `setLocalState` → `setScore` (via `GameSessionContext`, ephemeral/not persisted) →
  `saveGame` (via `useGameSave`, fire-and-forget localStorage write). `LocationBoard`
  never imports game logic — it's presentational, dispatching through handler props
  wired in `FastLane.tsx`.
- **`src/components/LocationBoard.tsx`** — the grid being replaced. 7 locations (`work`,
  `university`, `shop`, `apartment`, `financials`, `risky`, `selfCare`), each a button
  list wired to a handler prop. Crisis mode (`player.inCrisis`) replaces the whole grid
  with a Rest-only + End Turn panel. End Turn is a persistent button outside the grid.
- **`src/components/PlayerStatus.tsx`**, **`GameLog.tsx`**, **`GameShell.tsx`** — status
  bars, scrolling log, and the outer shell. `GameShell.tsx` wraps content in
  `max-w-2xl mx-auto` — **hard-caps board width, needs a full-bleed variant**.
- **`GameSessionContext.tsx`** (ephemeral phase/score) and **`useGameSave.ts`** (thin
  localStorage I/O) are independent of how the caller stores its own game-state copy —
  confirmed neither needs to be absorbed into Zustand.
- **No Phaser/Zustand/canvas dependency anywhere**, **no art assets anywhere** (no
  `src/assets`, no `public/`). Config (`vite.config.ts`, `tsconfig.app.json`,
  `eslint.config.js`) needs no changes for Phaser — browser globals, DOM libs, and
  bundler module resolution already cover it.
- Baseline is fully green: 0 lint warnings, 22/22 tests passing, clean `tsc`, working
  prod build. Every phase below must preserve this.
- Existing test pattern to reuse: `FastLane.test.tsx` mocks `turnEngine`'s
  `resolveWeekEnd`/`runRivalTurn` via `vi.mock(..., importOriginal)` to force a win, and
  mocks `useGameSave`/`useGameProgress`/`useShareImage`. New Phaser-touching components
  get the same treatment — mock `PhaserGameContainer`/`PhaserGame` in tests rather than
  mounting a real canvas under jsdom.

## Architecture decisions

- **Phaser `^3.90.0`** (not the new 4.x line) — mature docs, API shape matches the
  scene/graphics/tween plan directly; revisit 4.x later as an isolated upgrade.
- **Zustand `^5.0.14`** — current major, React 19-compatible peer range.
- **Store/hook boundary**: `fastLaneStore.ts` never imports `useGameSave`,
  `useGameProgress`, `useShareImage`, or `GameSessionContext`. Store actions are plain
  synchronous functions that return the new value they produced; `FastLane.tsx` (the
  only place wired to those hooks) calls the store action and then does the I/O itself
  with the returned value — a direct extension of today's `persist()` pattern.
- **Phaser ↔ React boundary**: `src/game/` never imports React, Zustand, or
  `src/lib/fastLane` — it only knows a `LocationId` string union and emits a scene event
  on node arrival. `PhaserGameContainer.tsx` is the sole bridge.
- **Crisis lock**: End Turn stays a persistent HUD button (React, not a node). Rest
  stays reachable only through the Self-Care node; during `inCrisis` the other 6 nodes
  render disabled, and `SelfCareActivity.tsx` hides "Attend a support meeting," leaving
  only Rest — mirroring today's dedicated crisis panel. The store's existing
  crisis-guard on player actions remains the backstop even if a disabled node were
  somehow triggered.
- **Shell width**: add `fullBleed?: boolean` to `GameShell.tsx` rather than a parallel
  shell component (single consumer today, no blast radius).
- **Settings/Game Log**: new `SettingsMenu.tsx` mounted in the board screen (gear icon),
  reusing `GameLog.tsx` unmodified plus the relocated "Start a new game" control.

## Phase 1 — Zustand becomes the state owner (UI unchanged)

Move `FastLaneSaveState`/`activeTab`/`outcome`/`confirmingReset` out of
`FastLane.tsx`'s `useState` calls into a new Zustand store. No visible or behavioral
change — same 3 tabs, same buttons.

- **New**: `src/state/fastLaneStore.ts` — state (`gameState`, `activeTab`, `outcome`,
  `confirmingReset`) + actions `hydrate`, `setActiveTab`, `startNewGame`,
  `runPlayerAction` (port of today's `runPlayerUpdate` crisis-guard), `endTurn` (port of
  `handleEndTurn`'s body, returns `{ next, playerWon }`), `requestStartOver` (port of
  the two-call confirm flow).
- **New**: `src/state/__tests__/fastLaneStore.test.ts` — covers the crisis-guard no-op,
  action application, `endTurn`'s win detection (mocking `turnEngine` the same way
  `FastLane.test.tsx` does), and the two-step reset confirmation.
- **Touched**: `src/components/FastLane.tsx` — drop the four `useState` calls, wire up
  `useFastLaneStore`, rewire `handleSelectDifficulty`/`runPlayerUpdate`/
  `handleEndTurn`/`handleStartOver` to call store actions and then perform
  `setScore`/`saveGame`/`clearSave` with the returned value (same I/O calls as today,
  same call sites). Initial hydrate-from-save becomes a mount effect.
- **Touched**: `package.json` — add `zustand`.
- `FastLane.test.tsx` needs no changes — it asserts on rendered behavior, not on
  `useState` internals, so it's the regression check for this phase as-is.

**Verify**: lint/build/test all green; manually confirm the app is pixel-identical to
before (tabs, buttons, autosave, reload, win screen, reset all behave unchanged).

## Phase 2 — Phaser scaffold + one real node

A new "Board (Preview)" 4th tab renders a Phaser canvas with 7 static location circles
and a token. Only the **Work** node is interactive and calls `applyWork` through the
store for real; the other 6 show a disabled "coming soon" state. Old tabs untouched.

- **New**: `src/game/config/phaserConfig.ts` (game config factory), `src/game/entities/
  LocationNode.ts` (Graphics circle + label, interactive/disabled states, emits
  `nodeClicked`), `src/game/entities/PlayerToken.ts` (Graphics circle, `jumpTo` for
  now), `src/game/scenes/PreloadScene.ts` (trivial — no assets to load, exists for
  correct boot shape), `src/game/scenes/BoardScene.ts` (lays out 7 nodes, listens for
  clicks, moves the token, invokes an `onLocationArrived` callback), `src/game/
  PhaserGame.ts` (the only file that calls `new Phaser.Game(...)`; kept a plain module,
  not a component, so `eslint-plugin-react-refresh`'s component-only-exports rule
  doesn't apply to it).
- **New**: `src/components/PhaserGameContainer.tsx` — React↔Phaser bridge, mounts/
  destroys the game in a `useEffect` (StrictMode-safe double-invoke guard), props
  `locations: LocationId[]` and `onLocationArrived: (id: LocationId) => void`.
- **New**: `src/components/__tests__/PhaserGameContainer.test.tsx` — mocks
  `../../game/PhaserGame`, asserts mount/unmount lifecycle and prop forwarding.
- **Touched**: `FastLane.tsx` — add a 4th tab rendering `PhaserGameContainer` with
  `locations={['work']}` wired to `runPlayerAction(applyWork)` on arrival.
- **Touched**: `package.json` — add `phaser`.
- No config changes expected; if Vite's dev-server first-run pre-bundling of Phaser is
  slow, the fix is `optimizeDeps.include: ['phaser']` in `vite.config.ts` — apply only
  if actually observed, not speculatively.

**Verify**: lint/build/test green (incl. new container test); manually click the Work
node — token jumps, Status tab's money/time reflect a real `applyWork` call.

## Phase 3 — Walk tween + directional animation

Same functional surface as Phase 2, but the token tweens between nodes instead of
teleporting, with a lightweight directional cue (squash/stretch or a facing "nose" via
`Graphics` — no sprites). **This completes the phases 1–3 milestone.**

- **Touched**: `PlayerToken.ts` — `walkTo(x, y, onComplete)` via `scene.tweens.add`.
- **Touched**: `BoardScene.ts` — arrival callback fires after the tween completes
  (matters for Phase 4: modals should open on arrival, not on click).
- No new files/tests — Phaser visuals aren't unit-testable under jsdom; verified
  manually.

**Verify**: lint/build/test green; manually confirm the glide and that `applyWork`
fires once, after the glide finishes.

## Phase 4 — Full parity: all 7 locations + HUD + crisis lock

Board (Preview) becomes functionally equivalent to Weekly Planner + Status combined.
Still additive — old tabs remain primary until Phase 5.

Location → node → modal mapping (content lifted from `LocationBoard.tsx`'s existing
branches, one component each): `work`→`WorkActivity.tsx`, `university`→
`UniversityActivity.tsx`, `shop`→`ShopActivity.tsx`, `apartment`→`ApartmentActivity.tsx`,
`financials`→`FinancialsActivity.tsx`, `risky`→`RiskyGigActivity.tsx`, `selfCare`→
`SelfCareActivity.tsx` (plus the crisis-only Rest-only rendering).

- **New**: `src/components/activities/ActivityModal.tsx` (shared dialog chrome) + the
  7 activity components above.
- **New**: `src/components/hud/StatBars.tsx` (extracted comparison-bar portion of
  `PlayerStatus.tsx`), `WeekTimer.tsx` (week/hours-remaining chip), `EndTurnButton.tsx`
  (extracted persistent End Turn button).
- **New**: `src/components/BoardScreen.tsx` — composes StatBars + WeekTimer +
  `PhaserGameContainer` (all 7 locations, or crisis-restricted subset) + whichever
  activity modal is open + EndTurnButton.
- **Touched**: `fastLaneStore.ts` — add `activeLocation: LocationId | null` +
  `setActiveLocation`, wired as `PhaserGameContainer`'s `onLocationArrived`.
  `BoardScreen.tsx` computes `interactiveLocations = inCrisis ? ['selfCare'] :
  ALL_SEVEN` and passes it down; `BoardScene.ts` disables non-listed nodes.
- **Touched**: `FastLane.tsx` — Board tab renders `BoardScreen` instead of the Phase
  2/3 single-node preview.
- **New tests**: one RTL test per activity component (porting the `disabled={...}`
  logic assertions implicit in `LocationBoard.tsx` today — first isolated coverage
  these paths have ever had) + `BoardScreen.test.tsx` (mocks `PhaserGameContainer`;
  asserts crisis-mode restricts `locations` to `['selfCare']`, arrival opens the right
  modal, End Turn always works).

**Verify**: lint/build/test green; manually confirm all 7 nodes match old grid's
enable/disable states, StatBars/WeekTimer match old Status numbers, forcing a crisis
grays out 6 nodes and Self-Care shows Rest-only, old tabs still fully playable.

## Phase 5 — Cutover: unified board+HUD becomes the only screen

Remove the tab UI. `BoardScreen` is simply what renders during play. Game Log moves
behind Settings. Shell goes full-bleed.

- **New**: `src/components/settings/SettingsMenu.tsx` — gear icon in `BoardScreen.tsx`,
  opens a panel with unmodified `GameLog` + the relocated "Start a new game" control.
- **Touched**: `FastLane.tsx` — remove the tab row and `activeTab` entirely; body
  becomes difficulty selector → win screen → `BoardScreen`. Pass `fullBleed` to
  `GameShell` only for the `BoardScreen` branch.
- **Touched**: `fastLaneStore.ts` — remove `activeTab`/`setActiveTab`.
- **Touched**: `GameShell.tsx` — add `fullBleed?: boolean` prop, conditional container
  class (`w-full` vs `max-w-2xl mx-auto`).
- **Deleted**: `LocationBoard.tsx`, `PlayerStatus.tsx` (fully superseded).
- **Touched**: `FastLane.test.tsx` — drop the tab-switch step, mock
  `PhaserGameContainer` so the test doesn't attempt a real canvas under jsdom; outcome
  assertions (save shape, win screen, recordProgress/clearSave) unchanged.
- **New test**: `SettingsMenu.test.tsx` — opening shows log entries + start-over
  control; two-click confirm flow still works.

**Verify**: lint/build/test green; manually confirm play goes straight to the
full-width board with no tabs, gear icon reveals log + reset, win screen unaffected.

## Phase 6 — Weekly event surfacing

`RANDOM_EVENTS` is already fully wired into `resolveWeekEnd` — no missing game logic.
The gap is presentational: those messages now only reach the player via the
Settings-gated Game Log, making crisis alerts easy to miss. This phase adds an
immediate post-turn summary.

- **New**: `src/components/hud/WeekSummaryModal.tsx` — shown after End Turn, rendering
  the weekly review lines (rent/interest/random-event/crisis/rival lines) from the
  store's `endTurn()` result; dismiss-only, no auto-timeout (so crisis alerts aren't
  missed).
- **Touched**: `fastLaneStore.ts` — `endTurn()`'s result already has everything needed;
  thread the raw log arrays through if not already flattened usefully.
- **Touched**: `BoardScreen.tsx` — opens the modal after `onEndTurn`.
- **New tests**: `WeekSummaryModal.test.tsx` (render + dismiss), extend
  `BoardScreen.test.tsx` for the open-after-End-Turn behavior.

**Verify**: lint/build/test green; manually confirm End Turn shows a dismissible
summary card with that week's key events, then returns to the updated board.

## Dependency/config summary

- `package.json`: `+ phaser@^3.90.0`, `+ zustand@^5.0.14`. No devDependency additions.
- `vite.config.ts` / `tsconfig.app.json` / `eslint.config.js`: no changes required by
  this plan (the one known Phaser+Vite pre-bundling gotcha has a documented fix to
  apply only if observed).

## Critical files

- `src/components/FastLane.tsx` — orchestrator being incrementally rewired
- `src/components/LocationBoard.tsx` — source of truth for the 7 activities' content/logic being ported
- `src/lib/fastLane/turnEngine.ts` — pure logic layer, reused unchanged throughout
- `src/components/GameShell.tsx` — gets the `fullBleed` variant
- `src/components/__tests__/FastLane.test.tsx` — regression check for Phases 1 and 5

## Verification (applies per-phase, per the checklists above)

1. `npm run lint` — 0 warnings
2. `npx tsc -b --noEmit` (or `npm run build`, which includes it)
3. `npm run test:once` — all tests green, including new ones added that phase
4. `npm run build` — clean production build
5. `npm run dev` — manual browser check of that phase's specific behavior change
