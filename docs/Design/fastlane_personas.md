# One Day at a Time — Player Personas
*(originally written for "Fast Lane," the project's prior working title — see `fast-lane_master_design_document.md` for the current name/scope. The persona profiles below are unchanged by that rename; only the framing paragraph above them has been updated.)*

> **Purpose:** Reference personas for developing *One Day at a Time*, an 8-bit-inspired life-sim about early recovery, structurally descended from *Jones in the Fast Lane* but its own thing — a hybrid daily/weekly loop (one meaningful decision per day across Morning/Afternoon/Evening blocks, resolving against weekly checkpoints) organized around SAMHSA's ROSC framework (Health/Home/Purpose/Community), with an 11-location board (Home, Workplace, Employment Center, Meeting Hall, Sponsor's House, Service Center, Health Clinic, Bank, School, Family & Friends, Corner Store). Unlike MRT (a daily-use crisis/wellness tool), this is a session-based *game* — someone chooses to sit down and play it, most often *not* mid-crisis. Personas here are built around who would actually pick this up, why, and what would make that daily/weekly loop and location board feel true rather than gimmicky or mocking. Full mechanical spec: `fast-lane_master_design_document.md`, whose §2 persona table is the condensed cross-reference to this file.
>
> Grounded in current U.S. treatment-population data (cited inline where a specific claim is made) rather than assumption. Demographics of "people in recovery" are broad — this set intentionally avoids defaulting to a single archetype (e.g., young male, stimulant/opioid-focused) since <cite index="17-1">women account for only around 20% of people in drug or alcohol treatment despite being roughly half the population</cite>, and recovery populations span a wide age range.

---

## How to use these

Same discipline as MRT's persona system: pick **one primary persona per feature or event**, design to their constraint, and let others be secondarily accommodated. Run these checks before shipping any location activity, daily beat, or Crossroads event:

