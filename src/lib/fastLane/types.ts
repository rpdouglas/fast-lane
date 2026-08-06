// src/lib/fastLane/types.ts
// "One Day at a Time" (working title "Fast Lane") — hybrid daily/weekly
// ROSC-framework life-sim. See docs/Design/fast-lane_master_design_document.md
// for the full spec these types implement (§4.2 stat model, §4.3
// location/activity shapes, §4.4 two-tier event system, §4.5 game length).
//
// The `FastLane`-prefixed naming convention (file paths, this save-state type
// name) is internal namespacing carried over from the game's original working
// title and is not user-facing — it stays as-is.

export type DayBlock = 'morning' | 'afternoon' | 'evening';

export type StatKey = 'wellness' | 'stability' | 'direction' | 'connection' | 'money';
// The 5 visible stats (§4.2). Recovery Capital is a derived/hidden aggregate, not a
// StatKey. Family Trust is its own slower-moving relationship value, not a StatKey.

export type RoscDimension = 'health' | 'home' | 'purpose' | 'community';

export type LocationId =
  | 'home' | 'workplace' | 'employmentCenter' | 'meetingHall' | 'sponsorHouse'
  | 'serviceCenter' | 'healthClinic' | 'bank' | 'school' | 'familyFriends' | 'cornerStore';
// The 11-row §3 table. Legal Aid/Cultural Center are explicitly "optional/expansion" —
// excluded from v1.

export type RelationshipKey = 'sponsor' | 'family' | 'employer';

export interface RelationshipState {
  key: RelationshipKey;
  npcName: string;
  trust: number;                    // 0–100. Only `family` is the mechanically decoupled
                                     // "Family Trust" from §4.2; sponsor/employer trust is
                                     // data-model-only for v1 ("light population at launch").
  lastInteractionDay: number | null;
  recentOutcomeFlags: string[];     // capped ring buffer (last 3), feeds future relationship memory.
}

export interface LocationDef {
  id: LocationId;
  name: string;
  dimension: RoscDimension;
  secondaryDimension?: RoscDimension;
  availableBlocks: DayBlock[];
  activities: ActivityDef[];
  eventWeight: number;              // feeds Crossroads selection via recently-visited locations
}

export interface ActivityDef {
  id: string;
  label: string;
  moneyCost?: number;
  moneyGain?: number;
  statDeltas: Partial<Record<StatKey, number>>;
  familyTrustDelta?: number;        // only meaningful on familyFriends activities
  diminishingReturns?: { cooldownDays: number; decayFactor: number };
  requiresFlag?: string;
  narrativeVariants: string[];
}

export interface DailyPlan {
  day: number;
  morning: ActivityChoice | null;
  afternoon: ActivityChoice | null;
  evening: ActivityChoice | null;
}

export interface ActivityChoice {
  locationId: LocationId;
  activityId: string;
}

export interface EventDef {
  id: string;
  title: string;
  triggerConditions: {
    locationIds?: LocationId[];
    statThresholds?: Partial<Record<StatKey, { below?: number; above?: number }>>;
    dayRange?: [number, number];
    minDaysSinceLastCrossroads?: number;
    requiresFlag?: string;
    minTotalDays?: 60;               // lets Pink Cloud events say "not in 30-day mode"
  };
  weight: number;
  isPinkCloud?: boolean;             // lets turnEngine find/guard the Pink Cloud event(s) explicitly
  choices: EventChoice[];
}

export interface EventChoice {
  label: string;
  statDeltas: Partial<Record<StatKey, number>>;
  moneyDelta?: number;
  familyTrustDelta?: number;
  outcomeText: string;
  setsFlag?: string;
}

export interface GameConfig {
  totalDays: 30 | 60 | 90;
  priorities: RoscDimension[];       // player picks top 1–2 at game start
}

export type PlayerStats = Record<StatKey, number>;
// wellness/stability/direction/connection: 0–100. money: floored at 0, no ceiling (§4.2).

export const QUIET_REST_DEFAULT: ActivityDef = {
  id: 'quietRest',
  label: 'Quiet day at home',
  statDeltas: { wellness: 1 },
  narrativeVariants: ['Nothing much happens today. That’s alright.'],
};

export interface MilestoneResult {
  id: string;
  title: string;
  narrativeText: string;
}

export interface FastLaneSaveState {
  schemaVersion: 1;
  config: GameConfig;
  day: number;                       // 1..totalDays
  currentBlock: DayBlock | 'day-complete';
  dailyPlan: DailyPlan;
  stats: PlayerStats;
  recoveryCapital: number;           // hidden numeric; only ever surfaced via getRecoveryCapitalLabel()
  relationships: Record<RelationshipKey, RelationshipState>;
  flags: Record<string, boolean | string>;
  activityCooldowns: Record<string, { lastDay: number; streak: number }>;
  blocksByDimensionThisWeek: Record<RoscDimension, number>;
  workBlocksThisWeek: number;
  crossroadsHistory: { lastCrossroadsDay: number | null; firedEventIds: string[] };
  pinkCloudFired: boolean;
  milestonesUnlocked: string[];
  log: string[];
}
