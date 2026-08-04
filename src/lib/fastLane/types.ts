// src/lib/fastLane/types.ts
// Extracted from MRT2 (My Recovery Toolkit) for standalone development.
// The AI rival is called "Casey" — a "keeping up with the Joneses" reference.

export interface FastLaneJob {
  id: number;
  title: string; // internal/AI-log-only label, never shown to the player
  titleRecovery: string; // player-facing role label
  wage: number;
  timeCost: number;
  educationReq: number;
  nextJobId: number | null;
}

export interface FastLaneCourse {
  name: string;
  cost: number;
  time: number;
  educationGain: number;
  level: number;
}

export interface FastLaneShopItem {
  id: string;
  name: string;
  cost: number;
  wellbeing: number;
  type: string;
  descRecovery: string;
}

type FastLaneEventType = 'positive' | 'negative' | 'neutral';

export interface FastLaneRandomEvent {
  type: FastLaneEventType;
  description: string;
  money: number;
  wellbeing: number;
}

export interface FastLaneApartmentTier {
  id: number;
  name: string;
  cost: number;
  rent: number;
  wellbeingBonus: number;
  timeCost: number;
  details: string;
}

export type FastLaneDifficultyKey = 'EASY' | 'NORMAL' | 'HARD';

export interface FastLaneGoals {
  wealth: number;
  // Job id (FastLaneJob.id) the player must reach to satisfy the career goal.
  careerJobId: number;
  education: number;
  wellbeing: number;
}

export interface FastLaneDifficulty {
  name: string;
  playerStartMoney: number;
  playerStartJob: number;
  playerStartDebt?: number;
  goals: Pick<FastLaneGoals, 'wealth' | 'careerJobId'>;
  rivalAdvantage: number;
}

// One side of the simulation (player or rival) — same shape, since Casey
// runs the identical turn-resolution math against her own copy of this state.
export interface FastLaneParticipantState {
  week: number;
  timeRemaining: number;
  money: number;
  wellbeing: number;
  education: number;
  currentJob: FastLaneJob;
  rentDueIn: number;
  rentCost: number;
  livingSituation: FastLaneApartmentTier;
  loanAmount: number;
  interestRate: number;
  inventory: string[];
  stockShares: number;
  stockValue: number;
  stressLevel: number;
  inCrisis: boolean;
}

export interface FastLaneSaveState {
  player: FastLaneParticipantState;
  rival: FastLaneParticipantState;
  goals: FastLaneGoals;
  difficulty: FastLaneDifficultyKey;
  log: string[];
}

export interface FastLaneWeekResult {
  updatedPlayer: FastLaneParticipantState;
  logMessages: string[];
  playerWon: boolean;
}

export interface FastLaneRivalTurnResult {
  updatedRival: FastLaneParticipantState;
  logMessages: string[];
  rivalWon: boolean;
}
