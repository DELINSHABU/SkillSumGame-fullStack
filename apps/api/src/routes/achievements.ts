import { eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { ACHIEVEMENTS_LIST } from '@skillsum/shared';
import { requireAuth, type AuthEnv } from '../auth/middleware';
import { db } from '../db/client';
import { userAchievements } from '../db/schema';

export const achievementRoutes = new Hono<AuthEnv>()
  .use('*', requireAuth)

  .get('/', async (c) => {
    const rows = await db
      .select()
      .from(userAchievements)
      .where(eq(userAchievements.userId, c.get('userId')));
    const unlockedAt = new Map(rows.map((r) => [r.achievementId, r.unlockedAt]));

    return c.json(
      ACHIEVEMENTS_LIST.map((a) => ({
        ...a,
        // Secret achievements stay hidden until unlocked.
        name: a.secret && !unlockedAt.has(a.id) ? '???' : a.name,
        description: a.secret && !unlockedAt.has(a.id) ? 'Keep playing to discover this one.' : a.description,
        unlockedAt: unlockedAt.get(a.id) ?? null,
      }))
    );
  });
