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
Never reintroduce a Firebase **backend** — Firestore, Firebase Auth, client-side encryption —
or `react-router-dom` navigation into this repo. That coupling was deliberately removed during
extraction from MRT2 (README §"What changed"). If a feature seems to need routing or a backend,
that's a signal it belongs back in MRT2, not here.

**Carve-out: Firebase Hosting is not the boundary.** `firebase.json`, `.firebaserc`, and the
`.github/workflows/` files that deploy the static `dist/` build to Firebase Hosting (a CDN /
static-file host — no database, no auth, no server code) are expected and allowed; see
"Before you open a PR" below. Hosting is a deploy target, not a backend, so adding it doesn't
reopen this boundary. But the boundary still applies to *what those files can contain*: if a
change to `firebase.json`, a workflow file, or anything else ever adds a Firestore/Auth SDK
call, a `firestore.rules` file, or server-side logic, that crosses the line above and gets the
same scrutiny as reintroducing Firebase would anywhere else in this repo.

## Content & Tone Boundary
Fast Lane depicts early recovery as a turn-based life-sim — that subject matter, not the tech
stack, is this project's actual highest-stakes risk. Every new location-node event, activity
outcome, or pitfall should pass these checks (full definitions in
`docs/Design/fastlane_personas.md`, "How to use these"):

| Check | Origin | Question | Fails if... |
|---|---|---|---|
| Ringer Test | Defined for this project | Would this ring true to someone who's lived it, or read like an outsider's guess? | Generic/cliché recovery tropes not grounded in the persona research |
| Punchline Test | Defined for this project | Is the humor aimed at systems/absurdities (bureaucracy, awkward small talk), never at the player's struggle? | Any joke whose target is the player rather than the situation |
| Non-Manipulation Commitment | Inherited from MRT2 — not originated here | Does this use streaks, shame mechanics, or non-aggregate analytics that single out the player? | Any guilt-trap framing, or punitive UI treatment of a bad week |

`/review`'s diff-review step runs these against any diff that touches event, activity-outcome,
or pitfall content — see `.claude/skills/review/SKILL.md` §2.

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
- Non-trivial work happens on a feature branch, merged to `main` via a PR — not pushed to
  `main` directly (see "Before you open a PR" below). Merging to `main` deploys the live site.

## Before you open a PR
CI (`.github/workflows/ci.yml`) reruns lint/build/test on every PR and on `main`, and opening a
PR creates a Firebase Hosting preview-channel deploy — but run these locally first so a failing
check doesn't burn a CI run and a preview build for something catchable in ten seconds:
- `npm run build` (typecheck + production build) and `npm run lint` must both pass clean.
- `npm run test:once` must pass.
- Run `/review` (or the `reviewer` subagent) before calling the branch ready for a PR.

Merging to `main` is a production deploy, not just a git operation — treat it accordingly.
