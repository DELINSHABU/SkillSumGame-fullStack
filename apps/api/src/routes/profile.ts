import { zValidator } from '@hono/zod-validator';
import { eq, sql } from 'drizzle-orm';
import { Hono } from 'hono';
import { z } from 'zod';
import { getLevelXPThreshold } from '@skillsum/shared';
import { requireAuth, type AuthEnv } from '../auth/middleware';
import { db } from '../db/client';
import { gameSessions, levelMastery, profiles } from '../db/schema';

const patchSchema = z.object({
  avatarEmoji: z.string().max(8).optional(),
  dailyGoalMinutes: z.number().int().min(5).max(60).optional(),
  mathLevel: z.enum(['beginner', 'intermediate', 'confident']).optional(),
  onboardingComplete: z.boolean().optional(),
});

export const profileRoutes = new Hono<AuthEnv>()
  .use('*', requireAuth)

  .get('/', async (c) => {
    const userId = c.get('userId');
    const [profile] = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1);
    if (!profile) return c.json({ error: 'Profile not found' }, 404);

    const [stats] = await db
      .select({
        totalSessions: sql<number>`count(*)::int`,
        totalCorrect: sql<number>`coalesce(sum(${gameSessions.correct}), 0)::int`,
        totalWrong: sql<number>`coalesce(sum(${gameSessions.wrong}), 0)::int`,
        totalTimeMs: sql<number>`coalesce(sum(${gameSessions.durationMs}), 0)::bigint`,
        bestStreak: sql<number>`coalesce(max(${gameSessions.maxStreak}), 0)::int`,
      })
      .from(gameSessions)
      .where(eq(gameSessions.userId, userId));

    const [masteryStats] = await db
      .select({
        levelsCompleted: sql<number>`count(*) filter (where ${levelMastery.stars} > 0)::int`,
        totalStars: sql<number>`coalesce(sum(${levelMastery.stars}), 0)::int`,
      })
      .from(levelMastery)
      .where(eq(levelMastery.userId, userId));

    return c.json({
      ...profile,
      xpForCurrentLevel: getLevelXPThreshold(profile.accountLevel),
      xpForNextLevel: getLevelXPThreshold(profile.accountLevel + 1),
      stats: { ...stats, ...masteryStats },
    });
  })

  .patch('/', zValidator('json', patchSchema), async (c) => {
    const updates = c.req.valid('json');
    const [updated] = await db
      .update(profiles)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(profiles.userId, c.get('userId')))
      .returning();
    return c.json(updated);
  });
