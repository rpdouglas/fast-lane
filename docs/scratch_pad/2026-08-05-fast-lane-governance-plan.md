# Fast Lane — Project Governance Plan
**Repo:** rpdouglas/fast-lane · **Stack:** React + Phaser 3 + Zustand + TypeScript
**Date:** August 2026

---

## Part 1 — How the Market Is Handling This Right Now

### The category now has a name: Spec-Driven Development (SDD)
What you've been doing on MRT — a spec file gating any code, CLAUDE.md as always-loaded
context, a governance skill checking drift — is what the market converged on in 2025–2026 and
formally named **spec-driven development**: a versioned, structured spec is the source of
truth, and code is generated/maintained against it rather than against a prompt. It emerged
specifically to fix three failure modes of unmanaged AI coding: intent drift (an underspecified
prompt gets the model's best guess, not your intent), context decay (the agent forgets earlier
decisions as the codebase grows past its effective window), and unverifiable output (no
acceptance criteria means no way to know if the agent's code is "right").

**The reassuring finding:** one of the clearer field guides put it directly — *if you're already
using a CLAUDE.md file effectively, you're already doing a lightweight form of spec-driven
development.* The formal tools (GitHub Spec Kit, OpenSpec, Kiro, BMAD-METHOD) add process
scaffolding on top of the same core idea you already implemented by hand.

### The tooling landscape, briefly
| Tool | Approach | Verdict for you |
|---|---|---|
| **GitHub Spec Kit** | Slash-command workflow (`/specify`, `/plan`, `/tasks`) native to Claude Code | Closest to your existing Phase 2 planning prompt — you built the same thing manually |
| **OpenSpec** | Strict `proposal → apply → archive` state machine; `specs/` = current truth, `changes/` = active proposals; `openspec validate --strict` catches missing acceptance criteria | Most actively maintained open-source option (52k+ GitHub stars); worth borrowing the proposal/archive *discipline*, not the whole tool |
| **BMAD-METHOD** | Persona-based multi-agent handoff (PM agent → Architect agent → Dev agent), thorough PRD/architecture generation | Field reports consistently flag **coordination overhead** on small/solo projects — handoffs break flow when one person is doing all the roles. Not a fit for Fast Lane. |
| **Kiro / Cursor Plan Mode + AGENTS.md** | IDE-native, read-only planning pass before edits | You already get this via Claude Code's native Plan Mode |

### Two market findings that directly shape the plan below
1. **Instruction-budget restraint is now the consensus, not a stretch goal.** Practitioner
   guidance converged on treating ~150–200 standing instructions as the point where model
   compliance with a rules file starts degrading — not a hard limit, but a strong signal that
   an "everything included" CLAUDE.md is a liability, not diligence. MRT's CLAUDE.md earns its
   length because the encryption boundary genuinely needs it. **Fast Lane doesn't have that
   boundary, so its CLAUDE.md should be materially shorter — deliberately, not by accident.**
2. **Governance should be sized to the team, not the ambition.** The 2026 buyer's-guide
   consensus is blunt: solo developers need speed and low friction; small teams need shared
   context and *lightweight* governance; heavy audit-trail/RBAC governance is an enterprise
   concern. Fast Lane is a solo project. The MRT-scale governance system (internal personas,
   mechanical sync scripts, CI-enforced spec-template validation) is more process than a
   one-person game project needs — some of it is still worth keeping (see below), but not all
   of it.

### Where your existing system is already ahead
Your `governance` skill — verifying claimed spec status against actual code evidence — is
functionally what OpenSpec's `validate --strict` and the SDD literature's "executable
specifications as active validation gates" are describing. You built a working version of that
before the tooling caught up to formalize it. Nothing to change there conceptually; it just
needs to be right-sized for a solo game project instead of a compliance-sensitive wellness app.

---

## Part 2 — The Fast Lane Boundary (Your Equivalent of MRT's Encryption Table)

Every project in your system has one non-negotiable thing that never gets violated. For MRT
it's the encryption boundary. For Fast Lane, it's the **Non-Manipulation Commitment**, already
established for MRT2 and explicitly extended to this project — plus the two content gates you
defined when building the personas: the **Ringer Test** and the **Punchline Test**.

This should go in Fast Lane's `CLAUDE.md` in exactly the same heavily-flagged, table-driven
shape as MRT's boundary section — not as prose buried in a design doc.

```markdown
## Content & Tone Boundary — NEVER VIOLATE

Fast Lane depicts early recovery as a turn-based life-sim. Every new event, activity outcome,
or pitfall must pass all three checks before merging:

| Check | Question | Fails if... |
|---|---|---|
| Non-Manipulation Commitment | Does this use streaks, shame mechanics, or non-aggregate analytics that single out the player? | Any guilt-trap framing, any punitive UI treatment of a bad week |
| Ringer Test | Would this ring true to someone who's lived it, or does it read like an outsider's guess? | Generic/cliché recovery tropes not grounded in the persona research |
| Punchline Test | Is the humor aimed at systems/absurdities (bureaucracy, awkward small talk), never at the player's struggle? | Any joke whose target is the player rather than the situation |

**Before adding any new location-node event or pitfall:** run it through all three checks
explicitly, not just informally. Log the check in the spec's Phase 2 (Definition) section.
**Never:** frame a setback as a failure state with red/punitive UI, tie any mechanic to a visible
streak counter, or use language that could read as mocking the player's situation.
```

This is the one section of Fast Lane's CLAUDE.md that should get MRT-level rigor. Everything
else should stay lean.

---

## Part 3 — The Right-Sized Governance Setup

### 3.1 What to install as-is from `recursive-build-methodology`
- `skills/planning`, `skills/ingest`, `skills/fix` — process is stack-agnostic, no changes needed
- `skills/review` — the self-correction loop matters more on a solo project, not less, since
  there's no second developer to catch drift informally
- `skills/debt-ledger` — useful once the codebase has more than a few modules
- `hooks/secrets-scan.sh` — install even though a game has less sensitive data than MRT; a
  Codespaces/Phaser project can still accidentally commit an API key (analytics, leaderboard
  backend, etc. if you add one later)
- `agents/explorer`, `agents/implementer` — genuinely useful given the `logic/` vs
  `scenes/` vs `store/` layering already planned; an explorer subagent can trace how a game rule
  currently works without polluting a session focused on Phaser rendering

### 3.2 What to adapt rather than install verbatim
- **`skills/governance`** — MRT's version checks security-rules-file coverage per collection.
  Fast Lane's equivalent check isn't a security rule — it's: does every new event/mechanic have
  a Non-Manipulation/Ringer/Punchline check logged in its spec? Same audit shape, different
  evidence source. Add this as check **K** alongside the existing lettered checks (A–J) rather
  than replacing them.
- **`skills/design`** — fill in the placeholder sections with Fast Lane's actual palette
  (8-bit/Phaser pixel-art constraints), and set the persona → constraint table from
  `fast-lane_personas.md`.
- **`00_TEMPLATE.md`** — replace MRT's "Security & Zero-Knowledge Audit" section (§2) with:

```markdown
## 2. Content & Tone Audit
*This section MUST be completed before any code is written.*
- [ ] Non-Manipulation Commitment: does this event/mechanic avoid streaks/shame mechanics?
- [ ] Ringer Test: grounded in which persona(s)? Cite the specific trait/motivation.
- [ ] Punchline Test: if this beat includes humor, what is the target — a system, not the player?
```

### 3.3 What to deliberately skip for now
- **Internal stakeholder personas** (MRT's §7.2) — that pattern earns its keep when multiple
  functional roles (growth, support, ops) have competing priorities on a live product. Fast
  Lane is pre-launch and solo; skip it until there's an actual second stakeholder (e.g., once
  you're thinking about distribution/monetization).
- **A CI-enforced `docs:check-specs` script** — valuable at MRT's scale, overkill for a project
  where you're the only one who can violate the spec-gate rule. Enforce it by habit (the
  `planning` skill's gatekeeper) rather than building CI tooling for it yet. Revisit if the
  project grows a second contributor.
- **`release-scribe` / user-facing changelog discipline** — skip until Fast Lane has actual
  users. A solo pre-launch game doesn't need a changelog audit yet.

### 3.4 The one addition the market data specifically argues for: keep CLAUDE.md short
Structure Fast Lane's `CLAUDE.md` as: identity (one paragraph — what the game is, tone) →
commands → stack + one rule each (React/Phaser/Zustand/TS, with the one rule for each being
"game rules live in `logic/`, framework-agnostic, no Phaser or React imports there") →
directory map → the Content & Tone Boundary table above → critical CI-failing rules (type
safety) → persona pointer + litmus question ("would [Marcus/persona] recognize this as true to
his week, or does it feel written by someone who's never been through it?") → deployment
mapping → the spec-gate rule. Target well under the instruction-budget concern zone — this
should be a fraction of MRT's CLAUDE.md length.

---

## Part 4 — Implementation Steps

1. **Install the plugin** in the `fast-lane` Codespace/repo:
   ```
   /plugin marketplace add <you>/rpd-dev-methodology
   /plugin install recursive-build-methodology@rpd-dev-methodology
   ```
2. **Write `CLAUDE.md`** per §3.4 above, including the Content & Tone Boundary table from
   Part 2. This is the first file — nothing else in this plan matters if this isn't in place.
3. **Set up `.claude/settings.json`** with the plugin's secrets-scan hook plus a
   project-specific `PostToolUse` hook for `eslint --fix` / `tsc --noEmit`, matching your usual
   pattern (these are stack-specific, so they live in the project, not the plugin).
4. **Add the `SessionStart` hook** for dependency reinstallation in cloud Codespaces sessions —
   same pattern your MRT2 mobile sessions already use, now covering Phaser/Zustand.
5. **Create `docs/projects/00_TEMPLATE.md`** with the Content & Tone Audit section from §3.2,
   and `docs/PERSONAS.md` pointing at (or absorbing) the existing `fast-lane_personas.md`.
6. **Create `docs/ROADMAP.md` / `BACKLOG.md` / `ACTIVE_CYCLE.md`** seeded from the build order
   already planned: port logic → wire Zustand to bare React UI → add Phaser scenes
   incrementally.
7. **Write the first spec file** (`docs/projects/01_LOGIC_PORT.md`) for the first real chunk of
   work — the logic-layer port — using the adapted template, before any code is written for it.
8. **Run `governance`** once the first 2–3 specs exist, to confirm the drift-check (including
   the new check K) actually catches something meaningful before you rely on it long-term.

---

## Part 5 — Summary Judgment

You don't need a heavier governance system for Fast Lane — you need a **lighter one, aimed at
a different boundary.** The market's 2026 consensus validates the shape of what you already
built (CLAUDE.md-as-lightweight-SDD, spec-gated planning, drift audits) and gives two specific
warnings worth heeding here: don't let the instruction file grow past what a solo pre-launch
game actually needs, and don't import multi-role process (internal personas, CI-enforced spec
validation, changelog discipline) before there's a second stakeholder or a live user base to
justify it.
