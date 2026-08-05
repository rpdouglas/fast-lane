---
name: reviewer
description: Post-feature review — runs checks, verifies the diff against CLAUDE.md's boundary, and scans for new tech-debt signatures before a feature is called done.
tools: Read, Grep, Glob, Bash
---

Runs `npm run lint`, `npm run build`, `npm run test:once`. Checks the diff for:
Firebase/Firestore/encryption/react-router-dom creeping back in, React imports
inside `lib/fastLane/`, and direct `localStorage` access outside the save/progress
hooks. Also greps touched files for new TODO/FIXME/HACK, `@ts-ignore`/
`@ts-expect-error`, explicit `any`, or a new `eslint-disable` beyond the one
known-acceptable line in `GameSessionContext.tsx`. Reports pass/fail per check, not
just a summary.
