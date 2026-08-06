/**
 * src/lib/fastLane/__tests__/gameData.test.ts
 * Content-integrity tests for "One Day at a Time"'s 11-location ROSC board
 * and Crossroads event pool. Covers both structural correctness (every
 * LocationId represented, valid trigger-condition keys, choice counts) and
 * the MVP checklist's hard content-integrity requirements (Quiet Rest can't
 * out-value an actual Health Clinic visit, sponsor pushback events exist,
 * Pink Cloud events never surface through Work/Money).
 */
import { describe, it, expect } from 'vitest';
import { LOCATIONS, CROSSROADS_EVENTS, RELATIONSHIP_SEEDS, RECOVERY_CAPITAL_BANDS, WORK_BLOCK_QUOTA } from '../gameData';
import { QUIET_REST_DEFAULT } from '../types';
import type { LocationId, StatKey } from '../types';

const ALL_LOCATION_IDS: LocationId[] = [
  'home', 'workplace', 'employmentCenter', 'meetingHall', 'sponsorHouse',
  'serviceCenter', 'healthClinic', 'bank', 'school', 'familyFriends', 'cornerStore',
];

const ALL_STAT_KEYS: StatKey[] = ['wellness', 'stability', 'direction', 'connection', 'money'];

// Same discipline as the legacy Fast Lane compliance scrub (fellowship names,
// branded program names, verbatim literature/Step quotes are never
// appropriate in generic game content), re-pointed at the new location and
// Crossroads narrative text.
const DENYLIST = [
  /\balcoholics anonymous\b/i,
  /\bnarcotics anonymous\b/i,
  /\bal-anon\b/i,
  /\bbig book\b/i,
  /\bbasic text\b/i,
  /\bwhite book\b/i,
  /\brecovery dharma\b/i,
  /\bsmart recovery\b/i,
  /\b12[\s-]step meeting\b/i,
  /\btwelve[\s-]step meeting\b/i,
  /\bbill wilson\b/i,
  /\bdr\.? bob\b/i,
];

function collectAllNarrativeText(): string[] {
  const strings: string[] = [];
  for (const location of LOCATIONS) {
    for (const activity of location.activities) {
      strings.push(activity.label, ...activity.narrativeVariants);
    }
  }
  for (const event of CROSSROADS_EVENTS) {
    strings.push(event.title);
    for (const choice of event.choices) {
      strings.push(choice.label, choice.outcomeText);
    }
  }
  return strings;
}

describe('🛡️ One Day at a Time content compliance scrub', () => {
  it('contains no fellowship names, branded program names, or literal Step/literature references', () => {
    const allText = collectAllNarrativeText();
    const violations: Array<{ text: string; pattern: string }> = [];

    for (const text of allText) {
      for (const pattern of DENYLIST) {
        if (pattern.test(text)) {
          violations.push({ text, pattern: pattern.toString() });
        }
      }
    }

    expect(violations).toEqual([]);
  });
});

describe('🗺️ LOCATIONS', () => {
  it('has exactly one LocationDef for every LocationId, with no duplicates', () => {
    expect(LOCATIONS).toHaveLength(ALL_LOCATION_IDS.length);
    const ids = LOCATIONS.map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ALL_LOCATION_IDS) {
      expect(ids).toContain(id);
    }
  });

  it('gives every location at least one activity with at least 2 narrativeVariants', () => {
    for (const location of LOCATIONS) {
      const qualifying = location.activities.filter((a) => a.narrativeVariants.length >= 2);
      expect(qualifying.length, `${location.id} has no activity with >=2 narrativeVariants`).toBeGreaterThan(0);
    }
  });

  it('gives every activity at least 2 narrativeVariants (stronger content bar than the MVP minimum)', () => {
    for (const location of LOCATIONS) {
      for (const activity of location.activities) {
        expect(
          activity.narrativeVariants.length,
          `${location.id}/${activity.id} has fewer than 2 narrativeVariants`,
        ).toBeGreaterThanOrEqual(2);
      }
    }
  });

  it('gives every location 2-4 activities', () => {
    for (const location of LOCATIONS) {
      expect(location.activities.length).toBeGreaterThanOrEqual(2);
      expect(location.activities.length).toBeLessThanOrEqual(4);
    }
  });

  it('gives every location at least one available block', () => {
    for (const location of LOCATIONS) {
      expect(location.availableBlocks.length).toBeGreaterThan(0);
    }
  });

  it("Health Clinic has an activity with a wellness gain strictly greater than Quiet Rest's default (MVP hard requirement)", () => {
    const healthClinic = LOCATIONS.find((l) => l.id === 'healthClinic');
    expect(healthClinic).toBeDefined();
    const quietRestWellness = QUIET_REST_DEFAULT.statDeltas.wellness ?? 0;
    for (const activity of healthClinic!.activities) {
      const wellnessDelta = activity.statDeltas.wellness ?? 0;
      expect(wellnessDelta, `${activity.id} does not exceed Quiet Rest's wellness delta`).toBeGreaterThan(quietRestWellness);
    }
    // At least one must exist and actually be greater — guards against every activity being 0.
    expect(healthClinic!.activities.some((a) => (a.statDeltas.wellness ?? 0) > quietRestWellness)).toBe(true);
  });
});

