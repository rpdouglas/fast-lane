# Governance

Fast Lane's governance is deliberately tiny. It's loosely modeled on a much heavier
sister project's system (full write-up:
`docs/scratch_pad/2026-08-05-mrt-governance-process.md`) but scaled for a solo game
repo with no backend and no team — most of that system's apparatus has nothing to
attach to here, so it isn't recreated in miniature. CI now exists
(`.github/workflows/`), but only for lint/build/test/deploy — not the heavier
spec-gate/review-role apparatus below.

## Why this is separate from code review

Code review (`/review`) checks whether a change is *correct*. Governance checks
whether the project's own records still match reality — is there a plan behind
non-trivial work, does `CLAUDE.md` still describe actual practice, is a doc meant to
be durable still sitting forgotten in `scratch_pad/`. Same distinction MRT draws; far
fewer places here for the two to drift apart.

## The file hierarchy (all of it)

- `CLAUDE.md` — stack rules, boundary, workflow, the spec gate.
- `docs/Design/` — durable design references (`fastlane_personas.md`, etc.).
- `docs/governance/GOVERNANCE.md` — this file.
- `docs/scratch_pad/` — ephemeral: gap analyses, migration plans, one-off write-ups.
  Dated filenames; nothing here is load-bearing from `CLAUDE.md`.

## The lifecycle

1. **Plan before code (the spec gate, light).** Non-trivial work gets a written plan
   first — Plan Mode reviewed live, or a `scratch_pad` doc. A rule in `CLAUDE.md`, not
   a mechanical CI gate.
2. **Implement**, per `CLAUDE.md`'s stack rules and boundary.
3. **`/review` before calling it done** — lint/build/test, the boundary checks (tech
   boundary + the Content & Tone Boundary for event/content diffs), and a
   debt-signature grep (fast-lane's stand-in for MRT's `debt-ledger` sweep). CI
   reruns lint/build/test mechanically on every PR as a backstop — it can't do the
   boundary or debt-signature checks, so `/review` still runs by hand.
4. **Promote or leave.** A doc meant to be a durable reference moves out of
   `scratch_pad/` into a named home (`docs/Design/`, `docs/governance/`) once it's
   done — as already happened once by hand with the personas doc.
5. **Merge via PR, not a direct push.** Non-trivial work goes through a PR so CI and a
   Firebase Hosting preview deploy run before merge (see `CLAUDE.md` "Before you open
   a PR"). Merging to `main` deploys the live site.

No `ticket-close`/sync-script step: there's nothing to mechanically sync, since none
of the multi-file status trackers in the table below exist here.

## What MRT has that this repo deliberately doesn't

| MRT concept | Why skipped here | Revisit when |
|---|---|---|
| `ROADMAP.md` / `BACKLOG.md` / `ACTIVE_CYCLE.md` | One dev, no sprints — the migration-plan doc is the whole current plan | A second regular contributor |
| `SCHEMA_ARCHITECTURE.md` | No Firestore/DB — state is `localStorage`, already documented in `CLAUDE.md` | A backend comes back (against the current boundary) |
| `docs/governance/INTERNAL_PERSONAS.md` | Solo dev, one stakeholder | A team forms |
| `docs/projects/` spec template + CI spec-gate (`docs:check-specs`) | CI now exists (`.github/workflows/ci.yml`, lint/build/test/deploy) but isn't used as a spec gate — Plan Mode / `scratch_pad` still serves that role by deliberate choice, confirmed 2026-08-05 | Specs start getting skipped in practice |
| `scripts/sync_ticket_docs.py` | Nothing to sync — none of the files it templates into exist here | Any of the above get built |
| Public changelog | No external users or release process | The game ships somewhere with real players |
| `governance` cross-file-auditor skill | One governance file, one design doc — nothing to cross-audit yet | The hierarchy above grows past a handful of files |
| `ticket-close` / `release-scribe` skills | No tickets, no changelog | Either of the above gets built |
| `debt-ledger` skill + bi-weekly cadence | `/review`'s debt-signature step already runs on every feature, at a scale too small to need a separate scheduled sweep | The debt-signature step starts finding things going unfixed between reviews |
| `secrets-scan` **skill** (interactive/manual scan) | The `PreToolUse` hook (`.claude/hooks/secrets-scan.sh`, added alongside CI/Hosting) already blocks a staged secret at commit time automatically — no separate skill needed for an on-demand version | A scan needs to run outside the commit path too (e.g. a scheduled repo-wide sweep) |
| Required PR reviews / branch-protection rules | Solo dev — nothing for a required review to check that `/review` doesn't already cover by hand | A second contributor joins |
