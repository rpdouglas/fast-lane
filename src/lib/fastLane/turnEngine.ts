// src/lib/fastLane/turnEngine.ts
// "One Day at a Time" — pure game logic for the hybrid daily/weekly loop
// (§4 of the master design doc). No side effects, no mutation of inputs, no
// React imports — see CLAUDE.md's stack rules.
import {
  LOCATIONS,
  CROSSROADS_EVENTS,
  RELATIONSHIP_SEEDS,
  RECOVERY_CAPITAL_BANDS,
  WORK_BLOCK_QUOTA,
} from './gameData';
import { QUIET_REST_DEFAULT } from './types';
import type {
  DayBlock,
  StatKey,
  RoscDimension,
  LocationId,
  RelationshipKey,
  RelationshipState,
  ActivityDef,
  ActivityChoice,
  EventDef,
  GameConfig,
  PlayerStats,
  MilestoneResult,
  FastLaneSaveState,
} from './types';

const ROSC_DIMENSIONS: RoscDimension[] = ['health', 'home', 'purpose', 'community'];

const DIMENSION_TO_STAT: Record<RoscDimension, StatKey> = {
  health: 'wellness',
  home: 'stability',
  purpose: 'direction',
  community: 'connection',
};

const DIMENSION_LABEL: Record<RoscDimension, string> = {
  health: 'Health',
  home: 'Home',
  purpose: 'Purpose',
  community: 'Community',
};

const DECAY_NARRATIVE: Record<RoscDimension, string> = {
  health: 'Self-care fell off this week — you can feel it a little.',
  home: 'The apartment and the budget didn’t get much attention this week.',
  purpose: 'Work and next-step stuff took a back seat this week.',
  community: 'You didn’t connect with anyone this week — no meetings, no sponsor, no family, no service. The isolation adds up quietly.',
};

const DIMENSION_DECAY_AMOUNT = 4; // flat value within the design's -3 to -5 "genuinely neglected" range
const FAMILY_TRUST_DECAY_AMOUNT = 2; // smaller than DIMENSION_DECAY_AMOUNT — family trust moves slower
const FAMILY_NEGLECT_WINDOW_DAYS = 14; // 2 consecutive 7-day checkpoints with no familyFriends visit
const DIMINISHING_RETURNS_FLOOR = 0.2;
const CROSSROADS_FIRE_PROBABILITY = 0.2; // ~1 in 5 days, reads as "periodic" not constant
const PINK_CLOUD_DAILY_PROBABILITY = 0.04;
const PINK_CLOUD_WINDOW: [number, number] = [45, 75];

const BALANCE_MILESTONES: { id: string; title: string; streakThreshold: number; narrativeText: string }[] = [
  {
    id: 'milestoneFindingRhythm',
    title: 'Finding a Rhythm',
    streakThreshold: 2,
    narrativeText: 'Two weeks running, nothing’s been on fire and nothing’s been neglected either. It’s starting to feel less like luck and more like a life.',
  },
  {
    id: 'milestoneHoldingSteady',
    title: 'Holding Steady',
    streakThreshold: 5,
    narrativeText: 'Over a month of showing up across the board — work, health, the people in your life, the plan for what’s next. Nobody’s handing out a medal for it. It still counts.',
  },
  {
    id: 'milestoneQuietlyDifferent',
    title: 'Quietly a Different Life',
    streakThreshold: 9,
    narrativeText: 'It’s been a couple months of just… living like this. Nobody around you is narrating it as a turning point. It’s just what your days look like now.',
  },
];

// --- Setup ---

export function createNewGameState(config: GameConfig): FastLaneSaveState {
  const stats: PlayerStats = {
    wellness: 55,
    stability: 55,
    direction: 55,
    connection: 55,
    money: 300,
  };

  const relationships: Record<RelationshipKey, RelationshipState> = {
    sponsor: { ...RELATIONSHIP_SEEDS.sponsor },
    family: { ...RELATIONSHIP_SEEDS.family },
    employer: { ...RELATIONSHIP_SEEDS.employer },
  };

  return {
    schemaVersion: 1,
    config,
    day: 1,
    currentBlock: 'morning',
    dailyPlan: { day: 1, morning: null, afternoon: null, evening: null },
    stats,
    recoveryCapital: calculateRecoveryCapital(stats),
    relationships,
    flags: {},
    activityCooldowns: {},
    blocksByDimensionThisWeek: { health: 0, home: 0, purpose: 0, community: 0 },
    workBlocksThisWeek: 0,
    crossroadsHistory: { lastCrossroadsDay: null, firedEventIds: [] },
    pinkCloudFired: false,
    milestonesUnlocked: [],
    log: [`Day 1 of ${config.totalDays}. One day at a time.`],
  };
}

