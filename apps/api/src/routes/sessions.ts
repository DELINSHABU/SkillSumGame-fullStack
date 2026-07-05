import { validate } from '../lib/validate';
import { and, desc, eq, sql } from 'drizzle-orm';
import { Hono } from 'hono';
import { z } from 'zod';
import {
  calculateXP,
  checkAchievements,
  detectWeakSpots,
  generateDailyChallenge,
  getAccountLevel,
  getLevelById,
  getLevelsByWorld,
  getStarsFromScore,
  isBossLevel,
  DAILY_XP_REWARD,
  type PracticeConfig,
  type QuestionAttempt,
  type StarCount,
} from '@skillsum/shared';
import { requireAuth, type AuthEnv } from '../auth/middleware';
import { db } from '../db/client';
import {
  dailyProgress,
  gameSessions,
  levelMastery,
  personalBests,
  profiles,
  userAchievements,
} from '../db/schema';
import { configKey } from '../lib/configKey';
import { getTodayDate, nextStreak } from '../lib/dates';
import { ImplausibleSessionError, recomputeSession } from '../lib/trust';

const operatorSchema = z.enum(['+', '-', '×', '÷']);

const attemptSchema = z.object({
  question: z.string().max(64),
  correctAnswer: z.number().int(),
  userAnswer: z.number().int().nullable(),
  isCorrect: z.boolean(),
  responseMs: z.number().int().min(0).max(600000),
  skill: z.string().max(32),
  operator: operatorSchema,
});

const practiceConfigSchema = z.object({
  mode: z.enum(['time', 'count', 'zen']),
  timeLimit: z.number().int().min(5).max(600).optional(),
  targetCount: z.number().int().min(1).max(200).optional(),
  operators: z.array(operatorSchema).min(1),
  numberRange: z.tuple([z.number().int().min(0), z.number().int().max(1000)]),
});

const submitSchema = z.object({
  mode: z.enum(['learn', 'practice', 'daily']),
  levelId: z.number().int().min(1).max(400).optional(),
  practiceConfig: practiceConfigSchema.optional(),
  dailyTaskId: z.string().max(32).optional(),
  attempts: z.array(attemptSchema).max(500),
  durationMs: z.number().int().min(0).max(3_600_000),
  localHour: z.number().int().min(0).max(23).optional(),
});

interface TaskStateEntry {
  progress: number;
  completed: boolean;
}
type TaskState = Record<string, TaskStateEntry>;

