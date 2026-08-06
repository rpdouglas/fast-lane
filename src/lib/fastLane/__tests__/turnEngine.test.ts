import { describe, it, expect, vi, afterEach } from 'vitest';
import type { EventDef, FastLaneSaveState, GameConfig, LocationId } from '../types';

// vi.mock below is hoisted above this file's imports, so the fixture list it
// references has to be created via vi.hoisted() rather than a plain
// top-level const (see https://vitest.dev/api/vi.html#vi-hoisted).
const { FIXTURE_EVENTS } = vi.hoisted(() => {
  const FIXTURE_EVENTS: EventDef[] = [
    {
      id: 'evtA',
      title: 'Plain location-gated event',
      triggerConditions: { locationIds: ['home'] },
      weight: 5,
      choices: [
        { label: 'Choice 1', statDeltas: { wellness: 1 }, outcomeText: 'Outcome 1' },
        { label: 'Choice 2', statDeltas: { wellness: -1 }, outcomeText: 'Outcome 2' },
      ],
    },
    {
      id: 'evtStatGate',
      title: 'Stat-threshold-gated event',
      triggerConditions: { locationIds: ['bank'], statThresholds: { stability: { below: 40 } } },
      weight: 5,
      choices: [
        { label: 'Choice 1', statDeltas: {}, outcomeText: 'Outcome 1' },
        { label: 'Choice 2', statDeltas: {}, outcomeText: 'Outcome 2' },
      ],
    },
    {
      id: 'evtDayRange',
      title: 'Day-range-gated event',
      triggerConditions: { locationIds: ['school'], dayRange: [10, 20] },
      weight: 5,
      choices: [
        { label: 'Choice 1', statDeltas: {}, outcomeText: 'Outcome 1' },
        { label: 'Choice 2', statDeltas: {}, outcomeText: 'Outcome 2' },
      ],
    },
    {
      id: 'evtCooldown',
      title: 'Cooldown-gated event',
      triggerConditions: { locationIds: ['employmentCenter'], minDaysSinceLastCrossroads: 5 },
      weight: 5,
      choices: [
        { label: 'Choice 1', statDeltas: {}, outcomeText: 'Outcome 1' },
        { label: 'Choice 2', statDeltas: {}, outcomeText: 'Outcome 2' },
      ],
    },
    {
      id: 'evtFlag',
      title: 'Flag-gated event',
      triggerConditions: { locationIds: ['serviceCenter'], requiresFlag: 'metSponsor' },
      weight: 5,
      choices: [
        { label: 'Choice 1', statDeltas: {}, outcomeText: 'Outcome 1' },
        { label: 'Choice 2', statDeltas: {}, outcomeText: 'Outcome 2' },
      ],
    },
    {
      id: 'evtPink',
      title: 'Pink Cloud fixture event',
      triggerConditions: { locationIds: ['healthClinic'], dayRange: [45, 75], minTotalDays: 60 },
      weight: 5,
      isPinkCloud: true,
      choices: [
        { label: 'Choice 1', statDeltas: {}, outcomeText: 'Outcome 1' },
        { label: 'Choice 2', statDeltas: {}, outcomeText: 'Outcome 2' },
      ],
    },
  ];
  return { FIXTURE_EVENTS };
});

vi.mock('../gameData', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../gameData')>();
  return { ...actual, CROSSROADS_EVENTS: FIXTURE_EVENTS };
});

import {
  createNewGameState,
  chooseActivity,
  resolveDayEnd,
  resolveWeeklyCheckpoint,
  calculateRecoveryCapital,
  getRecoveryCapitalLabel,
  getDiminishingReturnsMultiplier,
  checkCrossroadsTrigger,
  rollPinkCloud,
  resolveEventChoice,
  isGameComplete,
  getEndingReflection,
} from '../turnEngine';