// --- Availability (pure lookups) ---

export function getAvailableLocations(block: DayBlock) {
  return LOCATIONS.filter((location) => location.availableBlocks.includes(block));
}

export function getAvailableActivities(locationId: LocationId, state: FastLaneSaveState): ActivityDef[] {
  const location = LOCATIONS.find((l) => l.id === locationId);
  if (!location) return [];
  return location.activities.filter((activity) => !activity.requiresFlag || Boolean(state.flags[activity.requiresFlag]));
}

// --- Daily resolution ---

export function chooseActivity(
  state: FastLaneSaveState,
  block: DayBlock,
  choice: ActivityChoice,
): { state: FastLaneSaveState; outcomeText: string } {
  const location = LOCATIONS.find((l) => l.id === choice.locationId);
  if (!location) throw new Error(`Unknown location: ${choice.locationId}`);
  const activity = location.activities.find((a) => a.id === choice.activityId);
  if (!activity) throw new Error(`Unknown activity "${choice.activityId}" at location "${choice.locationId}"`);

  const multiplier = getDiminishingReturnsMultiplier(
    activity.id,
    state.activityCooldowns,
    state.day,
    activity.diminishingReturns,
  );

  const stats: PlayerStats = { ...state.stats };
  for (const key of Object.keys(activity.statDeltas) as StatKey[]) {
    const rawDelta = activity.statDeltas[key] ?? 0;
    stats[key] = clampStat(key, stats[key] + rawDelta * multiplier);
  }

  const moneyDelta = (activity.moneyGain ?? 0) - (activity.moneyCost ?? 0);
  if (moneyDelta !== 0) {
    stats.money = clampStat('money', stats.money + moneyDelta);
  }

  const relationships = { ...state.relationships };
  if (typeof activity.familyTrustDelta === 'number') {
    const family = relationships.family;
    relationships.family = {
      ...family,
      trust: clampTrust(family.trust + activity.familyTrustDelta),
      lastInteractionDay: state.day,
      recentOutcomeFlags: [...family.recentOutcomeFlags, activity.id].slice(-3),
    };
  }

  const blocksByDimensionThisWeek = { ...state.blocksByDimensionThisWeek };
  blocksByDimensionThisWeek[location.dimension] += 1;
  if (location.secondaryDimension) {
    blocksByDimensionThisWeek[location.secondaryDimension] += 0.5;
  }

  const workBlocksThisWeek = state.workBlocksThisWeek + (location.id === 'workplace' ? 1 : 0);

  const prevCooldownEntry = state.activityCooldowns[activity.id];
  const newStreak = computeNewStreak(prevCooldownEntry, state.day, activity.diminishingReturns);
  const activityCooldowns = {
    ...state.activityCooldowns,
    [activity.id]: { lastDay: state.day, streak: newStreak },
  };

  const outcomeText = resolveNarrativeVariant(activity, prevCooldownEntry?.streak ?? 0);

  const dailyPlan = { ...state.dailyPlan, [block]: choice };

  const nextState: FastLaneSaveState = {
    ...state,
    stats,
    relationships,
    blocksByDimensionThisWeek,
    workBlocksThisWeek,
    activityCooldowns,
    dailyPlan,
  };

  return { state: nextState, outcomeText };
}

export function resolveDayEnd(
  state: FastLaneSaveState,
): { state: FastLaneSaveState; logMessages: string[]; checkpointDue: boolean } {
  const logMessages: string[] = [];
  let workingState = state;

  const blocks: DayBlock[] = ['morning', 'afternoon', 'evening'];
  for (const block of blocks) {
    if (workingState.dailyPlan[block] === null) {
      const stats: PlayerStats = { ...workingState.stats };
      for (const key of Object.keys(QUIET_REST_DEFAULT.statDeltas) as StatKey[]) {
        const delta = QUIET_REST_DEFAULT.statDeltas[key] ?? 0;
        stats[key] = clampStat(key, stats[key] + delta);
      }
      workingState = { ...workingState, stats };
      logMessages.push(QUIET_REST_DEFAULT.narrativeVariants[0]);
    }
  }

  const nextDay = workingState.day + 1;
  const nextState: FastLaneSaveState = {
    ...workingState,
    day: nextDay,
    currentBlock: 'morning',
    dailyPlan: { day: nextDay, morning: null, afternoon: null, evening: null },
  };

  const checkpointDue = nextDay % 7 === 1;

  return { state: nextState, logMessages, checkpointDue };
}

