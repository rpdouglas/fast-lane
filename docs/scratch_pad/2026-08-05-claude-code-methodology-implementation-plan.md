# Claude Code Methodology — Implementation Plan for Fast Lane

**Source:** `docs/scratch_pad/2026-08-05-claude-code-setup-gap-analysis.md`
**Scope:** apply that report's recommendations to *this* repo, scaled to its actual size.

---

## 0. Reality check before applying the report

The gap-analysis report benchmarks an already-mature governance system (MRT: `CLAUDE.md`
boundary tables, hooks, `.claude/skills/`, persona framework, governance audit skill) and
finds three gaps: **subagents, worktrees, plan mode** (do-first/do-next), plus **plugin
packaging** as a longer-horizon idea.

Fast Lane starts from zero on all of it — confirmed by scanning the repo: no `CLAUDE.md`,
no `.claude/` directory, no `docs/governance/`. It's also a different shape of project than
MRT:

- Small, largely solo, single-package Vite + React + TypeScript app.
- No backend, no auth, no secrets — per the README, Firebase/Firestore and the encryption
  layer were deliberately stripped out during extraction from MRT2. Game state is
  `localStorage` only.
- No multi-client reuse yet (MRT's persona framework, governance-audit skill, and
  ticket-close/ingest skills exist because that system runs across several client repos).

So this isn't "retrofit a heavy system" — it's "bootstrap the baseline for the first time,
and build in the report's two highest-leverage recommendations (subagents, plan mode) from
day one." Everything MRT-specific that doesn't have a real analog here (persona framework,
secrets-scan urgency, ROADMAP/ACTIVE_CYCLE ceremony) is intentionally left out or deferred
until it earns its keep.

Note: `docs/scratch_pad/2026-08-05-fastlane-personas.md` already exists but is a *different*
concept — in-game player personas for design decisions, not the report's Claude-collaboration
persona framework. No conflict, just don't conflate the two.

---

## 1. Phase 1 — Do first (baseline + top 2 recommendations)

**Effort:** ~30–45 min, one sitting. Everything here is additive and reversible.

### 1.1 `CLAUDE.md` (root)
Identity → commands → stack rules → directory map → the one non-negotiable boundary →
CI-failing rules → workflow (plan mode, subagents, worktrees pointer). Draft below.

### 1.2 `.claude/settings.json`
Narrow Bash allowlist for the commands this repo actually uses (`npm run dev/build/lint/test*`,
read-only git). A `PostToolUse` lint/typecheck hook on `Edit`/`Write` is worth having; a
secrets-scan hook is **not** — there's nothing to scan for yet (see §3.3). Implement via the
`update-config` skill rather than hand-writing the hook JSON, so the matcher/command syntax is
correct on the first try.

### 1.3 `.claude/agents/` — three subagents
Same three the report recommends, scoped to this repo:

- **`explorer.md`** — read-only search (`Read, Grep, Glob, Bash`), no `Edit`/`Write`. Use for
  "where is X" / "how does the turn engine handle Y" instead of burning main-context tokens.
- **`implementer.md`** — scoped to one approved plan/phase (`Read, Edit, Write, Bash, Grep, Glob`).
  Takes a plan as input, doesn't invent scope beyond it.
- **`reviewer.md`** — runs `lint`/`build`/`test:once` and checks the diff against `CLAUDE.md`'s
  boundary (no Firebase/router creeping back in, game logic staying framework-agnostic in
  `lib/fastLane/`). Read-only + `Bash` for running checks.

### 1.4 Plan Mode as default workflow
No file to create — this is a habit change, encoded as one line in `CLAUDE.md`: use
`Shift+Tab` before starting non-trivial feature work instead of a pasted prompt template.
Replaces the "Phase 2: Definition" pattern the report describes at the mechanism level, not
the discipline level.

---

## 2. Phase 2 — Do next

**Trigger:** the next real feature/refactor, likely the Phaser+Zustand board migration
(`docs/scratch_pad/2026-08-05-fast-lane-phaser-zustand-migration-plan.md`).

### 2.1 Worktrees — status: corrected, not what was expected ✅
**Correction (post-write review of the actual migration plan):** the Phaser/Zustand doc's
6 phases are strictly sequential — Phase 2's board scaffold calls the Zustand actions Phase
1 builds, Phase 4 depends on Phase 2/3's node/tween primitives, etc. It does *not* split
into independent board-rendering vs. state-store tracks; that was a guess made before
reading the finalized plan in full, and it would have baked a bad example into `CLAUDE.md`.
Corrected the `CLAUDE.md` Workflow section to say so explicitly and give a generic
worktree trigger (independent work — a content pass alongside a refactor, two unrelated
bugfixes) instead of a fabricated one. No worktree tooling was needed for this migration.