function freshState(overrides: Partial<FastLaneSaveState> = {}, config: Partial<GameConfig> = {}): FastLaneSaveState {
  const base = createNewGameState({ totalDays: 60, priorities: [], ...config });
  return { ...base, ...overrides };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('🎮 createNewGameState', () => {
  it.each([30, 60, 90] as const)('produces a valid, complete save state for a %i-day game', (totalDays) => {
    const state = createNewGameState({ totalDays, priorities: ['health'] });

    expect(state.schemaVersion).toBe(1);
    expect(state.day).toBe(1);
    expect(state.currentBlock).toBe('morning');
    expect(state.dailyPlan).toEqual({ day: 1, morning: null, afternoon: null, evening: null });
    expect(state.stats.money).toBeGreaterThanOrEqual(0);
    for (const key of ['wellness', 'stability', 'direction', 'connection'] as const) {
      expect(state.stats[key]).toBeGreaterThanOrEqual(0);
      expect(state.stats[key]).toBeLessThanOrEqual(100);
    }
    expect(state.relationships.sponsor).toBeDefined();
    expect(state.relationships.family).toBeDefined();
    expect(state.relationships.employer).toBeDefined();
    expect(state.flags).toEqual({});
    expect(state.activityCooldowns).toEqual({});
    expect(state.blocksByDimensionThisWeek).toEqual({ health: 0, home: 0, purpose: 0, community: 0 });
    expect(state.workBlocksThisWeek).toBe(0);
    expect(state.crossroadsHistory).toEqual({ lastCrossroadsDay: null, firedEventIds: [] });
    expect(state.pinkCloudFired).toBe(false);
    expect(state.milestonesUnlocked).toEqual([]);
    expect(state.log.length).toBeGreaterThan(0);
    expect(state.recoveryCapital).toBe(calculateRecoveryCapital(state.stats));
  });
});

describe('🎮 chooseActivity — diminishing returns', () => {
  it('applies the full stat delta on the first use of an activity with diminishing returns', () => {
    const state = freshState({ day: 1 });
    const { state: next } = chooseActivity(state, 'morning', { locationId: 'workplace', activityId: 'workShift' });

    // workShift: direction +2, wellness -1, full value on first use.
    expect(next.stats.direction).toBe(state.stats.direction + 2);
    expect(next.stats.wellness).toBe(state.stats.wellness - 1);
  });

  it('reduces the stat delta on a repeat use within the cooldown window', () => {
    let state = freshState({ day: 1 });
    ({ state } = chooseActivity(state, 'morning', { locationId: 'workplace', activityId: 'workShift' }));
    const directionAfterFirst = state.stats.direction;

    // workShift's cooldown is 2 days — day 2 is still within the window.
    state = { ...state, day: 2 };
    ({ state } = chooseActivity(state, 'morning', { locationId: 'workplace', activityId: 'workShift' }));

    const multiplier = getDiminishingReturnsMultiplier('workShift', { workShift: { lastDay: 1, streak: 1 } }, 2, {
      cooldownDays: 2,
      decayFactor: 0.7,
    });
    expect(multiplier).toBeLessThan(1);
    expect(state.stats.direction - directionAfterFirst).toBeLessThan(2);
    expect(state.stats.direction - directionAfterFirst).toBeGreaterThan(0);
  });

  it('resets to full value once the gap reaches the cooldown window', () => {
    let state = freshState({ day: 1 });
    ({ state } = chooseActivity(state, 'morning', { locationId: 'workplace', activityId: 'workShift' })); // day 1
    state = { ...state, day: 2 };
    ({ state } = chooseActivity(state, 'morning', { locationId: 'workplace', activityId: 'workShift' })); // day 2, within window
    const directionAfterSecond = state.stats.direction;

    // Gap of 3 days from day 2 >= the 2-day cooldown — should be back to full value.
    state = { ...state, day: 5 };
    ({ state } = chooseActivity(state, 'morning', { locationId: 'workplace', activityId: 'workShift' }));

    expect(state.stats.direction - directionAfterSecond).toBe(2);
  });
});

describe('🎮 getDiminishingReturnsMultiplier', () => {
  it('returns 1 when no diminishingReturns config is present', () => {
    expect(getDiminishingReturnsMultiplier('anything', {}, 5, undefined)).toBe(1);
  });

  it('returns 1 when there is no prior cooldown entry', () => {
    expect(getDiminishingReturnsMultiplier('act', {}, 5, { cooldownDays: 3, decayFactor: 0.5 })).toBe(1);
  });

  it('never drops below the sane floor', () => {
    const cooldownState = { act: { lastDay: 1, streak: 20 } };
    const multiplier = getDiminishingReturnsMultiplier('act', cooldownState, 2, { cooldownDays: 5, decayFactor: 0.1 });
    expect(multiplier).toBeGreaterThanOrEqual(0.2);
  });
});

describe('🎮 resolveDayEnd', () => {
  it('auto-fills unfilled blocks with QUIET_REST_DEFAULT effects', () => {
    let state = freshState({ day: 1 });
    ({ state } = chooseActivity(state, 'morning', { locationId: 'home', activityId: 'homeChores' }));
    const wellnessBeforeDayEnd = state.stats.wellness;

    const result = resolveDayEnd(state);

    // afternoon + evening were left null -> two Quiet Rest applications (+1 wellness each).
    expect(result.state.stats.wellness).toBe(wellnessBeforeDayEnd + 2);
  });

  it('advances the day counter and resets the daily plan', () => {
    const state = freshState({ day: 3 });
    const result = resolveDayEnd(state);

    expect(result.state.day).toBe(4);
    expect(result.state.dailyPlan).toEqual({ day: 4, morning: null, afternoon: null, evening: null });
    expect(result.state.currentBlock).toBe('morning');
  });

  it('signals a checkpoint is due exactly when a new 7-day window starts', () => {
    // day 6 -> day 7: not yet a new window.
    expect(resolveDayEnd(freshState({ day: 6 })).checkpointDue).toBe(false);
    // day 7 -> day 8: day 8 starts week 2 (8 % 7 === 1).
    expect(resolveDayEnd(freshState({ day: 7 })).checkpointDue).toBe(true);
  });
});

describe('🎮 resolveWeeklyCheckpoint — context-sensitive decay', () => {
  it('decays a dimension with zero blocks that week', () => {
    const state = freshState({
      blocksByDimensionThisWeek: { health: 0, home: 2, purpose: 2, community: 2 },
    });
    const result = resolveWeeklyCheckpoint(state);

    expect(result.state.stats.wellness).toBeLessThan(state.stats.wellness);
  });

  it('does not decay a dimension touched even once, including via a secondaryDimension credit', () => {
    const state = freshState({
      blocksByDimensionThisWeek: { health: 2, home: 2, purpose: 0.5, community: 2 },
    });
    const result = resolveWeeklyCheckpoint(state);

    expect(result.state.stats.direction).toBe(state.stats.direction);
  });

  it('resets weekly counters for the new window', () => {
    const state = freshState({
      blocksByDimensionThisWeek: { health: 3, home: 3, purpose: 3, community: 3 },
      workBlocksThisWeek: 5,
    });
    const result = resolveWeeklyCheckpoint(state);

    expect(result.state.blocksByDimensionThisWeek).toEqual({ health: 0, home: 0, purpose: 0, community: 0 });
    expect(result.state.workBlocksThisWeek).toBe(0);
  });

  it('recalculates recoveryCapital from post-decay stats', () => {
    const state = freshState({
      blocksByDimensionThisWeek: { health: 0, home: 0, purpose: 0, community: 0 },
    });
    const result = resolveWeeklyCheckpoint(state);

    expect(result.state.recoveryCapital).toBe(calculateRecoveryCapital(result.state.stats));
  });
});

describe('🎮 Family Trust decoupling (MVP checklist item)', () => {
  it('does not move relationships.family.trust from a Connection-heavy week of Meeting Hall visits alone', () => {
    let state = freshState({ day: 1 });
    const startingTrust = state.relationships.family.trust;

    for (let day = 1; day <= 5; day++) {
      state = { ...state, day };
      ({ state } = chooseActivity(state, 'evening', { locationId: 'meetingHall', activityId: 'meetingShare' }));
    }

    expect(state.stats.connection).toBeGreaterThan(freshState().stats.connection);
    expect(state.relationships.family.trust).toBe(startingTrust);
  });

  it('only moves relationships.family.trust via familyFriends activities, and by a smaller margin than the paired Connection gain', () => {
    const state = freshState({ day: 1 });
    const startingTrust = state.relationships.family.trust;

    const { state: next } = chooseActivity(state, 'afternoon', { locationId: 'familyFriends', activityId: 'familyDinner' });

    const connectionGain = next.stats.connection - state.stats.connection;
    const trustGain = next.relationships.family.trust - startingTrust;

    expect(trustGain).toBeGreaterThan(0);
    expect(trustGain).toBeLessThan(connectionGain);
  });

  it('decays family trust only after 2+ consecutive checkpoints (14+ days) of zero familyFriends contact', () => {
    const neglectedState = freshState({ day: 14 });
    const result = resolveWeeklyCheckpoint(neglectedState);
    expect(result.state.relationships.family.trust).toBeLessThan(neglectedState.relationships.family.trust);

    const freshlyStartedState = freshState({ day: 7 });
    const earlyResult = resolveWeeklyCheckpoint(freshlyStartedState);
    expect(earlyResult.state.relationships.family.trust).toBe(freshlyStartedState.relationships.family.trust);
  });
});

describe('🎮 Money floor', () => {
  it('never lets money go negative via chooseActivity', () => {
    const state = freshState({ day: 1, stats: { ...freshState().stats, money: 5 } });
    const { state: next } = chooseActivity(state, 'evening', { locationId: 'school', activityId: 'schoolAttendClass' });

    expect(next.stats.money).toBe(0);
  });

  it('never lets money go negative via resolveEventChoice', () => {
    const state = freshState({ day: 1, stats: { ...freshState().stats, money: 5 } });
    const bigNegativeEvent: EventDef = {
      id: 'testNegativeMoney',
      title: 'test',
      triggerConditions: {},
      weight: 1,
      choices: [{ label: 'x', statDeltas: {}, moneyDelta: -500, outcomeText: 'x' }],
    };

    const { state: next } = resolveEventChoice(state, bigNegativeEvent, 0);
    expect(next.stats.money).toBe(0);
  });
});

describe('🎮 rollPinkCloud', () => {
  it('never fires for a 30-day game, even inside the window with a guaranteed-fire roll', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const state = freshState({ day: 50 }, { totalDays: 30 });
    expect(rollPinkCloud(state)).toBe(false);
  });

  it('never fires outside the day 45-75 window for 60/90-day games', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    expect(rollPinkCloud(freshState({ day: 44 }, { totalDays: 60 }))).toBe(false);
    expect(rollPinkCloud(freshState({ day: 76 }, { totalDays: 60 }))).toBe(false);
  });

  it('can fire within the window for 60/90-day games when the roll succeeds', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    expect(rollPinkCloud(freshState({ day: 60 }, { totalDays: 60 }))).toBe(true);
    expect(rollPinkCloud(freshState({ day: 60 }, { totalDays: 90 }))).toBe(true);
  });

  it('does not fire when the roll misses, even inside the window', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99);
    expect(rollPinkCloud(freshState({ day: 60 }, { totalDays: 60 }))).toBe(false);
  });

  it('never fires twice — guarded by pinkCloudFired', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const state = freshState({ day: 60, pinkCloudFired: true }, { totalDays: 60 });
    expect(rollPinkCloud(state)).toBe(false);
  });
});

