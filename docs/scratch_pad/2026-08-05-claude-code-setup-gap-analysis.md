# Claude Code Methodology: Gap Analysis & New-Project Setup Guide
**Prepared for:** Ryan (RPD Consulting / Lily Pad Strategy & Design)
**Baseline:** MRT AI Workflow & Governance System export
**Date:** August 2026

---

## 1. Executive Summary

Your MRT governance system (CLAUDE.md boundary tables, `.claude/skills/`, mechanical hooks, docs-as-code governance hierarchy, dual persona framework) is **more mature than the vast majority of what's in the marketplace right now**. Most public "best practice" guides in 2026 are still explaining what a `SKILL.md` is. You've already built a closed-loop governance audit skill that checks code reality against documentation claims — that's an advanced pattern almost nobody writes about.

The real gaps are in **three specific areas the marketplace has moved on**, largely because Anthropic shipped native primitives for them after your system was designed:

1. **Subagents + git worktrees** for parallel, isolated execution (you note you don't use these — the ecosystem has since standardized around them)
2. **Plan Mode / structured planning-then-approval as a first-class Claude Code feature**, not just a prompt template you paste in
3. **Plugin packaging** — turning your skill library into an installable, versioned bundle instead of hand-copied files per project

Everything else — your CLAUDE.md discipline, hooks-over-hope enforcement, and governance audit — is *validated*, not outdated. Anthropic's own documentation now explicitly admits CLAUDE.md compliance isn't guaranteed under context pressure, and that hooks are what actually hold under long sessions. You built that architecture already, ahead of the field discovering they needed it.

---

## 2. Gap Analysis Table

| Area | Your MRT system today | 2026 marketplace standard | Verdict |
|---|---|---|---|
| Root directive file | `CLAUDE.md`, single source, boundary table | Same — confirmed as the correct pattern | ✅ Ahead of curve |
| Mechanical enforcement | `settings.json` allowlist + `PreToolUse`/`PostToolUse` hooks | Same; explicitly the *only* thing proven to survive long-context drift | ✅ Ahead of curve — keep exactly as is |
| Skills | `.claude/skills/*/SKILL.md`, well-structured, gatekept | Standard as of Oct 2025 Agent Skills spec; your skills are more rigorous than most public examples | ✅ Ahead of curve |
| Subagents | Not used — noted explicitly as absent | `.claude/agents/*.md` with scoped tools/model is now the default way to keep context clean (research, verification, isolated implementation) | 🔴 **Gap** |
| Parallel execution | Single linear session | Git worktrees + subagents running concurrently is now a standard daily pattern (4–8 concurrent worktrees/developer is typical) | 🔴 **Gap** |
| Planning discipline | Prompt-template "Phase 2: Definition," pasted by hand | Native **Plan Mode** (Shift+Tab or `--permission-mode plan`) does the same thing as a built-in mode, plus an "Ultraplan" extended-thinking variant for complex features | 🟡 **Partial gap** — your process is right, the mechanism is manual |
| Governance/drift audit | `governance` skill — cross-file audit, code-reality checks | Rare in public examples; most teams still hand-check | ✅ Ahead of curve |
| Distribution/packaging | Skills copied file-by-file into each new repo | Plugin marketplaces (`/plugin marketplace add`, `/plugin install`) let you version and install your whole skill set in one command | 🔴 **Gap** |
| MCP servers | Not referenced in your export | Increasingly standard for wiring Claude Code to real tools (issue trackers, Figma, databases) instead of only file/bash access | 🟡 **Gap, situational** — relevant mainly if you want Claude Code to reach outside the repo |
| Secrets hygiene | Custom `secrets-scan.sh` pre-commit hook | Matches current guidance almost exactly | ✅ Ahead of curve |
| Session task tracking | In-session todo list mapped 1:1 to spec Phase 3 | Matches current guidance ("mark items complete as you go," don't invent a parallel breakdown) | ✅ Matches best practice |
| Self-correction loop | `review` skill after each feature/sprint | Rare in public systems — most don't close this loop at all | ✅ Ahead of curve |

**Bottom line:** you have zero governance debt and three concrete upgrade opportunities: subagents, worktrees, and plugin packaging. All three are additive — nothing in your current system needs to be torn down.

---

## 3. Recommendations — Ranked by Effort vs. Payoff

### Do first (high payoff, low effort)
1. **Define 3 subagents to start**: `explorer` (read-only codebase search, no Edit/Write), `implementer` (scoped to one spec's Phase 3), `reviewer` (runs your `review`/`governance` logic in an isolated context). Give each a `tools:` allowlist in frontmatter. This alone will cut main-context pollution dramatically on long sessions — the exact problem your `ingest` skill was designed to patch around.
2. **Switch Phase 2 "Definition" from a pasted prompt template to native Plan Mode.** Same discipline, one keystroke to trigger (`Shift+Tab`), and the plan is reviewable/editable in the VS Code extension's UI before you approve — you get everything your prompt template does, minus the copy-paste step.

### Do next (medium effort, compounding payoff)
3. **Package your skill library as a private plugin** (`.claude-plugin/marketplace.json` + your `.claude/skills/` folder pointed at from it). Then every new project — MRT, Fresh Nest Co., Artisan Kitchen & Bath, a future Lily Pad client — gets `planning`, `fix`, `governance`, `review`, `ticket-close` etc. via one `/plugin install`, versioned, instead of hand-copied and drifting per repo. This is the single highest-leverage change for you specifically, since you run this exact governance pattern across *multiple* client codebases already.
4. **Adopt git worktrees for the two workflows where you're most often blocked on serialization**: (a) running the `governance` audit skill on a read-only worktree while your main session keeps editing, and (b) parallel implementation when a spec's Phase 3 splits cleanly into independent modules (e.g., MRT2 game specs — Crossword and Anchor Words could build in parallel worktrees).

### Situational (only if it solves a real friction point)
5. **MCP servers** — worth adding only if you find yourself manually copy-pasting between Claude Code and, say, a project board or Figma. Not needed for the docs-as-code governance model itself, which deliberately keeps everything in-repo as markdown.

### Don't change
- CLAUDE.md structure, hooks, governance skill, persona framework, secrets-scan design — these match or exceed current best practice as documented by Anthropic and the wider ecosystem. Resist the temptation to rebuild them just because the tooling around them evolved.

---

## 4. New Project Setup — Claude Code CLI in VS Code

### 4.1 Install
```bash
# Requires Node.js 18+ (you already use this stack)
npm install -g @anthropic-ai/claude-code
```
Then in VS Code: Extensions (`Ctrl+Shift+X` / `Cmd+Shift+X`) → search "Claude Code" → install the official Anthropic extension. Sign in with your existing Claude account (Pro/Max/Team — no separate API key needed unless you want Console billing).

Open the project folder, open the integrated terminal (`` Ctrl+` ``), run `claude` to start a session, or click the extension's sidebar icon for the native panel (inline diffs, plan review, @-mention files).

### 4.2 Bootstrap the governance system (adapted checklist from your own export, §8)
1. Write `CLAUDE.md` first: identity → commands → stack + one rule each → directory map → the one non-negotiable boundary (as a table if data-shaped) → CI-failing rules → persona pointer + litmus question → deployment mapping → spec-gate rule.
2. `.claude/settings.json`: narrow allowlist, `PreToolUse` secrets-scan hook on `git commit`, `PostToolUse` auto-lint + typecheck on Edit/Write.
3. **New:** `.claude/agents/` — add `explorer.md`, `implementer.md`, `reviewer.md` (see §3.1 above).
4. `docs/governance/DEVELOPER_GUIDE.md` — port the Recursive Build Protocol + Maintenance Protocols, adjusted for the new stack's actual commands.
5. `docs/ROADMAP.md`, `BACKLOG.md`, `ACTIVE_CYCLE.md`, a schema/data-dictionary doc, `docs/projects/00_TEMPLATE.md`.
6. `docs/PERSONAS.md` + (if relevant) `docs/governance/INTERNAL_PERSONAS.md`.
7. Port skills in this priority order: `planning` + `ingest` → `fix` → `ticket-close` → `governance` (build last, depends on everything else existing) → `review`.
8. **New:** if this is the second or later project reusing the system (which it will be, given your client roster), skip steps 3–7 per-project and instead install your packaged plugin (§3, item 3) once it exists.

---

## 5. GitHub Codespaces Implementation

### 5.1 `.devcontainer/devcontainer.json`
```json
{
  "name": "New Project Dev Environment",
  "image": "mcr.microsoft.com/devcontainers/typescript-node:20",
  "features": {
    "ghcr.io/devcontainers/features/common-utils:2": {},
    "ghcr.io/devcontainers/features/git:1": {}
  },
  "postCreateCommand": "npm install",
  "postStartCommand": "npm install -g @anthropic-ai/claude-code@latest",
  "customizations": {
    "vscode": {
      "extensions": [
        "anthropic.claude-code",
        "dbaeumer.vscode-eslint",
        "esbenp.prettier-vscode"
      ],
      "settings": {
        "editor.formatOnSave": true
      }
    }
  },
  "forwardPorts": [3000],
  "remoteUser": "node"
}
```
Notes specific to your stack:
- Base image already matches your React/TypeScript/Vite/Firebase projects — swap the port for whatever your dev server uses.
- `postStartCommand` (not `postCreateCommand`) for the Claude Code install so it re-installs on every Codespace start, since global npm packages don't always survive rebuilds the way your project files do.
- Your mobile Claude Code sessions already require `SessionStart` hooks for dependency reinstallation in cloud sandboxes — the same hook pattern applies here; add a `SessionStart` hook in `.claude/settings.json` that runs `npm install` if `node_modules` is stale, so a fresh Codespace doesn't need a manual step.

### 5.2 First-session checklist in a new Codespace
1. Codespace builds → extension auto-installs via `customizations.vscode.extensions`.
2. Open terminal, run `claude` → sign in (first time only; credentials persist in the Codespace's storage volume across rebuilds, not across Codespace deletion).
3. Run your `ingest`-equivalent skill/command to have Claude read the real file structure before any planning.
4. Confirm `.claude/settings.json` hooks fire correctly (test with a trivial edit) before starting real feature work.
5. If reusing the packaged plugin: `/plugin marketplace add <your-repo>` then `/plugin install <your-plugin-name>` — this replaces manually copying `.claude/skills/`.

---

## 6. One Structural Idea Worth Considering

Given you already run this governance pattern across MRT, The Pawn Shop, Fresh Nest Co., and multiple Lily Pad clients, the plugin-packaging step (§3.3) isn't just an efficiency nicety — it's the thing that turns "a system I rebuild by hand per client" into "a product." Worth treating as its own small project with its own spec file, using your own template.
