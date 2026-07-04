// ============================================================
// SkillSum shared game types — single source of truth.
// All game types live here. Never redefine them in apps.
// ============================================================

export type OperationType = '+' | '-' | '×' | '÷';

export type SkillType =
  | 'makeTen'
  | 'addTen'
  | 'addNine'
  | 'addEight'
  | 'doubles'
  | 'nearDoubles'
  | 'subtractTen'
  | 'subtractNine'
  | 'multiplyByTwo'
  | 'multiplyByFive'
  | 'multiplyByTen'
  | 'multiplyByEleven'
  | 'integerDivision'
  | 'random';

export type LevelType = 'intro' | 'standard' | 'boss' | 'bonus' | 'speedrun' | 'review';

export type Difficulty = 'easy' | 'medium' | 'hard';

// ============================================================
// LEVEL DEFINITION
// ============================================================
export interface GenerationParams {
  operators: OperationType[];
  numberRange: [number, number];
  skill: SkillType;
  fixedOperand?: number;
  fixedOperandPosition?: 'first' | 'second';
}

export interface TipDiagram {
  steps: string[];
  example: string;
  solution: string[];
}

export interface Level {
  id: number;
  worldId: number; // 1-8
  worldName: string;
  title: string;
  description: string;
  tip: string;
  tipDiagram?: TipDiagram;
  type: LevelType;
  targetScore: number; // session goal (correct answers)
  star1Score: number;
  star2Score: number;
  star3Score: number; // star1 < star2 < star3 <= targetScore — enforced by tests
  timeLimit?: number; // seconds; undefined = no timer
  generationParams: GenerationParams;
  unlockRequirement?: number; // level id that must be passed first
}

export interface Question {
  question: string; // e.g. "27 + 9"
  answer: number;
  operator: OperationType;
  skill: SkillType;
}

// ============================================================
// USER PROGRESS
// ============================================================
export type StarCount = 0 | 1 | 2 | 3;

export interface LevelMastery {
  levelId: number;
  stars: StarCount;
  bestScore: number;
  bestAccuracy: number; // 0-100
  bestTimeMs: number;
  attempts: number;
  lastPlayedAt: string; // ISO date
  weakSkillsDetected: SkillType[];
}

export type MasteryMap = Record<number, LevelMastery>;

export type MathLevel = 'beginner' | 'intermediate' | 'confident';

export interface UserProfile {
  username: string;
  avatarEmoji: string;
  xp: number;
  accountLevel: number; // 1-100
  dailyStreak: number;
  lastStreakDate: string | null; // YYYY-MM-DD
  dailyXPEarned: number;
  dailyGoalMinutes: number;
  onboardingComplete: boolean;
  mathLevel: MathLevel;
  createdAt: string;
}

// ============================================================
// SESSION TRACKING
// ============================================================
export interface QuestionAttempt {
  question: string;
  correctAnswer: number;
  userAnswer: number | null;
  isCorrect: boolean;
  responseMs: number;
  skill: SkillType;
  operator: OperationType;
}

export type SessionMode = 'learn' | 'practice' | 'daily';

export interface SessionResult {
  id: string;
  mode: SessionMode;
  levelId?: number;
  practiceConfig?: PracticeConfig;
  startedAt: string;
  durationMs: number;
  attempts: QuestionAttempt[];
  correct: number;
  wrong: number;
  accuracy: number; // 0-100
  maxStreak: number;
  xpEarned: number;
  starsEarned?: StarCount;
  isPersonalBest?: boolean;
}

// ============================================================
// PRACTICE MODE
// ============================================================
export type PracticeMode = 'time' | 'count' | 'zen';

export interface PracticeConfig {
  mode: PracticeMode;
  timeLimit?: number; // seconds, 'time' mode
  targetCount?: number; // correct answers, 'count' mode
  operators: OperationType[];
  numberRange: [number, number];
}

export interface PersonalBest {
  configKey: string;
  score: number;
  accuracy: number;
  achievedAt: string;
}

// ============================================================
// ACHIEVEMENTS
// ============================================================
export type AchievementCategory =
  | 'firstSteps'
  | 'speed'
  | 'accuracy'
  | 'streaks'
  | 'mastery'
  | 'elite'
  | 'hidden';

export type AchievementConditionType =
  | 'totalCorrect'
  | 'streak'
  | 'accuracy'
  | 'speed'
  | 'levelComplete'
  | 'worldComplete'
  | 'accountLevel'
  | 'dailyStreak'
  | 'sessionCount'
  | 'custom';

export interface AchievementCondition {
  type: AchievementConditionType;
  threshold?: number;
  levelId?: number;
  worldId?: number;
  customId?: string; // for 'custom' — handled by named checks
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string; // emoji
  category: AchievementCategory;
  secret?: boolean;
  condition: AchievementCondition;
}

// ============================================================
// DAILY CHALLENGES
// ============================================================
export type ChallengeTaskType = 'score' | 'accuracy' | 'level' | 'streak';

export interface ChallengeTask {
  id: string;
  description: string;
  type: ChallengeTaskType;
  target: number;
  practiceConfig?: PracticeConfig;
  levelId?: number;
}

export interface DailyChallenge {
  id: string;
  date: string; // YYYY-MM-DD
  tasks: ChallengeTask[];
  xpReward: number;
}

// ============================================================
// WORLD META
// ============================================================
export interface WorldMeta {
  id: number;
  name: string;
  icon: string;
  colorVar: string; // CSS variable name, e.g. '--world-1'
  description: string;
}
