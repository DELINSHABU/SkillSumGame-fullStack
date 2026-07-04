import type { MiddlewareHandler } from 'hono';
import { getCookie } from 'hono/cookie';
import { db } from '../db/client';
import { getSessionUserId, SESSION_COOKIE } from './session';

export interface AuthEnv {
  Variables: {
    userId: string;
    sessionToken: string;
  };
}

export const requireAuth: MiddlewareHandler<AuthEnv> = async (c, next) => {
  const token = getCookie(c, SESSION_COOKIE);
  if (!token) return c.json({ error: 'Not authenticated' }, 401);

  const userId = await getSessionUserId(db, token);
  if (!userId) return c.json({ error: 'Session expired' }, 401);

  c.set('userId', userId);
  c.set('sessionToken', token);
  await next();
};
