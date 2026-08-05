---
name: review
description: Post-feature self-review for Fast Lane. Use before calling any feature, phase, or bugfix done — runs the automated checks, verifies the diff against CLAUDE.md's boundary, and scans for new tech-debt signatures.
---

Run this before reporting a feature/phase as complete. It's the same checklist the
`reviewer` subagent runs — use it directly for something small, or delegate to `reviewer`
to keep the check out of the main context on a longer session.

## 1. Automated checks (all must pass clean)
1. `npm run lint` — zero warnings
2. `npm run build` — includes typecheck (`tsc -b`); must complete with a clean production build
3. `npm run test:once` — all tests green, including any new ones the change needed

If any of these fail, fix the root cause before continuing — don't suppress with
`eslint-disable`, `@ts-ignore`, or `.skip` on a test unless the user explicitly agreed to
that as a temporary measure.

## 2. Diff review against CLAUDE.md's boundary
Read the actual diff (`git diff`) and check for:

- **No Firebase backend (Firestore, Firebase Auth), encryption, or `react-router-dom`**
  reintroduced anywhere — this repo was deliberately decoupled from MRT2's backend during
  extraction (see README). Firebase **Hosting** config (`firebase.json`, `.firebaserc`,
  `.github/workflows/firebase-hosting-*.yml`) is the one exception — see CLAUDE.md's
  "one non-negotiable boundary" carve-out.
- **`src/lib/fastLane/` stays framework-agnostic** — no `import React` / `import ... from
  'react'` inside that directory.
- **`localStorage` is only touched from `hooks/useGameSave.ts` / `hooks/useGameProgress.ts`**
  — not from components or other hooks directly.
- **New UI logic lives in `src/components/`, not duplicated game logic** — if a component
  is doing arithmetic or state transitions that belong in `turnEngine.ts`, flag it.
- **New/changed event, activity-outcome, or pitfall content passes the Content & Tone
  Boundary** (CLAUDE.md) — Ringer Test, Punchline Test, Non-Manipulation Commitment. Skip
  this check only if the diff has no player-facing narrative/event content.

## 3. Debt-signature scan
Grep the touched files (or all of `src/` if the change is broad) for the same four
signatures MRT's `debt-ledger` skill tracks under its Protocol B — fast-lane-scaled to
one step in this checklist rather than a separate skill with its own bi-weekly cadence
and ledger file, since there's no `ACTIVE_CYCLE.md` "Chores" section for it to feed:

- `TODO` / `FIXME` / `HACK`
- `@ts-ignore` / `@ts-expect-error`
- explicit `any` (`: any`, `<any>`, `as any` — not just the substring "any" in comments)
- any **new** `eslint-disable` beyond the one known-acceptable line in
  `src/contexts/GameSessionContext.tsx` (`react-refresh/only-export-components`)

Flag anything new. Fix the root cause, or — if the user has explicitly agreed a
suppression is warranted — leave a comment next to it explaining why, the same way the
existing `GameSessionContext.tsx` line already does, so the next reader doesn't have to
re-derive the reasoning from scratch.

## 4. Report
State pass/fail per check (1–4 above), not just a summary — if something was fixed along
the way, say what and why so it's traceable in the conversation.
