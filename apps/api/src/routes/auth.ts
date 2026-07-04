import { zValidator } from '@hono/zod-validator';
import { eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { deleteCookie, setCookie } from 'hono/cookie';
import { z } from 'zod';
import { hashPassword, verifyPassword } from '../auth/password';
import { createSession, deleteSession, SESSION_COOKIE } from '../auth/session';
import { requireAuth, type AuthEnv } from '../auth/middleware';
import { db } from '../db/client';
import { profiles, users } from '../db/schema';

const signupSchema = z.object({
  email: z.string().email().max(254),
  username: z.string().min(2).max(24).regex(/^[a-zA-Z0-9_ ]+$/),
  password: z.string().min(8).max(128),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1).max(128),
});

function setSessionCookie(c: Parameters<typeof setCookie>[0], token: string, expiresAt: Date) {
  setCookie(c, SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'Lax',
    path: '/',
    expires: expiresAt,
    secure: process.env.NODE_ENV === 'production',
  });
}

export const authRoutes = new Hono<AuthEnv>()
  .post('/signup', zValidator('json', signupSchema), async (c) => {
    const { email, username, password } = c.req.valid('json');

    const [existingUser] = await db.select({ id: users.id }).from(users).where(eq(users.email, email.toLowerCase())).limit(1);
    if (existingUser) return c.json({ error: 'Email already registered' }, 409);

    const [existingName] = await db.select({ userId: profiles.userId }).from(profiles).where(eq(profiles.username, username)).limit(1);
    if (existingName) return c.json({ error: 'Username taken' }, 409);

    const passwordHash = await hashPassword(password);
    const [user] = await db.insert(users).values({ email: email.toLowerCase(), passwordHash }).returning();
    if (!user) return c.json({ error: 'Failed to create user' }, 500);
    await db.insert(profiles).values({ userId: user.id, username });

    const { token, expiresAt } = await createSession(db, user.id);
    setSessionCookie(c, token, expiresAt);
    return c.json({ id: user.id, email: user.email, username }, 201);
  })
  .post('/login', zValidator('json', loginSchema), async (c) => {
    const { email, password } = c.req.valid('json');

    const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1);
    if (!user) return c.json({ error: 'Invalid email or password' }, 401);

    const valid = await verifyPassword(user.passwordHash, password);
    if (!valid) return c.json({ error: 'Invalid email or password' }, 401);

    const { token, expiresAt } = await createSession(db, user.id);
    setSessionCookie(c, token, expiresAt);

    const [profile] = await db.select().from(profiles).where(eq(profiles.userId, user.id)).limit(1);
    return c.json({ id: user.id, email: user.email, username: profile?.username ?? '' });
  })
  .post('/logout', requireAuth, async (c) => {
    await deleteSession(db, c.get('sessionToken'));
    deleteCookie(c, SESSION_COOKIE, { path: '/' });
    return c.json({ ok: true });
  })
  .get('/me', requireAuth, async (c) => {
    const userId = c.get('userId');
    const [row] = await db
      .select({
        id: users.id,
        email: users.email,
        username: profiles.username,
        avatarEmoji: profiles.avatarEmoji,
        xp: profiles.xp,
        accountLevel: profiles.accountLevel,
        dailyStreak: profiles.dailyStreak,
        dailyXpEarned: profiles.dailyXpEarned,
        dailyGoalMinutes: profiles.dailyGoalMinutes,
        onboardingComplete: profiles.onboardingComplete,
        mathLevel: profiles.mathLevel,
      })
      .from(users)
      .innerJoin(profiles, eq(profiles.userId, users.id))
      .where(eq(users.id, userId))
      .limit(1);
    if (!row) return c.json({ error: 'User not found' }, 404);
    return c.json(row);
  });