describe('🎮 checkCrossroadsTrigger', () => {
  function withVisit(locationId: LocationId, overrides: Partial<FastLaneSaveState> = {}): FastLaneSaveState {
    const state = freshState({ day: 15, ...overrides });
    return {
      ...state,
      dailyPlan: { ...state.dailyPlan, morning: { locationId, activityId: 'x' } },
    };
  }

  it('returns null when no candidate event matches today’s visited location', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const state = withVisit('cornerStore');
    expect(checkCrossroadsTrigger(state)).toBeNull();
  });

  it('respects statThresholds — ineligible when the threshold is not met', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const state = withVisit('bank', { stats: { ...freshState().stats, stability: 80 } });
    expect(checkCrossroadsTrigger(state)).toBeNull();
  });

  it('respects statThresholds — eligible once the threshold is met', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const state = withVisit('bank', { stats: { ...freshState().stats, stability: 20 } });
    expect(checkCrossroadsTrigger(state)?.id).toBe('evtStatGate');
  });

  it('respects dayRange — ineligible outside the range', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const state = withVisit('school', { day: 5 });
    expect(checkCrossroadsTrigger(state)).toBeNull();
  });

  it('respects dayRange — eligible inside the range', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const state = withVisit('school', { day: 15 });
    expect(checkCrossroadsTrigger(state)?.id).toBe('evtDayRange');
  });

  it('respects minDaysSinceLastCrossroads — ineligible too soon after the last Crossroads', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const state = withVisit('employmentCenter', {
      day: 15,
      crossroadsHistory: { lastCrossroadsDay: 13, firedEventIds: [] },
    });
    expect(checkCrossroadsTrigger(state)).toBeNull();
  });

  it('respects minDaysSinceLastCrossroads — eligible once enough days have passed', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const state = withVisit('employmentCenter', {
      day: 15,
      crossroadsHistory: { lastCrossroadsDay: 5, firedEventIds: [] },
    });
    expect(checkCrossroadsTrigger(state)?.id).toBe('evtCooldown');
  });

  it('respects requiresFlag — ineligible without the flag', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const state = withVisit('serviceCenter', { flags: {} });
    expect(checkCrossroadsTrigger(state)).toBeNull();
  });

  it('respects requiresFlag — eligible once the flag is set', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const state = withVisit('serviceCenter', { flags: { metSponsor: true } });
    expect(checkCrossroadsTrigger(state)?.id).toBe('evtFlag');
  });

  it('never returns an isPinkCloud event, even when its conditions are otherwise met', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const state = withVisit('healthClinic', { day: 50 });
    expect(checkCrossroadsTrigger(state)).toBeNull();
  });

  it('does not fire every time it is eligible — respects the base per-day probability', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99);
    const state = withVisit('home');
    expect(checkCrossroadsTrigger(state)).toBeNull();
  });
});

