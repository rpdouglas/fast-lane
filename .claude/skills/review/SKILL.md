---
name: review
description: Post-feature self-review for Fast Lane. Use before calling any feature, phase, or bugfix done — runs the automated checks and verifies the diff against CLAUDE.md's boundary.
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

- **No Firebase/Firestore, encryption, or `react-router-dom`** reintroduced anywhere —
  this repo was deliberately decoupled from MRT2's backend during extraction (see README).
- **`src/lib/fastLane/` stays framework-agnostic** — no `import React` / `import ... from
  'react'` inside that directory.
- **`localStorage` is only touched from `hooks/useGameSave.ts` / `hooks/useGameProgress.ts`**
  — not from components or other hooks directly.
- **New UI logic lives in `src/components/`, not duplicated game logic** — if a component
  is doing arithmetic or state transitions that belong in `turnEngine.ts`, flag it.

## 3. Report
State pass/fail per check (1–3 above), not just a summary — if something was fixed along
the way, say what and why so it's traceable in the conversation.
