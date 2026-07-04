import { and, eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { generateDailyChallenge, DAILY_XP_REWARD, getAccountLevel } from '@skillsum/shared';
import { requireAuth, type AuthEnv } from '../auth/middleware';
import { db } from '../db/client';
import { dailyProgress, profiles } from '../db/schema';
import { getTodayDate } from '../lib/dates';

export const dailyRoutes = new Hono<AuthEnv>()
  .use('*', requireAuth)

  .get('/', async (c) => {
    const userId = c.get('userId');
    const today = getTodayDate();
    const challenge = generateDailyChallenge(today);

    const [progress] = await db
      .select()
      .from(dailyProgress)
      .where(and(eq(dailyProgress.userId, userId), eq(dailyProgress.challengeDate, today)))
      .limit(1);

    return c.json({
      ...challenge,
      taskState: progress?.taskState ?? {},
      completedAll: progress?.completedAll ?? false,
      xpRewarded: progress?.xpRewarded ?? false,
    });
  })

  .post('/claim', async (c) => {
    const userId = c.get('userId');
    const today = getTodayDate();

    const [progress] = await db
      .select()
      .from(dailyProgress)
      .where(and(eq(dailyProgress.userId, userId), eq(dailyProgress.challengeDate, today)))
      .limit(1);

    if (!progress?.completedAll) return c.json({ error: 'Not all tasks completed' }, 400);
    if (progress.xpRewarded) return c.json({ error: 'Already claimed today' }, 409);

    await db.update(dailyProgress).set({ xpRewarded: true }).where(eq(dailyProgress.id, progress.id));

    const [profile] = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1);
    if (!profile) return c.json({ error: 'Profile not found' }, 404);
    const newXp = profile.xp + DAILY_XP_REWARD;
    await db
      .update(profiles)
      .set({ xp: newXp, accountLevel: getAccountLevel(newXp), updatedAt: new Date() })
      .where(eq(profiles.userId, userId));

    return c.json({ xpAwarded: DAILY_XP_REWARD, xp: newXp });
  });