export const sessionRoutes = new Hono<AuthEnv>()
  .use('*', requireAuth)

  // The core write: recompute everything server-side, never trust client totals.
  .post('/', validate('json', submitSchema), async (c) => {
    const userId = c.get('userId');
    const body = c.req.valid('json');
    const attempts = body.attempts as QuestionAttempt[];

    let recomputed;
    try {
      recomputed = recomputeSession(attempts, body.durationMs);
    } catch (err) {
      if (err instanceof ImplausibleSessionError) return c.json({ error: err.message }, 422);
      throw err;
    }

    const level = body.mode === 'learn' || body.mode === 'daily' ? getLevelById(body.levelId ?? -1) : undefined;
    if (body.mode === 'learn' && !level) return c.json({ error: 'Unknown level' }, 400);

    const [profile] = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1);
    if (!profile) return c.json({ error: 'Profile not found' }, 404);

    // Streak: server date only.
    const today = getTodayDate();
    const streak = nextStreak(profile, today);

    // Stars (learn mode).
    let starsEarned: StarCount | undefined;
    let isLevelComplete = false;
    if (body.mode === 'learn' && level) {
      starsEarned = getStarsFromScore(recomputed.correct, level);
      isLevelComplete = starsEarned > 0;
    }

    // Personal best (practice mode).
    let newPersonalBest = false;
    let pbKey: string | null = null;
    if (body.mode === 'practice' && body.practiceConfig) {
      pbKey = configKey(body.practiceConfig as PracticeConfig);
      const [pb] = await db
        .select()
        .from(personalBests)
        .where(and(eq(personalBests.userId, userId), eq(personalBests.configKey, pbKey)))
        .limit(1);
      newPersonalBest = !pb || recomputed.correct > pb.score;
    }

    // XP — computed here, never from the client.
    const xpBreakdown = calculateXP(
      { ...recomputed, durationMs: body.durationMs },
      {
        isLevelComplete,
        isBossLevel: level !== undefined && isBossLevel(level.id) && isLevelComplete,
        isPersonalBest: newPersonalBest,
        dailyStreakDays: streak.dailyStreak,
      }
    );

    // Persist the session.
    const [savedSession] = await db
      .insert(gameSessions)
      .values({
        userId,
        mode: body.mode,
        levelId: body.levelId,
        practiceConfig: body.practiceConfig,
        correct: recomputed.correct,
        wrong: recomputed.wrong,
        accuracy: String(recomputed.accuracy),
        maxStreak: recomputed.maxStreak,
        durationMs: body.durationMs,
        xpEarned: xpBreakdown.total,
        starsEarned,
        isPersonalBest: newPersonalBest,
        attempts: attempts,
      })
      .returning({ id: gameSessions.id });

    // Upsert mastery (learn mode) — keep bests.
    if (body.mode === 'learn' && level && starsEarned !== undefined) {
      const weakSkills = detectWeakSpots(attempts).map((r) => r.skill);
      await db
        .insert(levelMastery)
        .values({
          userId,
          levelId: level.id,
          stars: starsEarned,
          bestScore: recomputed.correct,
          bestAccuracy: String(recomputed.accuracy),
          bestTimeMs: body.durationMs,
          attempts: 1,
          weakSkills,
          lastPlayedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: [levelMastery.userId, levelMastery.levelId],
          set: {
            stars: sql`greatest(${levelMastery.stars}, ${starsEarned})`,
            bestScore: sql`greatest(${levelMastery.bestScore}, ${recomputed.correct})`,
            bestAccuracy: sql`greatest(${levelMastery.bestAccuracy}, ${String(recomputed.accuracy)}::numeric)`,
            attempts: sql`${levelMastery.attempts} + 1`,
            weakSkills,
            lastPlayedAt: new Date(),
            updatedAt: new Date(),
          },
        });
    }

    // Personal best upsert.
    if (newPersonalBest && pbKey) {
      await db
        .insert(personalBests)
        .values({ userId, configKey: pbKey, score: recomputed.correct, accuracy: String(recomputed.accuracy) })
        .onConflictDoUpdate({
          target: [personalBests.userId, personalBests.configKey],
          set: { score: recomputed.correct, accuracy: String(recomputed.accuracy), achievedAt: new Date() },
        });
    }

    // Profile: XP, account level, streak, daily XP counter.
    const newXp = profile.xp + xpBreakdown.total;
    const dailyXp = profile.dailyXpResetDate === today ? profile.dailyXpEarned + xpBreakdown.total : xpBreakdown.total;
    const newAccountLevel = getAccountLevel(newXp);
    await db
      .update(profiles)
      .set({
        xp: newXp,
        accountLevel: newAccountLevel,
        dailyStreak: streak.dailyStreak,
        lastStreakDate: streak.lastStreakDate,
        dailyXpEarned: dailyXp,
        dailyXpResetDate: today,
        updatedAt: new Date(),
      })
      .where(eq(profiles.userId, userId));

    // Daily challenge progress.
    const dailyState = await updateDailyProgress(userId, today, {
      dailyTaskId: body.dailyTaskId,
      mode: body.mode,
      correct: recomputed.correct,
      accuracy: recomputed.accuracy,
      totalAnswers: recomputed.correct + recomputed.wrong,
      maxStreak: recomputed.maxStreak,
    });

    // Achievements.
    const totals = await db
      .select({
        totalCorrect: sql<number>`coalesce(sum(${gameSessions.correct}), 0)::int`,
        sessionCount: sql<number>`count(*)::int`,
      })
      .from(gameSessions)
      .where(eq(gameSessions.userId, userId));

    let completedWorldId: number | undefined;
    let completedWorldIds: number[] = [];
    if (isLevelComplete && level) {
      const rows = await db
        .select({ levelId: levelMastery.levelId })
        .from(levelMastery)
        .where(and(eq(levelMastery.userId, userId), sql`${levelMastery.stars} > 0`));
      const done = new Set(rows.map((r) => r.levelId));
      completedWorldIds = [1, 2, 3, 4, 5, 6, 7, 8].filter((wid) =>
        getLevelsByWorld(wid).every((l) => done.has(l.id))
      );
      if (completedWorldIds.includes(level.worldId)) completedWorldId = level.worldId;
    }

    const unlockedRows = await db
      .select({ achievementId: userAchievements.achievementId })
      .from(userAchievements)
      .where(eq(userAchievements.userId, userId));

    const totalAnswers = recomputed.correct + recomputed.wrong;
    const newAchievements = checkAchievements({
      totalCorrect: totals[0]?.totalCorrect ?? 0,
      sessionCount: totals[0]?.sessionCount ?? 0,
      sessionAccuracy: totalAnswers > 0 ? recomputed.accuracy : 0,
      sessionMaxStreak: recomputed.maxStreak,
      sessionAvgMs: totalAnswers >= 5 ? body.durationMs / totalAnswers : 0,
      accountLevel: newAccountLevel,
      dailyStreak: streak.dailyStreak,
      completedLevelId: isLevelComplete ? level?.id : undefined,
      completedWorldId,
      completedWorldIds,
      localHour: body.localHour,
      alreadyUnlocked: new Set(unlockedRows.map((r) => r.achievementId)),
    });
    if (newAchievements.length > 0) {
      await db
        .insert(userAchievements)
        .values(newAchievements.map((achievementId) => ({ userId, achievementId })))
        .onConflictDoNothing();
    }

    return c.json({
      sessionId: savedSession?.id,
      recomputed,
      starsEarned,
      xpBreakdown,
      newAchievements,
      newPersonalBest,
      dailyTaskState: dailyState,
      profile: {
        xp: newXp,
        accountLevel: newAccountLevel,
        leveledUp: newAccountLevel > profile.accountLevel,
        dailyStreak: streak.dailyStreak,
        dailyXpEarned: dailyXp,
      },
    });
  })

  .get('/', async (c) => {
    const userId = c.get('userId');
    const mode = c.req.query('mode');
    const limit = Math.min(Number(c.req.query('limit') ?? 20), 100);
    const where = mode
      ? and(eq(gameSessions.userId, userId), eq(gameSessions.mode, mode))
      : eq(gameSessions.userId, userId);
    const rows = await db
      .select()
      .from(gameSessions)
      .where(where)
      .orderBy(desc(gameSessions.startedAt))
      .limit(limit);
    return c.json(rows);
  })

  .get('/personal-bests', async (c) => {
    const rows = await db
      .select()
      .from(personalBests)
      .where(eq(personalBests.userId, c.get('userId')));
    return c.json(rows);
  });

