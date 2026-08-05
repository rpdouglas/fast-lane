# Fast Lane — Design System
> **Purpose:** the single, self-contained reference for how Fast Lane looks, feels, and
> behaves — distilled from MRT's design-system pattern, resized for a solo game project.
> Fill in the bracketed sections as the visual language solidifies; keep this doc as
> honest as MRT's — if something below isn't built yet, say so rather than presenting it
> as current.

---

## 1. Status: What's Actually Built vs. What's Aspirational

MRT's lesson worth keeping: don't let one document blur "how it looks today" with "how we'd
like it to look eventually." Split it here too.

- **Implemented today:** [update as scenes/UI actually ship — e.g. "logic layer only, no
  rendering yet"]
- **Target / not yet built:** [the fuller pixel-art vision — animated tile transitions,
  full sprite sets per location, etc.]

---

## 2. Core Philosophy

One sentence per principle — this is the emotional target every screen should hit.

- **[Alive, not clinical]:** Fast Lane is a game first — retro, a little wry, never a
  wellness-app aesthetic.
- **[Legible at a glance]:** a turn-based board game read instantly, even on a small mobile
  screen inside a Codespace browser tab.
- **[Persona-adaptive tone, not persona-adaptive UI]:** unlike MRT, the *interface* doesn't
  need to reshape per player — but the *writing* (event text, outcomes) must ring true to
  the personas in `fast-lane_personas.md`.

---

## 3. Global UI Architecture

- **Rendering:** Phaser 3 canvas (`pixelArt: true`, nearest-neighbor scaling — no blur on
  scale-up).
- **Resolution/aspect:** [base game resolution, e.g. 320×180 or 480×270 — pick one and keep
  every sprite sheet aligned to it].
- **Layering:** Phaser owns the board/map/sprites; React owns the HUD, modals, and any
  text-heavy activity screens — Zustand is the bridge. Never render game-board elements in
  React or HUD chrome inside a Phaser scene.
- **Touch targets:** 44px minimum on every React-rendered interactive element (same
  accessibility floor as MRT) — Phaser-rendered nodes should hit the equivalent tap area
  even though they're drawn, not DOM elements.
- **Navigation:** single board view is the home state; activity/outcome screens are modal
  overlays, never a full navigation stack — keep the player oriented on the board.

---

## 4. Location Node → Visual Identity

The Fast Lane equivalent of MRT's module-color table. One row per board location.

| Location | Palette / sprite set | Vibe / psychological goal |
|---|---|---|
| Work | [ ] | [ ] |
| Meeting | [ ] | [ ] |
| Sponsor's house | [ ] | [ ] |
| Service center | [ ] | [ ] |
| Home | [ ] | [ ] |

**Rule:** [decide and state it — e.g. "8-bit palette per location, max N colors per sprite
sheet, no gradients (pixel-art constraint, unlike MRT's glassmorphism gradients)"].

---

## 5. Persona-Adaptive Constraints

Full detail lives in `fast-lane_personas.md`. Condensed here as acceptance criteria:

- **[Marcus / persona A]:** [one-line UX or tone constraint]
- **[persona B]:** [one-line constraint]
- **[persona C]:** [one-line constraint]
- **[persona D]:** [one-line constraint]

---

## 6. The Content & Tone Engine (Fast Lane's "No-Guilt Engine")

MRT bans red "overdue" states everywhere. Fast Lane's equivalent, already established:

- **Non-Manipulation Commitment:** no streaks, no shame mechanics, aggregate-only analytics.
- **Ringer Test:** every event/outcome must ring true to someone who's lived it.
- **Punchline Test:** humor targets systems/absurdities, never the player.
- A bad week in-game is a **setback with a story beat**, never a red failure state or a
  guilt-trap prompt.

---

## 7. Asset Protocol

- Sprite sheets referenced exclusively through a typed asset dictionary (Fast Lane's
  equivalent of MRT's `ASSETS` dictionary in `src/data/assets.ts`) — no hardcoded paths in
  scene/component code.
- [Format: PNG sprite sheets, e.g. `.png` + Phaser atlas JSON — state the actual pipeline
  once chosen.]
- Portraits/avatars only, no real faces — same anonymity-adjacent instinct as MRT, extended
  here for tone consistency with the recovery theme.

---

## 8. Pre-Implementation Checklist

Run before building any new scene, node, or HUD element:

1. Which location does this belong to? Apply that location's palette/sprite set (§4).
2. Which persona is this event primarily grounded in? Apply their constraint (§5).
3. Does this pass the Non-Manipulation Commitment, Ringer Test, and Punchline Test (§6)?
4. Are touch targets ≥44px on every React-rendered interactive element?
5. Is this rendered in the right layer — Phaser for board/sprites, React for HUD/modals?
6. If this is a setback/pitfall event, is it framed as a story beat, not a failure state?
