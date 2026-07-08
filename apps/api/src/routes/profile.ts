import { validate } from '../lib/validate';
import { eq, sql } from 'drizzle-orm';
import { Hono } from 'hono';
import { z } from 'zod';
import { getLevelXPThreshold, THEMES } from '@skillsum/shared';
import { requireAuth, type AuthEnv } from '../auth/middleware';
import { db } from '../db/client';
import { gameSessions, levelMastery, profiles } from '../db/schema';

const patchSchema = z.object({
  avatarEmoji: z.string().max(8).optional(),
  dailyGoalMinutes: z.number().int().min(5).max(60).optional(),
  mathLevel: z.enum(['beginner', 'intermediate', 'confident']).optional(),
  onboardingComplete: z.boolean().optional(),
  theme: z.enum(THEMES).optional(),
});

export const profileRoutes = new Hono<AuthEnv>()
  .use('*', requireAuth)

  .get('/', async (c) => {
    const userId = c.get('userId');
    // The three reads are independent — run them in one round trip instead of serially.
    const [[profile], [stats], [masteryStats]] = await Promise.all([
      db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1),
      db
        .select({
          totalSessions: sql<number>`count(*)::int`,
          totalCorrect: sql<number>`coalesce(sum(${gameSessions.correct}), 0)::int`,
          totalWrong: sql<number>`coalesce(sum(${gameSessions.wrong}), 0)::int`,
          totalTimeMs: sql<number>`coalesce(sum(${gameSessions.durationMs}), 0)::bigint`,
          bestStreak: sql<number>`coalesce(max(${gameSessions.maxStreak}), 0)::int`,
        })
        .from(gameSessions)
        .where(eq(gameSessions.userId, userId)),
      db
        .select({
          levelsCompleted: sql<number>`count(*) filter (where ${levelMastery.stars} > 0)::int`,
          totalStars: sql<number>`coalesce(sum(${levelMastery.stars}), 0)::int`,
        })
        .from(levelMastery)
        .where(eq(levelMastery.userId, userId)),
    ]);

    if (!profile) return c.json({ error: 'Profile not found' }, 404);

    return c.json({
      ...profile,
      xpForCurrentLevel: getLevelXPThreshold(profile.accountLevel),
      xpForNextLevel: getLevelXPThreshold(profile.accountLevel + 1),
      stats: { ...stats, ...masteryStats },
    });
  })

  .patch('/', validate('json', patchSchema), async (c) => {
    const updates = c.req.valid('json');
    const [updated] = await db
      .update(profiles)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(profiles.userId, c.get('userId')))
      .returning();
    return c.json(updated);
  });