// --- Weekly checkpoint ---

export function resolveWeeklyCheckpoint(
  state: FastLaneSaveState,
): { state: FastLaneSaveState; logMessages: string[]; milestone: MilestoneResult | null } {
  const logMessages: string[] = [];

  // (1) Obligations check — narrative-only, no lock-out/mechanical penalty.
  if (state.workBlocksThisWeek < WORK_BLOCK_QUOTA) {
    logMessages.push(
      `Work’s been lighter than usual this week (${state.workBlocksThisWeek} of ${WORK_BLOCK_QUOTA} expected blocks). Nothing’s happened because of it — just worth noticing.`,
    );
  } else {
    logMessages.push(`You kept up with work this week (${state.workBlocksThisWeek} blocks).`);
  }
  if (state.stats.stability < 35) {
    logMessages.push('Money’s tight enough that rent has been on your mind more than usual.');
  }

  // (2) Context-sensitive decay.
  const decayedState = applyContextSensitiveDecay(state);
  for (const dim of ROSC_DIMENSIONS) {
    if (state.blocksByDimensionThisWeek[dim] === 0) {
      logMessages.push(DECAY_NARRATIVE[dim]);
    }
  }

  // (3) Family trust — its own slower, separate cadence.
  const withFamilyTrust = recalculateFamilyTrust(decayedState);
  if (withFamilyTrust.relationships.family.trust < decayedState.relationships.family.trust) {
    logMessages.push(`It’s been a while since real time with ${withFamilyTrust.relationships.family.npcName} — that distance doesn’t close on its own.`);
  }

  // (4) Recovery Capital recalculation.
  const recoveryCapital = calculateRecoveryCapital(withFamilyTrust.stats);

  // (5) Milestone check.
  const allBalanced = ROSC_DIMENSIONS.every((dim) => withFamilyTrust.stats[DIMENSION_TO_STAT[dim]] >= 60);
  const prevStreak = Number(withFamilyTrust.flags.balanceStreakWeeks ?? 0);
  const newStreak = allBalanced ? prevStreak + 1 : 0;
  const flags = { ...withFamilyTrust.flags, balanceStreakWeeks: String(newStreak) };
  const stateForMilestoneCheck: FastLaneSaveState = { ...withFamilyTrust, flags };
  const milestone = checkMilestone(stateForMilestoneCheck);
  const milestonesUnlocked = milestone
    ? [...stateForMilestoneCheck.milestonesUnlocked, milestone.id]
    : stateForMilestoneCheck.milestonesUnlocked;
  if (milestone) {
    logMessages.push(milestone.narrativeText);
  }

  // (6) Reset weekly counters for the new window.
  const nextState: FastLaneSaveState = {
    ...stateForMilestoneCheck,
    recoveryCapital,
    milestonesUnlocked,
    blocksByDimensionThisWeek: { health: 0, home: 0, purpose: 0, community: 0 },
    workBlocksThisWeek: 0,
  };

  return { state: nextState, logMessages, milestone };
}

function applyContextSensitiveDecay(state: FastLaneSaveState): FastLaneSaveState {
  const stats: PlayerStats = { ...state.stats };
  for (const dim of ROSC_DIMENSIONS) {
    if (state.blocksByDimensionThisWeek[dim] === 0) {
      const statKey = DIMENSION_TO_STAT[dim];
      stats[statKey] = clampStat(statKey, stats[statKey] - DIMENSION_DECAY_AMOUNT);
    }
  }
  return { ...state, stats };
}

function recalculateFamilyTrust(state: FastLaneSaveState): FastLaneSaveState {
  const family = state.relationships.family;
  const lastDay = family.lastInteractionDay;
  const neglected = lastDay === null
    ? state.day >= FAMILY_NEGLECT_WINDOW_DAYS
    : state.day - lastDay >= FAMILY_NEGLECT_WINDOW_DAYS;
  if (!neglected) return state;

  return {
    ...state,
    relationships: {
      ...state.relationships,
      family: { ...family, trust: clampTrust(family.trust - FAMILY_TRUST_DECAY_AMOUNT) },
    },
  };
}

