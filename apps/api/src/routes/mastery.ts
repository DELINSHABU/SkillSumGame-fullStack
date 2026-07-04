import { and, eq, gte, lte } from 'drizzle-orm';
import { Hono } from 'hono';
import { requireAuth, type AuthEnv } from '../auth/middleware';
import { db } from '../db/client';
import { levelMastery } from '../db/schema';

export const masteryRoutes = new Hono<AuthEnv>()
  .use('*', requireAuth)

  .get('/', async (c) => {
    const userId = c.get('userId');
    const worldId = c.req.query('worldId');

    if (worldId !== undefined) {
      const wid = Number(worldId);
      if (!Number.isInteger(wid) || wid < 1 || wid > 8) return c.json({ error: 'Invalid worldId' }, 400);
      const rows = await db
        .select()
        .from(levelMastery)
        .where(
          and(
            eq(levelMastery.userId, userId),
            gte(levelMastery.levelId, (wid - 1) * 50 + 1),
            lte(levelMastery.levelId, wid * 50)
          )
        );
      return c.json(rows);
    }

    const rows = await db.select().from(levelMastery).where(eq(levelMastery.userId, userId));
    return c.json(rows);
  });
