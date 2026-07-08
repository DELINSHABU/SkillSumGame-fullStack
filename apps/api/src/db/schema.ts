import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  smallint,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

// Naming: auth_sessions = login sessions, game_sessions = gameplay records.

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const authSessions = pgTable(
  'auth_sessions',
  {
    // sha256 hash of the random token — raw token only lives in the cookie.
    id: text('id').primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('idx_auth_sessions_user').on(t.userId)]
);

export const profiles = pgTable('profiles', {
  userId: uuid('user_id')
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  username: text('username').notNull().unique(),
  avatarEmoji: text('avatar_emoji').notNull().default('🧠'),
  xp: integer('xp').notNull().default(0),
  accountLevel: integer('account_level').notNull().default(1),
  dailyStreak: integer('daily_streak').notNull().default(0),
  lastStreakDate: date('last_streak_date'),
  dailyXpEarned: integer('daily_xp_earned').notNull().default(0),
  dailyXpResetDate: date('daily_xp_reset_date'),
  dailyGoalMinutes: integer('daily_goal_minutes').notNull().default(10),
  onboardingComplete: boolean('onboarding_complete').notNull().default(false),
  mathLevel: text('math_level').notNull().default('beginner'),
  theme: text('theme').notNull().default('system'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const levelMastery = pgTable(
  'level_mastery',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => profiles.userId, { onDelete: 'cascade' }),
    levelId: integer('level_id').notNull(),
    stars: smallint('stars').notNull().default(0),
    bestScore: integer('best_score').notNull().default(0),
    bestAccuracy: numeric('best_accuracy', { precision: 5, scale: 2 }).notNull().default('0'),
    bestTimeMs: integer('best_time_ms').notNull().default(0),
    attempts: integer('attempts').notNull().default(0),
    weakSkills: jsonb('weak_skills').notNull().default([]),
    lastPlayedAt: timestamp('last_played_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('uq_mastery_user_level').on(t.userId, t.levelId),
    index('idx_mastery_user').on(t.userId),
  ]
);

export const gameSessions = pgTable(
  'game_sessions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => profiles.userId, { onDelete: 'cascade' }),
    mode: text('mode').notNull(), // learn | practice | daily
    levelId: integer('level_id'),
    practiceConfig: jsonb('practice_config'),
    correct: integer('correct').notNull().default(0),
    wrong: integer('wrong').notNull().default(0),
    accuracy: numeric('accuracy', { precision: 5, scale: 2 }).notNull().default('0'),
    maxStreak: integer('max_streak').notNull().default(0),
    durationMs: integer('duration_ms').notNull().default(0),
    xpEarned: integer('xp_earned').notNull().default(0), // always server-computed
    starsEarned: smallint('stars_earned'),
    isPersonalBest: boolean('is_personal_best').notNull().default(false),
    attempts: jsonb('attempts').notNull().default([]),
    startedAt: timestamp('started_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('idx_game_sessions_user').on(t.userId, t.startedAt)]
);

export const personalBests = pgTable(
  'personal_bests',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => profiles.userId, { onDelete: 'cascade' }),
    configKey: text('config_key').notNull(),
    score: integer('score').notNull().default(0),
    accuracy: numeric('accuracy', { precision: 5, scale: 2 }).notNull().default('0'),
    achievedAt: timestamp('achieved_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex('uq_pb_user_config').on(t.userId, t.configKey)]
);

export const userAchievements = pgTable(
  'user_achievements',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => profiles.userId, { onDelete: 'cascade' }),
    achievementId: text('achievement_id').notNull(),
    unlockedAt: timestamp('unlocked_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex('uq_achievement_user').on(t.userId, t.achievementId)]
);

export const dailyProgress = pgTable(
  'daily_progress',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => profiles.userId, { onDelete: 'cascade' }),
    challengeDate: date('challenge_date').notNull(),
    // { [taskId]: { progress: number, completed: boolean } }
    taskState: jsonb('task_state').notNull().default({}),
    completedAll: boolean('completed_all').notNull().default(false),
    xpRewarded: boolean('xp_rewarded').notNull().default(false),
  },
  (t) => [uniqueIndex('uq_daily_user_date').on(t.userId, t.challengeDate)]
);