1. **The Ringer Test** (named for the game's board of location nodes) — does this event/outcome ring true to someone who has actually lived it, or does it read like an outsider's guess?
2. **The Punchline Test** — is the humor aimed at the *systems and absurdities* of early recovery (bureaucracy, awkward small talk, a sponsor who won't stop quoting the Big Book) rather than at the player's struggle itself? The game can be funny; it should never be funny *at* the player.
3. **The Non-Manipulation Commitment** (shared with MRT2) — no streaks, no shame mechanics, aggregate-only analytics. A bad week in-game is a setback with a story beat, never a guilt trap.

---

## The Personas

### 1. Marcus — "The Rebuilder"
> *"I've had a job before. I've had an apartment before. This time I'd like to keep both."*

| Attribute | Profile |
|---|---|
| Age | 44 |
| Substance / recovery path | Opioids (prescription origin after a workplace injury) → MAT (buprenorphine), NA meetings alongside medical treatment |
| Recovery stage | 7 months, one prior relapse at month 3 |
| Occupation / life situation | Warehouse forklift operator, recently rehired after a 14-month gap in work history; behind on child support |
| Tech & gaming literacy | Moderate — comfortable with a smartphone, not a "gamer"; last console he owned was a Sega Genesis |
| Play context | Phone, on a break or on the couch after his kids are asleep, 10–15 minute sessions |

**Why Fast Lane resonates:** Marcus isn't looking for a wellness app — those feel clinical and a little condescending to him. A *game* that treats his week (work hours, NA meeting, a phone call to his sponsor, trying to scrape together child support) like a strategic puzzle to manage, the way Jones in the Fast Lane treated a mundane life, feels respectful rather than reductive. <cite index="15-1">Growth in admissions among adults 45 and older has been tied largely to alcohol and prescription drug complications</cite> — Marcus sits just under that line but shares the "rebuilding a stalled adult life" profile that group represents.

**Design implications:**
- Time-budget pressure should mirror real trade-offs he recognizes — working overtime vs. making a meeting, not abstract "energy points."
- MAT compliance should be representable without being singled out or flagged as a "lesser" recovery path — no in-game NPC commentary implying MAT isn't "real" sobriety.
- Session length matters: activities should resolve in a few taps, not multi-screen mini-games, since he's playing in short breaks.
- Pitfall events (a missed shift, a short-tempered ex) should have realistic, non-catastrophic recovery paths — a bad roll shouldn't feel like a moralizing punishment.

---

### 2. Jamie — "The Nostalgic Grinder"
> *"I used to play the actual Jones in the Fast Lane as a kid. I did not expect to relate to it this much at 27."*

| Attribute | Profile |
|---|---|
| Age | 27 |
| Substance / recovery path | Alcohol and stimulants (party-culture escalation through early-to-mid 20s) |
| Recovery stage | 3 months, first attempt at sobriety |
| Occupation / life situation | Marketing coordinator, outpatient program while keeping her job; single, active social calendar she's now renegotiating |
| Tech & gaming literacy | High — plays narrative indie games and management sims regularly, follows game design on social media |
| Play context | Laptop or phone, evenings, will replay/optimize a "week" if it goes badly, treats it like a strategy game |

**Why Fast Lane resonates:** <cite index="15-1">Demand for outpatient care rose 15% in 2025 among professionals aged 20 to 35 trying to maintain employment while in recovery</cite> — Jamie is squarely that cohort. She's tech-fluent enough to appreciate the retro aesthetic as a *reference*, not just a style choice, and she's the kind of player who'll min-max the week (skip a happy hour invite to hit a meeting instead) the way she'd optimize any sim game. The risk with Jamie is that gamified systems (points, streaks) could accidentally trigger the same "chase the number" behavior pattern she's trying to unlearn from stimulant use.

**Design implications:**
- Because she'll actively strategize the game, pitfall events tied to social pressure (declining a drink, an old friend texting) need to feel like real decisions with real stakes, not scripted inevitabilities.
- Avoid any mechanic that rewards optimization for its own sake (leaderboards, high scores) — reframe "winning" around balance across stats (job, relationships, health, recovery capital), not a single maximized number, consistent with the Non-Manipulation Commitment.
- She'll notice and appreciate authentic retro-game craft (era-accurate UI sounds, dialogue humor) — this persona is a good one to game-design *for* stylistically, even though she's not the primary emotional-safety anchor.

---

### 3. Renee — "The Juggler"
> *"Everyone keeps asking if I have 'me time.' I have forty-five minutes between picking up my kid and starting dinner."*

| Attribute | Profile |
|---|---|
| Age | 35 |
| Substance / recovery path | Alcohol, AA |
| Recovery stage | 14 months |
| Occupation / life situation | Single mother of two, works part-time retail plus freelance bookkeeping; self-care and "service" are the two categories of her life that get cut first |
| Tech & gaming literacy | Moderate — phone-first, no gaming background, would not self-describe as "a gamer" |
| Play context | Phone, in short fragmented windows (waiting in carpool line, after kids are in bed), frequently interrupted |

**Why Fast Lane resonates:** Renee is the reminder that <cite index="17-1">women are underrepresented in treatment populations relative to their share of the population</cite> partly because of exactly the caretaking load she's carrying — she doesn't have spare time for a "hobby," so the game has to justify itself quickly or she'll close it. If the self-care and service nodes in-game feel like one more obligation rather than something restorative, she'll disengage. She's a good pressure-test for whether the *game* accidentally reproduces the real-life imbalance it's depicting.

**Design implications:**
- Every session needs a clean, fast stopping point — no penalty for quitting mid-week, autosave by default.
- The Self-Care node specifically needs to feel *different* in tone from Work/Service — lower-stakes, restorative, maybe even genuinely relaxing to interact with, not just another task with a timer.
- Interruptions are the default context, not the exception — no mechanic should punish a long gap between sessions (no decaying stats from real-world elapsed time).
- She's a strong persona to check pitfall-event writing against: a "kid is sick, miss the meeting" event should never resolve as a moral failure on the character's part.

---

### 4. Dale — "The Second Act"
> *"I got sober the first time in 1994. I'm doing it again at 61, and I'd like to think I've earned a sense of humor about it."*

| Attribute | Profile |
|---|---|
| Age | 61 |
| Substance / recovery path | Alcohol, relapsed after 18 years sober following retirement and a spouse's death; back in AA |
| Recovery stage | 5 months (second time around) |
| Occupation / life situation | Recently retired, financially stable but restructuring daily routine and social life from scratch; adult children nearby but not deeply involved day-to-day |
| Tech & gaming literacy | Low-to-moderate — comfortable with a tablet, played the *actual* Jones in the Fast Lane on a friend's PC in the early '90s and remembers it fondly |
| Play context | Tablet, at home, unhurried sessions — has more free time than any other persona here, plays for the story and nostalgia as much as the mechanic |

**Why Fast Lane resonates:** Dale is the direct thread back to the source material — he's not decoding a retro *aesthetic*, he's revisiting something he actually played. <cite index="15-1">Admissions growth among adults 45 and older has been tied to rising alcohol misuse in that age group</cite>, often — as with Dale — following a major life transition rather than the addiction patterns more associated with younger users. His relapse-after-long-sobriety story matters for tone: the game shouldn't treat "day 1 again after decades" as either a joke or a tragedy — just a true, common shape of recovery.

**Design implications:**
- UI text size, contrast, and touch-target size should hold up on a tablet for a less digitally-fluent player — this is a good persona for baseline accessibility checks, similar to how MRT holds a touch-target floor for David.
- Dialogue and event-writing should acknowledge "starting over" as a distinct emotional register from "starting" — his sponsor, his frame of reference, his shame triggers are different from a first-timer's.
- He has more in-game "time" available per session than any other persona — a good stress-test for whether the pacing holds up for someone who *isn't* rushed, since most of the others are.
- Because he remembers the original game, an Easter egg or two nodding to Jones in the Fast Lane's own systems (the board-ring layout, the deadpan clerk dialogue) will land specifically with him — worth having at least one persona the nostalgia design choices are explicitly *for*.

---

## Cross-Persona Design Rules

- **No persona is "the addict."** Substance, path, age, and life circumstance vary deliberately across all four — no single default profile should silently become the template every event is written against.
- **Difficulty ≠ punishment.** A rough week for any persona should read as *narratively* true (this is genuinely hard) without being *mechanically* punitive (permanent stat loss, locked content, guilt-coded language) — same principle as MRT2's Non-Manipulation Commitment.
- **Humor has a target, and it's never the player.** Comedy in dialogue/events should land on bureaucracy, awkwardness, and absurd side characters (a landlord, a chatty coworker, an overly enthusiastic newcomer at a meeting) — never on the player's struggle itself.
- **Recovery path pluralism.** AA, NA, MAT, and secular/alternative paths should all be representable without the game's own systems implying a hierarchy between them.