### 2.2 One skill, not five ✅
Ported **`review`** only (`.claude/skills/review/SKILL.md`) — runs
`lint`/`build`/`test:once` plus a diff check against `CLAUDE.md`'s boundary (no
Firebase/router, `lib/fastLane/` stays framework-agnostic, `localStorage` only touched via
the save/progress hooks). Skipped `planning`/`ingest`/`fix`/`ticket-close`/`governance` —
no multi-repo/ticket-tracker surface area here to justify them.

### 2.3 Docs backbone — minimal, not the full MRT set — deferred
Skip `ROADMAP.md` / `ACTIVE_CYCLE.md` / persona-framework ceremony — `docs/scratch_pad/`
already functions as this repo's planning surface and works fine at this size. If backlog
tracking becomes a real pain point later, add a single `docs/BACKLOG.md`, not the full set.

---

## 3. Phase 3 — Situational / don't build yet

### 3.1 Plugin packaging
The report calls this the highest-leverage move *for a multi-client consultant*. It only
pays off once the same `.claude/agents/` + skill pattern needs to exist in a second repo
(another Lily Pad client, or back-porting into MRT2). Recommendation: defer. When that day
comes, extract Fast Lane's `.claude/` as the first version of the shared plugin rather than
starting from scratch.

### 3.2 MCP servers
No external-tool friction identified (no Figma/issue-tracker workflow mentioned for this
repo). Skip until a concrete need shows up.

### 3.3 Secrets-scan hook
Skip. Per the README, this repo has no credentials, API keys, or backend — everything
Firebase/encryption-related was stripped during extraction. Revisit only if a backend gets
added back.

---

## 4. Concrete deliverables (ready to create on approval)

### `CLAUDE.md`
```markdown
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
- `docs/scratch_pad/` — planning docs, gap analyses, migration plans

## The one non-negotiable boundary
Never reintroduce Firebase/Firestore, encryption, or `react-router-dom` navigation into this
repo — that coupling was deliberately removed during extraction from MRT2 (README §"What
changed"). If a feature seems to need routing or a backend, that's a signal it belongs back
in MRT2, not here.

## Workflow
- Use Plan Mode (`Shift+Tab`) before starting any non-trivial feature or refactor.
- Prefer the `explorer` subagent for read-only research over doing it in the main context.
- Prefer the `implementer` subagent for isolated, scoped implementation work.
- Run the `reviewer` subagent (or its checklist manually) before calling a feature done.
- For independent, parallelizable work — e.g. splitting the Phaser/Zustand migration into
  board-rendering vs. state-store tracks — use separate git worktrees instead of serializing.

## CI-failing rules
- `npm run build` and `npm run lint` must both pass clean before a PR is opened.
- `npm run test:once` must pass.
```

### `.claude/agents/explorer.md`
```markdown
---
name: explorer
description: Read-only codebase search for Fast Lane. Use for "where is X", "how does Y work", or locating existing patterns before planning or implementing.
tools: Read, Grep, Glob, Bash
---

Read-only research agent for the Fast Lane repo (React 19 + TS + Vite game).
Locate and summarize — never edit files. Report file:line references so the
calling session can act on them directly.
```

### `.claude/agents/implementer.md`
```markdown
---
name: implementer
description: Scoped implementation of one already-approved plan or phase. Does not invent scope beyond what was handed to it.
tools: Read, Edit, Write, Bash, Grep, Glob
---

Implements exactly the plan/phase it's given, against Fast Lane's CLAUDE.md
rules (game logic stays framework-agnostic in lib/fastLane/, no Firebase/router
reintroduced). Runs `npm run lint` and `npm run test:once` before reporting done.
```

### `.claude/agents/reviewer.md`
```markdown
---
name: reviewer
description: Post-feature review — runs checks and verifies the diff against CLAUDE.md's boundary before a feature is called done.
tools: Read, Grep, Glob, Bash
---

Runs `npm run lint`, `npm run build`, `npm run test:once`. Checks the diff for:
Firebase/Firestore/encryption/react-router-dom creeping back in, React imports
inside `lib/fastLane/`, and direct `localStorage` access outside the save/progress
hooks. Reports pass/fail per check, not just a summary.
```

---

## 5. Sequencing

| Phase | When | Effort |
|---|---|---|
| 1 — baseline + subagents + plan-mode habit | Now, one sitting | ~30–45 min |
| 2 — worktrees + `review` skill | Next real feature (Phaser/Zustand migration) | Incremental |
| 3 — plugin packaging, MCP, secrets-scan | Deferred until a second repo or a backend exists | N/A |

**Next step:** approve Phase 1 and I'll create the four files above (`CLAUDE.md` +
`.claude/agents/*.md`) and wire `.claude/settings.json` via the `update-config` skill.