function checkMilestone(state: FastLaneSaveState): MilestoneResult | null {
  const streak = Number(state.flags.balanceStreakWeeks ?? 0);
  for (const milestone of BALANCE_MILESTONES) {
    if (streak >= milestone.streakThreshold && !state.milestonesUnlocked.includes(milestone.id)) {
      return { id: milestone.id, title: milestone.title, narrativeText: milestone.narrativeText };
    }
  }
  return null;
}

export function calculateRecoveryCapital(stats: PlayerStats): number {
  // Equal-weighted average of the four ROSC-linked stats — money excluded, since
  // Recovery Capital is framed around the four capitals, not cash (§4.2).
  return Math.round((stats.wellness + stats.stability + stats.direction + stats.connection) / 4);
}

export function getRecoveryCapitalLabel(value: number): string {
  const band = RECOVERY_CAPITAL_BANDS.find((b) => value <= b.max);
  return band ? band.label : RECOVERY_CAPITAL_BANDS[RECOVERY_CAPITAL_BANDS.length - 1].label;
}

// --- Diminishing returns ---

export function getDiminishingReturnsMultiplier(
  activityId: string,
  cooldownState: FastLaneSaveState['activityCooldowns'],
  day: number,
  dr: ActivityDef['diminishingReturns'],
): number {
  if (!dr) return 1;
  const entry = cooldownState[activityId];
  if (!entry || day - entry.lastDay >= dr.cooldownDays) return 1;
  const multiplier = dr.decayFactor ** entry.streak;
  return Math.max(DIMINISHING_RETURNS_FLOOR, multiplier);
}

function computeNewStreak(
  prevEntry: { lastDay: number; streak: number } | undefined,
  day: number,
  dr: ActivityDef['diminishingReturns'],
): number {
  // Streak counts uses-so-far within the window (1 after the first use, 2
  // after the second, etc.) so getDiminishingReturnsMultiplier's lookup on
  // the *next* use already reflects the prior use — i.e. the 2nd use of an
  // activity is the first one to see a discount, not the 3rd.
  if (!prevEntry) return 1;
  if (dr && day - prevEntry.lastDay >= dr.cooldownDays) return 1; // window expired — reset
  return prevEntry.streak + 1;
}

// --- Events (two-tier) ---

export function checkCrossroadsTrigger(state: FastLaneSaveState): EventDef | null {
  // Simplification: "recently-visited locations" is read as "locations chosen
  // so far today" (today's already-filled dailyPlan blocks), rather than a
  // multi-day visit history — the save-state doesn't track a rolling
  // recent-visit log, and this keeps the trigger legible without one.
  const todaysLocations = new Set<LocationId>();
  (['morning', 'afternoon', 'evening'] as DayBlock[]).forEach((block) => {
    const choice = state.dailyPlan[block];
    if (choice) todaysLocations.add(choice.locationId);
  });

  const eligible = CROSSROADS_EVENTS.filter((event) => {
    // Pink Cloud events are gated exclusively through rollPinkCloud()'s own
    // dedicated probability/window/guard — never through this generic roll.
    if (event.isPinkCloud) return false;

    const tc = event.triggerConditions;

    if (tc.locationIds && !tc.locationIds.some((id) => todaysLocations.has(id))) return false;

    if (tc.statThresholds) {
      for (const key of Object.keys(tc.statThresholds) as StatKey[]) {
        const threshold = tc.statThresholds[key];
        if (!threshold) continue;
        const value = state.stats[key];
        if (threshold.below !== undefined && !(value < threshold.below)) return false;
        if (threshold.above !== undefined && !(value > threshold.above)) return false;
      }
    }

    if (tc.dayRange && (state.day < tc.dayRange[0] || state.day > tc.dayRange[1])) return false;

    if (tc.minDaysSinceLastCrossroads !== undefined) {
      const last = state.crossroadsHistory.lastCrossroadsDay;
      if (last !== null && state.day - last < tc.minDaysSinceLastCrossroads) return false;
    }

    if (tc.requiresFlag && !state.flags[tc.requiresFlag]) return false;

    if (tc.minTotalDays !== undefined && state.config.totalDays < tc.minTotalDays) return false;

    return true;
  });

  if (eligible.length === 0) return null;
  if (Math.random() > CROSSROADS_FIRE_PROBABILITY) return null;

  const totalWeight = eligible.reduce((sum, event) => sum + event.weight, 0);
  let roll = Math.random() * totalWeight;
  for (const event of eligible) {
    roll -= event.weight;
    if (roll <= 0) return event;
  }
  return eligible[eligible.length - 1];
}