describe('🎮 isGameComplete / getEndingReflection', () => {
  it('is not complete while day <= totalDays', () => {
    expect(isGameComplete(freshState({ day: 60 }, { totalDays: 60 }))).toBe(false);
  });

  it('is complete once day exceeds totalDays', () => {
    expect(isGameComplete(freshState({ day: 61 }, { totalDays: 60 }))).toBe(true);
  });

  it('returns a well-formed, non-throwing reflection for a completed game', () => {
    const state = freshState({ day: 61 }, { totalDays: 60, priorities: ['health', 'community'] });
    const reflection = getEndingReflection(state);

    expect(typeof reflection.summaryText).toBe('string');
    expect(reflection.summaryText.length).toBeGreaterThan(0);
    expect(Object.keys(reflection.perDimensionRead).sort()).toEqual(['community', 'health', 'home', 'purpose']);
    expect(Array.isArray(reflection.milestonesRecap)).toBe(true);
  });
});

describe('🎮 getRecoveryCapitalLabel', () => {
  it('maps low recovery capital to the lowest band', () => {
    expect(getRecoveryCapitalLabel(0)).toBe('on shaky ground');
  });

  it('maps high recovery capital to the highest band', () => {
    expect(getRecoveryCapitalLabel(100)).toBe('solid ground');
  });
});