interface DailyUpdateInput {
  dailyTaskId?: string;
  mode: 'learn' | 'practice' | 'daily';
  correct: number;
  accuracy: number;
  totalAnswers: number;
  maxStreak: number;
}

async function updateDailyProgress(userId: string, today: string, input: DailyUpdateInput): Promise<TaskState> {
  const challenge = generateDailyChallenge(today);

  const [existing] = await db
    .select()
    .from(dailyProgress)
    .where(and(eq(dailyProgress.userId, userId), eq(dailyProgress.challengeDate, today)))
    .limit(1);

  const state: TaskState = { ...((existing?.taskState as TaskState | undefined) ?? {}) };

  for (const task of challenge.tasks) {
    const entry = state[task.id] ?? { progress: 0, completed: false };
    if (entry.completed) {
      state[task.id] = entry;
      continue;
    }
    switch (task.type) {
      case 'streak':
        // Streak task counts from any session.
        entry.progress = Math.max(entry.progress, input.maxStreak);
        entry.completed = input.maxStreak >= task.target;
        break;
      case 'score':
        if (input.dailyTaskId === task.id && input.mode === 'daily') {
          entry.progress = Math.max(entry.progress, input.correct);
          entry.completed = input.correct >= task.target;
        }
        break;
      case 'accuracy':
        if (input.dailyTaskId === task.id && input.mode === 'daily') {
          const required = task.practiceConfig?.targetCount ?? 0;
          if (input.totalAnswers >= required) {
            entry.progress = Math.max(entry.progress, Math.floor(input.accuracy));
            entry.completed = input.accuracy >= task.target;
          }
        }
        break;
      case 'level':
        break;
      default: {
        const exhaustive: never = task.type;
        throw new Error(`Unknown task type: ${String(exhaustive)}`);
      }
    }
    state[task.id] = entry;
  }

  const completedAll = challenge.tasks.every((t) => state[t.id]?.completed);

  if (existing) {
    await db
      .update(dailyProgress)
      .set({ taskState: state, completedAll })
      .where(eq(dailyProgress.id, existing.id));
  } else {
    await db.insert(dailyProgress).values({ userId, challengeDate: today, taskState: state, completedAll });
  }

  return state;
}

export { DAILY_XP_REWARD };