export function rollPinkCloud(state: FastLaneSaveState): boolean {
  if (state.config.totalDays === 30) return false;
  if (state.pinkCloudFired) return false;
  if (state.day < PINK_CLOUD_WINDOW[0] || state.day > PINK_CLOUD_WINDOW[1]) return false;
  return Math.random() < PINK_CLOUD_DAILY_PROBABILITY;
}

export function resolveEventChoice(
  state: FastLaneSaveState,
  event: EventDef,
  choiceIndex: number,
): { state: FastLaneSaveState; outcomeText: string } {
  const choice = event.choices[choiceIndex];
  if (!choice) throw new Error(`Invalid choice index ${choiceIndex} for event "${event.id}"`);

  const stats: PlayerStats = { ...state.stats };
  for (const key of Object.keys(choice.statDeltas) as StatKey[]) {
    const delta = choice.statDeltas[key] ?? 0;
    stats[key] = clampStat(key, stats[key] + delta);
  }
  if (choice.moneyDelta) {
    stats.money = clampStat('money', stats.money + choice.moneyDelta);
  }

  const relationships = { ...state.relationships };
  if (typeof choice.familyTrustDelta === 'number') {
    const family = relationships.family;
    relationships.family = {
      ...family,
      trust: clampTrust(family.trust + choice.familyTrustDelta),
      lastInteractionDay: state.day,
      recentOutcomeFlags: [...family.recentOutcomeFlags, event.id].slice(-3),
    };
  }

  const flags = choice.setsFlag ? { ...state.flags, [choice.setsFlag]: true } : state.flags;

  const crossroadsHistory = {
    lastCrossroadsDay: state.day,
    firedEventIds: [...state.crossroadsHistory.firedEventIds, event.id],
  };

  const nextState: FastLaneSaveState = {
    ...state,
    stats,
    relationships,
    flags,
    crossroadsHistory,
    pinkCloudFired: event.isPinkCloud ? true : state.pinkCloudFired,
  };

  return { state: nextState, outcomeText: choice.outcomeText };
}

// --- Ending ---

export function isGameComplete(state: FastLaneSaveState): boolean {
  return state.day > state.config.totalDays;
}

export function getEndingReflection(state: FastLaneSaveState): {
  summaryText: string;
  perDimensionRead: Record<RoscDimension, string>;
  milestonesRecap: string[];
} {
  const perDimensionRead: Record<RoscDimension, string> = {
    health: describeDimension(state.stats.wellness),
    home: describeDimension(state.stats.stability),
    purpose: describeDimension(state.stats.direction),
    community: describeDimension(state.stats.connection),
  };

  const rcLabel = getRecoveryCapitalLabel(state.recoveryCapital);

  const prioritySummary = state.config.priorities.length > 0
    ? ` On the things you said mattered most — ${state.config.priorities
      .map((dim) => `${DIMENSION_LABEL[dim]} (${perDimensionRead[dim]})`)
      .join(', ')}.`
    : '';

  const summaryText = `${state.config.totalDays} days in, you're ${rcLabel}.${prioritySummary} No pass or fail here — just where things landed.`;

  return {
    summaryText,
    perDimensionRead,
    milestonesRecap: [...state.milestonesUnlocked],
  };
}

function describeDimension(value: number): string {
  if (value < 20) return 'struggled to get traction';
  if (value < 40) return 'stayed shaky';
  if (value < 60) return 'found some footing';
  if (value < 80) return 'held pretty steady';
  return 'stood on solid ground';
}

// --- Utility ---

function clampStat(key: StatKey, value: number): number {
  if (key === 'money') return Math.max(0, Math.round(value));
  return Math.min(100, Math.max(0, Math.round(value)));
}

function clampTrust(value: number): number {
  return Math.min(100, Math.max(0, Math.round(value)));
}

function resolveNarrativeVariant(activity: ActivityDef, cooldownStreak: number): string {
  const variants = activity.narrativeVariants;
  if (variants.length === 0) return '';
  const index = cooldownStreak % variants.length;
  return variants[index];
}