describe('🚦 CROSSROADS_EVENTS', () => {
  it('gives every event 2 or 3 choices', () => {
    for (const event of CROSSROADS_EVENTS) {
      expect([2, 3]).toContain(event.choices.length);
    }
  });

  it('references only real LocationIds in triggerConditions.locationIds', () => {
    for (const event of CROSSROADS_EVENTS) {
      const locationIds = event.triggerConditions.locationIds;
      if (!locationIds) continue;
      for (const id of locationIds) {
        expect(ALL_LOCATION_IDS, `${event.id} references unknown location "${id}"`).toContain(id);
      }
    }
  });

  it('references only real StatKeys in triggerConditions.statThresholds', () => {
    for (const event of CROSSROADS_EVENTS) {
      const statThresholds = event.triggerConditions.statThresholds;
      if (!statThresholds) continue;
      for (const key of Object.keys(statThresholds)) {
        expect(ALL_STAT_KEYS, `${event.id} references unknown stat "${key}"`).toContain(key);
      }
    }
  });

  it('has no duplicate event ids', () => {
    const ids = CROSSROADS_EVENTS.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('has at least 2-3 events representing sponsor pushback, tied to sponsorHouse', () => {
    const sponsorEvents = CROSSROADS_EVENTS.filter((e) => e.triggerConditions.locationIds?.includes('sponsorHouse'));
    expect(sponsorEvents.length).toBeGreaterThanOrEqual(2);
  });

  it('flags exactly 1-2 events as isPinkCloud', () => {
    const pinkCloudEvents = CROSSROADS_EVENTS.filter((e) => e.isPinkCloud === true);
    expect(pinkCloudEvents.length).toBeGreaterThanOrEqual(1);
    expect(pinkCloudEvents.length).toBeLessThanOrEqual(2);
  });

  it('never surfaces a Pink Cloud event through workplace or bank (would read as a productivity failure)', () => {
    const pinkCloudEvents = CROSSROADS_EVENTS.filter((e) => e.isPinkCloud === true);
    for (const event of pinkCloudEvents) {
      expect(event.triggerConditions.locationIds).toBeDefined();
      expect(event.triggerConditions.locationIds).not.toContain('workplace');
      expect(event.triggerConditions.locationIds).not.toContain('bank');
    }
  });

  it('constrains every Pink Cloud event to the day 45-75 / 60+-day-mode window', () => {
    const pinkCloudEvents = CROSSROADS_EVENTS.filter((e) => e.isPinkCloud === true);
    for (const event of pinkCloudEvents) {
      expect(event.triggerConditions.dayRange).toEqual([45, 75]);
      expect(event.triggerConditions.minTotalDays).toBe(60);
    }
  });
});

describe('🤝 RELATIONSHIP_SEEDS', () => {
  it('seeds all three relationship keys with a name and a trust value in range', () => {
    for (const key of ['sponsor', 'family', 'employer'] as const) {
      const seed = RELATIONSHIP_SEEDS[key];
      expect(seed.key).toBe(key);
      expect(seed.npcName.length).toBeGreaterThan(0);
      expect(seed.trust).toBeGreaterThanOrEqual(0);
      expect(seed.trust).toBeLessThanOrEqual(100);
      expect(seed.lastInteractionDay).toBeNull();
      expect(seed.recentOutcomeFlags).toEqual([]);
    }
  });
});

describe('📊 RECOVERY_CAPITAL_BANDS / WORK_BLOCK_QUOTA', () => {
  it('defines bands covering the full 0-100 range in ascending order', () => {
    expect(RECOVERY_CAPITAL_BANDS[RECOVERY_CAPITAL_BANDS.length - 1].max).toBe(100);
    for (let i = 1; i < RECOVERY_CAPITAL_BANDS.length; i++) {
      expect(RECOVERY_CAPITAL_BANDS[i].max).toBeGreaterThan(RECOVERY_CAPITAL_BANDS[i - 1].max);
    }
  });

  it('sets a work-block quota within the 21-blocks-per-week ceiling', () => {
    expect(WORK_BLOCK_QUOTA).toBeGreaterThan(0);
    expect(WORK_BLOCK_QUOTA).toBeLessThan(21);
  });
});
