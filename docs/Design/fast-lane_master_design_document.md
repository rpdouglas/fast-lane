# One Day at a Time — Master Design Document
*(working title, previously "Fast Lane" — renamed to avoid inviting direct comparison to Jones in the Fast Lane and to lead with the game's actual thesis)*

> Consolidates: player personas, board locations (ROSC-aligned), core gameplay logic (hybrid daily/weekly loop), and the phased roadmap resulting from two rounds of external design review. This is the single reference to hand to Claude Code (alongside the repo at `rpdouglas/fast-lane`) going forward — supersedes all prior standalone documents.

---

## 1. Concept

**One Day at a Time** is an 8-bit-inspired life-sim about early substance use recovery, structurally descended from *Jones in the Fast Lane* (1991) but deliberately its own thing: a **hybrid daily/weekly loop** (one meaningful decision per day, resolving against weekly-cadence checkpoints) organized around SAMHSA's **ROSC (Recovery-Oriented Systems of Care)** framework — the four dimensions of recovery are **Health, Home, Purpose, and Community** — layered with the **Recovery Capital** framework (social, physical, human, cultural capital).

The game is governed by the same **Non-Manipulation Commitment** as its sister app, My Recovery Toolkit: no streaks, no shame mechanics, no red "failure" states, no leaderboards, no individual behavioral personalization. Setbacks read as honest narrative beats, not punishment. This commitment matters more than usual for this project specifically, because a daily-cadence game sits in exactly the territory that normally produces streak counters and guilt-based "don't break the chain" pressure — every daily-facing decision below is checked against that risk directly.

### 1.1 Design Thesis (Signature Mechanic)

Most recovery games — and the earlier working framing of this one — implicitly ask *"can you stay sober?"* This game's actual signature is a different question:

> **How do you build a life worth staying sober for?**

The mechanic that carries this isn't a system to build — it's a lens applied to every decision already in the design. Major choices aren't framed as good-vs-bad; they're framed as **which version of yourself you want to be today** (a daughter's request vs. a sponsor's ask vs. a shift at work — all genuinely good, only room for one). Nobody flags the "correct" choice. There's no hidden morality meter. The game just remembers, and over dozens of ordinary daily decisions, NPCs and story beats start reflecting the pattern back ("You always show up," "You've been working a lot lately") — identity emerging from behavior rather than a tracked stat.

This reframing does double duty: it's also the strongest available answer to an early external review's "players will discover a dominant optimization strategy" concern. Adding more interacting systems to make optimization *harder* was one proposed fix; making optimization *undefined* — there is no single best version of yourself — resolves the same concern more directly and stays truer to the Non-Manipulation Commitment.

**Practical framing for content writing:** every daily action and event should be checked against "which version of yourself" tension, not just "good outcome vs. bad outcome."

---

## 2. Player Personas

Four personas ground design decisions — deliberately varied in age, substance, recovery path, and life circumstance so no single profile becomes the silent default the game is written against.

| Persona | Age | Path | Life situation | Design pressure they test |
|---|---|---|---|---|
| **Marcus** — "The Rebuilder" | 44 | Opioids, MAT + NA | Rebuilding work/family life after a relapse | Sub-1-minute daily sessions must feel worthwhile; MAT shown without hierarchy vs. abstinence-based paths |
| **Jamie** — "The Nostalgic Grinder" | 27 | Alcohol/stimulants, outpatient | Marketing coordinator, keeps job while in treatment | Will actively strategize/optimize — good test case for whether the game accidentally rewards score-chasing |
| **Renee** — "The Juggler" | 35 | Alcohol, AA | Single mother, fragmented time | The daily loop's biggest beneficiary — one small decision per day fits her reality far better than a weekly planning session ever did |
| **Dale** — "The Second Act" | 61 | Alcohol, relapsed after 18 years sober | Retired, restructuring life after loss | Accessibility floor (tablet, larger UI); "starting over" needs different tone than "starting" |

**Cross-persona rule:** No persona is "the addict" — substance, path, age, and circumstance vary deliberately. Humor targets systems and absurdities (bureaucracy, awkward small talk), never the player's struggle.

---

## 3. Board Locations & ROSC Alignment

| Location | ROSC Dimension | Recovery Capital | Jones Parallel | Function |
|---|---|---|---|---|
| Home / Apartment | Home | Physical | Apartment complex | Housing stability meter; losing this is rare and serious, not a casual pitfall |
| Workplace | Purpose | Human | Job sites | Income, work-history stat, promotion ladder |
| Employment Center | Purpose | Human | Employment Center | Job-hunting friction (gaps, transportation, shift conflicts) |
| Meeting Hall | Community | Social + Cultural | *(new)* | Core recovery-capital stat driver; never punished for skipping |
| Sponsor's House | Community | Social | *(new)* | Accountability + guidance; some events push back on player thinking, not just +Connection |
| Service Center | Community + Purpose | Social + Cultural | *(new)* | Volunteering; deliberately not the "efficient" choice — rewards values over optimization |
| Health Clinic / Self-Care | Health | Physical + Human | Health Club | Easiest node to neglect by design of the genre; costs accrue quietly, not loudly |
| Bank / Budgeting Office | Home + Purpose | Physical + Human | Bank | Financial literacy tied to housing security |
| School / Night Class | Purpose | Human | School | Slower payoff, higher long-term ceiling |
| Family & Friends' House | Community | Social | *(new)* | Trust recovers on its **own, slower** timeline — decoupled from sobriety/Connection progress |
| Corner Store / Diner | Community (mixed) | Social (can be negative) | General store / restaurant | Everyday errands; the natural home for low-stakes temptation/pitfall events |

**Optional/expansion:** Legal Aid/Courthouse (Home + Purpose, for probation/record-related arcs), Cultural/Faith Center (Community, cultural capital).

**Design rule:** Community gets the most net-new board presence of any dimension — Jones had no equivalent category for it, and it's the one most central to sustained recovery.

---

## 4. Gameplay Logic — Hybrid Daily/Weekly Loop

### 4.1 Core Loop

```
1. DAY START     → one flag/obligation surfaces if relevant today (shift scheduled, meeting 
                    night, rent due today), otherwise a clean slate. Sleep is locked at 8 
                    hours — confirmed, not chosen.
2. DAILY ACTION  → player fills three blocks — Morning, Afternoon, Evening — each with one 
                    activity pulled from locations available in that block. This is the day's 
                    real decision: which ROSC dimension(s) get attention today, and which 
                    don't. A Crossroads event, when it fires, occupies one block itself rather 
                    than adding a fourth decision — keeps the session bounded even on eventful 
                    days.
3. RESOLUTION    → brief flavor text/outcome per filled block, small stat deltas, block-level 
                    diminishing returns applied
4. DAY END       → any block left unfilled auto-resolves as Quiet Rest — a small Wellness 
                    nudge, deliberately smaller than an actual Self-Care/Health Clinic visit, 
                    so leaving blocks empty is a gentle fallback rather than an exploitable 
                    default. Day counter +1.
                    (every 7th day) → WEEK CHECKPOINT runs: obligations check (rent, shift 
                    hours), context-sensitive decay pass, Recovery Capital recalculation, 
                    milestone check
5. ADVANCE       → repeat until the configured game length (see 4.5) is reached
```

The 7-day checkpoint cadence runs independently of total game length — real obligations like rent don't care whether the playthrough is 30 or 90 days long, so the checkpoint simply keeps ticking every 7 days regardless of where that lands relative to the end.

No pause, no undo — actions are committed once resolved, same as a real day.

### 4.2 Stat Model

| Stat | Dimension | Grows from | Affected by |
|---|---|---|---|
| **Wellness** | Health | Clinic visits, rest, self-care | Overwork, skipped clinic visits, unresolved event stress |
| **Stability** | Home | Rent paid, Bank visits, steady income | Missed rent, financial shocks |
| **Direction** | Purpose | Work days, School progress, kept Service commitments | Job loss, skipped shifts |
| **Connection** | Community | Meeting attendance, Sponsor check-ins, Family/Friends visits, Service | Isolation, broken Sponsor commitments |
| **Money** | (practical) | Work income | Rent, expenses, events — **hard-floored at zero**, no negative/debt modeling in v1 |
| **Recovery Capital** | derived, hidden | Weighted aggregate of the four dimensions | — |

**Deltas are daily-scaled, not weekly-scaled**, and use **diminishing returns per activity type**: repeating the same action two days in a row yields a smaller stat gain than the first time, with the bonus refreshing after a short gap. This avoids both of daily cadence's failure modes — stats that barely move, or a flat "do the same optimal thing every day" climb — and reads more like real momentum than a simple rescaled number.

**Recovery Capital** stays hidden from the player as a number — shown only as a qualitative state ("steady," "stretched thin," "finding your footing"). It lightly softens event severity and widens available choices at higher levels, in addition to gating milestones.

**Family trust** is tracked as its own slower-moving value under Family & Friends, distinct from Connection — visiting family does not translate directly or quickly into relationship repair.

**Decay is checkpointed weekly, not daily.** A single skipped day never visibly costs anything — this is the core mechanism that keeps the daily loop from feeling like a streak to maintain. A dimension only decays at the 7-day checkpoint when it's been genuinely neglected across that window, and only where narratively justified (e.g., Community from real isolation).

**No stat reaching zero ends the game.** Low stats escalate consequences narratively (a hard conversation, a written-up shift), never a "GAME OVER" screen.

### 4.3 Location & Activity Model

```typescript
type DayBlock = "morning" | "afternoon" | "evening";

interface LocationDef {
  id: LocationId;
  name: string;
  dimension: RoscDimension;
  secondaryDimension?: RoscDimension;
  availableBlocks: DayBlock[];       // replaces hoursOpen — which blocks this location can be chosen in
  activities: ActivityDef[];
  eventWeight: number;
}

interface ActivityDef {
  id: string;
  label: string;
  moneyCost?: number;
  moneyGain?: number;
  statDeltas: Partial<Record<StatKey, number>>;
  diminishingReturns?: { cooldownDays: number; decayFactor: number };
  requiresFlag?: string;
  narrativeVariants: string[];
}

interface DailyPlan {
  day: number;
  morning: ActivityChoice | null;
  afternoon: ActivityChoice | null;
  evening: ActivityChoice | null;
  // any block left null at day-end resolves to the QUIET_REST default (see 4.1)
}

interface ActivityChoice {
  locationId: LocationId;
  activityId: string;
}

const QUIET_REST_DEFAULT: ActivityDef = {
  id: "quietRest",
  label: "Quiet day at home",
  statDeltas: { wellness: +1 },       // intentionally smaller than an actual Self-Care visit
  narrativeVariants: ["Nothing much happens today. That's alright."]
};
```

Every location follows the `LocationDef` shape, so new locations are cheap to add later. Most locations will realistically be available in only one or two blocks (e.g., Workplace: morning + afternoon; Meeting Hall: evening; Corner Store: any block) — this alone creates the daily trade-offs described above without needing raw hour math.

**Work obligations across blocks:** rather than a single "hours worked" number, a job can require a minimum number of work-blocks per weekly checkpoint (e.g., 5 of the week's 21 total blocks) to stay in good standing — a simplified, block-based version of Jones' original shift-hours pressure, without requiring the player to track literal hours.

### 4.4 Event System — Two Tiers

- **Daily beat.** Each filled block resolves with a short, low-content outcome — a line or two of flavor text keyed to the activity chosen. Three blocks means most days carry three small beats, not one, without any single beat needing to be heavy.
- **The Crossroads.** A meaningful dilemma-style event, firing periodically (not every day) from a separate contextual pool — the player's current obligations, relationships, and flags generate it (a therapist suggesting reduced hours, a landlord needing rent, a sponsor's call). **It occupies one of that day's three blocks** rather than adding a fourth decision, so a Crossroads day still resolves in the same number of taps as any other day.

```typescript
interface EventDef {
  id: string;
  title: string;
  triggerConditions: {
    locationIds?: LocationId[];
    statThresholds?: Partial<Record<StatKey, { below?: number; above?: number }>>;
    dayRange?: [number, number];
    minDaysSinceLastCrossroads?: number;
    requiresFlag?: string;
  };
  weight: number;
  choices: EventChoice[];
}

interface EventChoice {
  label: string;
  statDeltas: Partial<Record<StatKey, number>>;
  moneyDelta?: number;
  outcomeText: string;
  setsFlag?: string;
}
```

**Rules:**
- 2–3 real choices per event, no choice flagged as objectively correct.
- No single event is catastrophic; consequences compound narratively over time via flags, not instantly.
- **Write toward good-choice-vs-good-choice tension**, per the "which version of yourself" thesis in §1.1.
- **Sponsor events should sometimes challenge the player's thinking**, not just reward attendance.
- **Pink Cloud Crash equivalent is probabilistic, triggering somewhere in the day 45–75 range** (recalibrated from the old week-12–16 window to fit the new day-based length model — see §4.5). It occurs in the 60- and 90-day modes; it simply doesn't happen in the 30-day mode, which is the honest outcome — that particular wall isn't usually hit in the first month. Surfaces through a Health Clinic or Sponsor event, never Work/Money, so it doesn't read as a productivity failure.
- Each NPC/relationship (Sponsor, a Family member, an Employer) should have **its own lightweight state object** from the start, so relationship memory can be built out in Phase 2 without a refactor.

### 4.5 Game Length & Progression

**Length options: 30, 60, or 90 days** — chosen directly rather than derived from a week count, because these are the actual milestones recovery culture already orients around (the 30-day chip, "90 in 90"). Replaces the earlier 12/24/36-week model, which translated to an unwieldy 84–252 days once the loop went daily.

```typescript
interface GameConfig {
  totalDays: 30 | 60 | 90;   // player-selected at game start
}
```

1. **Weekly checkpoint** (§4.1) — obligations, decay, Recovery Capital, milestones — runs every 7 days regardless of total length.
2. **Milestone check** — sustained balance across all four dimensions unlocks a story beat ("chapters," not a streak counter).

**Win condition:** at game start, the player sets rough priorities across the four dimensions and picks a length (30/60/90 days). The playthrough ends at that day count with a soft narrative reflection on how things landed relative to stated priorities — no hard pass/fail line.

**No loss condition.** A very low-stat stretch triggers a harder story beat, never an early end. A missed day resolves quietly as a neutral "quiet day" — no penalty, no guilt messaging, no visible streak broken.

---

## 5. Phased Roadmap

### MVP (v1)
The hybrid daily/weekly loop, **three-block daily structure (Morning/Afternoon/Evening, sleep locked at 8 hours)**, 30/60/90-day length selector, two-tier event system, and all of the following are **in the v1 spec as written**, not deferred:
- Family trust decoupling from Connection
- Sponsor pushback events
- Probabilistic Pink Cloud (day 45–75 window, 60/90-day modes only)
- Context-sensitive, checkpoint-based decay
- Light Recovery Capital mechanical influence (event softening, not just milestone gating)
- Good-choice-vs-good-choice event writing, per the "which version of yourself" thesis
- Diminishing-returns stat deltas (avoids both flat-line and single-optimal-action failure modes)
- Quiet Rest default for unfilled blocks, intentionally smaller than an active Self-Care visit so it can't become a dominant strategy
- Relationship state objects (data model only — light population at launch)

### Phase 2 — Next Iteration
| Item | Scope |
|---|---|
| Relationship memory & evolving dialogue | Sponsor, one Family member, one Employer remember 2–3 past outcomes and reference them |
| Identity-pattern callbacks | Lightweight per-value counters (showed up for family, prioritized work, asked for help) feed conditional NPC dialogue — no visible stat, no morality meter. Rides on the same per-NPC state objects relationship memory needs |
| One cross-dimension cascade | Connection → Employment opportunities (strong Meeting Hall/Service history unlocks better job leads) — confirmed as the right first cascade |
| Opportunity windows | Time-boxed job postings, temporary classes, limited sponsor availability |
| Payday & basic environmental timing | Fixed pay schedule interacting with Bank/Money |
| Employment friction (one barrier type) | e.g., work-history gap slows job search — seed via Marcus-style persona pressure |
| Burnout / over-functioning | Soft decay when Work + Service stay maxed across consecutive weekly checkpoints |
| Modular event predicates | Refactor toward composable tags as the content library grows |

### Phase 3 — Longer-Term / Needs Prototyping First
| Item | Why it waits |
|---|---|
| Full Identity Development system (mechanical/stat version) | Phase 2's identity-pattern callbacks are the narrative-first version of this; only build a heavier tracked system if that proves insufficient |
| Invisible Backpack — single hidden "load" variable | One unified hidden variable (recent stress/support balance influencing dialogue tone and event difficulty), not six separate meters; expand only if the single-variable version proves too flat |
| Full world-evolution / permanent-consequence event architecture | Needs Phase 2's cascade and opportunity-window patterns proven first |
| Holidays / anniversaries / seasonal content | Needs an established content library to hang it on |
| Longer-mode (90-day) mechanical evolution | Needs Phase 2 systems (relationship memory, cascades) as building blocks so day 60–90 introduces new strategic texture, not just more of the same |
| Mentor arc — "Becoming the Person You Needed" | Defined shape for the 90-day mode's late game: a newcomer NPC mirroring the player's early-game state, with the player choosing what kind of support to offer |

---

## 6. Contested — Deliberately Not Adopted

Preserved so the reasoning isn't lost if revisited:

- **"Eliminate dominant weekly optimization loops."** Borrows engagement-design logic from mastery/replay-driven commercial games (Persona, Stardew). This game isn't optimizing for replay depth. A player settling into a stable routine is a recognizable, honest recovery pattern — the response is the game **noticing it narratively**, not engineering systems to prevent a stable routine from existing. This also directly conflicts with the same review's own ethical-risk warning against teaching players "I recovered correctly" — where the two conflict, the ethical framing wins.
- **Chasing Jones' economic chaos/unpredictability.** That served Jones' satirical tone; this game's register is sincere realism. Engineering randomness specifically to defeat optimal play risks feeling arbitrary rather than honest.
- **Exploit-prevention as a governing lens.** There's no leaderboard or monetized engagement loop here. Where a "gamed" pattern is also a real recovery-relevant behavior, the better response is narrative acknowledgment, not a balance patch.
- **"Recovery Is a Conversation" as a structural pivot** (dialogue-tree-centric design in the vein of Disco Elysium/Persona). The content-authoring cost is very high, and it works against the short-session needs the personas were built around. What's genuinely good about the idea — dialogue that carries history — is delivered more cheaply by Phase 2's relationship memory and identity-pattern callbacks.
- **Fully daily rebuild (all systems, not just the action layer, resolving daily).** Explored in depth separately — most of the architecture survives, but the real cost is narrative content volume (7x the number of meaningful turns) and stat-rebalancing discipline. The hybrid model captures nearly all of the benefit (daily engagement fits the fragmented-time personas, "one day at a time" is mechanically true) at a fraction of the authoring cost, since weekly-cadence systems (obligations, decay, Recovery Capital) don't need to be reinvented at daily granularity. Preserved in the backlog below in case the hybrid ever feels insufficiently daily once it's actually in front of players.

---

## 7. Backlog — Deferred, Not Forgotten

- **Negative Money / debt state** — would need its own escalation ladder, not an instant penalty, if ever revisited.
- **Persona-driven dynamic event weighting** — if the single base event curve feels too generic across very different starting situations, revisit as a per-persona multiplier table layered on the base weights.
- **True open-ended play length** — could return as an additional "endless" mode alongside 30/60/90, if fixed lengths feel too bounded once people are playing.
- **Fully daily system rebuild** — see Contested, above. Worth revisiting only if the hybrid's weekly-checkpoint layer ends up feeling like it undercuts the daily framing in actual play.

---

## 8. Open Questions

- What's the *smallest* version of relationship memory that still feels meaningful, short of "every relationship evolves uniquely"?
- Does the two-tier daily-beat/Crossroads event structure hold up as genuinely lighter-weight than the fully-daily model once real content is written for it, or does it converge toward the same authoring load?
- Should the 30-day mode have any narrative closure beat of its own, given it deliberately skips the Pink Cloud arc that 60/90-day modes get?
- What's the right weekly work-block quota (out of 21 total blocks/week) to feel like genuine pressure without crowding out Community/Health blocks entirely — 5? fewer?

---

## Strengths to Protect (non-negotiable across all phases)
1. Hybrid daily-action / weekly-checkpoint loop
2. ROSC-aligned board architecture
3. Non-manipulation philosophy — especially vigilance against streak/guilt patterns given the daily cadence
4. Narrative consequences instead of failure screens
5. Hidden, qualitative Recovery Capital presentation
6. Pure logic architecture (`logic/` layer, framework-agnostic)
7. Player-selected game length (30/60/90 days)
8. Ordinary-life framing of recovery rather than melodrama
